import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SpreadsheetFormProps {
  onSubmit: (spreadsheetUrl: string, overallRange: string, moduleRange: string) => void;
  isLoading: boolean;
}

const SpreadsheetForm = ({ onSubmit, isLoading }: SpreadsheetFormProps) => {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState("");
  const [overallRange, setOverallRange] = useState("");
  const [moduleRange, setModuleRange] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (spreadsheetUrl && overallRange && moduleRange) {
      onSubmit(spreadsheetUrl, overallRange, moduleRange);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Ensure your Google Spreadsheet is publicly accessible or shared with view permissions.
          <a 
            href="https://support.google.com/docs/answer/2494822" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 ml-2 text-primary hover:underline"
          >
            Learn how <ExternalLink className="h-3 w-3" />
          </a>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="spreadsheet-url" className="text-sm font-medium">
            Google Spreadsheet URL
          </Label>
          <Input
            id="spreadsheet-url"
            type="url"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={spreadsheetUrl}
            onChange={(e) => setSpreadsheetUrl(e.target.value)}
            required
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Paste the complete URL of your Google Spreadsheet
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="overall-range" className="text-sm font-medium">
              Overall Coverage Range
            </Label>
            <Input
              id="overall-range"
              placeholder="Sheet1!A1:G10"
              value={overallRange}
              onChange={(e) => setOverallRange(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Cell range containing overall test metrics
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="module-range" className="text-sm font-medium">
              Module Coverage Range
            </Label>
            <Input
              id="module-range"
              placeholder="Sheet1!A15:G25"
              value={moduleRange}
              onChange={(e) => setModuleRange(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Cell range containing module-wise metrics
            </p>
          </div>
        </div>

        <div className="bg-muted/30 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-sm">Expected Data Format:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-medium mb-1">Overall Range should contain:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Total Test Cases</li>
                <li>• Executed Cases</li>
                <li>• Passed Cases</li>
                <li>• Failed Cases</li>
                <li>• Blocked Cases</li>
                <li>• Not Executed Cases</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Module Range should contain:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Module/Feature Name</li>
                <li>• Total Cases per Module</li>
                <li>• Executed Cases per Module</li>
                <li>• Passed/Failed/Blocked counts</li>
              </ul>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={isLoading || !spreadsheetUrl || !overallRange || !moduleRange}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Loading Dashboard...
            </>
          ) : (
            "Generate Dashboard"
          )}
        </Button>
      </form>
    </div>
  );
};

export default SpreadsheetForm;