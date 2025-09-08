/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PieChart, TrendingUp, Database, Download, Loader2 } from "lucide-react";
import ConnectionForm from "@/components/dashboard/SpreadsheetForm";
import OverallCoverageSection from "@/components/dashboard/OverallCoverageSection";
import ModuleCoverageSection from "@/components/dashboard/ModuleCoverageSection";

interface DashboardData {
  coverageTrend: Array<{
    period: string;
    coverage: number;
  }>;
  overall: {
    totalModules: number
    totalCases: number;
    positiveCases: number;
    negativeCases: number;
    edgeCases: number;
    integrationCases: number;
    totalCovered: number;
    coveragePercentage: number;
  };
  modules: Array<{
    name: string;
    totalCases: number;
    positiveCases: number;
    negativeCases: number;
    edgeCases: number;
    integrationCases: number;
    totalCovered: number;
    coveragePercentage: number;
  }>;
}

interface RTMReportData {
  // Add interface for RTM report data structure based on your API response
  [key: string]: any;
}

interface ReportParams {
  storyIds?: string;
  sprintName?: string;
  connectionId: string;
}

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [reportParams, setReportParams] = useState<ReportParams | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Transform RTM data to dashboard format
  const transformRTMToDashboard = (rtmData: RTMReportData): DashboardData => {
    const { overallCoverage, moduleWiseCoverage, coverageTrend } = rtmData;

    const coverageTrendData = (coverageTrend?.data || []).map((item: any) => ({
      period: item.week,
      coverage: item.coverage,
    }));
    
    const overall = {
      totalModules: overallCoverage.totalModules,
      totalCases: overallCoverage.totalUseCases,
      positiveCases: overallCoverage.testCasesByType.positive,
      negativeCases: overallCoverage.testCasesByType.negative,
      edgeCases: overallCoverage.testCasesByType.edgeCases,
      integrationCases: overallCoverage.testCasesByType.integration,
      totalCovered: overallCoverage.coverage.totalCovered,
      coveragePercentage: overallCoverage.coverage.coveragePercentage
    };

    const modules = moduleWiseCoverage.map((module: any) => ({
      name: module.feature,
      totalCases: module.totalUseCases,
      positiveCases: module.positiveCovered,
      negativeCases: module.negativeCovered,
      edgeCases: module.edgeCasesCovered,
      integrationCases: module.integrationCovered,
      totalCovered: module.totalCovered,
      coveragePercentage: module.coveragePercentage,
    }))

    return {
      overall,
      modules,
      coverageTrend: coverageTrendData,
    };
  };

  const handleRTMGeneration = async (data: ReportParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Store the parameters for later use in download
      setReportParams(data);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('connection_id', data.connectionId);
      params.append('include_trend', 'true');
      params.append('trend_weeks', '4');
      
      if (data.storyIds) {
        params.append('story_ids', data.storyIds);
      } else if (data.sprintName) {
        params.append('sprint_name', data.sprintName);
      }
      
      // Fetch RTM report
      const response = await fetch(`${VITE_API_URL}/rtm-download?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate RTM report');
      }
      
      const rtmReportData = await response.json();
      
      // Transform RTM data to dashboard format
      const dashboardData = transformRTMToDashboard(rtmReportData);
      setDashboardData(dashboardData);
      
    } catch (err: any) {
      setError(err.message || "Failed to generate RTM report. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!reportParams) return;
    
    setIsDownloading(true);
    setError(null);
    
    try {
      // Build query parameters using the same params from report generation
      const params = new URLSearchParams();
      params.append('connection_id', reportParams.connectionId);
      
      if (reportParams.storyIds) {
        params.append('story_ids', reportParams.storyIds);
      } else if (reportParams.sprintName) {
        params.append('sprint_name', reportParams.sprintName);
      }
      
      // Add optional filename parameter
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `RTM_Report_${timestamp}`;
      params.append('filename', filename);
      
      // Fetch the Excel file
      const response = await fetch(`${VITE_API_URL}/rtm-report/download?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to download RTM report');
      }
      
      // Get the blob data
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Try to get filename from response headers, fallback to default
      const contentDisposition = response.headers.get('Content-Disposition');
      let downloadFilename = `${filename}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err: any) {
      setError(err.message || "Failed to download report");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!dashboardData && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Database className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                QA Test Coverage Dashboard
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate Requirements Traceability Matrix reports from Azure DevOps with comprehensive analytics 
              and interactive charts for both overall and module-wise insights.
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-background/80 border-2">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Connect to Azure DevOps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConnectionForm onSubmit={handleRTMGeneration} isLoading={isLoading} error={error} />
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-primary/20">
              <CardContent className="p-6 text-center">
                <PieChart className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Overall Coverage</h3>
                <p className="text-sm text-muted-foreground">KPIs, charts, and trend analysis</p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Module Analysis</h3>
                <p className="text-sm text-muted-foreground">Feature-wise coverage breakdown</p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-2">Interactive Filters</h3>
                <p className="text-sm text-muted-foreground">Drill down into specific modules</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">QA Test Coverage Dashboard</h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">RTM Report</Badge>
                <span className="text-sm text-muted-foreground">
                  Generated: {new Date().toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleDownloadReport}
                disabled={isDownloading || !reportParams}
                className="gap-2"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download Report
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setDashboardData(null);
                  setReportParams(null);
                  setError(null);
                }}
                className="gap-2"
              >
                <Database className="h-4 w-4" />
                New Report
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="overview" className="gap-2">
                <PieChart className="h-4 w-4" />
                Overall Coverage
              </TabsTrigger>
              <TabsTrigger value="modules" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Module Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverallCoverageSection data={dashboardData.overall} trendData={dashboardData.coverageTrend} />
            </TabsContent>

            <TabsContent value="modules">
              <ModuleCoverageSection data={dashboardData.modules} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Generating RTM Report</h3>
          <p className="text-muted-foreground">Fetching data from Azure DevOps...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
