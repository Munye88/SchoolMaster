import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useSchool } from "@/hooks/useSchool";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

import BasicNavbar from "@/components/layout/BasicNavbar";

// Define attendance status type with specific allowed values
type AttendanceStatus = "present" | "absent" | "late" | "sick" | "paternity" | "pto" | "bereavement";

// Define instructor type
interface Instructor {
  id: number;
  name: string;
  nationality: string;
  role: string | null;
  schoolId: number;
}

// Define attendance record type
interface AttendanceRecord {
  id: number;
  date: string;
  instructorId: number;
  status: AttendanceStatus;
  timeIn: string | null;
  timeOut: string | null;
  comments: string | null;
  recordedBy: number | null;
}

// Map status to colors
const statusColors: Record<AttendanceStatus, string> = {
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
  late: "bg-amber-100 text-amber-700",
  sick: "bg-purple-100 text-purple-700",
  paternity: "bg-blue-100 text-blue-700",
  pto: "bg-teal-100 text-teal-700",
  bereavement: "bg-slate-100 text-slate-700",
};

// New attendance form type
interface NewAttendance {
  date: string;
  instructorId: number;
  status: AttendanceStatus;
  timeIn: string | null;
  timeOut: string | null;
  comments: string | null;
}

export default function StaffAttendance() {
  const { toast } = useToast();
  const { selectedSchool } = useSchool();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAttendance, setNewAttendance] = useState<NewAttendance>({
    date: format(new Date(), "yyyy-MM-dd"),
    instructorId: 0,
    status: "present",
    timeIn: null,
    timeOut: null,
    comments: null,
  });

  // Format selected date as string for API request
  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  // Query to get instructors for the selected school
  const { data: instructors = [], isLoading: instructorsLoading } = useQuery({
    queryKey: ["/api/schools", selectedSchool?.id, "instructors"],
    queryFn: () => 
      apiRequest("GET", `/api/schools/${selectedSchool?.id}/instructors`)
        .then(res => res.json()),
    enabled: !!selectedSchool,
  });

  // Query to get attendance records for the selected date and school
  const {
    data: attendanceRecords = [],
    isLoading: attendanceLoading,
    refetch: refetchAttendance,
  } = useQuery({
    queryKey: ["/api/staff-attendance", formattedDate, selectedSchool?.id],
    queryFn: () => 
      apiRequest("GET", `/api/staff-attendance?date=${formattedDate}&schoolId=${selectedSchool?.id}`)
        .then(res => res.json()),
    enabled: !!selectedSchool && !!formattedDate,
  });

  // Mutation for creating new attendance records
  const createAttendanceMutation = useMutation({
    mutationFn: async (newRecord: NewAttendance) => {
      const res = await apiRequest("POST", "/api/staff-attendance", newRecord);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Attendance recorded",
        description: "Staff attendance has been successfully recorded",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-attendance"] });
      setDialogOpen(false);
      refetchAttendance();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to record attendance",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for updating attendance records
  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<NewAttendance>) => {
      const res = await apiRequest("PATCH", `/api/staff-attendance/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Attendance updated",
        description: "Staff attendance has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff-attendance"] });
      refetchAttendance();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update attendance",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Find instructor name by ID
  const getInstructorName = (id: number) => {
    const instructor = instructors.find((i: Instructor) => i.id === id);
    return instructor ? instructor.name : "Unknown";
  };

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setNewAttendance({
        ...newAttendance,
        date: format(date, "yyyy-MM-dd")
      });
    }
  };

  // Handle status change in table
  const handleStatusChange = (record: AttendanceRecord, newStatus: AttendanceStatus) => {
    if (record.status !== newStatus) {
      updateAttendanceMutation.mutate({
        id: record.id,
        status: newStatus
      });
    }
  };

  // Handle comment update
  const handleCommentUpdate = (record: AttendanceRecord, comments: string) => {
    if (record.comments !== comments) {
      updateAttendanceMutation.mutate({
        id: record.id,
        comments
      });
    }
  };

  // Create new attendance record
  const handleCreateAttendance = () => {
    if (newAttendance.instructorId === 0) {
      toast({
        title: "Missing information",
        description: "Please select an instructor",
        variant: "destructive",
      });
      return;
    }
    
    createAttendanceMutation.mutate(newAttendance);
  };

  // Get attended instructors IDs for the current date
  const attendedInstructorsIds = attendanceRecords.map(
    (record: AttendanceRecord) => record.instructorId
  );

  // Get instructors who haven't been marked for attendance yet
  const remainingInstructors = instructors.filter(
    (instructor: Instructor) => !attendedInstructorsIds.includes(instructor.id)
  );

  // Whether there are any instructors left to mark attendance for
  const hasRemainingInstructors = remainingInstructors.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <BasicNavbar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Staff Attendance
            </h1>
            <p className="text-gray-500 mt-1">
              {selectedSchool ? selectedSchool.name : "Select a school"} - Track and manage staff attendance
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!hasRemainingInstructors} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Record Attendance
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Record New Attendance</DialogTitle>
                  <DialogDescription>
                    Mark attendance for an instructor for {format(selectedDate, "PPP")}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="instructor" className="text-right">
                      Instructor
                    </Label>
                    <Select
                      value={newAttendance.instructorId.toString()}
                      onValueChange={(value) => setNewAttendance({
                        ...newAttendance,
                        instructorId: parseInt(value)
                      })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {remainingInstructors.map((instructor: Instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id.toString()}>
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Select
                      value={newAttendance.status}
                      onValueChange={(value) => setNewAttendance({
                        ...newAttendance,
                        status: value as AttendanceStatus
                      })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="sick">Sick</SelectItem>
                        <SelectItem value="paternity">Paternity</SelectItem>
                        <SelectItem value="pto">PTO</SelectItem>
                        <SelectItem value="bereavement">Bereavement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="timeIn" className="text-right">
                      Time In
                    </Label>
                    <Input
                      id="timeIn"
                      type="time"
                      className="col-span-3"
                      value={newAttendance.timeIn || ""}
                      onChange={(e) => setNewAttendance({
                        ...newAttendance,
                        timeIn: e.target.value || null
                      })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="timeOut" className="text-right">
                      Time Out
                    </Label>
                    <Input
                      id="timeOut"
                      type="time"
                      className="col-span-3"
                      value={newAttendance.timeOut || ""}
                      onChange={(e) => setNewAttendance({
                        ...newAttendance,
                        timeOut: e.target.value || null
                      })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="comments" className="text-right">
                      Comments
                    </Label>
                    <Textarea
                      id="comments"
                      className="col-span-3"
                      placeholder="Add any notes or comments"
                      value={newAttendance.comments || ""}
                      onChange={(e) => setNewAttendance({
                        ...newAttendance,
                        comments: e.target.value || null
                      })}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleCreateAttendance}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    Save Attendance
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card className="mt-6 overflow-hidden">
          <CardHeader className="bg-gray-50">
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              Staff attendance for {format(selectedDate, "MMMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {(attendanceLoading || instructorsLoading) ? (
              <div className="p-8 text-center">Loading attendance records...</div>
            ) : attendanceRecords.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No attendance records found for this date. Use the "Record Attendance" button to add records.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time In</TableHead>
                    <TableHead>Time Out</TableHead>
                    <TableHead className="w-1/3">Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record: AttendanceRecord) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {getInstructorName(record.instructorId)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={record.status}
                          onValueChange={(value) => 
                            handleStatusChange(record, value as AttendanceStatus)
                          }
                        >
                          <SelectTrigger className={cn("w-[110px]", statusColors[record.status])}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                            <SelectItem value="sick">Sick</SelectItem>
                            <SelectItem value="paternity">Paternity</SelectItem>
                            <SelectItem value="pto">PTO</SelectItem>
                            <SelectItem value="bereavement">Bereavement</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{record.timeIn || "N/A"}</TableCell>
                      <TableCell>{record.timeOut || "N/A"}</TableCell>
                      <TableCell>
                        <Textarea
                          className="min-h-[60px]"
                          placeholder="Add comments"
                          value={record.comments || ""}
                          onChange={(e) => handleCommentUpdate(record, e.target.value)}
                          onBlur={(e) => handleCommentUpdate(record, e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}