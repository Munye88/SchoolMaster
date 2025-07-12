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

  // Process attendance data filtered by selected month
  const processedAttendanceData = useMemo(() => {
    if (!schools.length || !instructors.length) return [];
    
    const schoolMap = schools.reduce((acc, school) => {
      acc[school.id] = school.name;
      return acc;
    }, {});

    // Create instructor to school mapping
    const instructorSchoolMap = instructors.reduce((acc, instructor) => {
      acc[instructor.id] = instructor.schoolId;
      return acc;
    }, {});

    // Initialize stats for all schools
    const schoolStats = {};
    schools.forEach(school => {
      schoolStats[school.name] = { present: 0, absent: 0, late: 0, total: 0 };
    });
    
    // Filter attendance data by selected month and year
    const filteredAttendanceData = attendanceData.filter(record => {
      const recordDate = new Date(record.date);
      const recordMonth = recordDate.toLocaleString('default', { month: 'long' });
      const recordYear = recordDate.getFullYear();
      return recordMonth === currentMonth && recordYear === currentYear;
    });
    
    // Process filtered attendance data
    filteredAttendanceData.forEach(record => {
      const instructorSchoolId = instructorSchoolMap[record.instructorId];
      const schoolName = schoolMap[instructorSchoolId] || 'Unknown';
      
      if (schoolStats[schoolName]) {
        schoolStats[schoolName].total++;
        if (record.status === 'present') {
          schoolStats[schoolName].present++;
        } else if (record.status === 'absent') {
          schoolStats[schoolName].absent++;
        } else if (record.status === 'late') {
          schoolStats[schoolName].late++;
        }
      }
    });

    const result = Object.entries(schoolStats).map(([school, stats]) => ({
      school,
      ...stats,
      attendance: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
    }));

    console.log('Attendance processing debug:', {
      selectedMonth: currentMonth,
      selectedYear: currentYear,
      schools: schools.map(s => s.name),
      totalAttendanceRecords: attendanceData.length,
      filteredAttendanceRecords: filteredAttendanceData.length,
      instructorCount: instructors.length,
      processedData: result
    });

    return result;
  }, [attendanceData, schools, instructors, currentMonth, currentYear]);

  // Process leave data for monthly tracking
  const processedLeaveData = useMemo(() => {
    if (!staffLeave.length || !schools.length) return [];
    
    const schoolMap = schools.reduce((acc, school) => {
      acc[school.id] = school.name;
      return acc;
    }, {});

    const currentYear = new Date().getFullYear();
    const monthlyData = months.map((month, index) => {
      const monthIndex = index + 1;
      
      // Filter leave for this month
      const monthLeave = staffLeave.filter(leave => {
        const leaveDate = new Date(leave.startDate);
        return leaveDate.getFullYear() === currentYear && 
               leaveDate.getMonth() === index;
      });
      
      const ptoCount = monthLeave.filter(leave => leave.leaveType === 'PTO').length;
      const rrCount = monthLeave.filter(leave => leave.leaveType === 'R&R').length;
      const sickCount = monthLeave.filter(leave => leave.leaveType === 'Sick').length;
      
      return {
        month,
        PTO: ptoCount,
        'R&R': rrCount,
        Sick: sickCount,
        total: ptoCount + rrCount + sickCount
      };
    });

    return monthlyData;
  }, [staffLeave, schools]);

  // Process evaluation data filtered by selected month
  const processedEvaluationData = useMemo(() => {
    if (!evaluations.length || !schools.length) return [];
    
    const schoolMap = schools.reduce((acc, school) => {
      acc[school.id] = school.name;
      return acc;
    }, {});
    
    // Filter evaluations by selected month and year
    const filteredEvaluations = evaluations.filter(evaluation => {
      const evalDate = new Date(evaluation.evaluationDate);
      const evalMonth = evalDate.toLocaleString('default', { month: 'long' });
      const evalYear = evalDate.getFullYear();
      return evalMonth === currentMonth && evalYear === currentYear;
    });
    
    if (filteredEvaluations.length === 0) {
      return schools.map(school => ({
        school: school.name,
        evaluations: 0,
        average: 0,
        passingRate: 0
      }));
    }
    
    // Calculate by school for selected month
    const schoolData = schools.map(school => {
      const schoolEvals = filteredEvaluations.filter(evaluation => evaluation.schoolId === school.id);
      
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

    return schoolData;
  }, [evaluations, schools, currentMonth, currentYear]);

  // Process performance data filtered by selected month
  const processedPerformanceData = useMemo(() => {
    if (!testScores.length || !schools.length) return [];
    
    const schoolMap = schools.reduce((acc, school) => {
      acc[school.id] = school.name;
      return acc;
    }, {});
    
    // Filter test scores by selected month and year
    const filteredTestScores = testScores.filter(test => {
      const testDate = new Date(test.testDate);
      const testMonth = testDate.toLocaleString('default', { month: 'long' });
      const testYear = testDate.getFullYear();
      return testMonth === currentMonth && testYear === currentYear;
    });
    
    return schools.map(school => {
      const schoolTests = filteredTestScores.filter(test => test.schoolId === school.id);
      
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
  }, [testScores, schools, currentMonth, currentYear]);

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

  // Generate monthly trend data from actual data
  const monthlyTrendData = useMemo(() => {
    return months.map((month, index) => {
      // Calculate attendance rate for this month
      const monthAttendance = attendanceData.filter(record => {
        const recordDate = new Date(record.date);
        const recordMonth = recordDate.toLocaleString('default', { month: 'long' });
        const recordYear = recordDate.getFullYear();
        return recordMonth === month && recordYear === currentYear;
      });
      
      const presentCount = monthAttendance.filter(record => record.status === 'present').length;
      const attendanceRate = monthAttendance.length > 0 ? Math.round((presentCount / monthAttendance.length) * 100) : 0;
      
      // Calculate evaluation average for this month
      const monthEvaluations = evaluations.filter(evaluation => {
        const evalDate = new Date(evaluation.evaluationDate);
        const evalMonth = evalDate.toLocaleString('default', { month: 'long' });
        const evalYear = evalDate.getFullYear();
        return evalMonth === month && evalYear === currentYear;
      });
      
      const evaluationAverage = monthEvaluations.length > 0 ? 
        Math.round(monthEvaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / monthEvaluations.length) : 0;
      
      // Calculate test performance for this month
      const monthTests = testScores.filter(test => {
        const testDate = new Date(test.testDate);
        const testMonth = testDate.toLocaleString('default', { month: 'long' });
        const testYear = testDate.getFullYear();
        return testMonth === month && testYear === currentYear;
      });
      
      const testAverage = monthTests.length > 0 ? 
        Math.round(monthTests.reduce((sum, test) => sum + test.score, 0) / monthTests.length) : 0;
      
      return {
        month: month.slice(0, 3),
        attendance: attendanceRate,
        evaluation: evaluationAverage,
        performance: testAverage
      };
    });
  }, [attendanceData, evaluations, testScores, currentYear, months]);

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
                    <RechartsBarChart data={processedLeaveData}>
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
                          {processedLeaveData.reduce((sum, month) => sum + month.PTO, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total PTO</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {processedLeaveData.reduce((sum, month) => sum + month['R&R'], 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total R&R</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {processedLeaveData.reduce((sum, month) => sum + month.Sick, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Sick</div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="text-center">
                        <div className="text-xl font-semibold text-gray-900">
                          {processedLeaveData.reduce((sum, month) => sum + month.total, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Leave Requests</div>
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
                    {evaluations.length > 0 ? 
                      Math.round((evaluations.filter(evaluation => evaluation.score >= 85).length / evaluations.length) * 100)
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
                          { name: 'Excellent (90-100)', value: evaluations.filter(e => e.score >= 90).length, fill: '#22c55e' },
                          { name: 'Good (85-89)', value: evaluations.filter(e => e.score >= 85 && e.score < 90).length, fill: '#3b82f6' },
                          { name: 'Below Passing (80-84)', value: evaluations.filter(e => e.score >= 80 && e.score < 85).length, fill: '#f59e0b' },
                          { name: 'Needs Improvement (<80)', value: evaluations.filter(e => e.score < 80).length, fill: '#ef4444' }
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
                        average: testScores.filter(test => test.testType === 'ALCPT').length > 0 ? 
                          Math.round((testScores.filter(test => test.testType === 'ALCPT').reduce((sum, test) => sum + test.score, 0) / 
                          testScores.filter(test => test.testType === 'ALCPT').length) * 10) / 10 : 0,
                        fill: '#3b82f6'
                      },
                      {
                        testType: 'Book Test',
                        average: testScores.filter(test => test.testType === 'Book').length > 0 ? 
                          Math.round((testScores.filter(test => test.testType === 'Book').reduce((sum, test) => sum + test.score, 0) / 
                          testScores.filter(test => test.testType === 'Book').length) * 10) / 10 : 0,
                        fill: '#22c55e'
                      },
                      {
                        testType: 'ECL',
                        average: testScores.filter(test => test.testType === 'ECL').length > 0 ? 
                          Math.round((testScores.filter(test => test.testType === 'ECL').reduce((sum, test) => sum + test.score, 0) / 
                          testScores.filter(test => test.testType === 'ECL').length) * 10) / 10 : 0,
                        fill: '#f59e0b'
                      },
                      {
                        testType: 'OPI',
                        average: testScores.filter(test => test.testType === 'OPI').length > 0 ? 
                          Math.round((testScores.filter(test => test.testType === 'OPI').reduce((sum, test) => sum + test.score, 0) / 
                          testScores.filter(test => test.testType === 'OPI').length) * 10) / 10 : 0,
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