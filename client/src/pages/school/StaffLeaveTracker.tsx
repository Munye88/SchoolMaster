import { useParams } from 'wouter';
import { Instructor } from '@shared/schema';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState, useEffect, useRef } from 'react';
import { PlusCircle, Calendar as CalendarIcon, FileText, Loader2, Save, Paperclip, Download, Eye, Edit, Trash2, Printer } from 'lucide-react';
import { useSchool } from '@/hooks/useSchool';
import { format, addDays } from 'date-fns';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { PrintButton } from '@/components/ui/print-button';

// Custom date formatter with ordinal suffix (1st, 2nd, 3rd, etc.)
function formatWithOrdinal(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  
  let suffix = 'th';
  if (day % 10 === 1 && day !== 11) {
    suffix = 'st';
  } else if (day % 10 === 2 && day !== 12) {
    suffix = 'nd';
  } else if (day % 10 === 3 && day !== 13) {
    suffix = 'rd';
  }
  
  return `${month} ${day}${suffix}, ${year}`;
}

// Define the interface for staff leave data from API
interface StaffLeave {
  id: number;
  instructorId: number;
  instructorName: string;
  employeeId?: string; // Employee ID field
  startDate: string;
  endDate: string;
  returnDate: string;
  ptodays: number;
  rrdays: number;
  leaveType: string;
  destination: string;
  status: string;
  comments?: string;
  approvedBy?: number;
  schoolId: number;
  attachmentUrl?: string; // URL to attachment
}

// Alias for form data, including schoolId
interface LeaveFormData extends Omit<StaffLeave, 'id' | 'instructorName'> {}

// Define validation schema for the leave form
const leaveFormSchema = z.object({
  instructorId: z.number({
    required_error: "Instructor is required",
    invalid_type_error: "Instructor is required",
  }),
  employeeId: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  returnDate: z.string().min(1, "Return date is required"),
  ptodays: z.number({
    required_error: "PTO days are required",
    invalid_type_error: "PTO days must be a number",
  }).min(0, "PTO days must be a positive number"),
  rrdays: z.number({
    required_error: "R&R days are required", 
    invalid_type_error: "R&R days must be a number",
  }).min(0, "R&R days must be a positive number"),
  leaveType: z.string().min(1, "Leave type is required"),
  destination: z.string().min(1, "Destination is required"),
  status: z.string().min(1, "Status is required"),
  comments: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

type LeaveFormValues = z.infer<typeof leaveFormSchema>;

export default function StaffLeaveTracker() {
  const params = useParams();
  const { schoolCode } = params;
  const { schools, selectSchool } = useSchool();
  const { toast } = useToast();
  
  // UI state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<StaffLeave | null>(null);
  
  // Create an edit form separate from the add form
  const editForm = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      instructorId: 0,
      employeeId: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      returnDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      ptodays: 0,
      rrdays: 0,
      leaveType: 'PTO',
      destination: '',
      status: 'Pending',
      comments: '',
      attachmentUrl: '',
    },
  });
  
  // Find the current school from all schools
  const currentSchool = schools.find(school => school.code === schoolCode);
  
  // Set the selected school based on the schoolCode from the URL
  useEffect(() => {
    if (currentSchool) {
      selectSchool(currentSchool);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSchool, schoolCode]);
  
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MMMM'));
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Fetch staff leave data from API
  const { 
    data: leaveRecords = [], 
    isLoading, 
    error 
  } = useQuery<StaffLeave[]>({
    queryKey: ['/api/staff-leave', currentSchool?.id],
    enabled: !!currentSchool?.id,
  });
  
  // Fetch instructors for the current school
  const { 
    data: instructors = [],
    isLoading: isLoadingInstructors
  } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors', currentSchool?.id],
    enabled: !!currentSchool?.id,
  });
  
  // Filter instructors by current school
  const schoolInstructors = currentSchool 
    ? instructors.filter((instructor) => instructor.schoolId === currentSchool.id)
    : [];
  
  // Filter leave records by selected school
  const schoolLeaveRecords = currentSchool 
    ? leaveRecords.filter(record => record.schoolId === currentSchool.id)
    : leaveRecords;
    
  // Initialize the form
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      instructorId: 0,
      employeeId: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      returnDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      ptodays: 0,
      rrdays: 0,
      leaveType: 'PTO',
      destination: '',
      status: 'Pending',
      comments: '',
      attachmentUrl: '',
    },
  });
  
  // Create leave record mutation
  const createLeaveMutation = useMutation({
    mutationFn: async (newLeave: LeaveFormData) => {
      const res = await apiRequest('POST', '/api/staff-leave', newLeave);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-leave'] });
    }
  });
  
  // Update leave record mutation
  const updateLeaveMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<LeaveFormData> }) => {
      const res = await apiRequest('PATCH', `/api/staff-leave/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-leave'] });
    }
  });
  
  // Delete leave record mutation
  const deleteLeaveMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/staff-leave/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff-leave'] });
    }
  });
  
  // Form submission handler
  const onSubmit = async (values: LeaveFormValues) => {
    try {
      if (!currentSchool) {
        toast({
          title: "Error",
          description: "School information not available",
          variant: "destructive",
        });
        return;
      }
      
      const leaveData: LeaveFormData = {
        ...values,
        schoolId: currentSchool.id
      };
      
      await createLeaveMutation.mutateAsync(leaveData);
      
      toast({
        title: "Success",
        description: "Leave request created successfully",
      });
      
      // Reset form and close dialog
      form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error submitting leave request:", error);
      toast({
        title: "Error",
        description: "Failed to create leave request",
        variant: "destructive",
      });
    }
  };
  
  // Calculate days between two dates
  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return diffDays;
  };
  
  // Update total days when dates change for add form
  useEffect(() => {
    const startDate = form.watch('startDate');
    const endDate = form.watch('endDate');
    const returnDate = form.watch('returnDate');
    
    if (startDate && endDate && returnDate) {
      const totalDays = calculateDays(startDate, endDate);
      const returnDays = calculateDays(endDate, returnDate);
      
      // Update PTO days based on total days
      form.setValue('ptodays', totalDays);
      
      // Update R&R days based on return date
      form.setValue('rrdays', returnDays - 1); // -1 because return day is not counted as R&R
    }
  }, [form.watch('startDate'), form.watch('endDate'), form.watch('returnDate')]);
  
  // Update total days when dates change for edit form
  useEffect(() => {
    const startDate = editForm.watch('startDate');
    const endDate = editForm.watch('endDate');
    const returnDate = editForm.watch('returnDate');
    
    if (startDate && endDate && returnDate) {
      const totalDays = calculateDays(startDate, endDate);
      const returnDays = calculateDays(endDate, returnDate);
      
      // Update PTO days based on total days
      editForm.setValue('ptodays', totalDays);
      
      // Update R&R days based on return date
      editForm.setValue('rrdays', returnDays - 1); // -1 because return day is not counted as R&R
    }
  }, [editForm.watch('startDate'), editForm.watch('endDate'), editForm.watch('returnDate')]);
  
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{currentSchool?.name} - Staff Leave Tracker</h1>
        <div className="flex items-center space-x-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>{date ? format(date, 'PPP') : 'Pick a date'}</span>
            </Button>
            
            {showCalendar && (
              <div className="absolute right-0 z-10">
                <Card>
                  <CardContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        setDate(newDate);
                        setShowCalendar(false);
                      }}
                      initialFocus
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          <PrintButton 
            contentId="leaveTrackerContent" 
            variant="outline"
          />
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0A2463]">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Leave Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Leave Request</DialogTitle>
                <DialogDescription>
                  Create a new leave request for an instructor
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="instructorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructor</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select instructor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingInstructors ? (
                              <div className="p-2 flex items-center justify-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Loading instructors...</span>
                              </div>
                            ) : (
                              schoolInstructors.map((instructor) => (
                                <SelectItem key={instructor.id} value={instructor.id.toString()}>
                                  {instructor.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter employee ID"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the instructor's employee ID
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="attachmentUrl"
                    render={({ field }) => {
                      const fileInputRef = useRef<HTMLInputElement>(null);
                      return (
                        <FormItem>
                          <FormLabel>Leave Form Attachment</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    // Handle file upload here - this would be connected to your API
                                    // For now, just storing the file name
                                    field.onChange(file.name);
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Paperclip className="h-4 w-4 mr-2" />
                                Attach Leave Form
                              </Button>
                              {field.value && (
                                <span className="text-sm text-gray-500">
                                  {field.value.split('/').pop()}
                                </span>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Upload a copy of the leave form (PDF or image)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="returnDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Return Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ptodays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PTO Days</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="rrdays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>R&R Days</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="leaveType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leave Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select leave type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PTO">PTO</SelectItem>
                            <SelectItem value="R&R">R&R</SelectItem>
                            <SelectItem value="Paternity">Paternity</SelectItem>
                            <SelectItem value="Bereavement">Bereavement</SelectItem>
                            <SelectItem value="Negative PTO">Negative PTO</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter destination" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
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
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comments</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Add any additional comments"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createLeaveMutation.isPending}
                      className="bg-[#0A2463]"
                    >
                      {createLeaveMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Request
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Main card with table for display on screen */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Leave Records</CardTitle>
          <CardDescription>
            Overview of all staff leave requests and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NAME</TableHead>
                <TableHead>EMPLOYEE ID</TableHead>
                <TableHead>LEAVE TYPE</TableHead>
                <TableHead>PTO</TableHead>
                <TableHead>R&R</TableHead>
                <TableHead>DESTINATION</TableHead>
                <TableHead>RETURN</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading leave records...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : schoolLeaveRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No leave records found for this school. Add a new leave request using the button above.
                  </TableCell>
                </TableRow>
              ) : (
                schoolLeaveRecords.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">{leave.instructorName}</TableCell>
                    <TableCell>{leave.employeeId || `INST-${leave.instructorId.toString().padStart(4, '0')}`}</TableCell>
                    <TableCell>{leave.leaveType || 'PTO'}</TableCell>
                    <TableCell>{leave.ptodays} days</TableCell>
                    <TableCell>{leave.rrdays} days</TableCell>
                    <TableCell>{leave.destination}</TableCell>
                    <TableCell>{format(new Date(leave.returnDate), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedLeave(leave);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedLeave(leave);
                            // Populate form with selected leave data
                            editForm.reset({
                              instructorId: leave.instructorId,
                              employeeId: leave.employeeId || '',
                              startDate: format(new Date(leave.startDate), 'yyyy-MM-dd'),
                              endDate: format(new Date(leave.endDate), 'yyyy-MM-dd'),
                              returnDate: format(new Date(leave.returnDate), 'yyyy-MM-dd'),
                              ptodays: leave.ptodays,
                              rrdays: leave.rrdays,
                              leaveType: leave.leaveType || 'PTO',
                              destination: leave.destination,
                              status: leave.status,
                              comments: leave.comments || '',
                              attachmentUrl: leave.attachmentUrl || '',
                            });
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (leave.attachmentUrl) {
                              // Download or view the attachment
                              window.open(leave.attachmentUrl, '_blank');
                            } else {
                              toast({
                                title: "No Attachment",
                                description: "No attachment has been uploaded for this leave request.",
                                variant: "default"
                              });
                            }
                          }}
                          className={!leave.attachmentUrl ? "opacity-50" : ""}
                        >
                          <Paperclip className="h-4 w-4 mr-1" />
                          Attachment
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Hidden table specifically formatted for printing */}
      <div id="leaveTrackerContent" className="hidden print:block mt-8 p-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">{currentSchool?.name} - Staff Leave Records</h1>
          <p className="text-base text-gray-600">Generated on {format(new Date(), 'MMMM d, yyyy')}</p>
        </div>

        <table className="w-full border-collapse border-spacing-y-4">
          <thead>
            <tr>
              <th className="py-4 text-left font-bold border-b-2 border-gray-400">Instructor</th>
              <th className="py-4 text-left font-bold border-b-2 border-gray-400">Employee ID</th>
              <th className="py-4 text-left font-bold border-b-2 border-gray-400">Leave Type</th>
              <th className="py-4 text-center font-bold border-b-2 border-gray-400">PTO</th>
              <th className="py-4 text-center font-bold border-b-2 border-gray-400">R&R</th>
              <th className="py-4 text-left font-bold border-b-2 border-gray-400">Destination</th>
              <th className="py-4 text-left font-bold border-b-2 border-gray-400">Start</th>
              <th className="py-4 text-left font-bold border-b-2 border-gray-400">End</th>
              <th className="py-4 text-left font-bold border-b-2 border-gray-400">Return</th>
            </tr>
          </thead>
          <tbody className="mt-4">
            {schoolLeaveRecords.map((leave, index) => (
              <tr key={leave.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-4 px-2 border-b border-gray-200">{leave.instructorName}</td>
                <td className="py-4 px-2 border-b border-gray-200">{leave.employeeId || `INST-${leave.instructorId.toString().padStart(4, '0')}`}</td>
                <td className="py-4 px-2 border-b border-gray-200">{leave.leaveType || 'PTO'}</td>
                <td className="py-4 px-2 border-b border-gray-200 text-center">{leave.ptodays}</td>
                <td className="py-4 px-2 border-b border-gray-200 text-center">{leave.rrdays}</td>
                <td className="py-4 px-2 border-b border-gray-200">{leave.destination}</td>
                <td className="py-4 px-2 border-b border-gray-200">{format(new Date(leave.startDate), 'MMM d')}</td>
                <td className="py-4 px-2 border-b border-gray-200">{format(new Date(leave.endDate), 'MMM d')}</td>
                <td className="py-4 px-2 border-b border-gray-200">{format(new Date(leave.returnDate), 'MMM d')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Leave Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader className="leave-details-dialog-header">
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              View details for {selectedLeave?.instructorName}'s leave request
            </DialogDescription>
          </DialogHeader>
          
          {selectedLeave && (
            <div className="py-4 leave-details" id="leave-details-print">
              {/* Instructor and ID Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-6 mb-6 instructor-card">
                <div className="mb-3">
                  <h4 className="text-base font-medium mb-1">Instructor</h4>
                  <p className="text-lg font-bold instructor-name">{selectedLeave.instructorName}</p>
                </div>
                <div>
                  <h4 className="text-base font-medium mb-1">Employee ID</h4>
                  <p className="text-base">{selectedLeave.employeeId || `INST-${selectedLeave.instructorId.toString().padStart(4, '0')}`}</p>
                </div>
              </div>
              
              {/* Dates Row */}
              <div className="grid grid-cols-3 gap-6 mb-6 dates-grid">
                <div>
                  <h4 className="text-base font-medium mb-1">Start Date</h4>
                  <p className="text-base">{formatWithOrdinal(new Date(selectedLeave.startDate))}</p>
                </div>
                <div>
                  <h4 className="text-base font-medium mb-1">End Date</h4>
                  <p className="text-base">{formatWithOrdinal(new Date(selectedLeave.endDate))}</p>
                </div>
                <div>
                  <h4 className="text-base font-medium mb-1">Return Date</h4>
                  <p className="text-base">{formatWithOrdinal(new Date(selectedLeave.returnDate))}</p>
                </div>
              </div>
              
              {/* Leave Type and Days Row */}
              <div className="grid grid-cols-3 gap-6 mb-6 leave-type-grid">
                <div>
                  <h4 className="text-base font-medium mb-1">Leave Type</h4>
                  <p className="text-base">{selectedLeave.leaveType || 'PTO'}</p>
                </div>
                <div>
                  <h4 className="text-base font-medium mb-1">PTO Days</h4>
                  <p className="text-base">{selectedLeave.ptodays} days</p>
                </div>
                <div>
                  <h4 className="text-base font-medium mb-1">R&R Days</h4>
                  <p className="text-base">{selectedLeave.rrdays} days</p>
                </div>
              </div>
              
              {/* Destination */}
              <div className="mb-6">
                <h4 className="text-base font-medium mb-1">Destination</h4>
                <p className="text-base">{selectedLeave.destination}</p>
              </div>
              
              {/* Status */}
              <div className="mb-6">
                <h4 className="text-base font-medium mb-1">Status</h4>
                <p className="text-base">{selectedLeave.status}</p>
              </div>
              
              {/* Comments (if any) */}
              {selectedLeave.comments && (
                <div className="mb-6">
                  <h4 className="text-base font-medium mb-1">Comments</h4>
                  <p className="text-base">{selectedLeave.comments}</p>
                </div>
              )}
              
              {/* Attachment */}
              <div>
                <h4 className="text-base font-medium mb-1">Attachment</h4>
                {selectedLeave.attachmentUrl ? (
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="default"
                      onClick={() => {
                        window.open(selectedLeave.attachmentUrl, '_blank');
                      }}
                      className="no-print"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      View Attachment
                    </Button>
                    <span className="text-gray-500">
                      {selectedLeave.attachmentUrl.split('/').pop()}
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-500">No attachment has been uploaded for this leave request.</p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="leave-details-dialog-footer">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <PrintButton contentId="leave-details-print" variant="secondary">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </PrintButton>
            <Button 
              variant="default" 
              className="bg-[#0A2463]"
              onClick={() => {
                setViewDialogOpen(false);
                if (selectedLeave) {
                  editForm.reset({
                    instructorId: selectedLeave.instructorId,
                    employeeId: selectedLeave.employeeId || '',
                    startDate: format(new Date(selectedLeave.startDate), 'yyyy-MM-dd'),
                    endDate: format(new Date(selectedLeave.endDate), 'yyyy-MM-dd'),
                    returnDate: format(new Date(selectedLeave.returnDate), 'yyyy-MM-dd'),
                    ptodays: selectedLeave.ptodays,
                    rrdays: selectedLeave.rrdays,
                    leaveType: selectedLeave.leaveType || 'PTO',
                    destination: selectedLeave.destination,
                    status: selectedLeave.status,
                    comments: selectedLeave.comments || '',
                    attachmentUrl: selectedLeave.attachmentUrl || '',
                  });
                  setEditDialogOpen(true);
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Leave Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Leave Request</DialogTitle>
            <DialogDescription>
              {selectedLeave ? `Update leave request for ${selectedLeave.instructorName}` : 'Update leave request'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(async (values) => {
              try {
                if (!selectedLeave) {
                  toast({
                    title: "Error",
                    description: "No leave request selected",
                    variant: "destructive",
                  });
                  return;
                }
                
                await updateLeaveMutation.mutateAsync({
                  id: selectedLeave.id,
                  data: values
                });
                
                toast({
                  title: "Success",
                  description: "Leave request updated successfully",
                });
                
                setEditDialogOpen(false);
              } catch (error) {
                console.error("Error updating leave request:", error);
                toast({
                  title: "Error",
                  description: "Failed to update leave request",
                  variant: "destructive",
                });
              }
            })} className="space-y-4 py-4">
              <FormField
                control={editForm.control}
                name="instructorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select instructor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingInstructors ? (
                          <div className="p-2 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Loading instructors...</span>
                          </div>
                        ) : (
                          schoolInstructors.map((instructor) => (
                            <SelectItem key={instructor.id} value={instructor.id.toString()}>
                              {instructor.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter employee ID"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the instructor's employee ID
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="attachmentUrl"
                render={({ field }) => {
                  const fileInputRef = useRef<HTMLInputElement>(null);
                  return (
                    <FormItem>
                      <FormLabel>Leave Form Attachment</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Handle file upload here - this would be connected to your API
                                // For now, just storing the file name
                                field.onChange(file.name);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="h-4 w-4 mr-2" />
                            {field.value ? 'Replace Attachment' : 'Attach Leave Form'}
                          </Button>
                          {field.value && (
                            <span className="text-sm text-gray-500">
                              {field.value.split('/').pop()}
                            </span>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload or replace the leave form (PDF or image)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="returnDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="ptodays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PTO Days</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="rrdays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>R&R Days</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="leaveType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PTO">PTO</SelectItem>
                        <SelectItem value="R&R">R&R</SelectItem>
                        <SelectItem value="Paternity">Paternity</SelectItem>
                        <SelectItem value="Bereavement">Bereavement</SelectItem>
                        <SelectItem value="Negative PTO">Negative PTO</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter destination" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Add any additional comments"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateLeaveMutation.isPending}
                  className="bg-[#0A2463]"
                >
                  {updateLeaveMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Request
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}