import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Plus, Database, Loader2, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Connection {
  id: string;
  name: string;
}

interface Sprint {
  id: string;
  name: string;
  path: string;
  startDate: string;
  finishDate: string;
  timeFrame: string;
}

interface ConnectionFormProps {
  onSubmit: (data: { storyIds?: string; sprintName?: string; connectionId: string }) => void;
  isLoading: boolean;
  error?: string | null;
}

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ConnectionForm = ({ onSubmit, isLoading, error }: ConnectionFormProps) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isAddingConnection, setIsAddingConnection] = useState(false);
  const [isDeletingConnection, setIsDeletingConnection] = useState<string | null>(null);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [isLoadingSprints, setIsLoadingSprints] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [sprintError, setSprintError] = useState<string | null>(null);
  
  // Form states
  const [reportType, setReportType] = useState<"story_ids" | "sprint_name">("story_ids");
  const [storyIds, setStoryIds] = useState("");
  const [selectedSprintName, setSelectedSprintName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Add connection form states
  const [newConnection, setNewConnection] = useState({
    name: "",
    azure_devops_org_url: "",
    azure_devops_project: "",
    azure_devops_pat: ""
  });

  // Fetch connections on component mount
  useEffect(() => {
    fetchConnections();
  }, []);

  // Fetch sprints when connection is selected
  useEffect(() => {
    if (selectedConnectionId) {
      fetchSprints(selectedConnectionId);
    }
  }, [selectedConnectionId]);

  const fetchConnections = async () => {
    setIsLoadingConnections(true);
    setConnectionError(null);
    try {
      const response = await fetch(`${VITE_API_URL}/connections`);
      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }
      const data = await response.json();
      setConnections(data.data);
      
      // Auto-select first connection if available
      if (data.count > 0 && !selectedConnectionId) {
        setSelectedConnectionId(data.data[0].id);
      }
    } catch (err: any) {
      setConnectionError(err.message || 'Failed to fetch connections');
    } finally {
      setIsLoadingConnections(false);
    }
  };

  const fetchSprints = async (connectionId: string) => {
    setIsLoadingSprints(true);
    setSprintError(null);
    try {
      const response = await fetch(`${VITE_API_URL}/sprints?connection_id=${connectionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sprints');
      }
      const data = await response.json();
      setSprints(data.data);
    } catch (err: any) {
      setSprintError(err.message || 'Failed to fetch sprints');
    } finally {
      setIsLoadingSprints(false);
    }
  };

  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingConnection(true);
    setConnectionError(null);
    
    try {
      const response = await fetch(`${VITE_API_URL}/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConnection),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add connection');
      }
      
      // Reset form and close dialog
      setNewConnection({
        name: "",
        azure_devops_org_url: "",
        azure_devops_project: "",
        azure_devops_pat: ""
      });
      setIsDialogOpen(false);
      
      // Refresh connections list
      await fetchConnections();
    } catch (err: any) {
      setConnectionError(err.message || 'Failed to add connection');
    } finally {
      setIsAddingConnection(false);
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    setIsDeletingConnection(connectionId);
    setConnectionError(null);
    
    try {
      const response = await fetch(`${VITE_API_URL}/connections/${connectionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete connection');
      }
      
      // If the deleted connection was selected, clear the selection
      if (selectedConnectionId === connectionId) {
        setSelectedConnectionId("");
        setSprints([]);
        setSelectedSprintName("");
      }
      
      // Refresh connections list
      await fetchConnections();
    } catch (err: any) {
      setConnectionError(err.message || 'Failed to delete connection');
    } finally {
      setIsDeletingConnection(null);
    }
  };

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedConnectionId) {
      return;
    }
    
    const data: { storyIds?: string; sprintName?: string; connectionId: string } = {
      connectionId: selectedConnectionId
    };
    
    if (reportType === "story_ids" && storyIds.trim()) {
      data.storyIds = storyIds.trim();
    } else if (reportType === "sprint_name" && selectedSprintName) {
      data.sprintName = selectedSprintName;
    } else {
      return; // Don't submit if no valid data
    }
    
    onSubmit(data);
  };

  return (
    <div className="space-y-6">
      {/* Add Connection Section */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Azure DevOps Connections</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Azure DevOps Connection</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddConnection} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="connection-name">Connection Name</Label>
                <Input
                  id="connection-name"
                  placeholder="My Azure DevOps"
                  value={newConnection.name}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="org-url">Azure DevOps Organization URL</Label>
                <Input
                  id="org-url"
                  placeholder="https://dev.azure.com/yourorg"
                  value={newConnection.azure_devops_org_url}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, azure_devops_org_url: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="Your Project Name"
                  value={newConnection.azure_devops_project}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, azure_devops_project: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pat">Personal Access Token</Label>
                <Input
                  id="pat"
                  type="password"
                  placeholder="Your PAT"
                  value={newConnection.azure_devops_pat}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, azure_devops_pat: e.target.value }))}
                  required
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isAddingConnection}
                >
                  {isAddingConnection ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Connection"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Connections Table */}
      {isLoadingConnections ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading connections...
        </div>
      ) : connections.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Connection Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connections.map((connection) => (
                  <TableRow 
                    key={connection.id}
                    className={selectedConnectionId === connection.id ? "bg-muted/50" : ""}
                  >
                    <TableCell>
                      <input
                        type="radio"
                        name="connection"
                        value={connection.id}
                        checked={selectedConnectionId === connection.id}
                        onChange={(e) => setSelectedConnectionId(e.target.value)}
                        className="h-4 w-4"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{connection.name}</TableCell>
                    <TableCell className="text-muted-foreground">{connection.id}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={isDeletingConnection === connection.id}
                          >
                            {isDeletingConnection === connection.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Connection</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the connection "{connection.name}"? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>No</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteConnection(connection.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Yes, Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Connections Found</h3>
            <p className="text-muted-foreground mb-4">
              Add your first Azure DevOps connection to get started.
            </p>
          </CardContent>
        </Card>
      )}

      {connectionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      {/* Report Generation Section */}
      {selectedConnectionId && (
        <Card>
          <CardHeader>
            <CardTitle>Generate RTM Report</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateReport} className="space-y-6">
              <RadioGroup 
                value={reportType} 
                onValueChange={(value: "story_ids" | "sprint_name") => setReportType(value)}
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="story_ids" id="story_ids" />
                    <Label htmlFor="story_ids">Enter User Story IDs</Label>
                  </div>
                  
                  {reportType === "story_ids" && (
                    <div className="ml-6 space-y-2">
                      <Input
                        placeholder="123,456,789"
                        value={storyIds}
                        onChange={(e) => setStoryIds(e.target.value)}
                        className="max-w-md"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter comma-separated user story IDs
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sprint_name" id="sprint_name" />
                    <Label htmlFor="sprint_name">Select Sprint</Label>
                  </div>
                  
                  {reportType === "sprint_name" && (
                    <div className="ml-6 space-y-2">
                      {isLoadingSprints ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading sprints...
                        </div>
                      ) : sprints.length > 0 ? (
                        <Select value={selectedSprintName} onValueChange={setSelectedSprintName}>
                          <SelectTrigger className="max-w-md">
                            <SelectValue placeholder="Select a sprint" />
                          </SelectTrigger>
                          <SelectContent>
                            {sprints.map((sprint) => (
                              <SelectItem key={sprint.id} value={sprint.name}>
                                {sprint.name} ({sprint.timeFrame})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm text-muted-foreground">No sprints available</p>
                      )}
                      
                      {sprintError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{sprintError}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              </RadioGroup>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={
                  isLoading || 
                  !selectedConnectionId || 
                  (reportType === "story_ids" && !storyIds.trim()) ||
                  (reportType === "sprint_name" && !selectedSprintName)
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  "Generate RTM Report"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConnectionForm;