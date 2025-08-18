import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  BarChart3,
  TrendingUp 
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

interface OverallCoverageData {
  totalCases: number;
  executedCases: number;
  passedCases: number;
  failedCases: number;
  blockedCases: number;
  notExecutedCases: number;
  coveragePercentage: number;
}

interface OverallCoverageSectionProps {
  data: OverallCoverageData;
}

const OverallCoverageSection = ({ data }: OverallCoverageSectionProps) => {
  const pieData = [
    { name: "Passed", value: data.passedCases, color: "hsl(var(--chart-1))" },
    { name: "Failed", value: data.failedCases, color: "hsl(var(--chart-2))" },
    { name: "Blocked", value: data.blockedCases, color: "hsl(var(--chart-3))" },
    { name: "Not Executed", value: data.notExecutedCases, color: "hsl(var(--chart-4))" },
  ];

  // Mock trend data for demonstration
  const trendData = [
    { period: "Week 1", coverage: 65 },
    { period: "Week 2", coverage: 72 },
    { period: "Week 3", coverage: 78 },
    { period: "Week 4", coverage: 84.4 },
  ];

  const chartConfig = {
    passed: { label: "Passed", color: "hsl(var(--chart-1))" },
    failed: { label: "Failed", color: "hsl(var(--chart-2))" },
    blocked: { label: "Blocked", color: "hsl(var(--chart-3))" },
    notExecuted: { label: "Not Executed", color: "hsl(var(--chart-4))" },
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "text-emerald-600";
    if (percentage >= 75) return "text-amber-600";
    return "text-red-600";
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <CheckCircle className="h-5 w-5 text-emerald-600" />;
    if (percentage >= 75) return <AlertCircle className="h-5 w-5 text-amber-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Test Cases</p>
                <p className="text-3xl font-bold">{data.totalCases.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Executed Cases</p>
                <p className="text-3xl font-bold text-emerald-600">{data.executedCases.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="mt-2">
              <Progress value={(data.executedCases / data.totalCases) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Test Coverage</p>
                <div className="flex items-center gap-2">
                  <p className={`text-3xl font-bold ${getStatusColor(data.coveragePercentage)}`}>
                    {data.coveragePercentage}%
                  </p>
                  {getStatusIcon(data.coveragePercentage)}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Cases</p>
                <p className="text-3xl font-bold text-red-600">{data.notExecutedCases.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Execution Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Test Execution Breakdown
              <Badge variant="secondary" className="ml-auto">
                {data.executedCases} / {data.totalCases}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Coverage Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Coverage Trend
              <Badge variant="outline" className="ml-auto">
                Last 4 Weeks
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="coverage" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Test Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-emerald-600">Passed</span>
              </div>
              <p className="text-2xl font-bold">{data.passedCases}</p>
              <p className="text-sm text-muted-foreground">
                {((data.passedCases / data.totalCases) * 100).toFixed(1)}% of total
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-600">Failed</span>
              </div>
              <p className="text-2xl font-bold">{data.failedCases}</p>
              <p className="text-sm text-muted-foreground">
                {((data.failedCases / data.totalCases) * 100).toFixed(1)}% of total
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-600">Blocked</span>
              </div>
              <p className="text-2xl font-bold">{data.blockedCases}</p>
              <p className="text-sm text-muted-foreground">
                {((data.blockedCases / data.totalCases) * 100).toFixed(1)}% of total
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-slate-600" />
                <span className="font-semibold text-slate-600">Not Executed</span>
              </div>
              <p className="text-2xl font-bold">{data.notExecutedCases}</p>
              <p className="text-sm text-muted-foreground">
                {((data.notExecutedCases / data.totalCases) * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverallCoverageSection;