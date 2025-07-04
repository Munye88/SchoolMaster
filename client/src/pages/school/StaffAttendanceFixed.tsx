import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Instructor } from "@shared/schema";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar as CalendarIcon, 
  Search, 
  Plus,
  Check,
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  User,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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

// Simple attendance form for creating new records
const AttendanceForm: React.FC<{
  instructors: Instructor[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ instructors, onClose, onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    instructorId: 0,
    status: "present" as const,
    timeIn: "07:00",
    timeOut: "17:00",
    comments: ""
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/staff-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructorId: data.instructorId,
          date: format(selectedDate, 'yyyy-MM-dd'),
          status: data.status,
          timeIn: data.timeIn,
          timeOut: data.timeOut,
          comments: data.comments,
          recordedBy: user?.id || 1
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save attendance record');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attendance record saved successfully.",
      });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
    
    createMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label>Instructor</Label>
          <Select
            value={formData.instructorId.toString()}
            onValueChange={(value) => 
              setFormData({...formData, instructorId: parseInt(value)})
            }
          >
            <SelectTrigger className="rounded-none">
              <SelectValue placeholder="Select instructor" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
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
                  "w-full justify-start text-left font-normal rounded-none",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-none">
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
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: any) => 
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger className="rounded-none">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
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
          <Label>Time In</Label>
          <Input
            type="time"
            value={formData.timeIn}
            onChange={(e) => setFormData({ ...formData, timeIn: e.target.value })}
            className="rounded-none"
          />
        </div>
        
        <div className="grid gap-2">
          <Label>Comments</Label>
          <Input
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            placeholder="Any additional notes..."
            className="rounded-none"
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onClose} className="rounded-none">
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending} className="rounded-none">
          {createMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Record"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default function StaffAttendanceFixed() {
  const { schoolCode } = useParams<{ schoolCode: string }>();
  const { selectedSchool, setSelectedSchool } = useSchool();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch schools data
  const { data: schoolsData = [] } = useQuery<Array<{id: number, name: string, code: string, location: string}>>({
    queryKey: ['/api/schools'],
  });

  // Set selected school from URL
  useEffect(() => {
    if (schoolCode && schoolsData.length > 0) {
      const school = schoolsData.find((s) => s.code === schoolCode);
      if (school && (!selectedSchool || selectedSchool.id !== school.id)) {
        setSelectedSchool(school);
      }
    }
  }, [schoolCode, schoolsData, selectedSchool, setSelectedSchool]);

  // Fetch instructors
  const { data: instructors = [], isLoading: instructorsLoading } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
  });

  // Filter instructors by selected school
  const schoolInstructors = instructors.filter(instructor => 
    selectedSchool && instructor.schoolId === selectedSchool.id
  );

  // Format month for API request
  const formattedMonth = format(selectedMonth, "yyyy-MM");

  // Fetch attendance data
  const { data: attendanceRecords = [], isLoading: attendanceLoading, refetch } = useQuery<StaffAttendance[]>({
    queryKey: ['/api/staff-attendance', selectedSchool?.id, formattedMonth],
    queryFn: async () => {
      let url = `/api/staff-attendance?date=${formattedMonth}`;
      if (selectedSchool) {
        url += `&schoolId=${selectedSchool.id}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance records');
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.length} attendance records for ${selectedSchool?.name} - ${formattedMonth}`);
      return data;
    },
    enabled: !!selectedSchool,
  });

  // Process attendance data
  const processedData = schoolInstructors.map(instructor => {
    const instructorRecords = attendanceRecords.filter(record => 
      record.instructorId === instructor.id
    );
    
    const presentDays = instructorRecords.filter(r => r.status === "present").length;
    const lateDays = instructorRecords.filter(r => r.status === "late").length;
    const absentDays = instructorRecords.filter(r => ["absent", "sick", "paternity", "pto", "bereavement"].includes(r.status)).length;
    
    const totalRecords = instructorRecords.length;
    const attendanceRate = totalRecords > 0 
      ? Math.round((presentDays + (lateDays * 0.5)) / totalRecords * 100)
      : 0;

    return {
      id: instructor.id,
      name: instructor.name,
      nationality: instructor.nationality,
      presentDays,
      lateDays,
      absentDays,
      totalRecords,
      attendanceRate,
      records: instructorRecords
    };
  });

  // Filter data by search query
  const filteredData = processedData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate statistics
  const totalInstructors = filteredData.length;
  const instructorsWithRecords = filteredData.filter(item => item.records.length > 0);
  const averageAttendance = instructorsWithRecords.length > 0
    ? Math.round(instructorsWithRecords.reduce((sum, item) => sum + item.attendanceRate, 0) / instructorsWithRecords.length)
    : 0;

  const presentCount = attendanceRecords.filter(record => record.status === "present").length;
  const lateCount = attendanceRecords.filter(record => record.status === "late").length;
  const absentCount = attendanceRecords.filter(record => ["absent", "sick", "paternity", "pto", "bereavement"].includes(record.status)).length;

  // Chart data
  const chartData = [
    { name: "Present", value: presentCount, color: "#22C55E" },
    { name: "Late", value: lateCount, color: "#F59E0B" },
    { name: "Absent", value: absentCount, color: "#EF4444" }
  ].filter(item => item.value > 0);

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Attendance data has been refreshed.",
    });
  };

  const handleFormSuccess = () => {
    refetch();
  };

  if (!selectedSchool) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No School Selected</h3>
          <p className="text-gray-500">Please select a school to view attendance records.</p>
        </div>
      </div>
    );
  }

  if (instructorsLoading || attendanceLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Attendance</h1>
          <p className="text-gray-600">{selectedSchool.name} - {format(selectedMonth, "MMMM yyyy")}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setLocation(`/schools/${selectedSchool.code}/staff-management`)}
            variant="outline" 
            className="rounded-none"
          >
            <Users className="h-4 w-4 mr-2" />
            Staff Hub
          </Button>
          <Button 
            onClick={() => setLocation(`/schools/${selectedSchool.code}/staff-evaluations`)}
            variant="outline" 
            className="rounded-none"
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            Evaluations
          </Button>
          <Button onClick={handleRefresh} variant="outline" className="rounded-none">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-none">
                <Plus className="h-4 w-4 mr-2" />
                Record Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-none">
              <DialogHeader>
                <DialogTitle>Record Attendance</DialogTitle>
                <DialogDescription>
                  Add a new attendance record for an instructor.
                </DialogDescription>
              </DialogHeader>
              <AttendanceForm 
                instructors={schoolInstructors} 
                onClose={() => setIsDialogOpen(false)}
                onSuccess={handleFormSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Month Selector */}
      <Card className="rounded-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="font-medium">Month:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="rounded-none">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedMonth, "MMMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-none">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={(date) => date && setSelectedMonth(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="ml-auto">
              <Input
                placeholder="Search instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Instructors</p>
                <p className="text-2xl font-bold text-gray-900">{totalInstructors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-gray-900">{presentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Late</p>
                <p className="text-2xl font-bold text-gray-900">{lateCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardContent className="p-4">
            <div className="flex items-center">
              <X className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-gray-900">{absentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No attendance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card className="lg:col-span-2 rounded-none">
          <CardHeader>
            <CardTitle>Instructor Attendance ({filteredData.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((instructor) => (
                    <TableRow key={instructor.id}>
                      <TableCell className="font-medium">{instructor.name}</TableCell>
                      <TableCell>{instructor.nationality}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600 border-green-600 rounded-none">
                          {instructor.presentDays}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600 rounded-none">
                          {instructor.lateDays}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-red-600 border-red-600 rounded-none">
                          {instructor.absentDays}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={instructor.attendanceRate} className="w-16" />
                          <span className="text-sm font-medium">{instructor.attendanceRate}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No instructors found matching your search
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}