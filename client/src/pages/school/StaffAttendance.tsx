import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Instructor } from "@shared/schema";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarIcon, Search, Download, Filter, Share2, FileText } from "lucide-react";
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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Generate random attendance data for demonstration
const generateAttendanceData = (instructors: Instructor[]) => {
  return instructors.map(instructor => {
    const totalDays = 22; // Working days in a month
    const present = Math.floor(Math.random() * 5) + 17; // Random between 17-22 days
    const absent = Math.floor(Math.random() * 3); // Random between 0-2 days
    const late = totalDays - present - absent; // Remaining days are late
    
    const attendanceRate = Math.round((present / totalDays) * 100);
    
    return {
      id: instructor.id,
      name: instructor.name,
      totalDays,
      present,
      absent,
      late,
      attendanceRate
    };
  });
};

const StaffAttendance = () => {
  const { selectedSchool, currentSchool } = useSchool();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState("month");
  const [selectedTab, setSelectedTab] = useState("overview");
  
  // Fetch instructors
  const { data: instructors = [], isLoading } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
  });
  
  const schoolInstructors = instructors.filter(instructor => 
    !selectedSchool || instructor.schoolId === currentSchool?.id
  );
  
  // Generate attendance data
  const attendanceData = generateAttendanceData(schoolInstructors);
  
  // Filter data based on search query
  const filteredData = attendanceData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate overall statistics
  const totalInstructors = filteredData.length;
  const averageAttendance = totalInstructors > 0
    ? Math.round(filteredData.reduce((sum, item) => sum + item.attendanceRate, 0) / totalInstructors)
    : 0;
  
  const presentCount = filteredData.filter(item => item.attendanceRate >= 90).length;
  const lateCount = filteredData.filter(item => item.attendanceRate >= 75 && item.attendanceRate < 90).length;
  const absentCount = filteredData.filter(item => item.attendanceRate < 75).length;
  
  const statusData = [
    { name: "Present", value: presentCount, color: "#10B981" },
    { name: "Late", value: lateCount, color: "#F59E0B" },
    { name: "Absent", value: absentCount, color: "#EF4444" }
  ];
  
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
            {currentSchool ? `${currentSchool.name} Staff Attendance` : 'Staff Attendance'}
          </h1>
          <p className="text-gray-500">Track and monitor instructor attendance records</p>
          <a 
            href="https://rsnfess.sharepoint.com/:x:/s/ELT/EQRTd3YnVABCteiKgSl98_oB6PV3pmGHrlh4O39GVXlsjQ?email=Munye.Sufi%40rsnfess.com&e=Pm0m3M" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mt-2"
          >
            <FileText size={14} /> Access Excel Attendance Sheet
          </a>
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
              <CardTitle>Monthly Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Attendance Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-center">{item.present}</TableCell>
                      <TableCell className="text-center">{item.late}</TableCell>
                      <TableCell className="text-center">{item.absent}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={item.attendanceRate} 
                            className={`h-2 ${
                              item.attendanceRate >= 90 ? "bg-green-500" : 
                              item.attendanceRate >= 75 ? "bg-amber-500" : 
                              "bg-red-500"
                            }`}
                          />
                          <span className="text-sm font-medium">{item.attendanceRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.attendanceRate >= 90 ? 'bg-green-100 text-green-800' : 
                          item.attendanceRate >= 75 ? 'bg-amber-100 text-amber-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.attendanceRate >= 90 ? 'Excellent' : 
                           item.attendanceRate >= 75 ? 'Satisfactory' : 
                           'Needs Improvement'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-500 mb-4">Daily attendance records will be populated from PowerBI</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  Connect your Excel sheet with detailed attendance data to populate this section with actual daily attendance logs.
                </p>
                <Button className="mt-4 bg-[#0A2463] hover:bg-[#071A4A]">Connect PowerBI</Button>
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