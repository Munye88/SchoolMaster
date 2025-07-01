import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Instructor } from "@shared/schema";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  Edit,
  Plus,
  Check,
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Save,
  ChevronDown,
  RefreshCw,
  FileText,
  User,
  UserCheck,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PrintButton } from "@/components/ui/print-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Define interface for attendance records
interface StaffAttendance {
  id: number;
  date: string;
  instructorId: number;
  status: "present" | "absent" | "late" | "sick" | "paternity" | "pto" | "bereavement";
  timeIn: string | null;
  timeOut: string | null;
  comments: string | null;
  recordedBy: number | null;
}

// Function to process attendance data
function processAttendanceData(
  instructors: Instructor[],
  attendanceRecords: StaffAttendance[],
  selectedDate: Date,
  filterByDay = false // New parameter to filter by exact day if needed
) {
  console.log('Processing attendance with records:', {
    recordCount: attendanceRecords.length,
    selectedDate: format(selectedDate, 'yyyy-MM-dd'),
    filterByDay
  });
  
  // Direct string comparison approach for better accuracy
  const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
  const formattedSelectedMonth = formattedSelectedDate.substring(0, 7); // yyyy-MM
  
  // Filter records based on date parameters using string comparison
  const filteredAttendanceRecords = attendanceRecords.filter(record => {
    // Normalize the date format (handle both with and without time component)
    const normalizedDate = record.date.includes('T') 
      ? record.date.split('T')[0] 
      : record.date;
    
    console.log('Comparing dates:', {
      recordDate: normalizedDate,
      selectedDate: formattedSelectedDate,
      match: filterByDay ? normalizedDate === formattedSelectedDate : normalizedDate.startsWith(formattedSelectedMonth)
    });
    
    // If filtering by day, match the exact day
    if (filterByDay) {
      return normalizedDate === formattedSelectedDate;
    }
    
    // Otherwise filter by month and year
    return normalizedDate.startsWith(formattedSelectedMonth);
  });
  
  return instructors.map(instructor => {
    // Get records for this instructor with the filtered date criteria
    const instructorRecords = filteredAttendanceRecords.filter(record => 
      record.instructorId === instructor.id
    );
    
    // Calculate attendance metrics
    // Count unique days that have attendance records for any instructor
    const recordedDays = new Set(
      filteredAttendanceRecords.map(record => record.date.split('T')[0])
    ).size;
    
    // Use recorded days instead of total days in month (for more realistic percentages)
    const totalDays = recordedDays > 0 ? recordedDays : 1; // Avoid division by zero
    
    const presentDays = instructorRecords.filter(r => r.status === "present").length;
    const lateDays = instructorRecords.filter(r => r.status === "late").length;
    const absentDays = instructorRecords.filter(r => ["absent", "sick", "paternity", "pto", "bereavement"].includes(r.status)).length;
    
    // Calculate rate based on days with records
    const recordedDaysForInstructor = presentDays + lateDays + absentDays;
    const attendanceRate = recordedDaysForInstructor > 0 
      ? Math.round((presentDays + (lateDays * 0.5)) / recordedDaysForInstructor * 100)
      : 0;

    return {
      name: instructor.name,
      id: instructor.id,
      nationality: instructor.nationality,
      credentials: instructor.credentials,
      presentDays,
      lateDays,
      absentDays,
      totalDays,
      attendanceRate,
      records: instructorRecords
    };
  });
}

// Attendance form states and functions
interface AttendanceFormData {
  instructorId: number;
  date: string;
  status: "present" | "absent" | "late" | "sick" | "paternity" | "pto" | "bereavement";
  timeIn: string;
  timeOut: string;
  comments: string;
}

// Component for editing existing attendance records
const EditAttendanceForm: React.FC<{
  record: StaffAttendance;
  instructorName: string;
  onClose: () => void;
}> = ({ record, instructorName, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Explicitly type the form data to match StaffAttendance status type
  const [formData, setFormData] = useState<{
    status: "present" | "absent" | "late" | "sick" | "paternity" | "pto" | "bereavement";
    timeIn: string;
    timeOut: string;
    comments: string;
  }>({
    status: record.status as "present" | "absent" | "late" | "sick" | "paternity" | "pto" | "bereavement",
    timeIn: record.timeIn || "07:00",
    timeOut: record.timeOut || "17:00",
    comments: record.comments || ""
  });
  
  // Mutation for updating attendance record
  const updateAttendanceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/staff-attendance/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update attendance record.");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `Updated attendance record for ${instructorName}.`,
        variant: "default"
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ 
        queryKey: ['/api/staff-attendance'] 
      });
      
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to update record",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert timeIn to minutes for easier comparison
    const timeInParts = formData.timeIn.split(':');
    const timeInMinutes = parseInt(timeInParts[0]) * 60 + parseInt(timeInParts[1]);
    
    // 7:00 AM threshold in minutes = 7 * 60 + 0 = 420 minutes
    const thresholdMinutes = 7 * 60;
    
    // If the person arrived after 7:00 AM and status is "present", mark as "late"
    const updatedFormData = {...formData};
    if (timeInMinutes > thresholdMinutes && formData.status === "present") {
      updatedFormData.status = "late";
      toast({
        title: "Late Arrival Detected",
        description: `Arrival time ${formData.timeIn} is after 7:00 AM. Status changed to Late.`,
      });
    }
    
    updateAttendanceMutation.mutate(updatedFormData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label>Instructor</Label>
          <div className="px-3 py-2 border rounded bg-gray-50">
            {instructorName}
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label>Date</Label>
          <div className="px-3 py-2 border rounded bg-gray-50">
            {format(new Date(record.date), 'MMMM dd, yyyy')}
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: "present" | "absent" | "late" | "sick" | "paternity" | "pto" | "bereavement") => 
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="sick">Sick</SelectItem>
              <SelectItem value="pto">PTO</SelectItem>
              <SelectItem value="paternity">Paternity</SelectItem>
              <SelectItem value="bereavement">Bereavement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="timeIn">Time In</Label>
          <Input
            id="timeIn"
            type="time"
            value={formData.timeIn}
            onChange={(e) => setFormData({ ...formData, timeIn: e.target.value })}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="timeOut">Time Out</Label>
          <Input
            id="timeOut"
            type="time"
            value={formData.timeOut}
            onChange={(e) => setFormData({ ...formData, timeOut: e.target.value })}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="comments">Comments</Label>
          <Input
            id="comments"
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            placeholder="Any additional notes..."
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={updateAttendanceMutation.isPending}>
          {updateAttendanceMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Record"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

// Component for recording new attendance
const AttendanceForm: React.FC<{
  instructors: Instructor[];
  onClose: () => void;
}> = ({ instructors, onClose }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<AttendanceFormData>({
    instructorId: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    status: "present",
    timeIn: "07:00", // Set default time to 7:00 AM as requested
    timeOut: "17:00",
    comments: ""
  });
  
  // Use the parent refetch function for consistency
  const { data: attendanceRecords = [], refetch: parentRefetch } = useQuery<StaffAttendance[]>({
    queryKey: ['/api/staff-attendance'],
    enabled: false // Only execute manually
  });

  // Mutation for creating attendance record
  const createAttendanceMutation = useMutation({
    mutationFn: async (data: AttendanceFormData) => {
      const response = await fetch('/api/staff-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructorId: data.instructorId,
          date: data.date,
          status: data.status,
          timeIn: data.timeIn || null,
          timeOut: data.timeOut || null,
          comments: data.comments || null,
          recordedBy: user?.id || 1
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save attendance record');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate queries with proper structure
      
      // Generic query - invalidate all attendance data
      queryClient.invalidateQueries({ 
        queryKey: ['/api/staff-attendance']
      });
      
      // Generic invalidation is sufficient
      // We've removed school-specific query invalidation to prevent errors
      
      // Force immediate refresh with the specific query
      parentRefetch();
      
      toast({
        title: "Success",
        description: "Attendance record saved successfully.",
      });
      
      // Close the form and apply a small delay to ensure data is refreshed
      setTimeout(() => {
        onClose();
      }, 300);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission with automatic late detection
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.instructorId === 0) {
      toast({
        title: "Error",
        description: "Please select an instructor.",
        variant: "destructive",
      });
      return;
    }
    
    // Convert timeIn to minutes for easier comparison
    const timeInParts = formData.timeIn.split(':');
    const timeInMinutes = parseInt(timeInParts[0]) * 60 + parseInt(timeInParts[1]);
    
    // 7:00 AM threshold in minutes = 7 * 60 + 0 = 420 minutes
    const thresholdMinutes = 7 * 60;
    
    // If the person arrived after 7:00 AM and status is "present", mark as "late"
    const updatedFormData = {...formData};
    if (timeInMinutes > thresholdMinutes && formData.status === "present") {
      updatedFormData.status = "late";
      toast({
        title: "Late Arrival Detected",
        description: `Arrival time ${formData.timeIn} is after 7:00 AM. Status changed to Late.`,
      });
    }
    
    createAttendanceMutation.mutate(updatedFormData);
  };
  
  // Update form when date changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      date: format(selectedDate, 'yyyy-MM-dd')
    }));
  }, [selectedDate]);
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="instructor">Instructor</Label>
          <Select
            value={formData.instructorId.toString()}
            onValueChange={(value) => 
              setFormData({...formData, instructorId: parseInt(value)})
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select instructor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Select an instructor</SelectItem>
              {instructors.map((instructor) => (
                <SelectItem key={instructor.id} value={instructor.id.toString()}>
                  {instructor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "MMMM dd, yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: "present" | "absent" | "late" | "sick" | "paternity" | "pto" | "bereavement") => 
              setFormData({...formData, status: value})
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="sick">Sick Leave</SelectItem>
              <SelectItem value="paternity">Paternity Leave</SelectItem>
              <SelectItem value="pto">PTO</SelectItem>
              <SelectItem value="bereavement">Bereavement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="timeIn">Time In</Label>
          <Input
            type="time"
            id="timeIn"
            value={formData.timeIn}
            onChange={(e) => setFormData({...formData, timeIn: e.target.value})}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="comments">Comments</Label>
          <Textarea
            id="comments"
            placeholder="Add any additional notes here..."
            value={formData.comments}
            onChange={(e) => setFormData({...formData, comments: e.target.value})}
            className="resize-none"
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={onClose} 
          type="button"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={createAttendanceMutation.isPending}
        >
          {createAttendanceMutation.isPending ? "Saving..." : "Save Record"}
        </Button>
      </DialogFooter>
    </form>
  );
};

const StaffAttendance = () => {
  // Get school code from URL parameters
  const { schoolCode } = useParams<{ schoolCode: string }>();
  
  // Context hooks
  const { selectedSchool, schools, setSelectedSchool } = useSchool();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch schools data
  const { data: schoolsData = [] } = useQuery({
    queryKey: ['/api/schools'],
  });

  // Set the selected school based on the URL parameter
  useEffect(() => {
    if (schoolCode && schoolsData.length > 0) {
      const school = schoolsData.find(s => s.code === schoolCode);
      if (school && (!selectedSchool || selectedSchool.id !== school.id)) {
        setSelectedSchool(school);
      }
    }
  }, [schoolCode, schoolsData, selectedSchool, setSelectedSchool]);
  
  // State hooks
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState("month");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedInstructors, setSelectedInstructors] = useState<{ 
    [key: number]: { 
      selected: boolean; 
      status: "present" | "absent" | "late" | "sick" | "paternity" | "pto" | "bereavement";
      timeIn: string;
    } 
  }>({});
  const [bulkDate, setBulkDate] = useState<Date>(new Date());
  
  const { data: instructors = [], isLoading: instructorsLoading } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
  });
  
  // Filter instructors by the selected school
  const schoolInstructors = instructors.filter(instructor => 
    selectedSchool && instructor.schoolId === selectedSchool.id
  );
  
  // Format selected date for API request
  const formattedMonth = date ? format(date, "yyyy-MM") : format(new Date(), "yyyy-MM");
  
  // Get the formatted date string for the selected date (if any)
  const formattedSelectedDate = date ? format(date, 'yyyy-MM-dd') : '';
  
  // Build the API URL with query parameters for school and optionally date
  const requestUrl = `/api/staff-attendance${selectedSchool ? 
    `?schoolId=${selectedSchool.id}${formattedSelectedDate ? `&date=${formattedSelectedDate}` : ''}` : 
    formattedSelectedDate ? `?date=${formattedSelectedDate}` : ''}`;
  
  // Fetch attendance data from API with proper filtering - auto-refresh when date changes
  const { data: attendanceRecords = [], isLoading: attendanceLoading, refetch: refetchAttendance } = useQuery<StaffAttendance[]>({
    queryKey: ['/api/staff-attendance', selectedSchool?.id, formattedMonth], // Use month for consistent data fetching
    queryFn: async () => {
      let url = `/api/staff-attendance?date=${formattedMonth}`;
      if (selectedSchool) {
        url += `&schoolId=${selectedSchool.id}`;
      }
      console.log("Fetching attendance data with URL:", url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance records');
      }
      const data = await response.json();
      console.log(`Fetched ${data.length} attendance records for ${formattedMonth} - ${selectedSchool?.name}`);
      return data;
    },
    enabled: !!selectedSchool && !!formattedMonth,
    refetchOnWindowFocus: false,
    staleTime: 30000 // Data is fresh for 30 seconds
  });
  
  // Force refetch when date or school changes
  useEffect(() => {
    if (selectedSchool) {
      console.log("Forcing attendance data refresh for school:", selectedSchool.name, "with date:", formattedSelectedDate);
      refetchAttendance();
    }
  }, [refetchAttendance, selectedSchool?.id, formattedSelectedDate]);
  
  // Process and filter data
  // First filter the attendance records by month
  const currentMonth = date || new Date();
  const currentMonthStr = format(currentMonth, 'yyyy-MM');
  
  const monthlyRecords = attendanceRecords.filter((record: StaffAttendance) => {
    // Handle both date formats: with and without time component
    const recordDate = record.date.split('T')[0]; // Extract only the date part
    return recordDate.startsWith(currentMonthStr);
  });
  
  // Determine if we should filter by day based on the selected tab and view
  const shouldFilterByDay = selectedTab === 'detailed' && !!date;
  
  // Records for the specific day when in detailed view
  const dayRecords = shouldFilterByDay 
    ? attendanceRecords.filter((record: StaffAttendance) => {
        // Normalize both dates to yyyy-MM-dd format for comparison
        let recordDate = record.date;
        if (recordDate.includes('T')) {
          recordDate = recordDate.split('T')[0];
        }
        const formattedSelectedDate = format(date, 'yyyy-MM-dd');
        console.log('Comparing dates:', recordDate, formattedSelectedDate, recordDate === formattedSelectedDate);
        return recordDate === formattedSelectedDate;
      }) 
    : [];
  
  // Then process the filtered records - filter by day if in detailed view
  const attendanceData = processAttendanceData(
    schoolInstructors, 
    shouldFilterByDay ? dayRecords : monthlyRecords, 
    currentMonth,
    shouldFilterByDay
  );
  
  const filteredData = attendanceData.filter((item: any) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate statistics
  const totalInstructors = filteredData.length;
  
  // Count instructors with actual attendance records
  const instructorsWithRecords = filteredData.filter(item => item.records.length > 0);
  
  // Calculate the average attendance rate only for instructors with records
  const averageAttendance = instructorsWithRecords.length > 0
    ? Math.round(instructorsWithRecords.reduce((sum: number, item: any) => sum + item.attendanceRate, 0) / instructorsWithRecords.length)
    : 0;
  
  // Count actual attendance statuses from the records
  // Use dayRecords or monthlyRecords based on view
  const recordsToCount = shouldFilterByDay ? dayRecords : monthlyRecords;
  
  const presentCount = recordsToCount.filter((record: StaffAttendance) => record.status === "present").length;
  const lateCount = recordsToCount.filter((record: StaffAttendance) => record.status === "late").length;
  const absentCount = recordsToCount.filter((record: StaffAttendance) => record.status === "absent").length;
  
  // For the pie chart, use the actual count of different statuses
  const statusData = [
    { name: "Present", value: presentCount, color: "#10B981" },
    { name: "Late", value: lateCount, color: "#F59E0B" },
    { name: "Absent", value: absentCount, color: "#EF4444" }
  ];
  
  // Effects
  useEffect(() => {
    if (schoolInstructors.length > 0) {
      // Initialize only for new instructors or when school changes
      const newSelectedInstructors: { [key: number]: any } = {};
      
      // Start fresh with all instructors from the current school
      schoolInstructors.forEach(instructor => {
        newSelectedInstructors[instructor.id] = {
          selected: false,
          status: "present",
          timeIn: "07:00"
        };
      });
      
      setSelectedInstructors(newSelectedInstructors);
    }
  }, [schoolInstructors.length, selectedSchool?.id]);
  
  // Loading state
  const isLoading = instructorsLoading || attendanceLoading;
  if (isLoading) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  // Event handlers
  const handleSelectInstructor = (instructorId: number, checked: boolean) => {
    setSelectedInstructors(prev => {
      // Make sure we have this instructor in our state
      if (!prev[instructorId]) {
        return {
          ...prev,
          [instructorId]: {
            selected: checked,
            status: "present",
            timeIn: "07:00"
          }
        };
      }
      
      // Otherwise, just update the selected status
      return {
        ...prev,
        [instructorId]: {
          ...prev[instructorId],
          selected: checked
        }
      };
    });
  };
  
  const handleStatusChange = (instructorId: number, status: "present" | "absent" | "late" | "sick" | "paternity" | "pto" | "bereavement") => {
    setSelectedInstructors(prev => {
      // Make sure we have this instructor in our state
      if (!prev[instructorId]) {
        return {
          ...prev,
          [instructorId]: {
            selected: true, // Auto-select if changing status
            status: status,
            timeIn: "07:00"
          }
        };
      }
      
      // Otherwise, just update the status
      return {
        ...prev,
        [instructorId]: {
          ...prev[instructorId],
          status,
          // When status is changed, always select the checkbox
          selected: true
        }
      };
    });
  };
  
  const handleTimeChange = (instructorId: number, timeIn: string) => {
    setSelectedInstructors(prev => {
      // Make sure we have this instructor in our state
      if (!prev[instructorId]) {
        return {
          ...prev,
          [instructorId]: {
            selected: true, // Auto-select if changing time
            status: "present",
            timeIn: timeIn
          }
        };
      }
      
      // Otherwise, just update the time
      return {
        ...prev,
        [instructorId]: {
          ...prev[instructorId],
          timeIn,
          // When time is changed, always select the checkbox
          selected: true
        }
      };
    });
  };
  
  const handleBulkSubmit = async () => {
    const selectedIds = Object.entries(selectedInstructors)
      .filter(([_, data]) => data.selected)
      .map(([id]) => parseInt(id));
    
    if (selectedIds.length === 0) {
      toast({
        title: "No instructors selected",
        description: "Please select at least one instructor to record attendance.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Keep track of instructors marked as late due to late arrival
      const lateArrivals: number[] = [];

      const promises = selectedIds.map(instructorId => {
        const instructorData = selectedInstructors[instructorId];
        
        // Check for late arrival
        let status = instructorData.status;
        
        // Convert timeIn to minutes for easier comparison
        const timeInParts = instructorData.timeIn.split(':');
        const timeInMinutes = parseInt(timeInParts[0]) * 60 + parseInt(timeInParts[1]);
        
        // 7:00 AM threshold in minutes = 7 * 60 + 0 = 420 minutes
        const thresholdMinutes = 7 * 60;
        
        // If the person arrived after 7:00 AM and status is "present", mark as "late"
        if (timeInMinutes > thresholdMinutes && status === "present") {
          status = "late";
          lateArrivals.push(instructorId);
        }

        return fetch('/api/staff-attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instructorId,
            date: format(bulkDate, 'yyyy-MM-dd'),
            status: status,
            timeIn: instructorData.timeIn,
            timeOut: null,
            comments: "",
            recordedBy: user?.id || 1
          }),
        });
      });
      
      await Promise.all(promises);
      
      // Notify about late arrivals if any were detected
      if (lateArrivals.length > 0) {
        toast({
          title: "Late Arrivals Detected",
          description: `${lateArrivals.length} instructor(s) marked as late because they arrived after 7:00 AM.`,
        });
      }
      
      // Reset selections
      const resetSelections = { ...selectedInstructors };
      Object.keys(resetSelections).forEach(key => {
        resetSelections[parseInt(key)].selected = false;
      });
      setSelectedInstructors(resetSelections);
      
      // Show success message
      toast({
        title: "Success!",
        description: `Recorded attendance for ${selectedIds.length} instructors.`,
        variant: "default"
      });
      
      // Refresh data with proper query key structure to match our custom query
      queryClient.invalidateQueries({ 
        queryKey: ['/api/staff-attendance'] 
      });
      
      // Force immediate specific refresh with the current date
      setTimeout(() => {
        console.log("Forcing refresh after bulk submit with date:", format(bulkDate, 'yyyy-MM-dd'));
        refetchAttendance();
      }, 200);
      
      // Small delay before exiting bulk mode to ensure data is refreshed
      setTimeout(() => {
        // Exit bulk mode
        setBulkMode(false);
      }, 300);
    } catch (error) {
      toast({
        title: "Error!",
        description: "Failed to save attendance records. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Mutation for deleting attendance record
  const deleteAttendanceMutation = useMutation({
    mutationFn: async (attendanceId: number) => {
      const response = await fetch(`/api/staff-attendance/${attendanceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete attendance record');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/staff-attendance']
      });
      
      refetchAttendance();
      
      toast({
        title: "Success",
        description: "Attendance record deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle delete record function
  const handleDeleteRecord = (recordId: number, instructorName: string, recordDate: string) => {
    if (window.confirm(`Are you sure you want to delete the attendance record for ${instructorName} on ${format(new Date(recordDate), 'MMM dd, yyyy')}?`)) {
      deleteAttendanceMutation.mutate(recordId);
    }
  };
  
  const toggleSelectAll = (checked: boolean) => {
    // Create a new object to avoid state mutation issues
    const updatedSelections = { ...selectedInstructors };
    
    // Apply to instructors from the current school
    schoolInstructors.forEach(instructor => {
      // If the instructor exists in our state, update it
      if (updatedSelections[instructor.id]) {
        updatedSelections[instructor.id] = {
          ...updatedSelections[instructor.id],
          selected: checked
        };
      } 
      // Otherwise, create a new entry for this instructor
      else {
        updatedSelections[instructor.id] = {
          selected: checked,
          status: "present",
          timeIn: "07:00"
        };
      }
    });
    
    setSelectedInstructors(updatedSelections);
  };

  // Show loading state while school is being determined
  if (!selectedSchool && schoolCode) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0A2463] mx-auto mb-4" />
            <p className="text-gray-600">Loading school information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if school not found
  if (schoolCode && !selectedSchool) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">School Not Found</h1>
          <p className="text-gray-600">The requested school "{schoolCode}" could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="staffAttendanceContent" className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 text-transparent bg-clip-text">
            {selectedSchool ? `${selectedSchool.name} Staff Attendance` : 'Staff Attendance'}
          </h1>
          <p className="text-gray-500">Track and monitor instructor attendance records for {schoolInstructors.length} instructors</p>
        </div>
        
        <div className="flex gap-2">
          <PrintButton contentId="staffAttendanceContent" />
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setBulkMode(!bulkMode)}
          >
            {bulkMode ? <X size={16} /> : <Check size={16} />}
            {bulkMode ? "Cancel" : "Take Attendance"}
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-green-600 hover:bg-green-700">
                <Plus size={16} /> Record Individual
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Record Staff Attendance</DialogTitle>
                <DialogDescription>
                  Enter attendance details for an instructor. Arrivals after 7:00 AM will be automatically marked as late.
                </DialogDescription>
              </DialogHeader>
              <AttendanceForm 
                instructors={schoolInstructors} 
                onClose={() => setIsDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
          
          <Button 
            className="bg-[#0A2463] hover:bg-[#071A4A] gap-2"
            onClick={() => {
              // Invalidate the query with proper parameters
              queryClient.invalidateQueries({ 
                queryKey: ['/api/staff-attendance'] 
              });
              // Also force an immediate refresh
              refetchAttendance();
            }}
          >
            <RefreshCw size={16} /> Refresh
          </Button>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search instructors..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal w-[240px]",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "MMMM yyyy") : <span>Pick a month</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate);
                // Force immediate refresh when date changes
                if (newDate) {
                  setTimeout(() => {
                    console.log("Date changed, forcing refresh...");
                    refetchAttendance();
                  }, 100);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Select value={selectedView} onValueChange={setSelectedView}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day View</SelectItem>
            <SelectItem value="week">Week View</SelectItem>
            <SelectItem value="month">Month View</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" className="gap-2">
          <Filter size={16} /> More Filters
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="overflow-hidden border-0 shadow-md">
          <div className={`h-2 w-full ${
            averageAttendance >= 90 ? "bg-gradient-to-r from-green-600 to-green-400" : 
            averageAttendance >= 75 ? "bg-gradient-to-r from-amber-600 to-amber-400" : 
            "bg-gradient-to-r from-red-600 to-red-400"
          }`} />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className={`${
                averageAttendance >= 90 ? "text-green-600" : 
                averageAttendance >= 75 ? "text-amber-600" : 
                "text-red-600"
              }`} size={18} />
              <CardTitle className="text-sm font-medium">Average Attendance Rate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`text-5xl font-bold ${
                averageAttendance >= 90 ? "text-green-600" : 
                averageAttendance >= 75 ? "text-amber-600" : 
                "text-red-600"
              }`}>{averageAttendance}%</div>
              <div>
                <Badge className={`${
                  averageAttendance >= 90 ? "bg-green-100 text-green-800 hover:bg-green-100" : 
                  averageAttendance >= 75 ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : 
                  "bg-red-100 text-red-800 hover:bg-red-100"
                }`}>
                  {averageAttendance >= 90 ? "Excellent" : 
                   averageAttendance >= 75 ? "Average" : 
                   "Needs Improvement"}
                </Badge>
                <p className="text-xs text-gray-500 mt-2">
                  For {totalInstructors} instructors in {format(date || new Date(), "MMMM yyyy")}
                </p>
              </div>
            </div>
            <Progress 
              value={averageAttendance} 
              className={`h-2 mt-4 ${
                averageAttendance >= 90 ? "bg-green-500" : 
                averageAttendance >= 75 ? "bg-amber-500" : 
                "bg-red-500"
              }`}
            />
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="h-2 w-full bg-gradient-to-r from-blue-600 to-blue-400" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <UserCheck className="text-blue-600" size={18} />
              <CardTitle className="text-sm font-medium">Attendance Breakdown</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-36 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                      label={false}
                      labelLine={false}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} instructors`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                  <div className="text-sm">Present: <span className="font-semibold">{presentCount}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                  <div className="text-sm">Late: <span className="font-semibold">{lateCount}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                  <div className="text-sm">Absent: <span className="font-semibold">{absentCount}</span></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="h-2 w-full bg-gradient-to-r from-purple-600 to-purple-400" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="text-purple-600" size={18} />
              <CardTitle className="text-sm font-medium">Monthly Statistics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col items-center p-3 rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(presentCount / Math.max(1, presentCount + lateCount + absentCount) * 100)}%
                </div>
                <div className="text-xs text-gray-500">On Time</div>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-amber-50">
                <div className="text-2xl font-bold text-amber-600">
                  {Math.round(lateCount / Math.max(1, presentCount + lateCount + absentCount) * 100)}%
                </div>
                <div className="text-xs text-gray-500">Late</div>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-red-50">
                <div className="text-2xl font-bold text-red-600">
                  {Math.round(absentCount / Math.max(1, presentCount + lateCount + absentCount) * 100)}%
                </div>
                <div className="text-xs text-gray-500">Absent</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Based on {instructorsWithRecords.length} instructors with {instructorsWithRecords.reduce((sum, item) => sum + item.records.length, 0)} recorded days in {format(date || new Date(), "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs and Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Records</TabsTrigger>
            <TabsTrigger value="trends">Attendance Trends</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="space-y-6">
          {bulkMode ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Record Daily Attendance</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Select instructors and mark their attendance for {format(bulkDate, 'MMMM dd, yyyy')}. 
                    Note: Arrivals after 7:00 AM will be automatically marked as late.
                  </p>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !bulkDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bulkDate ? format(bulkDate, "MMMM dd, yyyy") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bulkDate}
                      onSelect={(date) => date && setBulkDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="select-all" 
                      onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                    />
                    <label
                      htmlFor="select-all"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Select All Instructors
                    </label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setBulkMode(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={handleBulkSubmit}
                    >
                      <Save className="mr-2 h-4 w-4" /> Save Attendance
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {schoolInstructors.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      No instructors found. Please select a school.
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">Select</TableHead>
                            <TableHead>Instructor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Time In</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {schoolInstructors.map((instructor) => (
                            <TableRow key={instructor.id}>
                              <TableCell>
                                <Checkbox 
                                  checked={selectedInstructors[instructor.id]?.selected} 
                                  onCheckedChange={(checked) => handleSelectInstructor(instructor.id, !!checked)}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="font-bold text-lg text-gray-900">{instructor.name}</div>
                                <div className="text-sm font-medium text-gray-700">{instructor.nationality}</div>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={selectedInstructors[instructor.id]?.status}
                                  onValueChange={(value: "present" | "absent" | "late" | "sick" | "paternity" | "pto" | "bereavement") => 
                                    handleStatusChange(instructor.id, value)
                                  }
                                  disabled={!selectedInstructors[instructor.id]?.selected}
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="present">Present</SelectItem>
                                    <SelectItem value="absent">Absent</SelectItem>
                                    <SelectItem value="late">Late</SelectItem>
                                    <SelectItem value="sick">Sick Leave</SelectItem>
                                    <SelectItem value="paternity">Paternity Leave</SelectItem>
                                    <SelectItem value="pto">PTO</SelectItem>
                                    <SelectItem value="bereavement">Bereavement</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="time"
                                  value={selectedInstructors[instructor.id]?.timeIn}
                                  onChange={(e) => handleTimeChange(instructor.id, e.target.value)}
                                  disabled={!selectedInstructors[instructor.id]?.selected || selectedInstructors[instructor.id]?.status !== "present"}
                                  className="w-[120px]"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Instructor Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Attendance Rate</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Late</TableHead>
                        <TableHead>Absent</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-bold text-lg text-gray-900">{item.name}</div>
                            <div className="text-sm font-medium text-gray-700">{item.nationality}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={item.attendanceRate} 
                                className={`h-2 w-[60px] ${
                                  item.attendanceRate >= 90 ? "bg-green-500" : 
                                  item.attendanceRate >= 75 ? "bg-amber-500" : 
                                  "bg-red-500"
                                }`}
                              />
                              <span>{item.attendanceRate}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.presentDays}</TableCell>
                          <TableCell>{item.lateDays}</TableCell>
                          <TableCell>{item.absentDays}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{item.name} - Attendance Details</DialogTitle>
                                  <DialogDescription>
                                    Detailed attendance record for {format(date || new Date(), "MMMM yyyy")}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h4 className="font-medium">Attendance Rate</h4>
                                      <div className="text-2xl font-bold">{item.attendanceRate}%</div>
                                    </div>
                                    <div>
                                      <Badge 
                                        className={
                                          item.attendanceRate >= 90 ? "bg-green-500" : 
                                          item.attendanceRate >= 75 ? "bg-amber-500" : 
                                          "bg-red-500"
                                        }
                                      >
                                        {item.attendanceRate >= 90 ? "Excellent" : 
                                         item.attendanceRate >= 75 ? "Average" : 
                                         "Poor"}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="bg-green-50 p-3 rounded-md">
                                      <div className="text-sm text-gray-500">Present Days</div>
                                      <div className="text-xl font-bold text-green-600">{item.presentDays}</div>
                                    </div>
                                    <div className="bg-amber-50 p-3 rounded-md">
                                      <div className="text-sm text-gray-500">Late Days</div>
                                      <div className="text-xl font-bold text-amber-600">{item.lateDays}</div>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-md">
                                      <div className="text-sm text-gray-500">Absent Days</div>
                                      <div className="text-xl font-bold text-red-600">{item.absentDays}</div>
                                    </div>
                                  </div>
                                  
                                  <div className="border-t pt-4">
                                    <h4 className="font-medium mb-2">Attendance Records</h4>
                                    <div className="max-h-[300px] overflow-y-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Time In</TableHead>
                                            <TableHead>Comments</TableHead>
                                            <TableHead>Actions</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {item.records.length > 0 ? (
                                            item.records.map((record: StaffAttendance) => (
                                              <TableRow key={record.id}>
                                                <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
                                                <TableCell>
                                                  <Badge 
                                                    className={
                                                      record.status.toLowerCase() === "present" ? "bg-green-500" : 
                                                      record.status.toLowerCase() === "late" ? "bg-amber-500" : 
                                                      "bg-red-500"
                                                    }
                                                  >
                                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                  </Badge>
                                                </TableCell>
                                                <TableCell>{record.timeIn || "N/A"}</TableCell>
                                                <TableCell>{record.comments || "-"}</TableCell>
                                                <TableCell>
                                                  <div className="flex items-center gap-1">
                                                    <Dialog>
                                                      <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" title="Edit attendance record">
                                                          <Edit size={16} className="text-gray-500 hover:text-blue-600" />
                                                        </Button>
                                                      </DialogTrigger>
                                                      <DialogContent className="sm:max-w-[525px]">
                                                        <DialogHeader>
                                                          <DialogTitle>Edit Attendance Record</DialogTitle>
                                                          <DialogDescription>
                                                            Update attendance details for {item.name} on {format(new Date(record.date), "MMMM dd, yyyy")}.
                                                          </DialogDescription>
                                                        </DialogHeader>
                                                        <EditAttendanceForm 
                                                          record={record}
                                                          instructorName={item.name}
                                                          onClose={() => {}}
                                                        />
                                                      </DialogContent>
                                                    </Dialog>
                                                    <Button 
                                                      variant="ghost" 
                                                      size="icon" 
                                                      title="Delete attendance record"
                                                      onClick={() => handleDeleteRecord(record.id, item.name, record.date)}
                                                    >
                                                      <X size={16} className="text-gray-500 hover:text-red-600" />
                                                    </Button>
                                                  </div>
                                                </TableCell>
                                              </TableRow>
                                            ))
                                          ) : (
                                            <TableRow>
                                              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                                                No attendance records found for this month.
                                              </TableCell>
                                            </TableRow>
                                          )}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {filteredData.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                            No attendance data found. Please select a school and check your filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Detailed Attendance Records</CardTitle>
                <CardDescription>
                  Attendance records for {date ? format(date, 'MMMM dd, yyyy') : 'selected date'}
                </CardDescription>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "MMMM dd, yyyy") : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardHeader>
            <CardContent>
              {date ? (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time In</TableHead>
                        <TableHead>Time Out</TableHead>
                        <TableHead>Comments</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Filter records for the exact selected date */}
                      {monthlyRecords
                        .filter((record: StaffAttendance) => {
                          return record.date.split('T')[0] === format(date, 'yyyy-MM-dd');
                        })
                        .map((record: StaffAttendance) => {
                          const instructor = instructors.find(i => i.id === record.instructorId);
                          return (
                            <TableRow key={record.id}>
                              <TableCell>
                                <div className="font-medium">{instructor ? instructor.name : 'Unknown'}</div>
                                <div className="text-xs text-gray-500">{instructor ? instructor.nationality : ''}</div>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn(
                                  record.status === 'present' && 'bg-green-100 text-green-800 hover:bg-green-100',
                                  record.status === 'late' && 'bg-amber-100 text-amber-800 hover:bg-amber-100',
                                  record.status === 'absent' && 'bg-red-100 text-red-800 hover:bg-red-100',
                                  record.status === 'sick' && 'bg-blue-100 text-blue-800 hover:bg-blue-100',
                                  record.status === 'paternity' && 'bg-purple-100 text-purple-800 hover:bg-purple-100',
                                  record.status === 'pto' && 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
                                  record.status === 'bereavement' && 'bg-gray-100 text-gray-800 hover:bg-gray-100',
                                )}>
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>{record.timeIn || 'N/A'}</TableCell>
                              <TableCell>{record.timeOut || 'N/A'}</TableCell>
                              <TableCell>{record.comments || 'No comments'}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit attendance record">
                                        <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[525px]">
                                      <DialogHeader>
                                        <DialogTitle>Edit Attendance Record</DialogTitle>
                                        <DialogDescription>
                                          Update attendance details for {instructor ? instructor.name : 'Unknown'} on {format(new Date(record.date), "MMMM dd, yyyy")}.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <EditAttendanceForm 
                                        record={record}
                                        instructorName={instructor ? instructor.name : 'Unknown'}
                                        onClose={() => document.querySelector('[data-state="open"]')?.querySelector('[aria-label="Close"]')?.click()}
                                      />
                                    </DialogContent>
                                  </Dialog>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    title="Delete attendance record"
                                    onClick={() => handleDeleteRecord(record.id, instructor?.name || 'Unknown', record.date)}
                                  >
                                    <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      
                      {monthlyRecords.filter(record => record.date.split('T')[0] === format(date, 'yyyy-MM-dd')).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                            No attendance records found for {format(date, 'MMMM dd, yyyy')}. Use the "Record Individual" or "Take Attendance" buttons to add records.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Please select a date to view detailed attendance records.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                Historical trends and analysis features are coming soon.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffAttendance;