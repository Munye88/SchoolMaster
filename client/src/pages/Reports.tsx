import React, { useState, useMemo } from "react";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  BarChart2, 
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  PieChart,
  Share2,
  Users,
  BarChart,
  School,
  Filter,
  Plane,
  LineChart,
  Award
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

const Reports: React.FC = () => {
  const { toast } = useToast();
  
  const [currentMonth, setCurrentMonth] = useState("May");
  const [currentYear, setCurrentYear] = useState(2025);
  const [period, setPeriod] = useState("month");
  const [reportType, setReportType] = useState("performance");
  
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const currentMonthIndex = months.indexOf(currentMonth);
  
  const handlePreviousMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonth(months[11]);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(months[currentMonthIndex - 1]);
    }
  };
  
  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonth(months[0]);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(months[currentMonthIndex + 1]);
    }
  };
  
  const downloadReport = () => {
    toast({
      title: "Report Downloaded",
      description: `${currentMonth} ${currentYear} report has been downloaded.`,
    });
  };
  
  // Example data for charts
  // Actual implementation would fetch this from the backend
  
  const schoolPerformanceData = [
    {
      name: 'KFNA',
      alcpt: 82,
      ecl: 78,
      book: 87,
      opi: 75
    },
    {
      name: 'NFS East',
      alcpt: 85,
      ecl: 81,
      book: 89,
      opi: 78
    },
    {
      name: 'NFS West',
      alcpt: 79,
      ecl: 76,
      book: 83,
      opi: 73
    }
  ];
  
  const testTypeData = [
    {
      month: 'Jan',
      alcpt: 80,
      ecl: 75,
      book: 85,
      opi: 72
    },
    {
      month: 'Feb',
      alcpt: 82,
      ecl: 77,
      book: 86,
      opi: 73
    },
    {
      month: 'Mar',
      alcpt: 81,
      ecl: 76,
      book: 84,
      opi: 74
    },
    {
      month: 'Apr',
      alcpt: 83,
      ecl: 78,
      book: 87,
      opi: 76
    },
    {
      month: 'May',
      alcpt: 85,
      ecl: 80,
      book: 89,
      opi: 78
    }
  ];
  
  const passRateData = [
    { name: 'ALCPT', value: 75, color: '#3B82F6' },
    { name: 'ECL', value: 68, color: '#6247AA' },
    { name: 'Book Test', value: 82, color: '#0A2463' },
    { name: 'OPI', value: 70, color: '#FF8811' }
  ];
  
  const staffAttendanceData = [
    {
      name: 'KFNA',
      present: 95,
      late: 3,
      absent: 2
    },
    {
      name: 'NFS East',
      present: 93,
      late: 5,
      absent: 2
    },
    {
      name: 'NFS West',
      present: 91,
      late: 6,
      absent: 3
    }
  ];
  
  const attendanceTrendData = [
    { month: 'Jan', present: 92, late: 5, absent: 3 },
    { month: 'Feb', present: 93, late: 4, absent: 3 },
    { month: 'Mar', present: 94, late: 4, absent: 2 },
    { month: 'Apr', present: 93, late: 5, absent: 2 },
    { month: 'May', present: 94, late: 4, absent: 2 }
  ];
  
  const evaluationTypeData = [
    { name: 'Excellent', value: 35, percentage: 35, fill: '#4CB944' },
    { name: 'Good', value: 45, percentage: 45, fill: '#3B82F6' },
    { name: 'Satisfactory', value: 15, percentage: 15, fill: '#FF8811' },
    { name: 'Needs Improvement', value: 5, percentage: 5, fill: '#E63946' }
  ];
  
  const evaluationBySchoolData = [
    { name: 'KFNA', excellent: 12, good: 15, satisfactory: 5, needsImprovement: 2 },
    { name: 'NFS East', excellent: 11, good: 14, satisfactory: 5, needsImprovement: 1 },
    { name: 'NFS West', excellent: 12, good: 16, satisfactory: 5, needsImprovement: 2 }
  ];
  
  const leaveTypeData = [
    { name: 'PTO', value: 28, percentage: 39, fill: '#0A2463' },
    { name: 'R&R', value: 20, percentage: 28, fill: '#3B82F6' },
    { name: 'Paternity', value: 12, percentage: 17, fill: '#4CB944' },
    { name: 'Bereavement', value: 8, percentage: 11, fill: '#FF8811' },
    { name: 'Negative PTO', value: 4, percentage: 6, fill: '#E63946' }
  ];
  
  const leaveBySchoolData = [
    { name: 'KNFA', pto: 10, rr: 6, paternity: 4, bereavement: 3, negativePto: 1 },
    { name: 'NFS East', pto: 8, rr: 6, paternity: 5, bereavement: 2, negativePto: 1 },
    { name: 'NFS West', pto: 10, rr: 8, paternity: 3, bereavement: 3, negativePto: 2 }
  ];
  
  const leaveMonthlyTrendsData = [
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 10 },
    { month: 'Mar', count: 15 },
    { month: 'Apr', count: 18 },
    { month: 'May', count: 22 }
  ];
  
  const leaveDurationData = [
    { duration: '1-2 days', count: 15, fill: '#3B82F6' },
    { duration: '3-5 days', count: 25, fill: '#4CB944' },
    { duration: '1-2 weeks', count: 18, fill: '#FF8811' },
    { duration: '2-4 weeks', count: 8, fill: '#E63946' },
    { duration: '1+ month', count: 4, fill: '#6247AA' }
  ];
  
  const monthlyPerformanceData = [
    { month: 'Jan', kfna: 78, nfsEast: 82, nfsWest: 76 },
    { month: 'Feb', kfna: 80, nfsEast: 84, nfsWest: 78 },
    { month: 'Mar', kfna: 82, nfsEast: 85, nfsWest: 79 },
    { month: 'Apr', kfna: 83, nfsEast: 86, nfsWest: 81 },
    { month: 'May', kfna: 85, nfsEast: 88, nfsWest: 82 }
  ];
  
  return (
    <main className="p-8 mx-auto max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#0A2463]">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Comprehensive insights on program performance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-1 rounded-lg border border-blue-100 shadow-sm flex">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-blue-100 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5 text-blue-700" />
            </button>
            <div className="px-4 py-2 font-medium text-blue-900">
              {currentMonth} {currentYear}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-blue-100 rounded-lg"
            >
              <ChevronRight className="h-5 w-5 text-blue-700" />
            </button>
          </div>
          
          <Select defaultValue="month" onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] bg-white border-blue-100">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="quarter">Quarterly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="gap-2" onClick={downloadReport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="shadow-md border-blue-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-700">Total Instructors</CardTitle>
              <CardDescription className="text-xs text-gray-500">All schools</CardDescription>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-[#0A2463]">73</div>
            <div className="flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs font-medium text-green-500">+2.8% </span>
              <span className="text-xs text-gray-500 ml-1">since last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-green-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-green-50 to-white border-b border-green-100">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-700">Active Courses</CardTitle>
              <CardDescription className="text-xs text-gray-500">All schools</CardDescription>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <School className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-700">12</div>
            <div className="flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs font-medium text-green-500">+9.1% </span>
              <span className="text-xs text-gray-500 ml-1">since last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-purple-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-700">Students Enrolled</CardTitle>
              <CardDescription className="text-xs text-gray-500">All schools</CardDescription>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-700">396</div>
            <div className="flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs font-medium text-green-500">+0.0% </span>
              <span className="text-xs text-gray-500 ml-1">since last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-amber-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-700">Average Test Score</CardTitle>
              <CardDescription className="text-xs text-gray-500">All test types</CardDescription>
            </div>
            <div className="p-2 bg-amber-100 rounded-full">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-700">81.5</div>
            <div className="flex items-center mt-1">
              <ArrowDownRight className="h-3 w-3 text-amber-500 mr-1" />
              <span className="text-xs font-medium text-amber-500">-1.3% </span>
              <span className="text-xs text-gray-500 ml-1">since last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="performance" className="mb-6" onValueChange={setReportType}>
        <TabsList className="mb-6 bg-blue-50 p-1 rounded-lg border border-blue-100 shadow-sm">
          <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm" value="performance">
            <BarChart2 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm" value="attendance">
            <Users className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm" value="evaluations">
            <Award className="h-4 w-4 mr-2" />
            Staff Evaluations
          </TabsTrigger>
          <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm" value="staffLeave">
            <Plane className="h-4 w-4 mr-2" />
            Staff Leave
          </TabsTrigger>
          <TabsTrigger className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm" value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <BarChart2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#0A2463]">School Performance</CardTitle>
                      <CardDescription>
                        Test results by school
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>ALCPT</DropdownMenuItem>
                      <DropdownMenuItem>ECL</DropdownMenuItem>
                      <DropdownMenuItem>Book Test</DropdownMenuItem>
                      <DropdownMenuItem>OPI</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-blue-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-blue-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={schoolPerformanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar dataKey="alcpt" name="ALCPT" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ecl" name="ECL" fill="#6247AA" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="book" name="Book Test" fill="#0A2463" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="opi" name="OPI" fill="#FF8811" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-green-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-full">
                      <LineChart className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-green-700">Test Type Performance</CardTitle>
                      <CardDescription>
                        Score trends by test type
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-green-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-green-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={testTypeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Line type="monotone" dataKey="alcpt" name="ALCPT" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="ecl" name="ECL" stroke="#6247AA" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="book" name="Book Test" stroke="#0A2463" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="opi" name="OPI" stroke="#FF8811" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <BarChart2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-[#0A2463]">Test Pass Rate</CardTitle>
                    <CardDescription>
                      Passing rate by test type
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-80 bg-gradient-to-b from-blue-50 to-white py-3 px-1">
              <div className="w-full h-full rounded-lg bg-white shadow-inner border border-blue-100 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={passRateData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                    layout="vertical"
                    barSize={28}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                    <XAxis type="number" tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      formatter={(value, name) => [`${value}%`, name]}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '10px' }} 
                      iconType="square"
                      align="center"
                    />
                    <Bar 
                      dataKey="value" 
                      name="Pass Rate" 
                      background={{ fill: '#f5f5f5' }}
                    >
                      {passRateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <BarChart2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#0A2463]">Staff Attendance by School</CardTitle>
                      <CardDescription>
                        Present, late, and absent percentages
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-blue-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-blue-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={staffAttendanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value}%`, '']}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar dataKey="present" name="Present" stackId="a" fill="#4CB944" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="late" name="Late" stackId="a" fill="#FF8811" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="absent" name="Absent" stackId="a" fill="#E63946" radius={[0, 0, 4, 4]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-green-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-full">
                      <LineChart className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-green-700">Monthly Attendance Trends</CardTitle>
                      <CardDescription>
                        Attendance patterns over time
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-green-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-green-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={attendanceTrendData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value}%`, '']}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Line type="monotone" dataKey="present" name="Present" stroke="#4CB944" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="late" name="Late" stroke="#FF8811" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="absent" name="Absent" stroke="#E63946" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="evaluations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <PieChart className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#0A2463]">Evaluation Distribution</CardTitle>
                      <CardDescription>
                        Breakdown of evaluation ratings
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-blue-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-blue-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={evaluationTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {evaluationTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => [`${value} evaluations`, '']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-green-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-full">
                      <BarChart2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-green-700">Evaluations by School</CardTitle>
                      <CardDescription>
                        Evaluation ratings across schools
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-green-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-green-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={evaluationBySchoolData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar dataKey="excellent" name="Excellent" fill="#4CB944" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="good" name="Good" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="satisfactory" name="Satisfactory" fill="#FF8811" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="needsImprovement" name="Needs Improvement" fill="#E63946" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="staffLeave">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <PieChart className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#0A2463]">Leave Type Distribution</CardTitle>
                      <CardDescription>
                        Breakdown of different leave types
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-blue-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border-2 border-blue-300 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={leaveTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {leaveTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => [`${value} requests`, '']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-green-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-full">
                      <BarChart2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-green-700">Leave by School</CardTitle>
                      <CardDescription>
                        Distribution of leave requests by school
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>PTO</DropdownMenuItem>
                      <DropdownMenuItem>R&R</DropdownMenuItem>
                      <DropdownMenuItem>Paternity</DropdownMenuItem>
                      <DropdownMenuItem>Bereavement</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-green-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-green-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={leaveBySchoolData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar dataKey="pto" name="PTO" fill="#0A2463" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="rr" name="R&R" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="paternity" name="Paternity" fill="#4CB944" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="bereavement" name="Bereavement" fill="#FF8811" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="negativePto" name="Negative PTO" fill="#E63946" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 rounded-full">
                      <LineChart className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-amber-700">Monthly Leave Trends</CardTitle>
                      <CardDescription>
                        Leave requests throughout the year
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-amber-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-amber-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={leaveMonthlyTrendsData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value} requests`, '']}
                      />
                      <Area type="monotone" dataKey="count" name="Leave Requests" stroke="#FF8811" fill="#FF8811" fillOpacity={0.2} activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <BarChart2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#0A2463]">Leave Duration</CardTitle>
                      <CardDescription>
                        Length of leave requests
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-blue-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-blue-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={leaveDurationData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="duration" type="category" tick={{ fontSize: 12 }} width={60} />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value} requests`, '']}
                      />
                      <Bar dataKey="count" name="Requests" radius={[0, 4, 4, 0]}>
                        {leaveDurationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-[#0A2463]">Long-term Performance Trends</CardTitle>
                    <CardDescription>
                      Year-over-year performance metrics
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-80 bg-gradient-to-b from-blue-50 to-white py-3 px-1">
              <div className="w-full h-full rounded-lg bg-white shadow-inner border border-blue-100 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={monthlyPerformanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[70, 90]} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="kfna" name="KFNA" stroke="#E4424D" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="nfsEast" name="NFS East" stroke="#22A783" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="nfsWest" name="NFS West" stroke="#6247AA" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Reports;