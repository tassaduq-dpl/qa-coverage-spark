import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart3, PieChart, TrendingUp, FileSpreadsheet } from "lucide-react";
import SpreadsheetForm from "@/components/dashboard/SpreadsheetForm";
import OverallCoverageSection from "@/components/dashboard/OverallCoverageSection";
import ModuleCoverageSection from "@/components/dashboard/ModuleCoverageSection";

interface DashboardData {
  overall: {
    totalCases: number;
    executedCases: number;
    passedCases: number;
    failedCases: number;
    blockedCases: number;
    notExecutedCases: number;
    coveragePercentage: number;
  };
  modules: Array<{
    name: string;
    totalCases: number;
    executedCases: number;
    passedCases: number;
    failedCases: number;
    blockedCases: number;
    coveragePercentage: number;
  }>;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDataFetch = async (spreadsheetUrl: string, overallRange: string, moduleRange: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate data processing - in real implementation, this would call Google Sheets API
      // For now, we'll use mock data to demonstrate the dashboard
      const mockData: DashboardData = {
        overall: {
          totalCases: 450,
          executedCases: 380,
          passedCases: 320,
          failedCases: 35,
          blockedCases: 25,
          notExecutedCases: 70,
          coveragePercentage: 84.4
        },
        modules: [
          {
            name: "Authentication",
            totalCases: 85,
            executedCases: 78,
            passedCases: 70,
            failedCases: 5,
            blockedCases: 3,
            coveragePercentage: 91.8
          },
          {
            name: "User Management",
            totalCases: 120,
            executedCases: 95,
            passedCases: 85,
            failedCases: 8,
            blockedCases: 2,
            coveragePercentage: 79.2
          },
          {
            name: "Payment Processing",
            totalCases: 95,
            executedCases: 82,
            passedCases: 75,
            failedCases: 4,
            blockedCases: 3,
            coveragePercentage: 86.3
          },
          {
            name: "Reporting",
            totalCases: 75,
            executedCases: 68,
            passedCases: 60,
            failedCases: 6,
            blockedCases: 2,
            coveragePercentage: 90.7
          },
          {
            name: "API Integration",
            totalCases: 75,
            executedCases: 57,
            passedCases: 50,
            failedCases: 5,
            blockedCases: 2,
            coveragePercentage: 76.0
          }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDashboardData(mockData);
    } catch (err) {
      setError("Failed to fetch data from spreadsheet. Please check your URL and ranges.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!dashboardData && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                QA Test Coverage Dashboard
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Visualize your test coverage data from Google Sheets with comprehensive analytics 
              and interactive charts for both overall and module-wise insights.
            </p>
          </div>

          <Card className="backdrop-blur-sm bg-background/80 border-2">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Connect Your Spreadsheet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SpreadsheetForm onSubmit={handleDataFetch} isLoading={isLoading} />
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
                <Badge variant="secondary">Live Data</Badge>
                <span className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleString()}
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setDashboardData(null)}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Change Source
            </Button>
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
              <OverallCoverageSection data={dashboardData.overall} />
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
          <h3 className="text-lg font-semibold mb-2">Loading Dashboard</h3>
          <p className="text-muted-foreground">Fetching data from your spreadsheet...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
