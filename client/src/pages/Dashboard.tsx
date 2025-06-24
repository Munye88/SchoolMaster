import { useState, useEffect } from "react";
import { 
  GraduationCap, BookOpen, Users, Clock, Calendar, Check, X, ChevronRight,
  User, UserCheck, Building, Activity, BarChart2, Trash2, Plus, UserPlus, Loader2,
  FileText, School, UserCircle
} from "lucide-react";
import type { Course, Instructor, Student, TestResult, StaffAttendance, StaffLeave, Evaluation, Event } from "@shared/schema";
import { schools } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSchool } from "@/hooks/useSchool";
import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/dashboard/Calendar";
import Notifications from "@/components/dashboard/Notifications";
import StaticNotifications from "@/components/dashboard/StaticNotifications";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import QuickLinks from "@/components/dashboard/QuickLinks";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip, Cell } from 'recharts';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { getCourseStatus, calculateCourseProgress } from "@/utils/courseStatusHelpers";
// Logo moved to the navbar, no longer needed here

const Dashboard = () => {
  const { selectedSchool } = useSchool();
  
  // State for to-do list
  const [tasks, setTasks] = useState<{id: number; text: string; done: boolean}[]>(() => {
    const savedTasks = localStorage.getItem('dashboard_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      { id: 1, text: 'Submit staff evaluations', done: false },
      { id: 2, text: 'Review test scores', done: true },
      { id: 3, text: 'Order new books for KFNA', done: false },
    ];
  });
  const [newTask, setNewTask] = useState('');
  
  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // HARDCODED STATISTICS
  // This ensures the dashboard always shows the expected values
  // Static values set based on requirements: 112 students, 65 instructors, 3 schools, 5 courses, 3 active courses
  // Dynamic statistics calculation based on real-time data
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Fetch all required data but use the static values for rendering
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: selectedSchool 
      ? ['/api/schools', selectedSchool.id, 'courses'] 
      : ['/api/courses'],
    enabled: !selectedSchool || !!selectedSchool.id,
  });
  
  const { data: instructors = [] } = useQuery<Instructor[]>({
    queryKey: selectedSchool 
      ? ['/api/schools', selectedSchool.id, 'instructors'] 
      : ['/api/instructors'],
    enabled: !selectedSchool || !!selectedSchool.id,
  });

  const { data: schools = [] } = useQuery<any[]>({
    queryKey: ['/api/schools'],
  });
  
  const { data: students = [], isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: selectedSchool 
      ? ['/api/schools', selectedSchool.id, 'students'] 
      : ['/api/students'],
    enabled: !selectedSchool || !!selectedSchool.id,
  });

  // Fetch other data as needed
  const { data: testResults = [] } = useQuery<TestResult[]>({
    queryKey: ['/api/test-results'],
  });
  
  const { data: staffAttendance = [] } = useQuery<StaffAttendance[]>({
    queryKey: ['/api/staff-attendance'],
  });
  
  const { data: staffLeave = [] } = useQuery<StaffLeave[]>({
    queryKey: ['/api/staff-leave'],
  });
  
  const { data: evaluations = [] } = useQuery<Evaluation[]>({
    queryKey: ['/api/evaluations'],
  });
  
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });
  
  // Use our specialized hook for dashboard statistics
  const dashboardStats = useDashboardStats();
  
  // Set up statistics object using our hook data
  const statistics = {
    totalStudents: dashboardStats.studentCounts.totalStudents,
    activeInstructors: dashboardStats.instructorCount,
    totalSchools: dashboardStats.schoolCount,
    totalCourses: dashboardStats.totalCourses,
    activeCourses: dashboardStats.activeCourses,
    completedCourses: dashboardStats.completedCourses,
    // Student counts by school
    studentsBySchool: {
      knfa: dashboardStats.studentCounts.knfa,
      nfsEast: dashboardStats.studentCounts.nfsEast,
      nfsWest: dashboardStats.studentCounts.nfsWest
    }
  };

  // Debug logging for dashboard statistics
  console.log("Dashboard Statistics:", {
    totalStudents: statistics.totalStudents,
    studentsBySchool: statistics.studentsBySchool,
    dashboardStatsRaw: dashboardStats.studentCounts
  });

  // Create nationality data for charts from our hook data
  const nationalityData = [
    { 
      name: 'American', 
      value: dashboardStats.nationalityCounts.american, 
      color: '#4299E1' 
    },
    { 
      name: 'British', 
      value: dashboardStats.nationalityCounts.british, 
      color: '#48BB78' 
    },
    { 
      name: 'Canadian', 
      value: dashboardStats.nationalityCounts.canadian, 
      color: '#F6AD55' 
    }
  ];
  
  // Log when component mounts/unmounts for debugging
  useEffect(() => {
    console.log("Dashboard mounted or updated with dynamic statistics");
    
    // Debug the actual values being used in the chart
    console.log("CHART DATA VALUES:")
    console.log("KFNA Instructors:", instructors.filter(i => i.schoolId === schools.find(s => s.code === 'KFNA')?.id).length);
    console.log("NFS East Instructors:", instructors.filter(i => i.schoolId === schools.find(s => s.code === 'NFS_EAST')?.id).length);
    console.log("NFS West Instructors:", instructors.filter(i => i.schoolId === schools.find(s => s.code === 'NFS_WEST')?.id).length);
    
    console.log("KFNA Courses:", courses.filter(c => c.schoolId === schools.find(s => s.code === 'KFNA')?.id && c.status !== 'Completed').length);
    console.log("NFS East Courses:", courses.filter(c => c.schoolId === schools.find(s => s.code === 'NFS_EAST')?.id && c.status !== 'Completed').length);
    console.log("NFS West Courses:", courses.filter(c => c.schoolId === schools.find(s => s.code === 'NFS_WEST')?.id && c.status !== 'Completed').length);
    
    console.log("KFNA Students:", statistics.studentsBySchool.knfa);
    console.log("NFS East Students:", statistics.studentsBySchool.nfsEast);
    console.log("NFS West Students:", statistics.studentsBySchool.nfsWest);
    
    return () => {
      console.log("Dashboard unmounted");
    };
  }, [instructors, courses, schools, statistics]);
  
  const formatDate = (date: Date | string) => {
    return format(new Date(date), "MMM dd, yyyy");
  };
  
  // Functions for to-do list
  
  const addTask = () => {
    if (newTask.trim() !== '') {
      const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
      setTasks([...tasks, { id: newId, text: newTask.trim(), done: false }]);
      setNewTask('');
    }
  };
  
  const toggleTaskDone = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };
  
  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto py-6 px-6 bg-gradient-to-b from-gray-50 to-white">
      {/* Dashboard Header with Staff Nationality Flags */}
      <div className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white mb-6 rounded-lg shadow-md overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-white/5 bg-[length:16px_16px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1),_transparent)]"></div>
        <div className="flex justify-between items-center px-6 py-4 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-1 h-8 bg-blue-400 rounded-full"></div>
            <div className="text-lg font-semibold">Staff Nationality Distribution</div>
            
            {/* Nationality Flags with Counts */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 via-white to-blue-500 flex items-center justify-center text-xs font-bold text-blue-800 shadow-md">
                  🇺🇸
                </div>
                <div className="text-center">
                  <div className="text-xs text-blue-200">American</div>
                  <div className="text-lg font-bold">{dashboardStats.nationalityCounts.american}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 via-white to-red-600 flex items-center justify-center text-xs font-bold text-blue-800 shadow-md">
                  🇬🇧
                </div>
                <div className="text-center">
                  <div className="text-xs text-blue-200">British</div>
                  <div className="text-lg font-bold">{dashboardStats.nationalityCounts.british}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 via-white to-red-500 flex items-center justify-center text-xs font-bold text-red-800 shadow-md">
                  🇨🇦
                </div>
                <div className="text-center">
                  <div className="text-xs text-blue-200">Canadian</div>
                  <div className="text-lg font-bold">{dashboardStats.nationalityCounts.canadian}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <div className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-lg flex items-center border border-white/20 shadow-inner">
              <Calendar className="h-4 w-4 mr-2 text-blue-300" /> 
              <span className="font-medium text-sm">{format(new Date(), "EEEE, MMMM dd, yyyy")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview - Simple Card Design matching screenshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        {/* Students Card */}
        <div className="bg-[#3B82F6] rounded-lg shadow-md text-white p-2 flex items-center">
          <div className="text-white mr-2">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{statistics.totalStudents}</div>
            <div className="uppercase text-xs mt-0">TOTAL STUDENTS</div>
          </div>
        </div>

        {/* Instructors Card */}
        <div className="bg-[#3BB99B] rounded-lg shadow-md text-white p-2 flex items-center">
          <div className="text-white mr-2">
            <UserCircle className="h-7 w-7" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{statistics.activeInstructors}</div>
            <div className="uppercase text-xs mt-0">INSTRUCTORS</div>
          </div>
        </div>

        {/* Schools Card */}
        <div className="bg-[#4DB6AC] rounded-lg shadow-md text-white p-2 flex items-center">
          <div className="text-white mr-2">
            <School className="h-7 w-7" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{statistics.totalSchools}</div>
            <div className="uppercase text-xs mt-0">SCHOOLS</div>
          </div>
        </div>

        {/* Courses Card - Double-width */}
        <div className="bg-[#F59E0B] rounded-lg shadow-md text-white p-2 flex items-center">
          <div className="text-white mr-2">
            <FileText className="h-7 w-7" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{statistics.totalCourses}</div>
            <div className="uppercase text-xs mt-0">COURSES</div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Courses */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-1">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-[#0A2463]">Active Courses</CardTitle>
                <Link href="/courses" className="text-blue-600 hover:underline text-sm font-medium">View All</Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 pb-5">
              <div className="grid grid-cols-1 gap-4">
                {/* Overview and Total - Green background from screenshot */}
                <div className="bg-[#399165] rounded-lg shadow-md p-2 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold uppercase tracking-wider">ACTIVE COURSES</h3>
                      <p className="text-3xl font-bold mt-0">{statistics.activeCourses}</p>
                    </div>
                    <div className="p-1">
                      <BookOpen className="w-7 w-7 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Course Cards - Dynamic from API data */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {courses
                    .filter(course => course.status === 'In Progress')
                    .slice(0, 6)
                    .map((course, index) => {
                      // Color schemes for variety
                      const colorSchemes = [
                        {
                          bg: 'bg-[#F2EFFA]',
                          dot: 'bg-[#8E7CB0]',
                          text: 'text-[#342355]',
                          icon: 'bg-purple-200',
                          iconColor: 'text-[#8E7CB0]',
                          progress: 'bg-purple-200',
                          progressBar: 'bg-[#8E7CB0]'
                        },
                        {
                          bg: 'bg-[#FDF4E7]',
                          dot: 'bg-[#D9843A]',
                          text: 'text-[#733F10]',
                          icon: 'bg-orange-200',
                          iconColor: 'text-[#D9843A]',
                          progress: 'bg-orange-200',
                          progressBar: 'bg-[#D9843A]'
                        },
                        {
                          bg: 'bg-[#F0F9F5]',
                          dot: 'bg-[#4D9E7A]',
                          text: 'text-[#194434]',
                          icon: 'bg-green-200',
                          iconColor: 'text-[#4D9E7A]',
                          progress: 'bg-green-200',
                          progressBar: 'bg-[#4D9E7A]'
                        },
                        {
                          bg: 'bg-[#E7F3FF]',
                          dot: 'bg-[#3B82F6]',
                          text: 'text-[#1E3A8A]',
                          icon: 'bg-blue-200',
                          iconColor: 'text-[#3B82F6]',
                          progress: 'bg-blue-200',
                          progressBar: 'bg-[#3B82F6]'
                        },
                        {
                          bg: 'bg-[#FEF2F2]',
                          dot: 'bg-[#EF4444]',
                          text: 'text-[#7F1D1D]',
                          icon: 'bg-red-200',
                          iconColor: 'text-[#EF4444]',
                          progress: 'bg-red-200',
                          progressBar: 'bg-[#EF4444]'
                        },
                        {
                          bg: 'bg-[#FFFBEB]',
                          dot: 'bg-[#F59E0B]',
                          text: 'text-[#78350F]',
                          icon: 'bg-yellow-200',
                          iconColor: 'text-[#F59E0B]',
                          progress: 'bg-yellow-200',
                          progressBar: 'bg-[#F59E0B]'
                        }
                      ];
                      
                      const scheme = colorSchemes[index % colorSchemes.length];
                      const schoolName = schools.find(s => s.id === course.schoolId)?.name || 'Unknown';
                      const instructor = instructors.find(i => i.id === course.instructorId);
                      
                      return (
                        <div key={course.id} className={`rounded-lg shadow-sm ${scheme.bg} p-3`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full ${scheme.dot} mr-1`}></div>
                              <span className={`text-base font-medium ${scheme.text}`}>{course.name}</span>
                            </div>
                            <div className={`w-8 h-8 rounded-full ${scheme.icon} flex items-center justify-center text-center text-xl`}>
                              <BookOpen className={`w-5 h-5 ${scheme.iconColor}`} />
                            </div>
                          </div>
                          <div className="mt-2 mb-2">
                            <span className={`text-3xl font-bold ${scheme.text}`}>{course.studentCount || 0}</span>
                            <span className={`text-base font-medium ${scheme.text} ml-2`}>Students</span>
                          </div>
                          <div className="text-xs mb-1">
                            <span className={`${scheme.text} opacity-75`}>{schoolName}</span>
                          </div>
                          <div>
                            <div className={`flex items-center justify-between text-sm ${scheme.text} mb-1`}>
                              <span>Progress</span>
                              <span>{course.progress || 0}%</span>
                            </div>
                            <div className={`w-full ${scheme.progress} rounded-full h-2.5 overflow-hidden`}>
                              <div 
                                className={`h-full ${scheme.progressBar} rounded-full`} 
                                style={{ width: `${course.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                  {/* Show message if no active courses */}
                  {courses.filter(course => course.status === 'In Progress').length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No active courses at the moment</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Nationality */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-lg text-[#0A2463]">Staff Nationality</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pb-5">
              <div className="grid grid-cols-1 gap-4">
                {/* Overview and Total - Blue background from screenshot */}
                <div className="bg-[#3046C5] rounded-lg shadow-md p-2 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold uppercase tracking-wider">TOTAL INSTRUCTORS</h3>
                      <p className="text-3xl font-bold mt-0">{statistics.activeInstructors}</p>
                    </div>
                    <div className="p-1 bg-[#4D5FC9] text-white rounded-lg">
                      <User className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Nationality Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* American */}
                  <div className="rounded-lg shadow-sm bg-[#EEF5FD] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-600 mr-1"></div>
                        <span className="text-base font-medium text-blue-900">American</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-center text-xl">
                        🇺🇸
                      </div>
                    </div>
                    <div className="mt-2 mb-2">
                      <span className="text-3xl font-bold text-blue-950">{dashboardStats.nationalityCounts.american}</span>
                      <span className="text-base font-medium text-blue-900 ml-2">Instructors</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm text-blue-800 mb-1">
                        <span>Distribution</span>
                        <span>{(dashboardStats.nationalityCounts.american/statistics.activeInstructors*100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full" 
                          style={{ width: `${(dashboardStats.nationalityCounts.american/statistics.activeInstructors*100).toFixed(1)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* British */}
                  <div className="rounded-lg shadow-sm bg-[#F0F9F5] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-600 mr-1"></div>
                        <span className="text-base font-medium text-green-800">British</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-center text-xl">
                        🇬🇧
                      </div>
                    </div>
                    <div className="mt-2 mb-2">
                      <span className="text-3xl font-bold text-green-900">{dashboardStats.nationalityCounts.british}</span>
                      <span className="text-base font-medium text-green-800 ml-2">Instructors</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm text-green-800 mb-1">
                        <span>Distribution</span>
                        <span>{(dashboardStats.nationalityCounts.british/statistics.activeInstructors*100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full bg-green-600 rounded-full" 
                          style={{ width: `${(dashboardStats.nationalityCounts.british/statistics.activeInstructors*100).toFixed(1)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Canadian */}
                  <div className="rounded-lg shadow-sm bg-[#F5F2FA] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-purple-600 mr-1"></div>
                        <span className="text-base font-medium text-purple-800">Canadian</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-center text-xl">
                        🇨🇦
                      </div>
                    </div>
                    <div className="mt-2 mb-2">
                      <span className="text-3xl font-bold text-purple-900">{dashboardStats.nationalityCounts.canadian}</span>
                      <span className="text-base font-medium text-purple-800 ml-2">Instructors</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm text-purple-800 mb-1">
                        <span>Distribution</span>
                        <span>{(dashboardStats.nationalityCounts.canadian/statistics.activeInstructors*100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 rounded-full" 
                          style={{ width: `${(dashboardStats.nationalityCounts.canadian/statistics.activeInstructors*100).toFixed(1)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Student Distribution */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-lg text-[#0A2463]">Distribution by School</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pb-5">
              <div className="grid grid-cols-1 gap-4">
                {/* Overview and Total */}
                <div className="bg-[#951B5C] rounded-lg shadow-md p-2 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold uppercase tracking-wider">TOTAL STUDENTS</h3>
                      <p className="text-3xl font-bold mt-0">{statistics.totalStudents}</p>
                    </div>
                    <div className="p-1 bg-[#A93F78] text-white rounded-lg">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* School Cards - Matching Staff Nationality styling */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* KFNA */}
                  <div className="rounded-lg shadow-sm bg-[#FDE7E9] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#E4424D] mr-1"></div>
                        <span className="text-base font-medium text-[#8F1D25]">KFNA</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#FCCCD0] flex items-center justify-center text-center text-xl">
                        <Building className="w-5 h-5 text-[#E4424D]" />
                      </div>
                    </div>
                    <div className="mt-2 mb-2">
                      <span className="text-3xl font-bold text-[#8F1D25]">{statistics.studentsBySchool.knfa}</span>
                      <span className="text-base font-medium text-[#8F1D25] ml-2">Cadets</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm text-[#8F1D25] mb-1">
                        <span>Distribution</span>
                        <span>100%</span>
                      </div>
                      <div className="w-full bg-[#FCCCD0] rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full bg-[#E4424D] rounded-full" 
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* NFS East */}
                  <div className="rounded-lg shadow-sm bg-[#E9F7F2] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#22A783] mr-1"></div>
                        <span className="text-base font-medium text-[#0E6E55]">NFS East</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#C5EAE0] flex items-center justify-center text-center text-xl">
                        <Building className="w-5 h-5 text-[#22A783]" />
                      </div>
                    </div>
                    <div className="mt-2 mb-2">
                      <span className="text-3xl font-bold text-[#0E6E55]">{statistics.studentsBySchool.nfsEast}</span>
                      <span className="text-base font-medium text-[#0E6E55] ml-2">Students</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm text-[#0E6E55] mb-1">
                        <span>Distribution</span>
                        <span>100%</span>
                      </div>
                      <div className="w-full bg-[#C5EAE0] rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full bg-[#22A783] rounded-full" 
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* NFS West */}
                  <div className="rounded-lg shadow-sm bg-[#F2EFFA] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-[#6247AA] mr-1"></div>
                        <span className="text-base font-medium text-[#402F70]">NFS West</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#DCD3F0] flex items-center justify-center text-center text-xl">
                        <Building className="w-5 h-5 text-[#6247AA]" />
                      </div>
                    </div>
                    <div className="mt-2 mb-2">
                      <span className="text-3xl font-bold text-[#402F70]">{statistics.studentsBySchool.nfsWest}</span>
                      <span className="text-base font-medium text-[#402F70] ml-2">Students</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm text-[#402F70] mb-1">
                        <span>Distribution</span>
                        <span>100%</span>
                      </div>
                      <div className="w-full bg-[#DCD3F0] rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full bg-[#6247AA] rounded-full" 
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar added at the bottom of Left Column */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-lg text-[#0A2463]">Calendar</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <CalendarComponent className="shadow-none" />
            </CardContent>
          </Card>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="relative">
            <UpcomingEvents limit={3} />
            <div className="absolute top-4 right-4">
              <Link href="/events" className="text-blue-600 hover:underline text-sm font-medium">View All</Link>
            </div>
          </div>



          {/* To-Do List */}
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="p-3 pb-1">
                <h2 className="text-lg font-semibold text-gray-800">My Tasks</h2>
              </div>
              
              <div className="px-3 pb-3">
                <div className="flex mb-4 relative border rounded-md">
                  <Input 
                    value={newTask} 
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task..."
                    className="border-0 flex-1 py-2 rounded-md text-xs"
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  />
                  <Button 
                    onClick={addTask}
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {tasks.map(task => {
                    // Determine the task color scheme and appearance
                    let checkClass = '';
                    let borderClass = '';
                    
                    if (task.text.toLowerCase().includes('submit staff')) {
                      // Task 1 - Submit staff evaluations - Green
                      checkClass = 'bg-green-500 text-white';
                      borderClass = 'border-blue-200';
                    } else if (task.text.toLowerCase().includes('review test')) {
                      // Task 2 - Review test scores - Blue
                      checkClass = 'bg-blue-500 text-white';
                      borderClass = 'border-blue-200';
                    } else if (task.text.toLowerCase().includes('order new books')) {
                      // Task 3 - Order new books - Orange/Green (matching screenshot)
                      checkClass = 'bg-green-500 text-white';
                      borderClass = 'border-orange-200';
                    } else {
                      // Default for new tasks (ensuring color consistency)
                      // For new tasks, alternate between green and blue
                      const taskId = parseInt(task.id.toString().slice(-1));
                      checkClass = taskId % 2 === 0 ? 'bg-blue-500 text-white' : 'bg-green-500 text-white';
                      borderClass = taskId % 3 === 0 ? 'border-orange-200' : 'border-blue-200';
                    }
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`flex items-center justify-between py-2 px-2 rounded-md border ${borderClass}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${checkClass}`}>
                            <Check className="h-3 w-3" />
                          </div>
                          <span className="text-gray-800 text-sm font-normal">
                            {task.text}
                          </span>
                        </div>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <QuickLinks />

          {/* Notifications Card - Using dynamic notifications */}
          <Notifications 
            instructors={instructors} 
            staffAttendance={staffAttendance} 
            staffLeave={staffLeave} 
            evaluations={evaluations} 
            courses={courses} 
            limit={3} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
