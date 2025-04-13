import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Filter, 
  BarChart2, 
  PieChart, 
  LineChart, 
  Share2, 
  Users, 
  CheckCircle, 
  Award,
  TrendingUp,
  FileText,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { PrintButton } from "@/components/ui/print-button";
import { useSchool } from "@/hooks/useSchool";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  BarChart, Bar, 
  LineChart as RechartsLineChart, Line, 
  PieChart as RechartsPieChart, Pie, Cell,
  AreaChart, Area,
  ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const Reports = () => {
  const { selectedSchool } = useSchool();
  const [timeRange, setTimeRange] = useState("month");
  const [reportType, setReportType] = useState("performance");
  
  // Mock dates for report range
  const currentDate = new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = months[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  
  // Sample data for charts
  const schoolPerformanceData = [
    { name: 'KNFA', alcpt: 85, bookTest: 83, ecl: 82, fill: '#0A2463' },
    { name: 'NFS East', alcpt: 87, bookTest: 84, ecl: 84, fill: '#4CB944' },
    { name: 'NFS West', alcpt: 83, bookTest: 80, ecl: 81, fill: '#FF8811' }
  ];
  
  const courseCompletionData = [
    { name: 'Completed', value: 78.6, fill: '#4CB944' },
    { name: 'In Progress', value: 15.4, fill: '#FF8811' },
    { name: 'Not Started', value: 6.0, fill: '#E63946' }
  ];
  
  const monthlyPerformanceData = [
    { month: 'Jan', alcpt: 79, bookTest: 78, ecl: 77 },
    { month: 'Feb', alcpt: 80, bookTest: 79, ecl: 78 },
    { month: 'Mar', alcpt: 82, bookTest: 80, ecl: 79 },
    { month: 'Apr', alcpt: 83, bookTest: 81, ecl: 80 },
    { month: 'May', alcpt: 84, bookTest: 82, ecl: 80 },
    { month: 'Jun', alcpt: 84, bookTest: 82, ecl: 81 },
    { month: 'Jul', alcpt: 85, bookTest: 83, ecl: 81 },
    { month: 'Aug', alcpt: 86, bookTest: 83, ecl: 82 },
    { month: 'Sep', alcpt: 85, bookTest: 83, ecl: 82 },
    { month: 'Oct', alcpt: 84, bookTest: 82, ecl: 81 },
    { month: 'Nov', alcpt: 85, bookTest: 83, ecl: 82 },
    { month: 'Dec', alcpt: 86, bookTest: 84, ecl: 83 }
  ];
  
  const instructorEvaluationData = [
    { score: '95%+', count: 12, fill: '#4CB944' },
    { score: '90-94%', count: 22, fill: '#85C88A' },
    { score: '85-89%', count: 16, fill: '#FFB84C' },
    { score: '80-84%', count: 8, fill: '#F16767' },
    { score: '<80%', count: 2, fill: '#E63946' }
  ];
  
  const attendanceData = [
    { month: 'Jan', knfa: 95, nfsEast: 93, nfsWest: 91 },
    { month: 'Feb', knfa: 94, nfsEast: 92, nfsWest: 90 },
    { month: 'Mar', knfa: 96, nfsEast: 94, nfsWest: 93 },
    { month: 'Apr', knfa: 95, nfsEast: 95, nfsWest: 92 },
    { month: 'May', knfa: 93, nfsEast: 96, nfsWest: 90 },
    { month: 'Jun', knfa: 94, nfsEast: 93, nfsWest: 91 },
    { month: 'Jul', knfa: 96, nfsEast: 95, nfsWest: 92 },
    { month: 'Aug', knfa: 97, nfsEast: 94, nfsWest: 93 },
    { month: 'Sep', knfa: 96, nfsEast: 93, nfsWest: 94 },
    { month: 'Oct', knfa: 95, nfsEast: 92, nfsWest: 92 },
    { month: 'Nov', knfa: 94, nfsEast: 94, nfsWest: 93 },
    { month: 'Dec', knfa: 95, nfsEast: 96, nfsWest: 94 }
  ];

  return (
    <main id="reportsContent" className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0A2463] to-blue-600 bg-clip-text text-transparent">
            {selectedSchool 
              ? `${selectedSchool.name} Reports` 
              : 'Analytics & Reports'}
          </h1>
          <p className="text-gray-600 mt-1 font-medium">Track performance and view detailed analytics</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-36 border-blue-200 focus:ring-blue-400 shadow-sm">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="flex-1 sm:flex-none border-blue-200 hover:bg-blue-50 hover:text-blue-700">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
          
          <Button className="bg-[#0A2463] hover:bg-[#071A4A] flex-1 sm:flex-none shadow-md hover:shadow-lg transition-all duration-300">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-medium">
            {timeRange === "month" && `${currentMonth} ${currentYear}`}
            {timeRange === "quarter" && `Q${Math.ceil((currentDate.getMonth() + 1) / 3)} ${currentYear}`}
            {timeRange === "year" && `${currentYear}`}
            {timeRange === "week" && `Week of ${new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            {timeRange === "custom" && "Custom Date Range"}
          </div>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <PrintButton contentId="reportsContent" />
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" /> Date Range
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-md border-blue-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-700">Total Students</CardTitle>
              <CardDescription className="text-xs text-gray-500">Across all schools</CardDescription>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-[#0A2463]">489</div>
            <div className="flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs font-medium text-green-500">+12% </span>
              <span className="text-xs text-gray-500 ml-1">since last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-green-100 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 bg-gradient-to-r from-green-50 to-white border-b border-green-100">
            <div>
              <CardTitle className="text-sm font-semibold text-gray-700">Course Completion Rate</CardTitle>
              <CardDescription className="text-xs text-gray-500">Average across programs</CardDescription>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-700">78.6%</div>
            <div className="flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs font-medium text-green-500">+3.2% </span>
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
                      <CardTitle className="text-lg font-semibold text-[#0A2463]">Student Performance by School</CardTitle>
                      <CardDescription>
                        Average test scores across different schools
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
                      <DropdownMenuItem>KNFA</DropdownMenuItem>
                      <DropdownMenuItem>NFS East</DropdownMenuItem>
                      <DropdownMenuItem>NFS West</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-blue-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-blue-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={schoolPerformanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[70, 90]} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value}%`, '']}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar dataKey="alcpt" name="ALCPT" fill="#0A2463" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="bookTest" name="Book Test" fill="#4CB944" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ecl" name="ECL" fill="#FF8811" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-green-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-full">
                      <PieChart className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-green-800">Course Completion Rate</CardTitle>
                      <CardDescription>
                        Percentage of students completing courses on time
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-900 hover:bg-green-50">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-900 hover:bg-green-50">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-green-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-green-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                      <Pie
                        data={courseCompletionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {courseCompletionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Percentage']}
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 mb-6">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <LineChart className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-amber-800">Performance Trends Over Time</CardTitle>
                    <CardDescription>
                      Track test scores and performance metrics over time
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-amber-200 hover:bg-amber-50 text-amber-700">
                  <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-80 bg-gradient-to-b from-amber-50 to-white py-3 px-1">
              <div className="w-full h-full rounded-lg bg-white shadow-inner border border-amber-100 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={monthlyPerformanceData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis domain={[70, 90]} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`${value}%`, '']} 
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="alcpt"
                      name="ALCPT"
                      stroke="#0A2463"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="bookTest"
                      name="Book Test"
                      stroke="#4CB944"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ecl"
                      name="ECL"
                      stroke="#FF8811"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance">
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-[#0A2463]">Student Attendance Reports</CardTitle>
                    <CardDescription>
                      Track student attendance across all courses and schools
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 text-blue-700">
                  <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-80 bg-gradient-to-b from-blue-50 to-white py-3 px-1">
              <div className="w-full h-full rounded-lg bg-white shadow-inner border border-blue-100 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={attendanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis domain={[85, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`${value}%`, '']}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Area 
                      type="monotone" 
                      dataKey="knfa" 
                      name="KNFA" 
                      stroke="#0A2463" 
                      fill="#0A2463" 
                      fillOpacity={0.3} 
                      activeDot={{ r: 6 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="nfsEast" 
                      name="NFS East" 
                      stroke="#4CB944" 
                      fill="#4CB944" 
                      fillOpacity={0.3} 
                      activeDot={{ r: 6 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="nfsWest" 
                      name="NFS West" 
                      stroke="#FF8811" 
                      fill="#FF8811" 
                      fillOpacity={0.3} 
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="evaluations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Award className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-purple-900">Staff Evaluation by Quarter</CardTitle>
                      <CardDescription>
                        Track instructor evaluations and performance reviews
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
                      <DropdownMenuItem>Q1 2025</DropdownMenuItem>
                      <DropdownMenuItem>Q2 2025</DropdownMenuItem>
                      <DropdownMenuItem>Q3 2025</DropdownMenuItem>
                      <DropdownMenuItem>Q4 2025</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-purple-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-purple-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={instructorEvaluationData}
                      layout="vertical"
                      margin={{ top: 20, right: 50, left: 80, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                      <XAxis type="number" domain={[0, 25]} />
                      <YAxis 
                        type="category" 
                        dataKey="score" 
                        tick={{ fontSize: 12 }}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`${value} instructors`, '']}
                      />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Bar 
                        dataKey="count" 
                        name="Instructor Count" 
                        radius={[0, 4, 4, 0]} 
                      >
                        {instructorEvaluationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-white border-b border-rose-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-100 rounded-full">
                      <PieChart className="h-4 w-4 text-rose-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-rose-900">Evaluation Distribution</CardTitle>
                      <CardDescription>
                        Score distribution across all instructors
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-rose-700 hover:text-rose-900 hover:bg-rose-50">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-rose-700 hover:text-rose-900 hover:bg-rose-50">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-80 bg-gradient-to-b from-rose-50 to-white py-3 px-1">
                <div className="w-full h-full rounded-lg bg-white shadow-inner border border-rose-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart margin={{ top: 20, right: 30, left: 20, bottom: 25 }}>
                      <Pie
                        data={instructorEvaluationData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ score, count }) => `${score}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="score"
                      >
                        {instructorEvaluationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} instructors`, name]}
                        contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card className="shadow-md hover:shadow-lg transition-all duration-300 mb-6">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-indigo-900">Long-term Performance Trends</CardTitle>
                    <CardDescription>
                      Track year-over-year metrics and enrollment trends
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-indigo-200 hover:bg-indigo-50 text-indigo-700">
                  <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-80 bg-gradient-to-b from-indigo-50 to-white py-3 px-1">
              <div className="w-full h-full rounded-lg bg-white shadow-inner border border-indigo-100 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={monthlyPerformanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis domain={[70, 90]} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`${value}%`, '']}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Area 
                      type="monotone" 
                      dataKey="alcpt" 
                      name="ALCPT" 
                      stroke="#0A2463" 
                      fill="#0A2463" 
                      fillOpacity={0.1}
                    />
                    <Bar 
                      dataKey="bookTest" 
                      name="Book Test" 
                      barSize={20} 
                      fill="#4CB944"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="ecl"
                      name="ECL"
                      stroke="#FF8811"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-[#0A2463]">Report Summary</CardTitle>
                <CardDescription>
                  {reportType === "performance" && "Key insights from the performance report"}
                  {reportType === "attendance" && "Key insights from the attendance report"}
                  {reportType === "evaluations" && "Key insights from the staff evaluations"}
                  {reportType === "trends" && "Key insights from the trends analysis"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-4">
              <li className="flex items-start bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-green-800 font-medium">
                  {reportType === "performance" && "Overall performance has improved by 12% since last quarter."}
                  {reportType === "attendance" && "Attendance rate is 96%, which is above the target of 90%."}
                  {reportType === "evaluations" && "85% of instructors received satisfactory or above ratings."}
                  {reportType === "trends" && "Steady improvement in test scores over the past 6 months."}
                </span>
              </li>
              <li className="flex items-start bg-amber-50 p-3 rounded-lg border border-amber-100">
                <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <span className="text-amber-800 font-medium">
                  {reportType === "performance" && "NFS East shows the highest improvement in test scores."}
                  {reportType === "attendance" && "Technical Training courses have the lowest attendance rate."}
                  {reportType === "evaluations" && "Quarterly evaluations are completed for 95% of staff."}
                  {reportType === "trends" && "Course enrollment has increased by 23% year over year."}
                </span>
              </li>
              <li className="flex items-start bg-red-50 p-3 rounded-lg border border-red-100">
                <div className="h-6 w-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <span className="text-red-800 font-medium">
                  {reportType === "performance" && "Technical Training course pass rates need improvement."}
                  {reportType === "attendance" && "Action needed for students with attendance below 80%."}
                  {reportType === "evaluations" && "3 instructors require performance improvement plans."}
                  {reportType === "trends" && "Aviation course enrollment has declined in Q3."}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-purple-900">Recommendations</CardTitle>
                <CardDescription>
                  Strategic actions based on report insights
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-4">
              <li className="flex items-start bg-gradient-to-r from-blue-50 to-white p-3 rounded-lg border border-blue-100">
                <div className="h-6 w-6 rounded-full bg-[#0A2463] text-white flex items-center justify-center mr-3 mt-0.5 shadow-md">1</div>
                <span className="text-blue-900 font-medium">
                  {reportType === "performance" && "Schedule additional support sessions for Technical Training courses."}
                  {reportType === "attendance" && "Implement attendance incentives for low attendance courses."}
                  {reportType === "evaluations" && "Conduct focused training for instructors needing improvement."}
                  {reportType === "trends" && "Revise Aviation course curriculum to increase enrollment."}
                </span>
              </li>
              <li className="flex items-start bg-gradient-to-r from-blue-50 to-white p-3 rounded-lg border border-blue-100">
                <div className="h-6 w-6 rounded-full bg-[#0A2463] text-white flex items-center justify-center mr-3 mt-0.5 shadow-md">2</div>
                <span className="text-blue-900 font-medium">
                  {reportType === "performance" && "Recognize and reward instructors with highest performance improvements."}
                  {reportType === "attendance" && "Follow up with students having attendance below threshold."}
                  {reportType === "evaluations" && "Establish peer mentoring program for new instructors."}
                  {reportType === "trends" && "Expand successful Language Training course offerings."}
                </span>
              </li>
              <li className="flex items-start bg-gradient-to-r from-blue-50 to-white p-3 rounded-lg border border-blue-100">
                <div className="h-6 w-6 rounded-full bg-[#0A2463] text-white flex items-center justify-center mr-3 mt-0.5 shadow-md">3</div>
                <span className="text-blue-900 font-medium">
                  {reportType === "performance" && "Share best practices from NFS East with other schools."}
                  {reportType === "attendance" && "Review scheduling for courses with attendance issues."}
                  {reportType === "evaluations" && "Update evaluation criteria for next quarter based on feedback."}
                  {reportType === "trends" && "Implement new tracking metrics for course effectiveness."}
                </span>
              </li>
            </ul>
            
            <Button className="w-full mt-6 bg-[#0A2463] hover:bg-[#071A4A] shadow-md hover:shadow-lg transition-all duration-300">
              <FileText className="h-4 w-4 mr-2" /> Generate Detailed Action Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Reports;
