import { useParams } from 'wouter';
import { Instructor, PtoBalance } from '@shared/schema';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
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

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState, useEffect, useRef } from 'react';
import { PlusCircle, Calendar as CalendarIcon, FileText, Loader2, Save, Paperclip, Download, Eye, Edit, Trash2, Printer, Search, RefreshCw, Info as InfoIcon, Pencil as PencilIcon, Plus, Clock, User, MapPin, Timer, CalendarCheck, CheckCircle, Building, Settings, Users, ArrowRight, Info, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useSchool } from '@/hooks/useSchool';
import { format, addDays, differenceInCalendarDays } from 'date-fns';
import { cn } from '@/lib/utils';
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
  leaveBalance?: number; // Manual leave balance entry
  ptodays: number;
  rrdays: number;
  leaveType: "PTO" | "R&R" | "Emergency" | "Paternity" | "Bereavement" | "Other";
  destination: string;
  status: string;
  comments?: string;
  approvedBy?: number;
  schoolId: number;
  attachmentUrl?: string; // Optional attachment URL
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
  leaveBalance: z.number({
    required_error: "Leave balance is required",
    invalid_type_error: "Leave balance must be a number",
  }).min(0, "Leave balance must be a positive number"),
  ptodays: z.number({
    required_error: "PTO days are required",
    invalid_type_error: "PTO days must be a number",
  }).min(0, "PTO days must be a positive number"),
  rrdays: z.number({
    required_error: "R&R days are required", 
    invalid_type_error: "R&R days must be a number",
  }).min(0, "R&R days must be a positive number"),
  leaveType: z.enum(["PTO", "R&R", "Emergency", "Paternity", "Bereavement", "Other"], {
    required_error: "Leave type is required",
    invalid_type_error: "Invalid leave type selection",
  }),
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
      leaveBalance: 0,
      ptodays: 0,
      rrdays: 0,
      leaveType: 'PTO',
      destination: '',
      status: 'Pending',
      comments: '',
    },
  });

  // Form schema for editing PTO balance
  const editPtoBalanceSchema = z.object({
    totalDays: z.number().min(0),
    usedDays: z.number().min(0),
    adjustments: z.number().optional(),
  });

  const editPtoForm = useForm<z.infer<typeof editPtoBalanceSchema>>({
    resolver: zodResolver(editPtoBalanceSchema),
    defaultValues: {
      totalDays: 0,
      usedDays: 0,
      adjustments: 0,
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
  
  // For the employee ID search
  const [employeeIdSearch, setEmployeeIdSearch] = useState<string>('');
  
  // For the active tab selection
  const [activeTab, setActiveTab] = useState<string>("leave-records");
  
  // Current year for PTO balance tracking
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  // Track if PTO balances have been initialized
  const [ptoBalancesInitialized, setPtoBalancesInitialized] = useState<boolean>(false);
  
  // For PTO balance deletion
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ptoBalanceToDelete, setPtoBalanceToDelete] = useState<any>(null);
  const [editPtoDialogOpen, setEditPtoDialogOpen] = useState(false);
  const [ptoBalanceToEdit, setPtoBalanceToEdit] = useState<any>(null);
  
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
  
  // Fetch PTO balance data from API
  const {
    data: ptoBalances = [],
    isLoading: isLoadingPtoBalances,
    error: ptoBalanceError
  } = useQuery<(PtoBalance & { instructorName: string, schoolId: number })[]>({
    queryKey: ['/api/pto-balance', currentSchool?.id],
    enabled: !!currentSchool?.id && (activeTab === "pto-balance" || isDialogOpen),
  });
  
  // Filter PTO balances for the current school
  const schoolPtoBalances = ptoBalances.filter(balance => 
    instructors.some(instructor => 
      instructor.id === balance.instructorId && 
      instructor.schoolId === currentSchool?.id
    )
  );
  
  // Sync PTO balances mutation
  const syncPtoBalancesMutation = useMutation({
    mutationFn: async (year: number) => {
      const res = await apiRequest('POST', '/api/pto-balance/sync-all', { year });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pto-balance'] });
      toast({
        title: "PTO Balances Synchronized",
        description: "All instructors' PTO balances have been updated based on their approved leave records.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Synchronization Failed",
        description: "There was an error synchronizing PTO balances. Please try again.",
        variant: "destructive",
      });
      console.error("Error syncing PTO balances:", error);
    }
  });

  // Delete PTO balance mutation
  const deletePtoBalanceMutation = useMutation({
    mutationFn: async (balanceId: number) => {
      const res = await fetch(`/api/pto-balance/${balanceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete PTO balance');
      }
      
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "PTO balance record has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pto-balance'] });
      setDeleteDialogOpen(false);
      setPtoBalanceToDelete(null);
    },
    onError: (error) => {
      console.error('Error deleting PTO balance:', error);
      toast({
        title: "Error",
        description: "Failed to delete PTO balance record. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update PTO balance mutation
  const updatePtoBalanceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await fetch(`/api/pto-balance/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update PTO balance');
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "PTO balance has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pto-balance'] });
      setEditPtoDialogOpen(false);
      setPtoBalanceToEdit(null);
    },
    onError: (error) => {
      console.error('Error updating PTO balance:', error);
      toast({
        title: "Error",
        description: "Failed to update PTO balance. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Filter instructors by current school
  const schoolInstructors = currentSchool 
    ? instructors.filter((instructor) => instructor.schoolId === currentSchool.id)
    : [];
  
  // Get current instructor's PTO balance
  const getInstructorPtoBalance = (instructorId: number) => {
    const balance = ptoBalances.find(b => b.instructorId === instructorId);
    return balance ? {
      totalDays: balance.totalDays || 21,
      usedDays: balance.usedDays || 0,
      remainingDays: balance.remainingDays || 21,
      year: balance.year || new Date().getFullYear()
    } : null;
  };
  
  // Filter leave records by selected school, employee ID, and month
  const schoolLeaveRecords = currentSchool 
    ? leaveRecords
        .filter(record => record.schoolId === currentSchool.id)
        .filter(record => employeeIdSearch === '' || 
                (record.employeeId && record.employeeId.toLowerCase().includes(employeeIdSearch.toLowerCase())))
        .filter(record => {
          // Filter by selected month
          const recordMonth = format(new Date(record.startDate), 'MMMM');
          return recordMonth === selectedMonth;
        })
    : [];
    
  // Initialize the form
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      instructorId: 0,
      employeeId: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      returnDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      leaveBalance: 0,
      ptodays: 0,
      rrdays: 0,
      leaveType: 'PTO',
      destination: '',
      status: 'Pending',
      comments: '',
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
  
  // PTO balances are now automatically managed
  
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
      
      // Reset form
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

  // Calculate business days between two dates (excluding Saudi weekends Friday/Saturday and holidays)
  const calculateBusinessDays = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const holidays = [
      // Saudi holidays for 2025
      '2025-01-01', // New Year's Day
      '2025-09-23', // Saudi National Day
      '2025-12-25', // Christmas (if observed)
      // Add Islamic holidays as needed (dates vary by lunar calendar)
    ];

    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      const dateString = current.toISOString().split('T')[0];
      
      // Skip Saudi weekends (5 = Friday, 6 = Saturday) and holidays
      // Work days are Sunday (0), Monday (1), Tuesday (2), Wednesday (3), Thursday (4)
      if (dayOfWeek !== 5 && dayOfWeek !== 6 && !holidays.includes(dateString)) {
        count++;
      }
      
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };
  
  // Update total days when dates change for add form
  useEffect(() => {
    const startDate = form.watch('startDate');
    const endDate = form.watch('endDate');
    const leaveType = form.watch('leaveType');
    
    if (startDate && endDate) {
      const totalDays = calculateDays(startDate, endDate);
      
      if (leaveType === 'R&R') {
        // For R&R leave type, the R&R days should be the total days between start and end
        form.setValue('rrdays', totalDays);
        form.setValue('ptodays', 0); // Reset PTO days to 0
      } else {
        // For other leave types, update PTO days based on total days
        form.setValue('ptodays', totalDays);
        form.setValue('rrdays', 0); // Reset R&R days to 0
      }
    }
  }, [form.watch('startDate'), form.watch('endDate'), form.watch('leaveType')]);
  
  // Update total days when dates change for edit form
  useEffect(() => {
    const startDate = editForm.watch('startDate');
    const endDate = editForm.watch('endDate');
    const leaveType = editForm.watch('leaveType');
    
    if (startDate && endDate) {
      const totalDays = calculateDays(startDate, endDate);
      
      if (leaveType === 'R&R') {
        // For R&R leave type, the R&R days should be the total days between start and end
        editForm.setValue('rrdays', totalDays);
        editForm.setValue('ptodays', 0); // Reset PTO days to 0
      } else {
        // For other leave types, update PTO days based on total days
        editForm.setValue('ptodays', totalDays);
        editForm.setValue('rrdays', 0); // Reset R&R days to 0
      }
    }
  }, [editForm.watch('startDate'), editForm.watch('endDate'), editForm.watch('leaveType')]);
  
  // Auto-sync PTO balances when switching to the balance tab
  useEffect(() => {
    if (activeTab === "pto-balance" && currentSchool?.id) {
      // When switching to the PTO balance tab, always sync the data
      syncPtoBalancesMutation.mutate(selectedYear);
    }
  }, [activeTab, currentSchool?.id, selectedYear]);
  
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
            <SelectTrigger className="w-36 rounded-none">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          

          
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
            <DialogContent className="dialog-content-enhanced sm:max-w-[600px]">
              <DialogHeader className="text-center">
                <DialogTitle className="text-center">Add New Leave Request</DialogTitle>
                <DialogDescription className="text-center">
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
                            <SelectTrigger className="rounded-none">
                              <SelectValue placeholder="Select instructor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-none select-content-above-dialog">
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
                              className="rounded-none relative z-50"
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
                              className="rounded-none relative z-50"
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
                              className="rounded-none relative z-50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="leaveBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leave Balance (Hours)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            placeholder="Enter leave balance in hours"
                            className="rounded-none"
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the total leave balance for this instructor in hours (e.g., 168 hours = 21 days)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                            <SelectTrigger className="rounded-none">
                              <SelectValue placeholder="Select leave type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-none select-content-above-dialog">
                            <SelectItem value="PTO">PTO (Paid Time Off)</SelectItem>
                            <SelectItem value="R&R">R&R (Rest & Recuperation)</SelectItem>
                            <SelectItem value="Emergency">Emergency Leave</SelectItem>
                            <SelectItem value="Paternity">Paternity Leave</SelectItem>
                            <SelectItem value="Bereavement">Bereavement Leave</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Conditional days fields based on leave type */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Show PTO days field only when leave type is PTO or not yet selected */}
                    {(form.watch('leaveType') === 'PTO' || !form.watch('leaveType')) && (
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
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                placeholder="Enter PTO days"
                                className="rounded-none"
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the number of PTO days for this leave request
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {/* Show R&R days field only when leave type is R&R */}
                    {form.watch('leaveType') === 'R&R' && (
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
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                placeholder="Enter R&R days"
                                className="rounded-none"
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the number of R&R days for this leave request
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
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
      
      {/* Main card with enhanced design */}
      <Card className="rounded-none shadow-lg border-0 bg-gradient-to-br from-slate-50 to-white">
        <CardHeader className="pb-6 bg-gradient-to-r from-[#0A2463] to-[#1E3A8A] text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <CalendarIcon className="h-8 w-8" />
                Staff Leave Management
              </CardTitle>
              <CardDescription className="text-blue-100 mt-2">
                Comprehensive leave tracking and PTO management system for all instructors
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-blue-100">Current School</div>
                <div className="font-semibold text-lg">{currentSchool?.name}</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="leave-records" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 bg-white border shadow-sm rounded-lg p-1">
              <TabsTrigger 
                value="leave-records" 
                className="flex items-center gap-2 data-[state=active]:bg-[#0A2463] data-[state=active]:text-white"
              >
                <FileText className="h-4 w-4" />
                Leave Records
              </TabsTrigger>
              <TabsTrigger 
                value="pto-balance" 
                className="flex items-center gap-2 data-[state=active]:bg-[#0A2463] data-[state=active]:text-white"
              >
                <Clock className="h-4 w-4" />
                PTO Balance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="leave-records" className="space-y-6">
              {/* Enhanced filters section */}
              <div className="bg-white rounded-lg border shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search by Employee ID..."
                        className="w-full sm:w-64 rounded-lg border-gray-300 pl-10 py-2 text-sm focus:border-[#0A2463] focus:ring-[#0A2463]"
                        value={employeeIdSearch}
                        onChange={(e) => setEmployeeIdSearch(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-40 rounded-lg border-gray-300 focus:border-[#0A2463] focus:ring-[#0A2463]">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{schoolLeaveRecords.length} records found</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden relative z-10">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow className="border-none">
                      <TableHead className="min-w-[140px] font-bold text-gray-900 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          INSTRUCTOR
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap min-w-[100px] font-bold text-gray-900 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          LEAVE TYPE
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[180px] font-bold text-gray-900 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          PERIOD
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[110px] font-bold text-gray-900 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          DESTINATION
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[90px] font-bold text-gray-900 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4" />
                          DAYS
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[100px] font-bold text-gray-900 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="h-4 w-4" />
                          RETURN
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[100px] font-bold text-gray-900 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          STATUS
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[100px] font-bold text-gray-900 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          SCHOOL
                        </div>
                      </TableHead>
                      <TableHead className="min-w-[150px] font-bold text-gray-900 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          ACTIONS
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Loading leave records...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : schoolLeaveRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        No leave records found for this school. Add a new leave request using the button above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    schoolLeaveRecords.map((leave) => (
                  <TableRow key={leave.id} className="hover:bg-slate-50 bg-white mb-2">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{leave.instructorName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className={cn(
                        "inline-flex items-center rounded-none px-2.5 py-0.5 text-xs font-medium",
                        leave.leaveType === "PTO" 
                          ? "bg-blue-100 text-blue-800" 
                          : leave.leaveType === "R&R" 
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                      )}>
                        {leave.leaveType || 'PTO'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm font-medium whitespace-nowrap">
                        <div>{leave.startDate && format(new Date(leave.startDate), 'MMM d, yyyy')}</div>
                        <div className="text-gray-500 text-sm">to</div>
                        <div>{leave.endDate && format(new Date(leave.endDate), 'MMM d, yyyy')}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm">
                        {leave.destination || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm">
                        {(() => {
                          // Calculate actual number of days between start and end date
                          const startDate = new Date(leave.startDate);
                          const endDate = new Date(leave.endDate);
                          const timeDiff = endDate.getTime() - startDate.getTime();
                          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end days
                          
                          return (
                            <span className="font-medium text-gray-900">
                              {daysDiff} {daysDiff === 1 ? 'day' : 'days'}
                            </span>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm">
                        {leave.returnDate ? format(new Date(leave.returnDate), 'MMM d, yyyy') : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        leave.status === "Pending" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : leave.status === "Approved" 
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      )}>
                        {leave.status}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        "bg-blue-100 text-blue-800"
                      )}>
                        {currentSchool?.name ? currentSchool.name.replace('NFS ', '') : "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
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
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedLeave(leave);
                            // Reset the edit form with the selected leave's data
                            editForm.reset({
                              instructorId: leave.instructorId,
                              employeeId: leave.employeeId || '',
                              startDate: format(new Date(leave.startDate), 'yyyy-MM-dd'),
                              endDate: format(new Date(leave.endDate), 'yyyy-MM-dd'),
                              returnDate: format(new Date(leave.returnDate), 'yyyy-MM-dd'),
                              leaveBalance: leave.leaveBalance || 0,
                              ptodays: leave.ptodays,
                              rrdays: leave.rrdays,
                              leaveType: leave.leaveType,
                              destination: leave.destination,
                              status: leave.status,
                              comments: leave.comments || '',
                            });
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this leave record? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={async () => {
                                  try {
                                    await deleteLeaveMutation.mutateAsync(leave.id);
                                    toast({
                                      title: "Success",
                                      description: "Leave record deleted successfully",
                                    });
                                  } catch (error) {
                                    console.error("Error deleting leave record:", error);
                                    toast({
                                      title: "Error",
                                      description: "Failed to delete leave record",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
                </TableBody>
              </Table>
            </div>
            </TabsContent>
            
            <TabsContent value="pto-balance">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <Select 
                    value={selectedYear.toString()} 
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                      <SelectItem value="2029">2029</SelectItem>
                      <SelectItem value="2030">2030</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {syncPtoBalancesMutation.isPending && (
                    <div className="flex items-center text-sm text-slate-500">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating balances...
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">
                    <InfoIcon className="h-4 w-4 inline mr-1" />
                    PTO balances are automatically updated when leave requests are recorded
                  </p>
                </div>
              </div>
              
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="border-none">
                    <TableHead className="font-bold text-gray-900 py-4 text-sm">INSTRUCTOR</TableHead>
                    <TableHead className="font-bold text-gray-900 py-4 text-sm">TOTAL HOURS</TableHead>
                    <TableHead className="font-bold text-gray-900 py-4 text-sm">PTO HOURS TAKEN</TableHead>
                    <TableHead className="font-bold text-gray-900 py-4 text-sm">R&R TAKEN</TableHead>
                    <TableHead className="font-bold text-gray-900 py-4 text-sm">REMAINING HOURS
                      <div className="text-xs font-normal opacity-75">(After PTO & R&R)</div>
                    </TableHead>
                    <TableHead className="font-bold text-gray-900 py-4 text-sm">LAST UPDATED</TableHead>
                    <TableHead className="font-bold text-gray-900 py-4 text-sm">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPtoBalances ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Loading PTO balances...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : schoolPtoBalances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <p>No PTO balance records found for {selectedYear}.</p>
                          <p className="text-sm text-muted-foreground">
                            PTO balances will be automatically created when instructors have approved PTO leave records.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    schoolPtoBalances.map((balance) => (
                      <TableRow key={balance.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="font-medium">{balance.instructorName}</div>
                        </TableCell>
                        <TableCell>{balance.totalDays}</TableCell>
                        <TableCell>{balance.usedDays}</TableCell>
                        <TableCell>
                          {(() => {
                            // Calculate R&R days used by this instructor
                            const instructorRRLeaves = schoolLeaveRecords.filter(
                              leave => leave.instructorId === balance.instructorId && 
                                      leave.leaveType === 'R&R' &&
                                      leave.status === 'Approved'
                            );
                            const rrDaysUsed = instructorRRLeaves.reduce((total, leave) => total + leave.rrdays, 0);
                            
                            if (rrDaysUsed > 0) {
                              return <Badge variant="secondary">Yes ({rrDaysUsed} days)</Badge>;
                            } else {
                              return <Badge variant="outline">No</Badge>;
                            }
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            // Calculate remaining days - usedDays already includes both PTO and R&R
                            // No need to add R&R days again as they're already counted in usedDays
                            const actualRemaining = balance.totalDays - balance.usedDays + (balance.adjustments || 0);
                            
                            return (
                              <Badge variant={actualRemaining < 5 ? "destructive" : actualRemaining < 10 ? "outline" : "default"}>
                                {Math.max(0, actualRemaining)}
                              </Badge>
                            );
                          })()}
                        </TableCell>

                        <TableCell>{format(new Date(balance.lastUpdated), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setPtoBalanceToEdit(balance);
                                editPtoForm.reset({
                                  totalDays: balance.totalDays,
                                  usedDays: balance.usedDays,
                                  adjustments: balance.adjustments || 0,
                                });
                                setEditPtoDialogOpen(true);
                              }}
                            >
                              <PencilIcon className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => {
                                setPtoBalanceToDelete(balance);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              

            </TabsContent>
          </Tabs>
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
        <DialogContent className="dialog-content-enhanced sm:max-w-[600px]">
          <DialogHeader className="leave-details-dialog-header">
            <div className="flex items-center justify-center w-full print-header">
              <div className="text-center">
                <DialogTitle className="text-center">Leave Request Details</DialogTitle>
                <DialogDescription className="text-center">
                  View details for {selectedLeave?.instructorName}'s leave request
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {selectedLeave && (
            <div className="py-4 leave-details" id="leave-details-print">
              {/* Instructor Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-6 mb-6 instructor-card">
                <div>
                  <h4 className="text-base font-medium mb-1">Instructor</h4>
                  <p className="text-lg font-bold instructor-name">{selectedLeave.instructorName}</p>
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
        <DialogContent className="dialog-content-enhanced sm:max-w-[600px]">
          <DialogHeader className="text-center">
            <DialogTitle className="text-center">Edit Leave Request</DialogTitle>
            <DialogDescription className="text-center">
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
                      <SelectContent className="select-content-above-dialog">
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
                          className="rounded-none relative z-50"
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
                          className="rounded-none relative z-50"
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
                          className="rounded-none relative z-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Conditional days fields based on leave type - for edit form */}
              <div className="grid grid-cols-1 gap-4">
                {/* Show PTO days field only when leave type is PTO or not yet selected */}
                {(editForm.watch('leaveType') === 'PTO' || !editForm.watch('leaveType')) && (
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
                            readOnly
                            className="bg-gray-50"
                          />
                        </FormControl>
                        <FormDescription>
                          Automatically calculated based on selected dates (start to end)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {/* Show R&R days field only when leave type is R&R */}
                {editForm.watch('leaveType') === 'R&R' && (
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
                            readOnly
                            className="bg-gray-50"
                          />
                        </FormControl>
                        <FormDescription>
                          Automatically calculated based on selected dates (start to end)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
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
                      <SelectContent className="select-content-above-dialog">
                        <SelectItem value="PTO">PTO (Paid Time Off)</SelectItem>
                        <SelectItem value="R&R">R&R (Rest & Recuperation)</SelectItem>
                        <SelectItem value="Emergency">Emergency Leave</SelectItem>
                        <SelectItem value="Paternity">Paternity Leave</SelectItem>
                        <SelectItem value="Bereavement">Bereavement Leave</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
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
                      <SelectContent className="select-content-above-dialog">
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

      {/* PTO Balance Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="dialog-content-enhanced sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete the PTO balance record for {ptoBalanceToDelete?.instructorName}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              This action cannot be undone. The PTO balance record will be permanently deleted.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (ptoBalanceToDelete) {
                  deletePtoBalanceMutation.mutate(ptoBalanceToDelete.id);
                }
              }}
              disabled={deletePtoBalanceMutation.isPending}
            >
              {deletePtoBalanceMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit PTO Balance Dialog */}
      <Dialog open={editPtoDialogOpen} onOpenChange={setEditPtoDialogOpen}>
        <DialogContent className="dialog-content-enhanced sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-center">Edit PTO Balance</DialogTitle>
            <DialogDescription className="text-center">
              Update PTO balance for {ptoBalanceToEdit?.instructorName}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editPtoForm}>
            <form onSubmit={editPtoForm.handleSubmit(async (values) => {
              if (!ptoBalanceToEdit) return;
              
              await updatePtoBalanceMutation.mutateAsync({
                id: ptoBalanceToEdit.id,
                data: values
              });
            })} className="space-y-4">
              
              <FormField
                control={editPtoForm.control}
                name="totalDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Hours</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editPtoForm.control}
                name="usedDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Used Hours</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editPtoForm.control}
                name="adjustments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adjustments</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Positive for additional hours, negative for deductions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditPtoDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updatePtoBalanceMutation.isPending}
                  className="bg-[#0A2463]"
                >
                  {updatePtoBalanceMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Balance
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