import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Settings, Users, CalendarDays, BookOpen, Award, Clock, ChevronUp, Sliders, Save, Plus, Edit, Trash2, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DashboardWidget {
  id: number;
  name: string;
  type: 'chart' | 'list' | 'statistic' | 'calendar';
  position: number;
  enabled: boolean;
  settings: {
    dataSource?: string;
    displayLimit?: number;
    colorScheme?: string;
    showLabels?: boolean;
    refreshInterval?: number;
  };
}

interface DashboardSettings {
  id: number;
  showWelcomeMessage: boolean;
  showQuoteOfTheDay: boolean;
  enableNotifications: boolean;
  dashboardRefreshInterval: number;
  colorTheme: string;
  layout: 'grid' | 'list';
}

// Sample quote for the quote of the day
const defaultQuote = {
  text: "Leadership is not about being in charge. It is about taking care of those in your charge.",
  author: "Simon Sinek"
};

export default function ManageDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('widgets');
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);
  const [isWidgetDialogOpen, setIsWidgetDialogOpen] = useState(false);
  const [quote, setQuote] = useState(defaultQuote);
  
  // Mock data since we don't have an actual endpoint yet
  const dashboardSettings: DashboardSettings = {
    id: 1,
    showWelcomeMessage: true,
    showQuoteOfTheDay: true,
    enableNotifications: true,
    dashboardRefreshInterval: 5,
    colorTheme: 'blue',
    layout: 'grid'
  };
  
  const widgets: DashboardWidget[] = [
    {
      id: 1,
      name: 'Recent Leave Requests',
      type: 'list',
      position: 1,
      enabled: true,
      settings: {
        dataSource: 'staff-leave',
        displayLimit: 5,
        refreshInterval: 5
      }
    },
    {
      id: 2,
      name: 'Staff Attendance Overview',
      type: 'chart',
      position: 2,
      enabled: true,
      settings: {
        dataSource: 'staff-attendance',
        colorScheme: 'blue',
        showLabels: true,
        refreshInterval: 10
      }
    },
    {
      id: 3,
      name: 'Recent Evaluations',
      type: 'list',
      position: 3,
      enabled: true,
      settings: {
        dataSource: 'evaluations',
        displayLimit: 5,
        refreshInterval: 5
      }
    },
    {
      id: 4,
      name: 'Upcoming Events',
      type: 'calendar',
      position: 4,
      enabled: true,
      settings: {
        dataSource: 'events',
        displayLimit: 5,
        refreshInterval: 15
      }
    },
    {
      id: 5,
      name: 'School Statistics',
      type: 'statistic',
      position: 5,
      enabled: true,
      settings: {
        dataSource: 'schools',
        refreshInterval: 30
      }
    }
  ];
  
  // Function to handle saving dashboard settings
  const handleSaveSettings = () => {
    // In a real implementation, this would call an API endpoint
    toast({
      title: 'Settings saved',
      description: 'Dashboard settings have been updated successfully.',
    });
  };
  
  // Function to update widget position
  const moveWidgetUp = (id: number) => {
    // This would be implemented with proper API calls in a real application
    toast({
      title: 'Widget moved',
      description: 'Widget position has been updated.',
    });
  };
  
  const moveWidgetDown = (id: number) => {
    // This would be implemented with proper API calls in a real application
    toast({
      title: 'Widget moved',
      description: 'Widget position has been updated.',
    });
  };
  
  // Function to toggle widget visibility
  const toggleWidgetVisibility = (id: number, enabled: boolean) => {
    // This would be implemented with proper API calls in a real application
    toast({
      title: enabled ? 'Widget enabled' : 'Widget disabled',
      description: `Widget visibility has been ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };
  
  // Function to edit widget
  const openEditWidgetDialog = (widget: DashboardWidget) => {
    setEditingWidget(widget);
    setIsWidgetDialogOpen(true);
  };
  
  // Function to save widget changes
  const saveWidgetChanges = () => {
    if (!editingWidget) return;
    
    // This would be implemented with proper API calls in a real application
    toast({
      title: 'Widget updated',
      description: 'Widget settings have been saved successfully.',
    });
    
    setIsWidgetDialogOpen(false);
    setEditingWidget(null);
  };
  
  // Function to save quote of the day
  const saveQuote = () => {
    // This would be implemented with proper API calls in a real application
    toast({
      title: 'Quote updated',
      description: 'Dashboard quote has been updated successfully.',
    });
  };
  
  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">Dashboard Management</h1>
          <p className="text-gray-500">Configure and customize the dashboard for all users</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border border-gray-200 p-1">
          <TabsTrigger value="widgets" className="data-[state=active]:bg-gray-100">
            <Settings className="h-4 w-4 mr-2" />
            Dashboard Widgets
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-gray-100">
            <Sliders className="h-4 w-4 mr-2" />
            General Settings
          </TabsTrigger>
          <TabsTrigger value="quote" className="data-[state=active]:bg-gray-100">
            <BookOpen className="h-4 w-4 mr-2" />
            Quote of the Day
          </TabsTrigger>
        </TabsList>
        
        {/* Widgets Tab */}
        <TabsContent value="widgets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Dashboard Widgets</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Widget
                </Button>
              </div>
              <CardDescription>
                Manage dashboard widgets and their display order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {widgets.map(widget => (
                  <div key={widget.id} className="flex items-center justify-between p-4 border rounded-md bg-white">
                    <div className="flex items-center">
                      <div className="mr-4">
                        <div className="grid grid-flow-col gap-1">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => moveWidgetUp(widget.id)}>
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => moveWidgetDown(widget.id)}>
                            <ChevronUp className="h-4 w-4 rotate-180" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">{widget.name}</div>
                        <div className="text-sm text-gray-500">Type: {widget.type.charAt(0).toUpperCase() + widget.type.slice(1)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id={`widget-${widget.id}-enabled`}
                          checked={widget.enabled}
                          onCheckedChange={(checked) => toggleWidgetVisibility(widget.id, checked)}
                        />
                        <Label htmlFor={`widget-${widget.id}-enabled`}>Visible</Label>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => openEditWidgetDialog(widget)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit widget</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove the "{widget.name}" widget from the dashboard for all users.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete widget</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Default</Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Dashboard Settings</CardTitle>
              <CardDescription>
                Configure global dashboard settings for all users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Layout & Appearance</h3>
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="layout">Dashboard Layout</Label>
                      <Select defaultValue={dashboardSettings.layout}>
                        <SelectTrigger id="layout">
                          <SelectValue placeholder="Select layout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grid Layout</SelectItem>
                          <SelectItem value="list">List Layout</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="colorTheme">Color Theme</Label>
                      <Select defaultValue={dashboardSettings.colorTheme}>
                        <SelectTrigger id="colorTheme">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">Blue Theme</SelectItem>
                          <SelectItem value="green">Green Theme</SelectItem>
                          <SelectItem value="purple">Purple Theme</SelectItem>
                          <SelectItem value="amber">Amber Theme</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="refresh">Refresh Interval (minutes)</Label>
                    <Select defaultValue={dashboardSettings.dashboardRefreshInterval.toString()}>
                      <SelectTrigger id="refresh">
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 minute</SelectItem>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="0">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Features & Content</h3>
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="welcome">Show Welcome Message</Label>
                        <div className="text-sm text-muted-foreground">
                          Display personalized welcome message
                        </div>
                      </div>
                      <Switch id="welcome" defaultChecked={dashboardSettings.showWelcomeMessage} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="quote">Show Quote of the Day</Label>
                        <div className="text-sm text-muted-foreground">
                          Display motivational quote on dashboard
                        </div>
                      </div>
                      <Switch id="quote" defaultChecked={dashboardSettings.showQuoteOfTheDay} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Enable Notifications</Label>
                        <div className="text-sm text-muted-foreground">
                          Show alert notifications for urgent items
                        </div>
                      </div>
                      <Switch id="notifications" defaultChecked={dashboardSettings.enableNotifications} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="colorcode">Color-Code Notifications</Label>
                        <div className="text-sm text-muted-foreground">
                          Red for absences, amber for leaves, purple for low scores
                        </div>
                      </div>
                      <Switch id="colorcode" defaultChecked={true} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Default</Button>
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Quote Tab */}
        <TabsContent value="quote" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Quote</CardTitle>
              <CardDescription>
                Update the quote displayed on the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quote-text">Quote Text</Label>
                <Textarea 
                  id="quote-text" 
                  value={quote.text}
                  onChange={(e) => setQuote({...quote, text: e.target.value})}
                  placeholder="Enter quote text"
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">Current quote: "Leadership is not about being in charge. It is about taking care of those in your charge."</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quote-author">Quote Author</Label>
                <Input 
                  id="quote-author" 
                  value={quote.author}
                  onChange={(e) => setQuote({...quote, author: e.target.value})}
                  placeholder="Enter author name"
                />
                <p className="text-sm text-muted-foreground">Current author: Simon Sinek</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Preview</h4>
                    <div className="mt-2 p-4 bg-[#0A2463] rounded shadow-sm italic text-white">
                      "{quote.text}"
                      <div className="text-right mt-2 font-medium">— {quote.author}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setQuote(defaultQuote)}>Reset</Button>
              <Button onClick={saveQuote}>Save Quote</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Widget Dialog */}
      <Dialog open={isWidgetDialogOpen} onOpenChange={setIsWidgetDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Widget</DialogTitle>
            <DialogDescription>
              Customize the widget settings and appearance
            </DialogDescription>
          </DialogHeader>
          {editingWidget && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="widget-name">Widget Name</Label>
                <Input 
                  id="widget-name" 
                  value={editingWidget.name}
                  onChange={(e) => setEditingWidget({...editingWidget, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="widget-type">Widget Type</Label>
                  <Select 
                    value={editingWidget.type}
                    onValueChange={(value: 'chart' | 'list' | 'statistic' | 'calendar') => 
                      setEditingWidget({...editingWidget, type: value})
                    }
                  >
                    <SelectTrigger id="widget-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chart">Chart</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="statistic">Statistic</SelectItem>
                      <SelectItem value="calendar">Calendar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="widget-datasource">Data Source</Label>
                  <Select 
                    value={editingWidget.settings.dataSource}
                    onValueChange={(value) => 
                      setEditingWidget({
                        ...editingWidget, 
                        settings: {...editingWidget.settings, dataSource: value}
                      })
                    }
                  >
                    <SelectTrigger id="widget-datasource">
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff-leave">Staff Leave</SelectItem>
                      <SelectItem value="staff-attendance">Staff Attendance</SelectItem>
                      <SelectItem value="evaluations">Evaluations</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="schools">Schools</SelectItem>
                      <SelectItem value="instructors">Instructors</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="courses">Courses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="widget-limit">Display Limit</Label>
                  <Select 
                    value={editingWidget.settings.displayLimit?.toString() || "5"}
                    onValueChange={(value) => 
                      setEditingWidget({
                        ...editingWidget, 
                        settings: {...editingWidget.settings, displayLimit: parseInt(value)}
                      })
                    }
                  >
                    <SelectTrigger id="widget-limit">
                      <SelectValue placeholder="Select limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 items</SelectItem>
                      <SelectItem value="5">5 items</SelectItem>
                      <SelectItem value="10">10 items</SelectItem>
                      <SelectItem value="15">15 items</SelectItem>
                      <SelectItem value="20">20 items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="widget-refresh">Refresh Interval (minutes)</Label>
                  <Select 
                    value={editingWidget.settings.refreshInterval?.toString() || "5"}
                    onValueChange={(value) => 
                      setEditingWidget({
                        ...editingWidget, 
                        settings: {...editingWidget.settings, refreshInterval: parseInt(value)}
                      })
                    }
                  >
                    <SelectTrigger id="widget-refresh">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minute</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="0">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {editingWidget.type === 'chart' && (
                <div className="space-y-2">
                  <Label htmlFor="widget-colorscheme">Color Scheme</Label>
                  <Select 
                    value={editingWidget.settings.colorScheme || "blue"}
                    onValueChange={(value) => 
                      setEditingWidget({
                        ...editingWidget, 
                        settings: {...editingWidget.settings, colorScheme: value}
                      })
                    }
                  >
                    <SelectTrigger id="widget-colorscheme">
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="amber">Amber</SelectItem>
                      <SelectItem value="multi">Multi-color</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {editingWidget.type === 'chart' && (
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="widget-labels" 
                    checked={editingWidget.settings.showLabels || false}
                    onCheckedChange={(checked) => 
                      setEditingWidget({
                        ...editingWidget, 
                        settings: {...editingWidget.settings, showLabels: checked}
                      })
                    }
                  />
                  <Label htmlFor="widget-labels">Show Labels</Label>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWidgetDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveWidgetChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}