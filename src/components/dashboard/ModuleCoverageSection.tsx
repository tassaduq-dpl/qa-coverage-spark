import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  Filter, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Cell
} from "recharts";

interface ModuleData {
  name: string;
  totalCases: number;
  positiveCases: number;
  negativeCases: number;
  edgeCases: number;
  integrationCases: number;
  totalCovered: number;
  coveragePercentage: number;
}

interface ModuleCoverageSectionProps {
  data: ModuleData[];
}

const ModuleCoverageSection = ({ data }: ModuleCoverageSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const filteredData = data.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartConfig = {
    coveragePercentage: { label: "Coverage %", color: "hsl(var(--primary))" },
    coveredCases: { label: "Executed", color: "hsl(var(--chart-1))" },
    totalCases: { label: "Total", color: "hsl(var(--chart-4))" },
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 90) return "hsl(var(--chart-1))"; // Green
    if (percentage >= 75) return "hsl(var(--chart-3))"; // Yellow
    return "hsl(var(--chart-2))"; // Red
  };

  const getCoverageStatus = (percentage: number) => {
    if (percentage >= 90) return { label: "Excellent", color: "text-emerald-600", icon: CheckCircle };
    if (percentage >= 75) return { label: "Good", color: "text-amber-600", icon: TrendingUp };
    if (percentage >= 60) return { label: "Fair", color: "text-orange-600", icon: AlertCircle };
    return { label: "Poor", color: "text-red-600", icon: TrendingDown };
  };

  const averageCoverage = data.reduce((sum, module) => sum + module.coveragePercentage, 0) / data.length;
  const bestModule = data.reduce((best, current) => 
    current.coveragePercentage > best.coveragePercentage ? current : best
  );
  const worstModule = data.reduce((worst, current) => 
    current.coveragePercentage < worst.coveragePercentage ? current : worst
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Coverage</p>
                <p className="text-3xl font-bold">{averageCoverage.toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Performing</p>
                <p className="text-lg font-bold text-emerald-600">{bestModule.name}</p>
                <p className="text-sm text-muted-foreground">{bestModule.coveragePercentage}% coverage</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Needs Attention</p>
                <p className="text-lg font-bold text-red-600">{worstModule.name}</p>
                <p className="text-sm text-muted-foreground">{worstModule.coveragePercentage}% coverage</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Module Coverage Analysis
              <Badge variant="secondary">{filteredData.length} modules</Badge>
            </CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="coveragePercentage" radius={[4, 4, 0, 0]}>
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.coveragePercentage)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Module Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map((module, index) => {
          const status = getCoverageStatus(module.coveragePercentage);
          const StatusIcon = status.icon;
          
          return (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedModule === module.name ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedModule(selectedModule === module.name ? null : module.name)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{module.name}</CardTitle>
                  <div className={`flex items-center gap-1 ${status.color}`}>
                    <StatusIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{status.label}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className={`text-3xl font-bold ${status.color}`}>
                      {module.coveragePercentage}%
                    </p>
                    <p className="text-sm text-muted-foreground">Test Coverage</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-semibold">{module.totalCases}</p>
                      <p className="text-muted-foreground">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{module.totalcovered}</p>
                      <p className="text-muted-foreground">Covered</p>
                    </div>
                  </div>

                  {selectedModule === module.name && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                            <span className="font-medium">Positive Cases</span>
                          </div>
                          <p className="font-bold text-emerald-600">{module.positiveCases}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <XCircle className="h-3 w-3 text-red-600" />
                            <span className="font-medium">Negative Cases</span>
                          </div>
                          <p className="font-bold text-red-600">{module.negativeCases}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <AlertCircle className="h-3 w-3 text-amber-600" />
                            <span className="font-medium">Edge Cases</span>
                          </div>
                          <p className="font-bold text-amber-600">{module.edgeCases}</p>
                        </div>
                         <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <XCircle className="h-3 w-3 text-red-600" />
                            <span className="font-medium">Integration Cases</span>
                          </div>
                          <p className="font-bold text-red-600">{module.integrationCases}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No modules found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search term to find relevant modules.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModuleCoverageSection;
