import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, MapPin, Edit, Trash2, Plus, Loader2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useSchool } from '@/hooks/useSchool';

// Schema for event form validation
const eventFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  description: z.string().optional(),
  schoolId: z.string().min(1, { message: 'Please select a school' }),
  start: z.string().min(1, { message: 'Start date is required' }),
  startTime: z.string().min(1, { message: 'Start time is required' }),
  end: z.string().min(1, { message: 'End date is required' }),
  endTime: z.string().min(1, { message: 'End time is required' }),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function EventsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  // Get all schools for dropdown
  const { data: schools = [] } = useQuery({
    queryKey: ['/api/schools'],
  });

  // Get all events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events'],
  });

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(b.start).getTime() - new Date(a.start).getTime();
  });

  // Create event form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      schoolId: '',
      start: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      end: format(new Date(), 'yyyy-MM-dd'),
      endTime: '17:00',
    },
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: 'Event created',
        description: 'The event has been created successfully.',
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
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update event');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setIsDialogOpen(false);
      setEditingEvent(null);
      form.reset();
      toast({
        title: 'Event updated',
        description: 'The event has been updated successfully.',
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

  // Handle form submission
  const onSubmit = (data: EventFormValues) => {
    // Combine date and time fields
    const startDateTime = new Date(`${data.start}T${data.startTime}:00`);
    const endDateTime = new Date(`${data.end}T${data.endTime}:00`);
    
    const eventData = {
      title: data.title,
      description: data.description || null,
      schoolId: parseInt(data.schoolId) || null,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
    };
    
    if (editingEvent) {
      updateEventMutation.mutate(eventData);
    } else {
      createEventMutation.mutate(eventData);
    }
  };

  // Open edit dialog with event data
  const handleEditEvent = (event: any) => {
    const startDate = format(new Date(event.start), 'yyyy-MM-dd');
    const startTime = format(new Date(event.start), 'HH:mm');
    const endDate = format(new Date(event.end), 'yyyy-MM-dd');
    const endTime = format(new Date(event.end), 'HH:mm');
    
    form.reset({
      title: event.title,
      description: event.description || '',
      schoolId: event.schoolId ? event.schoolId.toString() : '',
      start: startDate,
      startTime: startTime,
      end: endDate,
      endTime: endTime,
    });
    
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  // Find school name by ID
  const getSchoolName = (schoolId: number | null) => {
    if (!schoolId) return 'All Schools';
    const school = schools.find((s) => s.id === schoolId);
    return school ? school.name : 'Unknown School';
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">Event Management</h1>
          <p className="text-gray-500">Manage all school events and activities</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              form.reset({
                title: '',
                description: '',
                schoolId: '',
                start: format(new Date(), 'yyyy-MM-dd'),
                startTime: '09:00',
                end: format(new Date(), 'yyyy-MM-dd'),
                endTime: '17:00',
              });
              setEditingEvent(null);
            }} className="bg-[#0A2463]">
              <Plus className="mr-2 h-4 w-4" />
              Create New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
              <DialogDescription>
                {editingEvent ? 'Update the details for this event' : 'Add a new event to the calendar'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter event description" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="schoolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a school" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">All Schools</SelectItem>
                          {schools.map((school) => (
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
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date*</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time*</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="end"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date*</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time*</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={createEventMutation.isPending || updateEventMutation.isPending}>
                    {(createEventMutation.isPending || updateEventMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#0A2463]" />
        </div>
      ) : (
        <div className="grid gap-6">
          {sortedEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-[#0A2463]">{event.title}</CardTitle>
                    <CardDescription>
                      <span className="inline-flex items-center text-sm">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        {getSchoolName(event.schoolId)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEvent(event)}
                      className="h-8 px-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-red-500 border-red-200 hover:bg-red-50"
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
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {event.description && (
                  <p className="text-gray-600 mb-4">{event.description}</p>
                )}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1.5 text-blue-600" />
                    <span>
                      {format(new Date(event.start), 'MMMM d, yyyy')}
                      {format(new Date(event.start), 'yyyy-MM-dd') !== format(new Date(event.end), 'yyyy-MM-dd') && 
                        ` - ${format(new Date(event.end), 'MMMM d, yyyy')}`}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1.5 text-blue-600" />
                    <span>
                      {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {sortedEvents.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-500 mb-2">No events found</h3>
              <p className="text-gray-400 mb-6">There are no events scheduled at this time.</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      form.reset();
                      setEditingEvent(null);
                      setIsDialogOpen(true);
                    }}
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add the first event
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </div>
      )}
    </div>
  );
}