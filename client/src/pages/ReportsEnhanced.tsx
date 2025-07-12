import React, { useState, useMemo, useCallback } from "react";
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
  PieChart,
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
    "June", "July", "August", "September", "October", "November",
    "December", "January", "February", "March", "April", "May"
  ];

  // Pre-process attendance data by month for better performance
  const attendanceByMonth = useMemo(() => {
    if (!schools.length || !instructors.length || !attendanceData.length) return {};
    
    const schoolMap = schools.reduce((acc, school) => {
      acc[school.id] = school.name;
      return acc;
    }, {});

    const instructorSchoolMap = instructors.reduce((acc, instructor) => {
      acc[instructor.id] = instructor.schoolId;
      return acc;
    }, {});

    const monthlyData = {};
    
    attendanceData.forEach(record => {
      const recordDate = new Date(record.date);
      const recordMonth = recordDate.toLocaleString('default', { month: 'long' });
      const recordYear = recordDate.getFullYear();
      const monthKey = `${recordMonth}-${recordYear}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {};
        schools.forEach(school => {
          monthlyData[monthKey][school.name] = { present: 0, absent: 0, late: 0, total: 0 };
        });
      }
      
      const instructorSchoolId = instructorSchoolMap[record.instructorId];
      const schoolName = schoolMap[instructorSchoolId] || 'Unknown';
      
      if (monthlyData[monthKey][schoolName]) {
        monthlyData[monthKey][schoolName].total++;
        if (record.status === 'present') {
          monthlyData[monthKey][schoolName].present++;
        } else if (record.status === 'absent') {
          monthlyData[monthKey][schoolName].absent++;
        } else if (record.status === 'late') {
          monthlyData[monthKey][schoolName].late++;
        }
      }
    });

    return monthlyData;
  }, [attendanceData, schools, instructors]);

  // Get processed attendance data for current month
  const processedAttendanceData = useMemo(() => {
    const monthKey = `${currentMonth}-${currentYear}`;
    const monthData = attendanceByMonth[monthKey] || {};
    
    return Object.entries(monthData).map(([school, stats]) => ({
      school,
      ...stats,
      attendance: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
    }));
  }, [attendanceByMonth, currentMonth, currentYear]);

  // Pre-process leave data by month for better performance
  const leaveByMonth = useMemo(() => {
    if (!staffLeave.length) return {};
    
    const monthlyData = {};
    
    staffLeave.forEach(leave => {
      const leaveDate = new Date(leave.startDate);
      const leaveMonth = leaveDate.toLocaleString('default', { month: 'long' });
      const leaveYear = leaveDate.getFullYear();
      const monthKey = `${leaveMonth}-${leaveYear}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          PTO: 0,
          'R&R': 0,
          Sick: 0
        };
      }
      
      if (leave.leaveType === 'PTO') {
        monthlyData[monthKey].PTO++;
      } else if (leave.leaveType === 'R&R') {
        monthlyData[monthKey]['R&R']++;
      } else if (leave.leaveType === 'Sick') {
        monthlyData[monthKey].Sick++;
      }
    });

    return monthlyData;
  }, [staffLeave]);

  // Get processed leave data for current month
  const processedLeaveData = useMemo(() => {
    const monthKey = `${currentMonth}-${currentYear}`;
    const monthData = leaveByMonth[monthKey] || { PTO: 0, 'R&R': 0, Sick: 0 };
    
    return [
      { type: 'PTO', count: monthData.PTO },
      { type: 'R&R', count: monthData['R&R'] },
      { type: 'Sick', count: monthData.Sick }
    ];
  }, [leaveByMonth, currentMonth, currentYear]);

  // Pre-process evaluation data by month for better performance
  const evaluationsByMonth = useMemo(() => {
    if (!evaluations.length || !schools.length) return {};
    
    const monthlyData = {};
    
    evaluations.forEach(evaluation => {
      const evalDate = new Date(evaluation.evaluationDate);
      const evalMonth = evalDate.toLocaleString('default', { month: 'long' });
      const evalYear = evalDate.getFullYear();
      const monthKey = `${evalMonth}-${evalYear}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {};
        schools.forEach(school => {
          monthlyData[monthKey][school.id] = [];
        });
      }
      
      if (!monthlyData[monthKey][evaluation.schoolId]) {
        monthlyData[monthKey][evaluation.schoolId] = [];
      }
      
      monthlyData[monthKey][evaluation.schoolId].push(evaluation);
    });

    return monthlyData;
  }, [evaluations, schools]);

  // Get current month evaluations for statistics
  const currentMonthEvaluations = useMemo(() => {
    const monthKey = `${currentMonth}-${currentYear}`;
    const monthData = evaluationsByMonth[monthKey] || {};
    
    return Object.values(monthData).flat();
  }, [evaluationsByMonth, currentMonth, currentYear]);



  // Get processed evaluation data for current month
  const processedEvaluationData = useMemo(() => {
    const monthKey = `${currentMonth}-${currentYear}`;
    const monthData = evaluationsByMonth[monthKey] || {};
    
    return schools.map(school => {
      const schoolEvals = monthData[school.id] || [];
      
      if (schoolEvals.length === 0) {
        return {
          school: school.name,
          evaluations: 0,
          average: 0,
          passingRate: 0
        };
      }
      
      const totalScore = schoolEvals.reduce((sum, evaluation) => sum + evaluation.score, 0);
      const average = Math.round(totalScore / schoolEvals.length);
      const passingEvals = schoolEvals.filter(evaluation => evaluation.score >= 85);
      const passingRate = Math.round((passingEvals.length / schoolEvals.length) * 100);
      
      return {
        school: school.name,
        evaluations: schoolEvals.length,
        average,
        passingRate
      };
    });
  }, [evaluationsByMonth, schools, currentMonth, currentYear]);

  // Pre-process test scores by month for better performance
  const testScoresByMonth = useMemo(() => {
    if (!testScores.length || !schools.length) return {};
    
    const monthlyData = {};
    
    testScores.forEach(test => {
      const testDate = new Date(test.testDate);
      const testMonth = testDate.toLocaleString('default', { month: 'long' });
      const testYear = testDate.getFullYear();
      const monthKey = `${testMonth}-${testYear}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {};
        schools.forEach(school => {
          monthlyData[monthKey][school.id] = [];
        });
      }
      
      if (!monthlyData[monthKey][test.schoolId]) {
        monthlyData[monthKey][test.schoolId] = [];
      }
      
      monthlyData[monthKey][test.schoolId].push(test);
    });

    return monthlyData;
  }, [testScores, schools]);

  // Get current month test scores for statistics
  const currentMonthTestScores = useMemo(() => {
    const monthKey = `${currentMonth}-${currentYear}`;
    const monthData = testScoresByMonth[monthKey] || {};
    
    return Object.values(monthData).flat();
  }, [testScoresByMonth, currentMonth, currentYear]);

  // Get processed performance data for current month
  const processedPerformanceData = useMemo(() => {
    const monthKey = `${currentMonth}-${currentYear}`;
    const monthData = testScoresByMonth[monthKey] || {};
    
    return schools.map(school => {
      const schoolTests = monthData[school.id] || [];
      
      // Define test types for each school based on requirements
      const testTypes = school.name === 'KFNA' ? ['ALCPT', 'Book'] :
                       school.name === 'NFS West' ? ['ALCPT', 'Book', 'ECL'] :
                       ['ALCPT', 'Book', 'ECL', 'OPI']; // NFS East gets all types
      
      const result = { school: school.name };
      
      testTypes.forEach(testType => {
        const typeTests = schoolTests.filter(test => test.testType === testType);
        let passingRate = 0;
        
        if (typeTests.length > 0) {
          const passingTests = typeTests.filter(test => {
            if (testType === 'Book') return test.score >= 66;
            if (testType === 'ALCPT' || testType === 'ECL') return test.score >= 50;
            if (testType === 'OPI') return test.score >= 2;
            return false;
          });
          passingRate = Math.round((passingTests.length / typeTests.length) * 100);
        }
        
        result[testType] = passingRate;
      });
      
      return result;
    });
  }, [testScoresByMonth, schools, currentMonth, currentYear]);

  // Calculate summary statistics for selected month
  const summaryStats = useMemo(() => {
    const totalInstructors = instructors.length;
    const presentForMonth = processedAttendanceData.reduce((sum, school) => sum + school.present, 0);
    
    // Filter leave data for selected month
    const monthlyLeave = staffLeave.filter(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const selectedMonthStart = new Date(currentYear, months.indexOf(currentMonth), 1);
      const selectedMonthEnd = new Date(currentYear, months.indexOf(currentMonth) + 1, 0);
      
      return (startDate <= selectedMonthEnd && endDate >= selectedMonthStart);
    });
    
    const absent = processedAttendanceData.reduce((sum, school) => sum + school.absent, 0);
    const totalAttendanceRecords = processedAttendanceData.reduce((sum, school) => sum + school.total, 0);
    
    return {
      totalInstructors,
      presentForMonth,
      onLeave: monthlyLeave.length,
      absent,
      attendanceRate: totalAttendanceRecords > 0 ? Math.round((presentForMonth / totalAttendanceRecords) * 100) : 0,
      totalAttendanceRecords
    };
  }, [instructors, processedAttendanceData, staffLeave, currentMonth, currentYear, months]);

  // Generate monthly trend data from pre-processed data
  const monthlyTrendData = useMemo(() => {
    return months.map((month, index) => {
      const monthKey = `${month}-${currentYear}`;
      
      // Get attendance rate for this month
      const monthAttendanceData = attendanceByMonth[monthKey] || {};
      let totalPresent = 0;
      let totalRecords = 0;
      
      Object.values(monthAttendanceData).forEach(schoolData => {
        totalPresent += schoolData.present;
        totalRecords += schoolData.total;
      });
      
      const attendanceRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
      
      // Get evaluation average for this month
      const monthEvaluationData = evaluationsByMonth[monthKey] || {};
      const allEvaluations = Object.values(monthEvaluationData).flat();
      const evaluationAverage = allEvaluations.length > 0 ? 
        Math.round(allEvaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / allEvaluations.length) : 0;
      
      // Get test performance for this month
      const monthTestData = testScoresByMonth[monthKey] || {};
      const allTests = Object.values(monthTestData).flat();
      const testAverage = allTests.length > 0 ? 
        Math.round(allTests.reduce((sum, test) => sum + test.score, 0) / allTests.length) : 0;
      
      return {
        month: month.slice(0, 3),
        attendance: attendanceRate,
        evaluation: evaluationAverage,
        performance: testAverage
      };
    });
  }, [attendanceByMonth, evaluationsByMonth, testScoresByMonth, currentYear, months]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
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
  }, [currentMonth, currentYear, months]);

  const generateSummaryAndRecommendations = () => {
    const { attendanceRate, totalInstructors, presentForMonth, onLeave, absent } = summaryStats;
    
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
        summary: `Current attendance rate of ${attendanceRate}% with ${presentForMonth} out of ${totalInstructors} instructors present. ${onLeave} instructors are on planned leave and ${absent} are absent.`,
        recommendations
      };
    }
    
    if (activeTab === 'evaluation') {
      const recommendations = [];
      const totalEvaluations = evaluations.length;
      const averageScore = totalEvaluations > 0 ? 
        Math.round((evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / totalEvaluations) * 10) / 10 : 0;
      const excellentCount = evaluations.filter(evaluation => evaluation.score >= 85).length;
      const excellenceRate = totalEvaluations > 0 ? Math.round((excellentCount / totalEvaluations) * 100) : 0;
      
      if (averageScore < 85) {
        recommendations.push({
          type: 'alert',
          text: 'Average evaluation score is below passing threshold (85). Consider additional training and support programs.'
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
        summary: `${totalEvaluations} evaluations completed with an average score of ${averageScore} out of 100 points. ${excellentCount} instructors (${excellenceRate}%) achieved excellence rating (≥90 points).`,
        recommendations
      };
    }
    
    if (activeTab === 'performance') {
      const recommendations = [];
      const totalTests = testScores.length;
      const averageScore = totalTests > 0 ? 
        Math.round((testScores.reduce((sum, test) => sum + test.score, 0) / totalTests) * 10) / 10 : 0;
      
      // Calculate passing count based on test-specific thresholds
      const passingCount = testScores.filter(test => {
        if (test.testType === 'Book') return test.score >= 66;
        if (test.testType === 'ALCPT' || test.testType === 'ECL') return test.score >= 50;
        if (test.testType === 'OPI') return test.score >= 2;
        return false;
      }).length;
      
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
        summary: `${totalTests} tests administered with an average score of ${averageScore} out of 100 points. ${passingCount} students (${passingRate}%) achieved passing grade.`,
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
                  <CardDescription className="text-center">Current month attendance percentages</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={processedAttendanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="school" 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickFormatter={(value, index) => {
                          const schoolData = processedAttendanceData[index];
                          return `${value} (${schoolData?.attendance || 0}%)`;
                        }}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value, name, props) => {
                          if (name === 'Attendance Rate') {
                            return [`${value}%`, 'Attendance Rate'];
                          }
                          return [value, name];
                        }}
                      />
                      <Bar dataKey="attendance" fill="#10b981" name="Attendance Rate" radius={[2, 2, 0, 0]} />
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

            {/* Leave Tracking Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Staff Leave Trends */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Staff Leave Trends
                  </CardTitle>
                  <CardDescription className="text-center">Monthly leave distribution by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={[{
                      month: currentMonth,
                      PTO: processedLeaveData.find(item => item.type === 'PTO')?.count || 0,
                      'R&R': processedLeaveData.find(item => item.type === 'R&R')?.count || 0,
                      Sick: processedLeaveData.find(item => item.type === 'Sick')?.count || 0
                    }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        angle={-45}
                        textAnchor="end"
                        height={70}
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
                        formatter={(value, name) => [`${value} staff`, name]}
                      />
                      <Bar dataKey="PTO" fill="#3b82f6" name="PTO" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="R&R" fill="#10b981" name="R&R" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Sick" fill="#ef4444" name="Sick" radius={[2, 2, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Leave Summary Stats */}
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Leave Summary
                  </CardTitle>
                  <CardDescription className="text-center">Current year leave statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {processedLeaveData.find(item => item.type === 'PTO')?.count || 0}
                        </div>
                        <div className="text-sm text-gray-600">PTO This Month</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {processedLeaveData.find(item => item.type === 'R&R')?.count || 0}
                        </div>
                        <div className="text-sm text-gray-600">R&R This Month</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {processedLeaveData.find(item => item.type === 'Sick')?.count || 0}
                        </div>
                        <div className="text-sm text-gray-600">Sick This Month</div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="text-center">
                        <div className="text-xl font-semibold text-gray-900">
                          {processedLeaveData.reduce((sum, item) => sum + item.count, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Leave This Month</div>
                      </div>
                    </div>
                  </div>
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
                  <div className="text-2xl font-bold text-gray-900">{currentMonthEvaluations.length}</div>
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
                    {currentMonthEvaluations.length > 0 ? 
                      Math.round((currentMonthEvaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / currentMonthEvaluations.length) * 10) / 10 
                      : 0
                    }%
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
                    {currentMonthEvaluations.length > 0 ? 
                      Math.round((currentMonthEvaluations.filter(evaluation => evaluation.score >= 85).length / currentMonthEvaluations.length) * 100)
                      : 0
                    }%
                  </div>
                  <p className="text-xs text-gray-500">Scores ≥ 85 points (passing)</p>
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
                  <CardDescription className="text-center">Quarterly performance by school with combined average</CardDescription>
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
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        content={({ payload }) => (
                          <div className="flex justify-center gap-4 flex-wrap">
                            {payload?.map((entry, index) => (
                              <div key={index} className="flex items-center gap-1">
                                <div 
                                  className="w-3 h-3 rounded-none" 
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm text-gray-600">{entry.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      />
                      <Bar dataKey="KFNA" fill="#E4424D" name="KFNA" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="NFS East" fill="#22A783" name="NFS East" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="NFS West" fill="#6247AA" name="NFS West" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Average" fill="#3b82f6" name="Combined Average" radius={[2, 2, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Performance Distribution
                  </CardTitle>
                  <CardDescription className="text-center">Evaluation scores by performance level</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Excellent (90-100)', value: currentMonthEvaluations.filter(e => e.score >= 90).length, fill: '#22c55e' },
                          { name: 'Good (85-89)', value: currentMonthEvaluations.filter(e => e.score >= 85 && e.score < 90).length, fill: '#3b82f6' },
                          { name: 'Below Passing (80-84)', value: currentMonthEvaluations.filter(e => e.score >= 80 && e.score < 85).length, fill: '#f59e0b' },
                          { name: 'Needs Improvement (<80)', value: currentMonthEvaluations.filter(e => e.score < 80).length, fill: '#ef4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                    </RechartsPieChart>
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
                  <div className="text-2xl font-bold text-gray-900">{currentMonthTestScores.length}</div>
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
                    {currentMonthTestScores.length > 0 ? 
                      Math.round((currentMonthTestScores.reduce((sum, test) => sum + test.score, 0) / currentMonthTestScores.length) * 10) / 10 
                      : 0
                    }%
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
                    {currentMonthTestScores.length > 0 ? 
                      Math.round((currentMonthTestScores.filter(test => test.score >= 80).length / currentMonthTestScores.length) * 100)
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
                  <CardTitle className="flex items-center justify-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Performance by School
                  </CardTitle>
                  <CardDescription className="text-center">Test type percentages by school</CardDescription>
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
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        label={{ value: 'Pass Rate (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        content={({ payload }) => (
                          <div className="flex justify-center gap-4 flex-wrap">
                            {payload?.map((entry, index) => (
                              <div key={index} className="flex items-center gap-1">
                                <div 
                                  className="w-3 h-3 rounded-none" 
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm text-gray-600">{entry.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      />
                      <Bar dataKey="ALCPT" fill="#3b82f6" name="ALCPT" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Book" fill="#22c55e" name="Book Test" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="ECL" fill="#f59e0b" name="ECL" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="OPI" fill="#ef4444" name="OPI" radius={[2, 2, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Test Averages by Type
                  </CardTitle>
                  <CardDescription className="text-center">Average scores for each test type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart data={[
                      {
                        testType: 'ALCPT',
                        average: currentMonthTestScores.filter(test => test.testType === 'ALCPT').length > 0 ? 
                          Math.round((currentMonthTestScores.filter(test => test.testType === 'ALCPT').reduce((sum, test) => sum + test.score, 0) / 
                          currentMonthTestScores.filter(test => test.testType === 'ALCPT').length) * 10) / 10 : 0,
                        fill: '#3b82f6'
                      },
                      {
                        testType: 'Book Test',
                        average: currentMonthTestScores.filter(test => test.testType === 'Book').length > 0 ? 
                          Math.round((currentMonthTestScores.filter(test => test.testType === 'Book').reduce((sum, test) => sum + test.score, 0) / 
                          currentMonthTestScores.filter(test => test.testType === 'Book').length) * 10) / 10 : 0,
                        fill: '#22c55e'
                      },
                      {
                        testType: 'ECL',
                        average: currentMonthTestScores.filter(test => test.testType === 'ECL').length > 0 ? 
                          Math.round((currentMonthTestScores.filter(test => test.testType === 'ECL').reduce((sum, test) => sum + test.score, 0) / 
                          currentMonthTestScores.filter(test => test.testType === 'ECL').length) * 10) / 10 : 0,
                        fill: '#f59e0b'
                      },
                      {
                        testType: 'OPI',
                        average: currentMonthTestScores.filter(test => test.testType === 'OPI').length > 0 ? 
                          Math.round((currentMonthTestScores.filter(test => test.testType === 'OPI').reduce((sum, test) => sum + test.score, 0) / 
                          currentMonthTestScores.filter(test => test.testType === 'OPI').length) * 10) / 10 : 0,
                        fill: '#ef4444'
                      }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="testType" 
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        label={{ value: 'Average Score', angle: -90, position: 'insideLeft' }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value, name, props) => [
                          `${value}% out of 100 points`, 
                          `${props.payload.testType} Average Score`
                        ]}
                      />
                      <Bar 
                        dataKey="average" 
                        radius={[4, 4, 0, 0]}
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#22c55e" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Bar>
                    </RechartsBarChart>
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