/* eslint-disable @typescript-eslint/no-explicit-any */
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
  totalModules: number;
  totalCases: number;
  positiveCases: number;
  negativeCases: number;
  edgeCases: number;
  integrationCases: number;
  totalCovered: number;
  coveragePercentage: number;
}

interface OverallCoverageSectionProps {
  data: OverallCoverageData;
  trendData?: Array<{
    period: string;
    coverage: number;
  }>;
}

const OverallCoverageSection = ({ data, trendData }: OverallCoverageSectionProps) => {
  const pieData = [
    { name: "Positive", value: data.positiveCases, color: "hsl(var(--chart-1))" },
    { name: "Negative", value: data.negativeCases, color: "hsl(var(--chart-2))" },
    { name: "Edge", value: data.edgeCases, color: "hsl(var(--chart-3))" },
    { name: "Integration", value: data.integrationCases, color: "hsl(var(--chart-4))" },
  ];

  const chartConfig = {
    positive: { label: "Positive Cases", color: "hsl(var(--chart-1))" },
    negative: { label: "Negative Cases", color: "hsl(var(--chart-2))" },
    edge: { label: "Edge Cases", color: "hsl(var(--chart-3))" },
    integration: { label: "Integration Cases", color: "hsl(var(--chart-4))" },
    coverage: { label: "Coverage", color: "hsl(var(--primary))" },
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

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {data.name}
              </span>
              <span className="font-bold text-muted-foreground">
                {data.value}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for line chart
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {label}
              </span>
              <span className="font-bold text-muted-foreground">
                Coverage {data.value}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Modules</p>
                <p className="text-3xl font-bold">{data.totalModules.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
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
                <p className="text-sm font-medium text-muted-foreground">Total Covered </p>
                <p className="text-3xl font-bold text-emerald-600">{data.totalCovered.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="mt-2">
              <Progress value={(data.totalCovered / data.totalCases) * 100} className="h-2" />
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
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Execution Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Test Cases Breakdown
              <Badge variant="secondary" className="ml-auto">
                {data.totalCovered} / {data.totalCases}
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
                  <ChartTooltip content={<CustomPieTooltip />} />
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
          <CardContent className="p-0">
            <ChartContainer config={chartConfig} >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={trendData}
                  margin={{ right: 25 }}
                >
                  <XAxis 
                    dataKey="period" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <ChartTooltip content={<CustomLineTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="coverage" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
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
                <span className="font-semibold text-emerald-600">Positive</span>
              </div>
              <p className="text-2xl font-bold">{data.positiveCases}</p>
              <p className="text-sm text-muted-foreground">
                {(((data.positiveCases / data.totalCovered) * 100) || 0).toFixed(1)}% of total covered
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-600">Negative</span>
              </div>
              <p className="text-2xl font-bold">{data.negativeCases}</p>
              <p className="text-sm text-muted-foreground">
                {(((data.negativeCases / data.totalCovered) * 100) || 0).toFixed(1)}% of total covered
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-600">Edge</span>
              </div>
              <p className="text-2xl font-bold">{data.edgeCases}</p>
              <p className="text-sm text-muted-foreground">
                {(((data.edgeCases / data.totalCovered) * 100) || 0).toFixed(1)}% of total covered
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-slate-600" />
                <span className="font-semibold text-slate-600">Integration</span>
              </div>
              <p className="text-2xl font-bold">{data.integrationCases}</p>
              <p className="text-sm text-muted-foreground">
                {(((data.integrationCases / data.totalCovered) * 100) || 0).toFixed(1)}% of total covered
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverallCoverageSection;
