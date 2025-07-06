import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { DateRange } from 'react-day-picker';
import { format, parseISO, isValid, startOfDay, endOfDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Plus, Trash2, Edit, Loader2, Filter, CalendarDays, Search, AlertTriangle, X, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Event {
  id: number;
  title: string;
  start: string;
  end: string;
  description: string | null;
  schoolId: number | null;
}

interface School {
  id: number;
  name: string;
  code: string;
  location: string | null;
}

// Event form schema
const eventFormSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  start: z.date(),
  end: z.date(),
  description: z.string().optional(),
  schoolId: z.number().nullable(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function EventsPage() {
  const { toast } = useToast();
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Fetch events
  const { data: events = [], isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });
  
  // Fetch schools
  const { data: schools = [], isLoading: isLoadingSchools } = useQuery<School[]>({
    queryKey: ['/api/schools'],
  });
  
  // Filter events based on date range, search term, and school filter
  const filteredEvents = events.filter(event => {
    const matchesDateRange = !date?.from || !date?.to || (
      (new Date(event.start) >= startOfDay(date.from) &&
       new Date(event.start) <= endOfDay(date.to || date.from))
    );
    
    const matchesSearch = !searchTerm || (
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const matchesSchool = schoolFilter === 'all' || event.schoolId === schoolFilter || (schoolFilter === 0 && event.schoolId === null);
    
    return matchesDateRange && matchesSearch && matchesSchool;
  });
  
  // Create event form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      start: new Date(),
      end: new Date(),
      description: '',
      schoolId: null,
    },
  });
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          start: data.start.toISOString(),
          end: data.end.toISOString(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setIsAddEventOpen(false);
      form.reset();
      toast({
        title: 'Event created',
        description: 'The event has been created successfully.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async (data: EventFormValues & { id: number }) => {
      const { id, ...eventData } = data;
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          start: eventData.start.toISOString(),
          end: eventData.end.toISOString(),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update event');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setIsEditEventOpen(false);
      setSelectedEvent(null);
      toast({
        title: 'Event updated',
        description: 'The event has been updated successfully.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete event');
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: 'Event deleted',
        description: 'The event has been deleted successfully.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submit for creating event
  const onCreateSubmit = (data: EventFormValues) => {
    createEventMutation.mutate(data);
  };
  
  // Handle form submit for updating event
  const onUpdateSubmit = (data: EventFormValues) => {
    if (!selectedEvent) return;
    
    updateEventMutation.mutate({
      id: selectedEvent.id,
      ...data,
    });
  };
  
  // Handle edit event
  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    
    const startDate = parseISO(event.start);
    const endDate = parseISO(event.end);
    
    form.reset({
      title: event.title,
      start: isValid(startDate) ? startDate : new Date(),
      end: isValid(endDate) ? endDate : new Date(),
      description: event.description || '',
      schoolId: event.schoolId,
    });
    
    setIsEditEventOpen(true);
  };
  
  // Reset form for new event
  const handleAddNewEvent = () => {
    form.reset({
      title: '',
      start: new Date(),
      end: new Date(),
      description: '',
      schoolId: null,
    });
    setIsAddEventOpen(true);
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    setDate(undefined);
    setSearchTerm('');
    setSchoolFilter('all');
  };
  
  // Get school name by ID
  const getSchoolName = (schoolId: number | null) => {
    if (schoolId === null) return 'All Schools';
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : 'Unknown School';
  };
  
  // Render event badges by school
  const renderEventBadge = (schoolId: number | null) => {
    if (schoolId === null) {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">All Schools</Badge>;
    }
    
    const schoolColors: Record<string, string> = {
      'NFS_EAST': 'bg-blue-50 text-blue-700 border-blue-200',
      'NFS_WEST': 'bg-green-50 text-green-700 border-green-200',
      'KFNA': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    
    const school = schools.find(s => s.id === schoolId);
    const colorClass = school ? schoolColors[school.code] || 'bg-gray-50 text-gray-700 border-gray-200' : 'bg-gray-50 text-gray-700 border-gray-200';
    
    return <Badge variant="outline" className={colorClass}>{school ? school.name : 'Unknown School'}</Badge>;
  };
  
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">Event Management</h1>
          <p className="text-gray-500">Create and manage school events and activities</p>
        </div>
        <Button className="bg-[#0A2463]" onClick={handleAddNewEvent}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Event
        </Button>
      </div>
      
      <Card className="mb-6 rounded-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-center">Filter Events</CardTitle>
          <CardDescription className="text-center">
            Narrow down events by date range, school, or keywords
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Date Range</label>
              <div className="flex">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal w-full rounded-none",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Select date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                {date && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDate(undefined)}
                    className="ml-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">School</label>
              <Select
                value={schoolFilter.toString()}
                onValueChange={(value) => setSchoolFilter(value === 'all' ? 'all' : parseInt(value))}
              >
                <SelectTrigger className="rounded-none">
                  <SelectValue placeholder="All Schools" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="all">All Schools</SelectItem>
                  <SelectItem value="0">No Specific School</SelectItem>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id.toString()}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title or description"
                  className="pl-8 rounded-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="absolute right-2 top-2.5"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              {(date?.from || searchTerm || schoolFilter !== 'all') && (
                <Button variant="outline" size="sm" onClick={handleClearFilters} className="rounded-none">
                  <Filter className="mr-2 h-3 w-3" />
                  Clear Filters
                </Button>
              )}
              <div className="text-sm text-muted-foreground">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm mr-2">View:</span>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-none ${viewMode === 'list' ? 'bg-[#0A2463]' : ''}`}
              >
                List
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={`rounded-none ${viewMode === 'calendar' ? 'bg-[#0A2463]' : ''}`}
              >
                Calendar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="rounded-none">
        {isLoadingEvents ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#0A2463]" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-gray-50 rounded-md p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No events found</h3>
            <p className="text-gray-400 mb-6">There are no events matching your search criteria.</p>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : viewMode === 'list' ? (
          <CardContent className="p-0">
            <Table className="rounded-none">
              <TableHeader>
                <TableRow className="rounded-none">
                  <TableHead className="text-center font-bold">EVENT</TableHead>
                  <TableHead className="text-center font-bold">SCHOOL</TableHead>
                  <TableHead className="text-center font-bold">DATE</TableHead>
                  <TableHead className="text-center font-bold">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => {
                  const startDate = parseISO(event.start);
                  const endDate = parseISO(event.end);
                  const isValidStart = isValid(startDate);
                  const isValidEnd = isValid(endDate);
                  const formattedDate = isValidStart && isValidEnd 
                    ? format(startDate, 'do MMM yyyy') === format(endDate, 'do MMM yyyy')
                      ? `${format(startDate, 'do MMM yyyy')}, ${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`
                      : `${format(startDate, 'do MMM yyyy, h:mm a')} - ${format(endDate, 'do MMM yyyy, h:mm a')}`
                    : 'Invalid date';
                  
                  return (
                    <TableRow key={event.id} className="rounded-none">
                      <TableCell className="text-center">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          {event.description && (
                            <p className="text-xs text-gray-500 truncate max-w-[300px] mx-auto">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{renderEventBadge(event.schoolId)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <CalendarDays className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 rounded-none"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-red-500 border-red-200 hover:bg-red-50 rounded-none"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the event "{event.title}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => deleteEventMutation.mutate(event.id)}
                                >
                                  {deleteEventMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        ) : (
          <CardContent className="p-4">
            <div className="bg-gray-50 p-4 rounded-md text-center mb-4">
              <Info className="h-4 w-4 inline-block mr-1 text-blue-500" />
              <span className="text-sm text-gray-600">Calendar view is coming soon. Currently in development.</span>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => {
                const startDate = parseISO(event.start);
                const endDate = parseISO(event.end);
                const isValidStart = isValid(startDate);
                const isValidEnd = isValid(endDate);
                
                return (
                  <Card key={event.id} className="overflow-hidden border border-gray-200">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{event.title}</CardTitle>
                        <div className="flex space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleEditEvent(event)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit event</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <AlertDialog>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-red-500"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Delete event</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the event "{event.title}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => deleteEventMutation.mutate(event.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {renderEventBadge(event.schoolId)}
                    </CardHeader>
                    <CardContent className="pb-2">
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                      )}
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <CalendarDays className="h-4 w-4 mr-2 text-gray-400" />
                        <span>
                          {isValidStart ? format(startDate, 'do MMM yyyy') : 'Invalid date'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span>
                          {isValidStart && isValidEnd 
                            ? `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`
                            : 'Invalid time'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader className="text-center">
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event for your school calendar.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date & Time*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP p")
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
                          <div className="p-3 border-t border-gray-100">
                            <Input
                              type="time"
                              value={format(field.value, "HH:mm")}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(":");
                                const newDate = new Date(field.value);
                                newDate.setHours(parseInt(hours));
                                newDate.setMinutes(parseInt(minutes));
                                field.onChange(newDate);
                              }}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="end"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date & Time*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP p")
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
                          <div className="p-3 border-t border-gray-100">
                            <Input
                              type="time"
                              value={format(field.value, "HH:mm")}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(":");
                                const newDate = new Date(field.value);
                                newDate.setHours(parseInt(hours));
                                newDate.setMinutes(parseInt(minutes));
                                field.onChange(newDate);
                              }}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="schoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "null" ? null : parseInt(value))}
                      defaultValue={field.value === null ? "null" : field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a school" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">All Schools</SelectItem>
                        {schools.map((school) => (
                          <SelectItem key={school.id} value={school.id.toString()}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Leave as "All Schools" for events that apply to all schools
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter event description (optional)"
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="flex justify-center">
                <Button type="submit" disabled={createEventMutation.isPending} className="rounded-none">
                  {createEventMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Event
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Event Dialog */}
      {selectedEvent && (
        <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Update the details of this event.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date & Time*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP p")
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
                            <div className="p-3 border-t border-gray-100">
                              <Input
                                type="time"
                                value={format(field.value, "HH:mm")}
                                onChange={(e) => {
                                  const [hours, minutes] = e.target.value.split(":");
                                  const newDate = new Date(field.value);
                                  newDate.setHours(parseInt(hours));
                                  newDate.setMinutes(parseInt(minutes));
                                  field.onChange(newDate);
                                }}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="end"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date & Time*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP p")
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
                            <div className="p-3 border-t border-gray-100">
                              <Input
                                type="time"
                                value={format(field.value, "HH:mm")}
                                onChange={(e) => {
                                  const [hours, minutes] = e.target.value.split(":");
                                  const newDate = new Date(field.value);
                                  newDate.setHours(parseInt(hours));
                                  newDate.setMinutes(parseInt(minutes));
                                  field.onChange(newDate);
                                }}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="schoolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "null" ? null : parseInt(value))}
                        defaultValue={field.value === null ? "null" : field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a school" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">All Schools</SelectItem>
                          {schools.map((school) => (
                            <SelectItem key={school.id} value={school.id.toString()}>
                              {school.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Leave as "All Schools" for events that apply to all schools
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter event description (optional)"
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" type="button" className="mr-auto">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the event "{selectedEvent.title}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => {
                            deleteEventMutation.mutate(selectedEvent.id);
                            setIsEditEventOpen(false);
                          }}
                        >
                          {deleteEventMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button type="submit" disabled={updateEventMutation.isPending}>
                    {updateEventMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Event
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}