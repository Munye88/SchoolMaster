import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Instructor, Course, TestResult, Evaluation, StaffLeave } from "@shared/schema";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  BarChart2, 
  TrendingUp,
  Users,
  BarChart,
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
  CheckCircle,
  UserCheck,
  UserX,
  ClipboardCheck,
  Target,
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";

const ReportsEnhanced: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState("June");
  const [currentYear, setCurrentYear] = useState(2025);
  const [activeTab, setActiveTab] = useState("attendance");

  // Fetch authentic data from APIs
  const { data: instructors = [], isLoading: instructorsLoading } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  const { data: evaluations = [], isLoading: evaluationsLoading } = useQuery<Evaluation[]>({
    queryKey: ['/api/evaluations'],
  });

  const { data: staffLeave = [], isLoading: staffLeaveLoading } = useQuery<StaffLeave[]>({
    queryKey: ['/api/staff-leave'],
  });

  const { data: attendanceData = [], isLoading: attendanceLoading } = useQuery<any[]>({
    queryKey: ['/api/staff-attendance'],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: testScores = [], isLoading: testScoresLoading } = useQuery<any[]>({
    queryKey: ['/api/test-scores'],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: schools = [], isLoading: schoolsLoading } = useQuery<any[]>({
    queryKey: ['/api/schools'],
  });

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Process attendance data
  const processedAttendanceData = useMemo(() => {
    if (!attendanceData.length || !schools.length) return [];
    
    const schoolMap = schools.reduce((acc, school) => {
      acc[school.id] = school.name;
      return acc;
    }, {});

    const schoolStats = {};
    
    attendanceData.forEach(record => {
      const schoolName = schoolMap[record.schoolId] || 'Unknown';
      if (!schoolStats[schoolName]) {
        schoolStats[schoolName] = { present: 0, absent: 0, late: 0, total: 0 };
      }
      
      schoolStats[schoolName].total++;
      if (record.status === 'present') {
        schoolStats[schoolName].present++;
      } else if (record.status === 'absent') {
        schoolStats[schoolName].absent++;
      } else if (record.status === 'late') {
        schoolStats[schoolName].late++;
      }
    });

    return Object.entries(schoolStats).map(([school, stats]) => ({
      school,
      ...stats,
      attendance: Math.round((stats.present / stats.total) * 100)
    }));
  }, [attendanceData, schools]);

  // Process evaluation data for quarterly percentages
  const processedEvaluationData = useMemo(() => {
    if (!evaluations.length) return [];
    
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    
    const quarterlyData = quarters.map(quarter => {
      // Filter evaluations by quarter using the existing quarter field
      const quarterEvals = evaluations.filter(evaluation => evaluation.quarter === quarter);
      
      if (quarterEvals.length === 0) return { quarter, percentage: 0, evaluationCount: 0 };
      
      // Use the score field directly
      const totalScore = quarterEvals.reduce((sum, evaluation) => sum + evaluation.score, 0);
      const averageScore = totalScore / quarterEvals.length;
      const percentage = Math.round(averageScore);
      
      return {
        quarter,
        percentage,
        evaluationCount: quarterEvals.length
      };
    });

    return quarterlyData;
  }, [evaluations]);

  // Process performance data from test scores
  const processedPerformanceData = useMemo(() => {
    if (!testScores.length || !schools.length) return [];
    
    const schoolMap = schools.reduce((acc, school) => {
      acc[school.id] = school.name;
      return acc;
    }, {});

    const schoolPerformance = {};
    
    testScores.forEach(score => {
      const schoolName = schoolMap[score.schoolId] || 'Unknown';
      if (!schoolPerformance[schoolName]) {
        schoolPerformance[schoolName] = { 
          total: 0, 
          sum: 0, 
          count: 0,
          passing: 0,
          testTypes: {}
        };
      }
      
      schoolPerformance[schoolName].total += score.score;
      schoolPerformance[schoolName].sum += score.score;
      schoolPerformance[schoolName].count++;
      
      if (score.score >= 80) {
        schoolPerformance[schoolName].passing++;
      }
      
      if (!schoolPerformance[schoolName].testTypes[score.testType]) {
        schoolPerformance[schoolName].testTypes[score.testType] = 0;
      }
      schoolPerformance[schoolName].testTypes[score.testType]++;
    });

    return Object.entries(schoolPerformance).map(([school, data]) => ({
      school,
      averageScore: Math.round((data.sum / data.count) * 10) / 10,
      passingRate: Math.round((data.passing / data.count) * 100),
      totalTests: data.count,
      testTypes: data.testTypes
    }));
  }, [testScores, schools]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalInstructors = instructors.length;
    const presentToday = processedAttendanceData.reduce((sum, school) => sum + school.present, 0);
    const onLeave = staffLeave.filter(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const today = new Date();
      return today >= startDate && today <= endDate;
    }).length;
    const absent = processedAttendanceData.reduce((sum, school) => sum + school.absent, 0);
    
    return {
      totalInstructors,
      presentToday,
      onLeave,
      absent,
      attendanceRate: totalInstructors > 0 ? Math.round((presentToday / totalInstructors) * 100) : 0
    };
  }, [instructors, processedAttendanceData, staffLeave]);

  // Generate monthly trend data
  const monthlyTrendData = useMemo(() => {
    return months.map((month, index) => ({
      month: month.slice(0, 3),
      attendance: 92 + Math.sin(index * 0.5) * 3 + Math.random() * 2,
      evaluation: 85 + Math.cos(index * 0.3) * 4 + Math.random() * 3,
      performance: 88 + Math.sin(index * 0.4) * 5 + Math.random() * 2
    }));
  }, []);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentIndex = months.indexOf(currentMonth);
    if (direction === 'prev') {
      if (currentIndex > 0) {
        setCurrentMonth(months[currentIndex - 1]);
      } else {
        setCurrentMonth(months[11]);
        setCurrentYear(currentYear - 1);
      }
    } else {
      if (currentIndex < 11) {
        setCurrentMonth(months[currentIndex + 1]);
      } else {
        setCurrentMonth(months[0]);
        setCurrentYear(currentYear + 1);
      }
    }
  };

  const generateSummaryAndRecommendations = () => {
    const { attendanceRate, totalInstructors, presentToday, onLeave, absent } = summaryStats;
    
    if (activeTab === 'attendance') {
      const recommendations = [];
      
      if (attendanceRate < 90) {
        recommendations.push({
          type: 'warning',
          text: 'Attendance rate is below 90%. Consider implementing attendance improvement strategies.'
        });
      }
      
      if (absent > 3) {
        recommendations.push({
          type: 'alert',
          text: 'High number of unplanned absences. Review staff wellness and engagement programs.'
        });
      }
      
      if (attendanceRate >= 95) {
        recommendations.push({
          type: 'success',
          text: 'Excellent attendance rate! Current strategies are working well.'
        });
      }
      
      return {
        summary: `Current attendance rate of ${attendanceRate}% with ${presentToday} out of ${totalInstructors} instructors present. ${onLeave} instructors are on planned leave and ${absent} are absent.`,
        recommendations
      };
    }
    
    if (activeTab === 'evaluation') {
      const recommendations = [];
      const totalEvaluations = evaluations.length;
      const averageScore = totalEvaluations > 0 ? 
        Math.round((evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / totalEvaluations) * 10) / 10 : 0;
      const excellentCount = evaluations.filter(evaluation => evaluation.score >= 90).length;
      const excellenceRate = totalEvaluations > 0 ? Math.round((excellentCount / totalEvaluations) * 100) : 0;
      
      if (averageScore < 80) {
        recommendations.push({
          type: 'alert',
          text: 'Average evaluation score is below 80. Consider additional training and support programs.'
        });
      }
      
      if (excellenceRate < 50) {
        recommendations.push({
          type: 'warning',
          text: 'Excellence rate is below 50%. Focus on professional development initiatives.'
        });
      }
      
      if (averageScore >= 85) {
        recommendations.push({
          type: 'success',
          text: 'Strong evaluation performance! Continue current training methods.'
        });
      }
      
      if (totalEvaluations === 0) {
        recommendations.push({
          type: 'warning',
          text: 'No evaluations completed this period. Schedule regular evaluation sessions.'
        });
      }
      
      return {
        summary: `${totalEvaluations} evaluations completed with an average score of ${averageScore}/100. ${excellentCount} instructors (${excellenceRate}%) achieved excellence rating (≥90 points).`,
        recommendations
      };
    }
    
    if (activeTab === 'performance') {
      const recommendations = [];
      const totalTests = testScores.length;
      const averageScore = totalTests > 0 ? 
        Math.round((testScores.reduce((sum, test) => sum + test.score, 0) / totalTests) * 10) / 10 : 0;
      const passingCount = testScores.filter(test => test.score >= 80).length;
      const passingRate = totalTests > 0 ? Math.round((passingCount / totalTests) * 100) : 0;
      
      if (averageScore < 75) {
        recommendations.push({
          type: 'alert',
          text: 'Average test score is below 75. Review curriculum and teaching methods.'
        });
      }
      
      if (passingRate < 80) {
        recommendations.push({
          type: 'warning',
          text: 'Passing rate is below 80%. Consider additional student support programs.'
        });
      }
      
      if (averageScore >= 85) {
        recommendations.push({
          type: 'success',
          text: 'Excellent test performance! Students are meeting learning objectives.'
        });
      }
      
      if (totalTests === 0) {
        recommendations.push({
          type: 'warning',
          text: 'No test scores recorded this period. Ensure regular assessment completion.'
        });
      }
      
      return {
        summary: `${totalTests} tests administered with an average score of ${averageScore}/100. ${passingCount} students (${passingRate}%) achieved passing grade (≥80 points).`,
        recommendations
      };
    }
    
    return {
      summary: 'No data available for the selected tab.',
      recommendations: []
    };
  };

  const { summary, recommendations } = generateSummaryAndRecommendations();

  if (instructorsLoading || attendanceLoading || schoolsLoading) {
    return (
      <div className="flex-1 p-6 bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600">Comprehensive insights into attendance, evaluations, and performance</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Month Navigation */}
            <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="p-1 h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-sm">
                  {currentMonth} {currentYear}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="p-1 h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Download Button */}
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border rounded-lg">
            <TabsTrigger value="attendance" className="flex items-center gap-2 data-[state=active]:bg-gray-100">
              <Users className="h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="evaluation" className="flex items-center gap-2 data-[state=active]:bg-gray-100">
              <ClipboardCheck className="h-4 w-4" />
              Evaluation
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2 data-[state=active]:bg-gray-100">
              <Target className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Staff</CardTitle>
                  <Users className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{summaryStats.totalInstructors}</div>
                  <p className="text-xs text-gray-500">All instructors</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Present Today</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{summaryStats.presentToday}</div>
                  <p className="text-xs text-gray-500">{summaryStats.attendanceRate}% attendance rate</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">On Leave</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{summaryStats.onLeave}</div>
                  <p className="text-xs text-gray-500">Planned absences</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Absent</CardTitle>
                  <UserX className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{summaryStats.absent}</div>
                  <p className="text-xs text-gray-500">Unplanned absences</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attendance by School */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Attendance by School
                  </CardTitle>
                  <CardDescription className="text-center">Current month attendance breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={processedAttendanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="school" 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="present" fill="#10b981" name="Present" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[2, 2, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Attendance Trend */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Monthly Attendance Trend
                  </CardTitle>
                  <CardDescription className="text-center">Attendance percentage over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsLineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <YAxis 
                        domain={[85, 100]}
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="attendance" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#3b82f6' }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Evaluation Tab */}
          <TabsContent value="evaluation" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Evaluations</CardTitle>
                  <ClipboardCheck className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{evaluations.length}</div>
                  <p className="text-xs text-gray-500">Completed this month</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
                  <Award className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {evaluations.length > 0 ? 
                      Math.round((evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluations.length) * 10) / 10 
                      : 0
                    }
                  </div>
                  <p className="text-xs text-gray-500">Out of 100 points</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Excellence Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {evaluations.length > 0 ? 
                      Math.round((evaluations.filter(evaluation => evaluation.score >= 90).length / evaluations.length) * 100)
                      : 0
                    }%
                  </div>
                  <p className="text-xs text-gray-500">Scores ≥ 90 points</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Evaluation Scores by School
                  </CardTitle>
                  <CardDescription className="text-center">Quarterly performance percentages</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={processedEvaluationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="quarter" 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="percentage" fill="#3b82f6" name="Performance %" radius={[2, 2, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Monthly Evaluation Trend
                  </CardTitle>
                  <CardDescription>Evaluation scores over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsLineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <YAxis 
                        domain={[80, 95]}
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="evaluation" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#8b5cf6' }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Tests</CardTitle>
                  <FileText className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{testScores.length}</div>
                  <p className="text-xs text-gray-500">Administered this month</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
                  <Target className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {testScores.length > 0 ? 
                      Math.round((testScores.reduce((sum, test) => sum + test.score, 0) / testScores.length) * 10) / 10 
                      : 0
                    }
                  </div>
                  <p className="text-xs text-gray-500">Out of 100 points</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Passing Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {testScores.length > 0 ? 
                      Math.round((testScores.filter(test => test.score >= 80).length / testScores.length) * 100)
                      : 0
                    }%
                  </div>
                  <p className="text-xs text-gray-500">Scores ≥ 80 points</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Performance by School
                  </CardTitle>
                  <CardDescription>Average test scores by school</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={processedPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="school" 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="averageScore" fill="#f59e0b" name="Average Score" radius={[2, 2, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Monthly Performance Trend
                  </CardTitle>
                  <CardDescription>Performance scores over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsLineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <YAxis 
                        domain={[80, 95]}
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="performance" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#f59e0b' }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary and Recommendations */}
        <div className="mt-6 space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5" />
              Summary & Recommendations
            </h3>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-blue-900 mb-2">Current Status</h4>
            <p className="text-sm text-blue-800 leading-relaxed">• {summary}</p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Recommendations</h4>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <p 
                  key={index}
                  className={`text-sm leading-relaxed ${
                    rec.type === 'success' ? 'text-green-800' :
                    rec.type === 'warning' ? 'text-yellow-800' :
                    'text-red-800'
                  }`}
                >
                  • {rec.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsEnhanced;