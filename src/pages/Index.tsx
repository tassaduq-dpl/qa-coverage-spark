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

  const extractSpreadsheetId = (url: string): string => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) throw new Error("Invalid Google Sheets URL");
    return match[1];
  };

  const fetchSheetData = async (spreadsheetId: string, range: string): Promise<any[][]> => {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&range=${encodeURIComponent(range)}`;
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch spreadsheet data. Make sure the sheet is publicly accessible.");
    }
    
    const csvText = await response.text();
    
    // Parse CSV data
    const rows = csvText.split('\n').map(row => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      
      if (current) {
        values.push(current.replace(/^"|"$/g, ''));
      }
      
      return values;
    }).filter(row => row.some(cell => cell.trim()));
    
    return rows;
  };

  const parseOverallData = (data: any[][]): DashboardData['overall'] => {
    // Assuming the overall data is in a specific format
    // Row 1: Headers, Row 2: Values
    if (data.length < 2) throw new Error("Invalid overall data format");
    
    const values = data[1];
    const totalCases = parseInt(values[0]) || 0;
    const executedCases = parseInt(values[1]) || 0;
    const passedCases = parseInt(values[2]) || 0;
    const failedCases = parseInt(values[3]) || 0;
    const blockedCases = parseInt(values[4]) || 0;
    const notExecutedCases = parseInt(values[5]) || totalCases - executedCases;
    
    const coveragePercentage = totalCases > 0 ? (executedCases / totalCases) * 100 : 0;
    
    return {
      totalCases,
      executedCases,
      passedCases,
      failedCases,
      blockedCases,
      notExecutedCases,
      coveragePercentage: Math.round(coveragePercentage * 10) / 10
    };
  };

  const parseModuleData = (data: any[][]): DashboardData['modules'] => {
    // Assuming first row contains headers, subsequent rows contain module data
    if (data.length < 2) throw new Error("Invalid module data format");
    
    return data.slice(1).map(row => {
      const name = row[0] || "Unknown Module";
      const totalCases = parseInt(row[1]) || 0;
      const executedCases = parseInt(row[2]) || 0;
      const passedCases = parseInt(row[3]) || 0;
      const failedCases = parseInt(row[4]) || 0;
      const blockedCases = parseInt(row[5]) || 0;
      
      const coveragePercentage = totalCases > 0 ? (executedCases / totalCases) * 100 : 0;
      
      return {
        name,
        totalCases,
        executedCases,
        passedCases,
        failedCases,
        blockedCases,
        coveragePercentage: Math.round(coveragePercentage * 10) / 10
      };
    }).filter(module => module.name && module.name !== "Unknown Module");
  };

  const handleDataFetch = async (spreadsheetUrl: string, overallRange: string, moduleRange: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
      
      // Fetch data from both ranges
      const [overallData, moduleData] = await Promise.all([
        fetchSheetData(spreadsheetId, overallRange),
        fetchSheetData(spreadsheetId, moduleRange)
      ]);
      
      // Parse the data
      const overall = parseOverallData(overallData);
      const modules = parseModuleData(moduleData);
      
      const dashboardData: DashboardData = {
        overall,
        modules
      };
      
      setDashboardData(dashboardData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data from spreadsheet. Please check your URL and ranges.");
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
              <SpreadsheetForm onSubmit={handleDataFetch} isLoading={isLoading} error={error} />
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
