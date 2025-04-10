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
import { useSchool } from "@/hooks/useSchool";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const Reports = () => {
  const { selectedSchool, currentSchool } = useSchool();
  const [timeRange, setTimeRange] = useState("month");
  const [reportType, setReportType] = useState("performance");
  
  // Mock dates for report range
  const currentDate = new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = months[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  return (
    <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0A2463] to-blue-600 bg-clip-text text-transparent">
            {selectedSchool && currentSchool 
              ? `${currentSchool.name} Reports` 
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
              <CardContent className="h-80 flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6">
                <div className="text-center w-full">
                  <div className="rounded-lg bg-white shadow-inner p-10 border border-blue-100 h-64 flex items-center justify-center">
                    <div>
                      <BarChart2 className="h-16 w-16 text-blue-400 mx-auto mb-4 opacity-70" />
                      <p className="text-base font-medium text-blue-900">
                        PowerBI Dashboard
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Interactive chart showing student performance metrics by school
                      </p>
                    </div>
                  </div>
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
              <CardContent className="h-80 flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-6">
                <div className="text-center w-full">
                  <div className="rounded-lg bg-white shadow-inner p-10 border border-green-100 h-64 flex items-center justify-center">
                    <div>
                      <PieChart className="h-16 w-16 text-green-400 mx-auto mb-4 opacity-70" />
                      <p className="text-base font-medium text-green-900">
                        PowerBI Dashboard
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Interactive chart showing course completion rates
                      </p>
                    </div>
                  </div>
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
            <CardContent className="h-80 flex items-center justify-center bg-gradient-to-b from-amber-50 to-white p-6">
              <div className="text-center w-full">
                <div className="rounded-lg bg-white shadow-inner p-10 border border-amber-100 h-64 flex items-center justify-center">
                  <div>
                    <LineChart className="h-16 w-16 text-amber-400 mx-auto mb-4 opacity-70" />
                    <p className="text-base font-medium text-amber-900">
                      PowerBI Dashboard
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Interactive timeline chart showing performance trends
                    </p>
                  </div>
                </div>
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
            <CardContent className="h-80 flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6">
              <div className="text-center w-full">
                <div className="rounded-lg bg-white shadow-inner p-10 border border-blue-100 h-64 flex items-center justify-center">
                  <div>
                    <BarChart2 className="h-16 w-16 text-blue-400 mx-auto mb-4 opacity-70" />
                    <p className="text-base font-medium text-blue-900">
                      PowerBI Dashboard
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Interactive chart showing student attendance metrics by course
                    </p>
                  </div>
                </div>
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
              <CardContent className="h-80 flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-6">
                <div className="text-center w-full">
                  <div className="rounded-lg bg-white shadow-inner p-10 border border-purple-100 h-64 flex items-center justify-center">
                    <div>
                      <BarChart2 className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-70" />
                      <p className="text-base font-medium text-purple-900">
                        PowerBI Dashboard
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Interactive chart showing quarterly staff evaluation metrics
                      </p>
                    </div>
                  </div>
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
              <CardContent className="h-80 flex items-center justify-center bg-gradient-to-b from-rose-50 to-white p-6">
                <div className="text-center w-full">
                  <div className="rounded-lg bg-white shadow-inner p-10 border border-rose-100 h-64 flex items-center justify-center">
                    <div>
                      <PieChart className="h-16 w-16 text-rose-400 mx-auto mb-4 opacity-70" />
                      <p className="text-base font-medium text-rose-900">
                        PowerBI Dashboard
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Interactive chart showing evaluation score distribution
                      </p>
                    </div>
                  </div>
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
            <CardContent className="h-80 flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-6">
              <div className="text-center w-full">
                <div className="rounded-lg bg-white shadow-inner p-10 border border-indigo-100 h-64 flex items-center justify-center">
                  <div>
                    <LineChart className="h-16 w-16 text-indigo-400 mx-auto mb-4 opacity-70" />
                    <p className="text-base font-medium text-indigo-900">
                      PowerBI Dashboard
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Interactive timeline showing long-term performance and enrollment trends
                    </p>
                  </div>
                </div>
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
