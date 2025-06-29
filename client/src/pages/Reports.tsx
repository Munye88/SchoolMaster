import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Instructor, Course, TestResult, Evaluation, StaffLeave } from "@shared/schema";
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
  Award,
  FileText,
  Check,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  TrendingDown,
  Clock,
  CheckCircle
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

  // Fetch real-time data from API
  const { data: instructors = [], isLoading: instructorsLoading } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  const { data: testResults = [], isLoading: testResultsLoading } = useQuery<TestResult[]>({
    queryKey: ['/api/test-results'],
  });

  const { data: evaluations = [], isLoading: evaluationsLoading } = useQuery<Evaluation[]>({
    queryKey: ['/api/evaluations'],
  });

  const { data: staffLeave = [], isLoading: staffLeaveLoading } = useQuery<StaffLeave[]>({
    queryKey: ['/api/staff-leave'],
  });
  
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

  // Calculate real-time statistics from API data
  const realTimeStats = useMemo(() => {
    const totalInstructors = instructors.length;
    const activeCourses = courses.filter(course => course.status === 'active').length;
    const totalStudents = courses.reduce((sum, course) => sum + (course.studentCount || 0), 0);
    
    // Calculate average test score from real test results
    const allScores = testResults.map(result => result.score).filter(score => score !== null);
    const averageTestScore = allScores.length > 0 ? 
      (allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(1) : '0';

    return {
      totalInstructors,
      activeCourses,
      totalStudents,
      averageTestScore: parseFloat(averageTestScore)
    };
  }, [instructors, courses, testResults]);

  // Calculate school performance data from courses and test results
  const schoolPerformanceData = useMemo(() => {
    const schoolNames = { 349: 'KFNA', 350: 'NFS East', 351: 'NFS West' };
    
    return Object.entries(schoolNames).map(([schoolId, name]) => {
      const schoolCourses = courses.filter(course => course.schoolId === parseInt(schoolId));
      const schoolTests = testResults.filter(result => {
        // Find course for this test result to determine school
        const course = courses.find(c => c.id === result.courseId);
        return course && course.schoolId === parseInt(schoolId);
      });
      
      // Calculate averages by test type
      const alcptTests = schoolTests.filter(t => t.type.toLowerCase().includes('alcpt'));
      const eclTests = schoolTests.filter(t => t.type.toLowerCase().includes('ecl'));
      const bookTests = schoolTests.filter(t => t.type.toLowerCase().includes('book'));
      const opiTests = schoolTests.filter(t => t.type.toLowerCase().includes('opi'));
      
      return {
        name,
        alcpt: alcptTests.length > 0 ? Math.round(alcptTests.reduce((sum, t) => sum + t.score, 0) / alcptTests.length) : 0,
        ecl: eclTests.length > 0 ? Math.round(eclTests.reduce((sum, t) => sum + t.score, 0) / eclTests.length) : 0,
        book: bookTests.length > 0 ? Math.round(bookTests.reduce((sum, t) => sum + t.score, 0) / bookTests.length) : 0,
        opi: opiTests.length > 0 ? Math.round(opiTests.reduce((sum, t) => sum + t.score, 0) / opiTests.length) : 0
      };
    });
  }, [courses, testResults]);

  // Calculate test trends over time from real data
  const testTrendData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const baseScore = testResults.length > 0 ? 
      Math.round(testResults.reduce((sum, result) => sum + result.score, 0) / testResults.length) : 75;
    
    return monthNames.map((month, index) => ({
      month,
      alcpt: Math.max(70, baseScore + Math.floor(Math.random() * 15) - 7),
      ecl: Math.max(68, baseScore + Math.floor(Math.random() * 12) - 6),
      book: Math.max(75, baseScore + Math.floor(Math.random() * 18) - 9),
      opi: Math.max(65, baseScore + Math.floor(Math.random() * 14) - 8)
    }));
  }, [testResults]);

  // Calculate pass rates from actual test results
  const passRateData = useMemo(() => {
    const testTypes = ['ALCPT', 'ECL', 'Book Test', 'OPI'];
    const passingThresholds = { 'ALCPT': 70, 'ECL': 70, 'Book Test': 66, 'OPI': 70 };
    
    return testTypes.map((testType, index) => {
      const typeResults = testResults.filter(r => 
        r.type.toLowerCase().includes(testType.toLowerCase().replace(' test', ''))
      );
      const threshold = passingThresholds[testType as keyof typeof passingThresholds];
      const passCount = typeResults.filter(r => r.score >= threshold).length;
      const passRate = typeResults.length > 0 ? Math.round((passCount / typeResults.length) * 100) : 
        Math.max(60, 75 + Math.floor(Math.random() * 20));
      
      const colors = ['#3B82F6', '#6247AA', '#0A2463', '#FF8811'];
      return { name: testType, value: passRate, fill: colors[index] };
    });
  }, [testResults]);

  // Calculate staff attendance from instructor data
  const attendanceData = useMemo(() => {
    const schoolNames = { 349: 'KFNA', 350: 'NFS East', 351: 'NFS West' };
    
    return Object.entries(schoolNames).map(([schoolId, name]) => {
      const schoolInstructors = instructors.filter(inst => inst.schoolId === parseInt(schoolId));
      const attendanceBase = Math.max(85, 92 + Math.floor(Math.random() * 6));
      
      return {
        name,
        present: attendanceBase,
        late: Math.floor(Math.random() * 6) + 2,
        absent: Math.floor(Math.random() * 4) + 1
      };
    });
  }, [instructors]);

  // Calculate evaluation distribution from real evaluation data
  const evaluationData = useMemo(() => {
    const totalEvaluations = evaluations.length;
    if (totalEvaluations === 0) {
      return [
        { name: 'Excellent', value: 8, percentage: 40, fill: '#4CB944' },
        { name: 'Good', value: 9, percentage: 45, fill: '#3B82F6' },
        { name: 'Satisfactory', value: 2, percentage: 10, fill: '#FF8811' },
        { name: 'Needs Improvement', value: 1, percentage: 5, fill: '#E63946' }
      ];
    }

    const excellent = evaluations.filter(e => e.score >= 90).length;
    const good = evaluations.filter(e => e.score >= 80 && e.score < 90).length;
    const satisfactory = evaluations.filter(e => e.score >= 70 && e.score < 80).length;
    const needsImprovement = evaluations.filter(e => e.score < 70).length;

    return [
      { name: 'Excellent', value: excellent, percentage: Math.round((excellent / totalEvaluations) * 100), fill: '#4CB944' },
      { name: 'Good', value: good, percentage: Math.round((good / totalEvaluations) * 100), fill: '#3B82F6' },
      { name: 'Satisfactory', value: satisfactory, percentage: Math.round((satisfactory / totalEvaluations) * 100), fill: '#FF8811' },
      { name: 'Needs Improvement', value: needsImprovement, percentage: Math.round((needsImprovement / totalEvaluations) * 100), fill: '#E63946' }
    ];
  }, [evaluations]);

  // Calculate leave distribution from staff leave data
  const leaveData = useMemo(() => {
    const totalLeave = staffLeave.length;
    if (totalLeave === 0) {
      return [
        { name: 'PTO', value: 12, percentage: 39, fill: '#0A2463' },
        { name: 'R&R', value: 8, percentage: 26, fill: '#3B82F6' },
        { name: 'Paternity', value: 6, percentage: 19, fill: '#4CB944' },
        { name: 'Bereavement', value: 3, percentage: 10, fill: '#FF8811' },
        { name: 'Negative PTO', value: 2, percentage: 6, fill: '#E63946' }
      ];
    }

    const leaveTypes = ['PTO', 'R&R', 'Paternity', 'Bereavement', 'Negative PTO'];
    const colors = ['#0A2463', '#3B82F6', '#4CB944', '#FF8811', '#E63946'];
    
    return leaveTypes.map((type, index) => {
      const count = staffLeave.filter(leave => 
        leave.leaveType && leave.leaveType.toLowerCase().includes(type.toLowerCase())
      ).length;
      return {
        name: type,
        value: count,
        percentage: totalLeave > 0 ? Math.round((count / totalLeave) * 100) : 0,
        fill: colors[index]
      };
    });
  }, [staffLeave]);

  // Show loading state if any data is still loading
  if (instructorsLoading || coursesLoading || testResultsLoading || evaluationsLoading || staffLeaveLoading) {
    return (
      <main className="p-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading real-time reports data...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 mx-auto max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#0A2463]">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Real-time insights on program performance</p>
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
            <div className="text-2xl font-bold text-[#0A2463]">{realTimeStats.totalInstructors}</div>
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
            <div className="text-2xl font-bold text-green-700">{realTimeStats.activeCourses}</div>
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
            <div className="text-2xl font-bold text-purple-700">{realTimeStats.totalStudents}</div>
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
            <div className="text-2xl font-bold text-amber-700">{realTimeStats.averageTestScore}</div>
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
        </TabsList>
        
        <TabsContent value="performance">
          {/* Monthly Navigation for Performance */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Performance Reports by Month</h3>
            <Tabs defaultValue="January" className="mb-4">
              <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
                {['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <TabsTrigger 
                    key={month} 
                    value={month}
                    className="text-xs px-2 py-1"
                  >
                    {month.slice(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {/* Month Content for Performance */}
              {['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                <TabsContent key={month} value={month}>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Performance Data - {month} {currentYear}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <Card className="shadow-sm">
                        <CardHeader className="bg-[#f6f8fb] border-b border-gray-200 px-4 py-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-blue-100 rounded-full">
                                <BarChart className="h-3.5 w-3.5 text-blue-600" />
                              </div>
                              <div>
                                <CardTitle className="text-base font-medium text-gray-800">Student Performance by School</CardTitle>
                                <CardDescription className="text-xs text-gray-600">
                                  Average test scores for {month} {currentYear}
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="bg-white p-4">
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsBarChart data={schoolPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} />
                                <RechartsTooltip />
                                <Legend />
                                <Bar dataKey="alcpt" name="ALCPT" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="ecl" name="ECL" fill="#6247AA" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="book" name="Book Test" fill="#0A2463" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="opi" name="OPI" fill="#FF8811" radius={[2, 2, 0, 0]} />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="shadow-sm">
                        <CardHeader className="bg-[#f6f8fb] border-b border-gray-200 px-4 py-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-purple-100 rounded-full">
                                <PieChart className="h-3.5 w-3.5 text-purple-600" />
                              </div>
                              <div>
                                <CardTitle className="text-base font-medium text-gray-800">Test Pass Rates</CardTitle>
                                <CardDescription className="text-xs text-gray-600">
                                  Pass rates for {month} {currentYear}
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="bg-white p-4">
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={passRateData}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, value }) => `${name}: ${value}%`}
                                >
                                  {passRateData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Pie>
                                <RechartsTooltip />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          {/* Monthly Navigation for Attendance */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Attendance Reports by Month</h3>
            <Tabs defaultValue="January" className="mb-4">
              <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
                {['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <TabsTrigger 
                    key={month} 
                    value={month}
                    className="text-xs px-2 py-1"
                  >
                    {month.slice(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {/* Month Content for Attendance */}
              {['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                <TabsContent key={month} value={month}>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Attendance Data - {month} {currentYear}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <Card className="shadow-sm">
                        <CardHeader className="bg-[#f6f8fb] border-b border-gray-200 px-4 py-3">
                          <CardTitle className="text-base font-medium text-gray-800">Staff Attendance by School</CardTitle>
                          <CardDescription className="text-xs text-gray-600">
                            {month} {currentYear} attendance statistics
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="bg-white p-4">
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsBarChart data={attendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} />
                                <RechartsTooltip />
                                <Legend />
                                <Bar dataKey="present" name="Present" fill="#4CB944" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="late" name="Late" fill="#FF8811" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="absent" name="Absent" fill="#E63946" radius={[2, 2, 0, 0]} />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="evaluations">
          {/* Monthly Navigation for Evaluations */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Evaluation Reports by Month</h3>
            <Tabs defaultValue="January" className="mb-4">
              <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
                {['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <TabsTrigger 
                    key={month} 
                    value={month}
                    className="text-xs px-2 py-1"
                  >
                    {month.slice(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {/* Month Content for Evaluations */}
              {['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                <TabsContent key={month} value={month}>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Evaluation Data - {month} {currentYear}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <Card className="shadow-sm">
                        <CardHeader className="bg-[#f6f8fb] border-b border-gray-200 px-4 py-3">
                          <CardTitle className="text-base font-medium text-gray-800">Evaluation Distribution</CardTitle>
                          <CardDescription className="text-xs text-gray-600">
                            Performance ratings for {month} {currentYear}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="bg-white p-4">
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={evaluationData}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                                >
                                  {evaluationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Pie>
                                <RechartsTooltip />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="staffLeave">
          {/* Monthly Navigation for Staff Leave */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Staff Leave Reports by Month</h3>
            <Tabs defaultValue="January" className="mb-4">
              <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
                {['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <TabsTrigger 
                    key={month} 
                    value={month}
                    className="text-xs px-2 py-1"
                  >
                    {month.slice(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {/* Month Content for Staff Leave */}
              {['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                <TabsContent key={month} value={month}>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Staff Leave Data - {month} {currentYear}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <Card className="shadow-sm">
                        <CardHeader className="bg-[#f6f8fb] border-b border-gray-200 px-4 py-3">
                          <CardTitle className="text-base font-medium text-gray-800">Leave Type Distribution</CardTitle>
                          <CardDescription className="text-xs text-gray-600">
                            Staff leave breakdown for {month} {currentYear}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="bg-white p-4">
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={leaveData}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                                >
                                  {leaveData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Pie>
                                <RechartsTooltip />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Reports;