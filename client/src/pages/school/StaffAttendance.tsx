import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Instructor } from "@shared/schema";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar as CalendarIcon, 
  Search, 
  Download, 
  Filter, 
  Share2, 
  FileText, 
  Edit, 
  ExternalLink,
  Plus,
  Check,
  X,
  Clock,
  AlertTriangle
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Staff attendance interface
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

// Process attendance data to calculate statistics
function processAttendanceData(
  instructors: Instructor[], 
  attendanceRecords: StaffAttendance[],
  selectedDate: Date
) {
  const month = format(selectedDate, 'yyyy-MM');
  
  // Filter attendance records for the selected month
  const monthlyAttendance = attendanceRecords.filter(record => 
    record.date.startsWith(month)
  );
  
  // Create a map of instructor IDs to their attendance records
  const instructorAttendance = new Map<number, StaffAttendance[]>();
  monthlyAttendance.forEach(record => {
    const records = instructorAttendance.get(record.instructorId) || [];
    records.push(record);
    instructorAttendance.set(record.instructorId, records);
  });
  
  // Calculate attendance statistics for each instructor
  return instructors.map(instructor => {
    const records = instructorAttendance.get(instructor.id) || [];
    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const sick = records.filter(r => r.status === 'sick').length;
    const paternity = records.filter(r => r.status === 'paternity').length;
    const pto = records.filter(r => r.status === 'pto').length;
    const bereavement = records.filter(r => r.status === 'bereavement').length;
    const absent = records.filter(r => r.status === 'absent').length;
    
    const totalDays = records.length;
    // Calculate attendance rate: present days + (late days * 0.5) / total days
    const attendanceRate = totalDays === 0 ? 0 : 
      Math.round((present + (late * 0.5)) / totalDays * 100);
    
    return {
      id: instructor.id,
      name: instructor.name,
      position: instructor.role || "ELT Instructor",
      present,
      late,
      absent,
      sick,
      paternity,
      pto,
      bereavement,
      totalDays,
      attendanceRate,
      records
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
    timeIn: "09:00",
    timeOut: "17:00",
    comments: ""
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
          ...data,
          recordedBy: user?.id || 1
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save attendance record');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refresh attendance data
      queryClient.invalidateQueries({ queryKey: ['/api/staff-attendance'] });
      toast({
        title: "Success!",
        description: "Attendance record has been saved.",
        variant: "default",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error!",
        description: `Failed to save attendance record: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.instructorId === 0) {
      toast({
        title: "Error!",
        description: "Please select an instructor.",
        variant: "destructive",
      });
      return;
    }
    
    createAttendanceMutation.mutate(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="instructorId">Instructor</Label>
        <Select 
          name="instructorId" 
          value={formData.instructorId.toString()} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, instructorId: parseInt(value) }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select instructor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Select instructor</SelectItem>
            {instructors.map((instructor) => (
              <SelectItem key={instructor.id} value={instructor.id.toString()}>
                {instructor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "MMMM dd, yyyy") : <span>Select date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          name="status" 
          value={formData.status} 
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="sick">Sick</SelectItem>
            <SelectItem value="paternity">Paternity</SelectItem>
            <SelectItem value="pto">PTO</SelectItem>
            <SelectItem value="bereavement">Bereavement</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="timeIn">Time In</Label>
          <Input
            id="timeIn"
            name="timeIn"
            type="time"
            value={formData.timeIn}
            onChange={handleInputChange}
            disabled={formData.status === "absent"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeOut">Time Out</Label>
          <Input
            id="timeOut"
            name="timeOut"
            type="time"
            value={formData.timeOut}
            onChange={handleInputChange}
            disabled={formData.status === "absent"}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="comments">Comments</Label>
        <Textarea
          id="comments"
          name="comments"
          value={formData.comments}
          onChange={handleInputChange}
          placeholder="Add any notes or comments about the attendance record"
          rows={3}
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
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
  const { selectedSchool } = useSchool();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState("month");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch instructors for the selected school
  const { data: instructors = [], isLoading: instructorsLoading } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
  });
  
  // Filter instructors by the selected school
  const schoolInstructors = instructors.filter(instructor => 
    !selectedSchool || instructor.schoolId === selectedSchool?.id
  );
  
  // Format selected date for API request
  const formattedMonth = date ? format(date, "yyyy-MM") : format(new Date(), "yyyy-MM");
  
  // Fetch attendance data from API
  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useQuery<StaffAttendance[]>({
    queryKey: ['/api/staff-attendance', formattedMonth, selectedSchool?.id],
    queryFn: async () => {
      // If no school is selected, don't fetch
      if (!selectedSchool) return [];
      
      try {
        const res = await fetch(`/api/staff-attendance?date=${formattedMonth}&schoolId=${selectedSchool.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch attendance data');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching attendance:', error);
        return [];
      }
    },
    enabled: !!selectedSchool && !!date,
  });
  
  // Process real attendance data
  const attendanceData = processAttendanceData(schoolInstructors, attendanceRecords, date || new Date());
  
  // Filter data based on search query
  const filteredData = attendanceData.filter((item: any) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate overall statistics
  const totalInstructors = filteredData.length;
  const averageAttendance = totalInstructors > 0
    ? Math.round(filteredData.reduce((sum: number, item: any) => sum + item.attendanceRate, 0) / totalInstructors)
    : 0;
  
  const presentCount = filteredData.filter((item: any) => item.attendanceRate >= 90).length;
  const lateCount = filteredData.filter((item: any) => item.attendanceRate >= 75 && item.attendanceRate < 90).length;
  const absentCount = filteredData.filter((item: any) => item.attendanceRate < 75).length;
  
  const statusData = [
    { name: "Present", value: presentCount, color: "#10B981" },
    { name: "Late", value: lateCount, color: "#F59E0B" },
    { name: "Absent", value: absentCount, color: "#EF4444" }
  ];
  
  // Excel file URL
  const excelFileUrl = "https://rsnfess-my.sharepoint.com/:x:/p/sufimuny1294/Ea1KOnzSOkpJmkqPxldi9ugBTekFDEDl9SocGCMl0Ajmkg?e=teYFz0";
  
  // Check if data is still loading
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
  
  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {selectedSchool ? `${selectedSchool.name} Staff Attendance` : 'Staff Attendance'}
          </h1>
          <p className="text-gray-500">Track and monitor instructor attendance records</p>
          <div className="mt-2 text-sm">
            <span className="flex items-center gap-1 text-emerald-600">
              <FileText size={14} /> Live Excel attendance data is accessible below
            </span>
            <a 
              href={excelFileUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mt-1"
            >
              <Download size={14} /> Download or edit in Excel Online
            </a>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 size={16} /> Share
          </Button>
          <Button className="bg-[#0A2463] hover:bg-[#071A4A] gap-2">
            <FileText size={16} /> PowerBI Dashboard
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
              onSelect={setDate}
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
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 gap-2">
              <Plus size={16} /> Record Attendance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Record Staff Attendance</DialogTitle>
              <DialogDescription>
                Enter attendance details for an instructor. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <AttendanceForm 
              instructors={schoolInstructors} 
              onClose={() => setIsDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{averageAttendance}%</div>
              <div className={`p-2 rounded-full ${
                averageAttendance >= 90 ? 'bg-green-100 text-green-800' : 
                averageAttendance >= 75 ? 'bg-amber-100 text-amber-800' : 
                'bg-red-100 text-red-800'
              }`}>
                <CalendarIcon size={20} />
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
            <p className="text-xs text-gray-500 mt-2">
              Average attendance rate for {totalInstructors} instructors in {format(date || new Date(), "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Attendance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-36">
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <div>Present: {presentCount}</div>
              <div>Late: {lateCount}</div>
              <div>Absent: {absentCount}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Monthly Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-green-600">{Math.round(presentCount / totalInstructors * 100)}%</div>
                <div className="text-xs text-gray-500">On Time</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-amber-600">{Math.round(lateCount / totalInstructors * 100)}%</div>
                <div className="text-xs text-gray-500">Late</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-red-600">{Math.round(absentCount / totalInstructors * 100)}%</div>
                <div className="text-xs text-gray-500">Absent</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Based on {filteredData.reduce((sum, item) => sum + item.totalDays, 0)} total attendance days in {format(date || new Date(), "MMMM yyyy")}
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
          <Card>
            <CardHeader>
              <CardTitle>Live Attendance Data (Excel)</CardTitle>
              <p className="text-sm text-gray-500">
                View and access the latest staff attendance data. The Excel file opens in a new tab for full access.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center">
                <div className="mb-4 w-full">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-blue-800">Staff Attendance Spreadsheet</h3>
                    <div className="flex gap-2">
                      <a 
                        href={excelFileUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <ExternalLink size={16} /> Open in new tab
                      </a>
                      <a 
                        href={`${excelFileUrl}&action=edit`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Edit size={16} /> Edit
                      </a>
                      <a 
                        href={`${excelFileUrl}&download=1`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <Download size={16} /> Download
                      </a>
                    </div>
                  </div>

                  {/* Primary Excel Embed - Using Microsoft's Office Online Viewer */}
                  <div className="w-full rounded-md overflow-hidden border border-gray-200 bg-white mb-4">
                    <iframe 
                      src="https://view.officeapps.live.com/op/embed.aspx?src=https%3A%2F%2Frsnfess-my.sharepoint.com%2F%3Ax%3A%2Fp%2Fsufimuny1294%2FEa1KOnzSOkpJmkqPxldi9ugBTekFDEDl9SocGCMl0Ajmkg%3Fe%3DteYFz0"
                      width="100%" 
                      height="700px" 
                      frameBorder="0" 
                      scrolling="yes"
                      title="Staff Attendance Excel"
                      className="bg-white"
                      allowFullScreen={true}
                      loading="lazy"
                    >
                      This browser does not support embedding Office documents.
                    </iframe>
                  </div>
                  
                  {/* Backup Embed Options */}
                  <div className="text-sm text-gray-500 mt-4">
                    <p>If the Excel spreadsheet isn't displaying properly above, try these alternative viewing options:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                      <Button 
                        variant="outline" 
                        className="text-sm"
                        onClick={() => window.open("https://view.officeapps.live.com/op/embed.aspx?src=" + encodeURIComponent(excelFileUrl), "_blank")}
                      >
                        <FileText className="mr-2 h-4 w-4" /> View in Office Online
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-sm"
                        onClick={() => window.open(excelFileUrl, "_blank")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" /> Open in SharePoint
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-sm"
                        onClick={() => window.open("https://rsnfess-my.sharepoint.com/personal/sufimuny1294_rsnf_edu_sa/_layouts/15/Doc.aspx?sourcedoc={f59b14a2-4cb9-4fc4-bfae-56a2e9a3ed44}&action=embedview&wdAllowInteractivity=False&wdHideGridlines=True&wdHideHeaders=True&wdDownloadButton=True&wdInConfigurator=True", "_blank")}
                      >
                        <FileText className="mr-2 h-4 w-4" /> Web Embedded View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Daily Attendance Records</CardTitle>
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Plus size={16} /> Add Record
              </Button>
            </CardHeader>
            <CardContent>
              {filteredData.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-500 mb-4">No attendance records found</h3>
                  <p className="text-sm text-gray-400 max-w-md mx-auto">
                    {selectedSchool ? 
                      `No attendance records found for ${selectedSchool.name} in ${format(date || new Date(), "MMMM yyyy")}` : 
                      'Please select a school to view attendance records'}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Attendance Rate</TableHead>
                        <TableHead className="hidden sm:table-cell">Present</TableHead>
                        <TableHead className="hidden sm:table-cell">Late</TableHead>
                        <TableHead className="hidden sm:table-cell">Absent</TableHead>
                        <TableHead className="hidden md:table-cell">Other</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((instructor: any) => (
                        <TableRow key={instructor.id}>
                          <TableCell className="font-medium">{instructor.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className={`w-3 h-3 rounded-full ${
                                  instructor.attendanceRate >= 90 ? 'bg-green-500' : 
                                  instructor.attendanceRate >= 75 ? 'bg-amber-500' : 
                                  'bg-red-500'
                                }`}
                              />
                              <span>{instructor.attendanceRate}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{instructor.present}</TableCell>
                          <TableCell className="hidden sm:table-cell">{instructor.late}</TableCell>
                          <TableCell className="hidden sm:table-cell">{instructor.absent}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {instructor.sick + instructor.paternity + instructor.pto + instructor.bereavement}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-xs"
                              onClick={() => {
                                // Open a dialog to show detailed records (in a future implementation)
                                console.log('View details for', instructor.name);
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Recent Attendance Activities</h3>
                {attendanceRecords.length > 0 ? (
                  <div className="space-y-4">
                    {attendanceRecords.slice(0, 5).map((record) => {
                      // Find the instructor for this record
                      const instructor = instructors.find(i => i.id === record.instructorId);
                      if (!instructor) return null;
                      
                      const statusIcon = 
                        record.status === 'present' ? <Check className="text-green-500" /> :
                        record.status === 'late' ? <Clock className="text-amber-500" /> :
                        record.status === 'absent' ? <X className="text-red-500" /> :
                        <AlertTriangle className="text-blue-500" />;
                        
                      return (
                        <div 
                          key={record.id} 
                          className="flex items-center gap-4 p-3 border rounded-md bg-white"
                        >
                          <div className="p-2 bg-gray-100 rounded-full">
                            {statusIcon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{instructor.name}</div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(record.date), "MMMM d, yyyy")} - {record.status}
                              {record.timeIn && record.status !== 'absent' && ` (${record.timeIn} - ${record.timeOut || 'N/A'})`}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit size={16} />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No recent attendance activities
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-500 mb-4">Attendance trends will be displayed from PowerBI</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  Connect your Excel sheet with historical attendance data to visualize attendance trends over time.
                </p>
                <Button className="mt-4 bg-[#0A2463] hover:bg-[#071A4A]">Connect PowerBI</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffAttendance;