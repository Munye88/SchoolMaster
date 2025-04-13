import { useParams } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from '@/components/ui/calendar';
import { useState, useEffect } from 'react';
import { PlusCircle, Calendar as CalendarIcon, FileText, Loader2 } from 'lucide-react';
import { useSchool } from '@/hooks/useSchool';
import { format } from 'date-fns';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';

// Define the interface for staff leave data from API
interface StaffLeave {
  id: number;
  instructorId: number;
  instructorName: string;
  startDate: string;
  endDate: string;
  returnDate: string;
  ptodays: number;
  rrdays: number;
  destination: string;
  status: string;
  comments?: string;
  approvedBy?: number;
  schoolId: number;
}

// Define the interface for the form data
interface LeaveFormData {
  instructorId: number;
  startDate: string;
  endDate: string;
  returnDate: string;
  ptodays: number;
  rrdays: number;
  destination: string;
  status: string;
  comments?: string;
  approvedBy?: number;
}

export default function StaffLeaveTracker() {
  const params = useParams();
  const { schoolCode } = params;
  const { schools, selectSchool } = useSchool();
  
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
  
  // Filter leave records by selected school
  const schoolLeaveRecords = currentSchool 
    ? leaveRecords.filter(record => record.schoolId === currentSchool.id)
    : leaveRecords;
  
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
          
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          
          <Button className="bg-[#0A2463]">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Leave Request
          </Button>
        </div>
      </div>
      
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
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading leave records...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : schoolLeaveRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No leave records found for this school. Add a new leave request using the button above.
                  </TableCell>
                </TableRow>
              ) : (
                schoolLeaveRecords.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">{leave.instructorName}</TableCell>
                    <TableCell>INST-{leave.instructorId.toString().padStart(4, '0')}</TableCell>
                    <TableCell>{leave.ptodays} days</TableCell>
                    <TableCell>{leave.rrdays} days</TableCell>
                    <TableCell>{leave.destination}</TableCell>
                    <TableCell>{format(new Date(leave.returnDate), 'yyyy-MM-dd')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}