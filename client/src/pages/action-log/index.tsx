import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CalendarIcon, Plus, Search, Filter, Loader2, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ActionLog } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Import our custom components
import { ActionLogCard } from '@/components/action-log/ActionLogCard';
import { ActionLogStats } from '@/components/action-log/ActionLogStats';
import { PrintableActionLogs } from '@/components/action-log/PrintableActionLogs';

const actionLogSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  requesterName: z.string().min(3, { message: 'Requester name must be at least 3 characters' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters' }),
  dueDate: z.date().optional(),
  status: z.enum(['pending', 'completed', 'under_review']),
  category: z.string().optional(),
  assignedTo: z.number().optional(),
  schoolId: z.number().optional(),
});

type FormData = z.infer<typeof actionLogSchema>;

export default function ActionLogPage() {
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActionLog | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const printableRef = useRef<HTMLDivElement>(null);
  
  // Function to handle printing
  const handlePrint = () => {
    window.print();
  };

  const { data: actionLogs = [], isLoading } = useQuery({
    queryKey: ['/api/action-logs'],
    queryFn: async () => {
      const response = await fetch('/api/action-logs');
      if (!response.ok) {
        throw new Error('Failed to fetch action logs');
      }
      return response.json();
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  });

  const { data: schools = [] } = useQuery({
    queryKey: ['/api/schools'],
    queryFn: async () => {
      const response = await fetch('/api/schools');
      if (!response.ok) {
        throw new Error('Failed to fetch schools');
      }
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/action-logs', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create action log');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Action log created successfully',
      });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/action-logs'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FormData> }) => {
      const response = await apiRequest('PATCH', `/api/action-logs/${id}`, data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update action log');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Action log updated successfully',
      });
      setIsEditDialogOpen(false);
      setSelectedLog(null);
      queryClient.invalidateQueries({ queryKey: ['/api/action-logs'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/action-logs/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete action log');
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Action log deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/action-logs'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const createForm = useForm<FormData>({
    resolver: zodResolver(actionLogSchema),
    defaultValues: {
      title: '',
      requesterName: '',
      description: '',
      status: 'pending',
      category: '',
    },
  });

  const editForm = useForm<FormData>({
    resolver: zodResolver(actionLogSchema),
    defaultValues: {
      title: '',
      requesterName: '',
      description: '',
      status: 'pending',
      category: '',
    },
  });

  const onCreateSubmit = (data: FormData) => {
    // Convert string date to proper Date object if it exists
    const formattedData = {
      ...data,
      // For dueDate, ensure it stays as a Date object for Zod validation
      dueDate: data.dueDate,
      // createdBy will be set on the server side
    };
    
    createMutation.mutate(formattedData);
  };

  const onEditSubmit = (data: FormData) => {
    if (selectedLog) {
      // Convert string date to proper Date object if it exists
      const formattedData = {
        ...data,
        // For dueDate, ensure it stays as a Date object for Zod validation
        dueDate: data.dueDate,
      };
      
      updateMutation.mutate({ id: selectedLog.id, data: formattedData });
    }
  };

  const handleEditClick = (log: ActionLog) => {
    setSelectedLog(log);
    
    // Convert string date to Date object if it exists and handle null values
    const formattedLog = {
      title: log.title,
      requesterName: log.requesterName,
      description: log.description,
      dueDate: log.dueDate ? new Date(log.dueDate) : undefined,
      status: log.status,
      category: log.category || undefined,
      assignedTo: log.assignedTo || undefined,
      schoolId: log.schoolId || undefined
    };
    
    editForm.reset(formattedLog);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    if (confirm('Are you sure you want to delete this action log?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: number, status: 'pending' | 'completed' | 'under_review') => {
    updateMutation.mutate({ id, data: { status } });
  };

  const filteredLogs = actionLogs.filter((log: ActionLog) => {
    const matchesSearch = 
      !searchQuery || 
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || log.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter logs based on active tab
  const getDisplayedLogs = () => {
    if (activeTab === 'all') {
      return filteredLogs;
    }
    return filteredLogs.filter((log: ActionLog) => log.status === activeTab);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header with title and actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Action Log
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage tasks, requests, and action items
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="print:hidden"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="print:hidden bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                <Plus className="mr-2 h-4 w-4" />
                New Action Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Action Item</DialogTitle>
                <DialogDescription>
                  Add a new task or request to track in the system.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Timesheet approval" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="requesterName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requester Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John Smith" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Please approve John's timesheet for week ending 04/14/2025"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="under_review">Under Review</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Timesheet, Leave, etc." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="schoolId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School (Optional)</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                          value={field.value?.toString() || "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select school" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {schools.map((school: any) => (
                              <SelectItem key={school.id} value={school.id.toString()}>
                                {school.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending}
                      className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                    >
                      {createMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create Action Item
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats area - only show if we have logs */}
      {actionLogs.length > 0 && (
        <div className="print:hidden">
          <ActionLogStats logs={actionLogs} />
        </div>
      )}

      {/* Search and filter */}
      <div className="flex gap-4 mb-6 print:hidden">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search action items..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {statusFilter ? (
                statusFilter === 'completed' ? 'Completed' : 
                statusFilter === 'pending' ? 'Pending' : 'Under Review'
              ) : 'Filter'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('under_review')}>
              Under Review
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Empty state */}
      {filteredLogs.length === 0 && (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>No Action Items Found</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="rounded-full bg-muted p-6">
              <Filter className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="mb-2">No action items match your current filter criteria.</p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter(null);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Log Items */}
      {filteredLogs.length > 0 && (
        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full print:hidden"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({filteredLogs.filter((log: ActionLog) => log.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({filteredLogs.filter((log: ActionLog) => log.status === 'completed').length})
            </TabsTrigger>
            <TabsTrigger value="under_review">
              Under Review ({filteredLogs.filter((log: ActionLog) => log.status === 'under_review').length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getDisplayedLogs().map((log: ActionLog) => (
              <ActionLogCard 
                key={log.id} 
                log={log} 
                onEdit={() => handleEditClick(log)}
                onDelete={() => handleDeleteClick(log.id)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </TabsContent>
          
          <TabsContent value="pending" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getDisplayedLogs().map((log: ActionLog) => (
              <ActionLogCard 
                key={log.id} 
                log={log} 
                onEdit={() => handleEditClick(log)}
                onDelete={() => handleDeleteClick(log.id)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </TabsContent>
          
          <TabsContent value="completed" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getDisplayedLogs().map((log: ActionLog) => (
              <ActionLogCard 
                key={log.id} 
                log={log} 
                onEdit={() => handleEditClick(log)}
                onDelete={() => handleDeleteClick(log.id)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </TabsContent>
          
          <TabsContent value="under_review" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getDisplayedLogs().map((log: ActionLog) => (
              <ActionLogCard 
                key={log.id} 
                log={log} 
                onEdit={() => handleEditClick(log)}
                onDelete={() => handleDeleteClick(log.id)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </TabsContent>
        </Tabs>
      )}

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Action Item</DialogTitle>
            <DialogDescription>
              Update the details of this action item.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="requesterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requester Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="schoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                      value={field.value?.toString() || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select school" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {schools.map((school: any) => (
                          <SelectItem key={school.id} value={school.id.toString()}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                >
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Action Item
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Printable content - hidden until print */}
      <PrintableActionLogs logs={filteredLogs} printRef={printableRef} />
    </div>
  );
}