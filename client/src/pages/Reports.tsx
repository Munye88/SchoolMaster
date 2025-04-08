import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronLeft, ChevronRight, Download, Filter, BarChart2, PieChart, LineChart, Share2 } from "lucide-react";
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
    <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {selectedSchool && currentSchool 
              ? `${currentSchool.name} Reports` 
              : 'Analytics & Reports'}
          </h1>
          <p className="text-gray-500 mt-1">Track performance and view detailed analytics</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-36">
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
          
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
          
          <Button className="bg-[#0A2463] hover:bg-[#071A4A] flex-1 sm:flex-none">
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">489</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-green-500">+12% </span>
              <span className="text-xs text-gray-500 ml-1">since last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Course Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.6%</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-green-500">+3.2% </span>
              <span className="text-xs text-gray-500 ml-1">since last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Test Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">81.5</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-yellow-500">-1.3% </span>
              <span className="text-xs text-gray-500 ml-1">since last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="performance" className="mb-6" onValueChange={setReportType}>
        <TabsList className="mb-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="evaluations">Staff Evaluations</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Student Performance by School</CardTitle>
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
                <CardDescription>
                  Average test scores across different schools
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <BarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">
                    PowerBI chart showing student performance metrics by school
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Course Completion Rate</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Percentage of students completing courses on time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">
                    PowerBI chart showing course completion rates
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Performance Trends Over Time</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Export Data
                </Button>
              </div>
              <CardDescription>
                Track test scores and performance metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500">
                  PowerBI timeline chart showing performance trends
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance">
          <Card>
            <CardContent className="p-6 h-96 flex items-center justify-center">
              <div className="text-center">
                <BarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Attendance Reports</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  This section would display PowerBI visualizations for student and instructor attendance data.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="evaluations">
          <Card>
            <CardHeader>
              <CardTitle>Staff Evaluation by Quarter</CardTitle>
              <CardDescription>
                Track instructor evaluations and performance reviews
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <BarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500">
                  PowerBI chart showing quarterly staff evaluation metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardContent className="p-6 h-96 flex items-center justify-center">
              <div className="text-center">
                <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Long-term Trends</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  This section would display PowerBI visualizations for long-term performance and enrollment trends.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
            <CardDescription>
              {reportType === "performance" && "Key insights from the performance report"}
              {reportType === "attendance" && "Key insights from the attendance report"}
              {reportType === "evaluations" && "Key insights from the staff evaluations"}
              {reportType === "trends" && "Key insights from the trends analysis"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span>
                  {reportType === "performance" && "Overall performance has improved by 12% since last quarter."}
                  {reportType === "attendance" && "Attendance rate is 96%, which is above the target of 90%."}
                  {reportType === "evaluations" && "85% of instructors received satisfactory or above ratings."}
                  {reportType === "trends" && "Steady improvement in test scores over the past 6 months."}
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <span>
                  {reportType === "performance" && "NFS East shows the highest improvement in test scores."}
                  {reportType === "attendance" && "Technical Training courses have the lowest attendance rate."}
                  {reportType === "evaluations" && "Quarterly evaluations are completed for 95% of staff."}
                  {reportType === "trends" && "Course enrollment has increased by 23% year over year."}
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <span>
                  {reportType === "performance" && "Technical Training course pass rates need improvement."}
                  {reportType === "attendance" && "Action needed for students with attendance below 80%."}
                  {reportType === "evaluations" && "3 instructors require performance improvement plans."}
                  {reportType === "trends" && "Aviation course enrollment has declined in Q3."}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Actions based on report insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-[#0A2463] text-white flex items-center justify-center mr-2 mt-0.5">1</div>
                <span>
                  {reportType === "performance" && "Schedule additional support sessions for Technical Training courses."}
                  {reportType === "attendance" && "Implement attendance incentives for low attendance courses."}
                  {reportType === "evaluations" && "Conduct focused training for instructors needing improvement."}
                  {reportType === "trends" && "Revise Aviation course curriculum to increase enrollment."}
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-[#0A2463] text-white flex items-center justify-center mr-2 mt-0.5">2</div>
                <span>
                  {reportType === "performance" && "Recognize and reward instructors with highest performance improvements."}
                  {reportType === "attendance" && "Follow up with students having attendance below threshold."}
                  {reportType === "evaluations" && "Establish peer mentoring program for new instructors."}
                  {reportType === "trends" && "Expand successful Language Training course offerings."}
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-[#0A2463] text-white flex items-center justify-center mr-2 mt-0.5">3</div>
                <span>
                  {reportType === "performance" && "Share best practices from NFS East with other schools."}
                  {reportType === "attendance" && "Review scheduling for courses with attendance issues."}
                  {reportType === "evaluations" && "Update evaluation criteria for next quarter based on feedback."}
                  {reportType === "trends" && "Implement new tracking metrics for course effectiveness."}
                </span>
              </li>
            </ul>
            
            <Button className="w-full mt-6 bg-[#0A2463] hover:bg-[#071A4A]">
              Generate Detailed Action Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Reports;
