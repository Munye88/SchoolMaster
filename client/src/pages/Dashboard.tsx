import { useState, useEffect } from "react";
import { 
  GraduationCap, BookOpen, Users, Clock, Calendar, Check, X, ChevronRight,
  User, UserCheck, Building, Activity, BarChart2, Trash2, Plus, UserPlus, Loader2
} from "lucide-react";
import { School as SchoolIcon } from "lucide-react";
import { Course, Instructor, Student, TestResult, School, StaffAttendance, StaffLeave, Evaluation, Event } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSchool } from "@/hooks/useSchool";
import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/dashboard/Calendar";
import Notifications from "@/components/dashboard/Notifications";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
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
      { id: 3, text: 'Order new books for KNFA', done: false },
    ];
  });
  const [newTask, setNewTask] = useState('');
  
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

  const { data: schools = [] } = useQuery<School[]>({
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
    return () => {
      console.log("Dashboard unmounted");
    };
  }, []);
  
  const formatDate = (date: Date | string) => {
    return format(new Date(date), "MMM dd, yyyy");
  };
  
  // Functions for to-do list
  useEffect(() => {
    localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
  }, [tasks]);
  
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
      {/* Dashboard Header with Modern Design */}
      <div className="bg-gradient-to-r from-[#0A2463] to-[#1e3a8a] text-white mb-6 rounded-lg shadow-md overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-white/5 bg-[length:16px_16px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1),_transparent)]"></div>
        <div className="flex justify-between items-center px-6 py-2 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-blue-400 rounded-full mr-3"></div>
            <div>
              <p className="text-sm italic text-white">
                "Leadership is not about being in charge. It is about taking care of those in your charge." – Simon Sinek
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-lg flex items-center border border-white/20 shadow-inner">
              <Calendar className="h-4 w-4 mr-2 text-blue-300" /> 
              <span className="font-medium text-sm">{format(new Date(), "EEEE, MMMM dd, yyyy")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview - Modern Card Design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        {/* Students Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md overflow-hidden border border-blue-200 group hover:shadow-lg transition-all duration-300 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full transform translate-x-8 -translate-y-8"></div>
          <div className="p-5 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-700/70 font-medium mb-1">Total Students</p>
                <h3 className="text-3xl font-bold text-blue-800 flex items-baseline">
                  {dashboardStats.isLoadingStudents ? (
                    <span className="flex items-center">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin text-blue-600" /> 
                      Loading...
                    </span>
                  ) : (
                    <>
                      {statistics.totalStudents}
                      <span className="text-green-500 text-xs font-medium ml-2 bg-green-100 px-1.5 py-0.5 rounded-full">+3%</span>
                    </>
                  )}
                </h3>
              </div>
              <div className="bg-blue-500 bg-opacity-15 p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "75%" }}></div>
            </div>
            <p className="text-xs text-blue-600 mt-2 flex items-center">
              <ChevronRight className="h-3 w-3 mr-1" />
              75% of target enrollment
            </p>
          </div>
        </div>

        {/* Instructors Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md overflow-hidden border border-green-200 group hover:shadow-lg transition-all duration-300 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full transform translate-x-8 -translate-y-8"></div>
          <div className="p-5 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-green-700/70 font-medium mb-1">Instructors</p>
                <h3 className="text-3xl font-bold text-green-800 flex items-baseline">
                  {statistics.activeInstructors}
                  <span className="text-green-500 text-xs font-medium ml-2 bg-green-100 px-1.5 py-0.5 rounded-full">100%</span>
                </h3>
              </div>
              <div className="bg-green-500 bg-opacity-15 p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-green-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: "100%" }}></div>
            </div>
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <ChevronRight className="h-3 w-3 mr-1" />
              Full staff capacity
            </p>
          </div>
        </div>

        {/* Schools Card */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl shadow-md overflow-hidden border border-teal-200 group hover:shadow-lg transition-all duration-300 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full transform translate-x-8 -translate-y-8"></div>
          <div className="p-5 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-teal-700/70 font-medium mb-1">Schools</p>
                <h3 className="text-3xl font-bold text-teal-800 flex items-baseline">
                  {statistics.totalSchools}
                  <span className="text-teal-500 text-xs font-medium ml-2 bg-teal-100 px-1.5 py-0.5 rounded-full">Active</span>
                </h3>
              </div>
              <div className="bg-teal-500 bg-opacity-15 p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                <SchoolIcon className="h-6 w-6 text-teal-600" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1">
              <div className="h-1.5 bg-teal-600 rounded-full"></div>
              <div className="h-1.5 bg-teal-400 rounded-full"></div>
              <div className="h-1.5 bg-teal-300 rounded-full"></div>
            </div>
            <p className="text-xs text-teal-600 mt-2 flex items-center">
              <ChevronRight className="h-3 w-3 mr-1" />
              KFNA, NFS East, NFS West
            </p>
          </div>
        </div>

        {/* Courses Card */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-md overflow-hidden border border-amber-200 group hover:shadow-lg transition-all duration-300 relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full transform translate-x-8 -translate-y-8"></div>
          <div className="p-5 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-amber-700/70 font-medium mb-1">Courses</p>
                <h3 className="text-3xl font-bold text-amber-800 flex items-baseline">
                  {statistics.totalCourses}
                  <span className="text-amber-500 text-xs font-medium ml-2 bg-amber-100 px-1.5 py-0.5 rounded-full">{statistics.activeCourses} active</span>
                </h3>
              </div>
              <div className="bg-amber-500 bg-opacity-15 p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-3 flex space-x-1">
              <div className="h-1.5 w-1/5 bg-amber-600 rounded-full"></div>
              <div className="h-1.5 w-1/5 bg-amber-600 rounded-full"></div>
              <div className="h-1.5 w-1/5 bg-amber-600 rounded-full"></div>
              <div className="h-1.5 w-1/5 bg-amber-300 rounded-full"></div>
              <div className="h-1.5 w-1/5 bg-amber-300 rounded-full"></div>
            </div>
            <p className="text-xs text-amber-600 mt-2 flex items-center">
              <ChevronRight className="h-3 w-3 mr-1" />
              {statistics.activeCourses} active, {statistics.completedCourses} completed
            </p>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Courses */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-[#0A2463]">Active Courses</CardTitle>
                <Link href="/courses" className="text-blue-600 hover:underline text-sm font-medium">View All</Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 pb-6">
              <div className="grid grid-cols-1 gap-4">
                {/* Overview and Total */}
                <div className="bg-gradient-to-r from-blue-500 to-teal-400 rounded-lg shadow-md p-4 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wider">Active Courses</h3>
                      <p className="text-3xl font-bold mt-1">{statistics.activeCourses}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Course Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {courses.filter(c => c.status === "In Progress" || c.status === "Active").slice(0, 3).map(course => {
                    const school = schools.find(s => s.id === course.schoolId);
                    let fromColor = 'from-blue-50';
                    let toColor = 'to-blue-100';
                    let borderColor = 'border-blue-200';
                    let bgColor = 'bg-blue-600/10';
                    let textColor = 'text-blue-900';
                    let valueColor = 'text-blue-700';
                    let labelColor = 'text-blue-600';
                    let progressBgColor = 'bg-blue-200';
                    let progressFillColor = 'bg-blue-600';
                    let progressTextColor = 'text-blue-700';
                    
                    // Determine color based on school
                    if (school?.name.includes('East')) {
                      fromColor = 'from-emerald-50';
                      toColor = 'to-emerald-100';
                      borderColor = 'border-emerald-200';
                      bgColor = 'bg-emerald-600/10';
                      textColor = 'text-emerald-900';
                      valueColor = 'text-emerald-700';
                      labelColor = 'text-emerald-600';
                      progressBgColor = 'bg-emerald-200';
                      progressFillColor = 'bg-emerald-600';
                      progressTextColor = 'text-emerald-700';
                    } else if (school?.name.includes('West')) {
                      fromColor = 'from-amber-50';
                      toColor = 'to-amber-100';
                      borderColor = 'border-amber-200';
                      bgColor = 'bg-amber-600/10';
                      textColor = 'text-amber-900';
                      valueColor = 'text-amber-700';
                      labelColor = 'text-amber-600';
                      progressBgColor = 'bg-amber-200';
                      progressFillColor = 'bg-amber-600';
                      progressTextColor = 'text-amber-700';
                    }
                    
                    return (
                      <div key={course.id} className={`relative overflow-hidden rounded-lg shadow-md group hover:shadow-lg transition-all bg-gradient-to-br ${fromColor} ${toColor} border ${borderColor}`}>
                        <div className={`absolute -right-6 -top-6 w-24 h-24 ${bgColor} rounded-full`}></div>
                        <div className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="z-10">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${progressFillColor}`}></div>
                                <h3 className={`font-semibold ${textColor}`}>{course.name}</h3>
                              </div>
                              <div className="mt-3 flex items-baseline gap-1">
                                <span className={`text-3xl font-bold ${valueColor}`}>{course.studentCount}</span>
                                <span className={`text-sm font-medium ${labelColor}`}>Students</span>
                              </div>
                              <div className="mt-3">
                                <div className={`flex items-center justify-between text-xs ${progressTextColor} mb-1`}>
                                  <span>Progress</span>
                                  <span>
                                    {course.name === 'Cadets' ? '0' : calculateCourseProgress(course)}%
                                  </span>
                                </div>
                                <div className={`w-full ${progressBgColor} rounded-full h-2 overflow-hidden`}>
                                  <div 
                                    className={`h-full ${progressFillColor} rounded-full`} 
                                    style={{ width: `${course.name === 'Cadets' ? '0' : calculateCourseProgress(course)}%` }}
                                  ></div>
                                </div>
                                <div className={`mt-2 text-xs ${labelColor}`}>
                                  {school?.name || "N/A"} | Started: {formatDate(course.startDate)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Nationality */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg text-[#0A2463]">Staff Nationality</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pb-6">
              <div className="grid grid-cols-1 gap-4">
                {/* Overview and Total */}
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-lg shadow-md p-4 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wider">Total Instructors</h3>
                      <p className="text-3xl font-bold mt-1">{statistics.activeInstructors}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg">
                      <UserCheck className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Nationality Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* American */}
                  <div className="relative overflow-hidden rounded-lg shadow-md group hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-600/10 rounded-full"></div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                            <h3 className="font-semibold text-blue-900">American</h3>
                          </div>
                          <div className="mt-3 flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-blue-700">{dashboardStats.nationalityCounts.american}</span>
                            <span className="text-sm font-medium text-blue-600">Instructors</span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
                              <span>Distribution</span>
                              <span style={{paddingLeft: '4px'}}>{(dashboardStats.nationalityCounts.american/statistics.activeInstructors*100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full" 
                                style={{ width: `${(dashboardStats.nationalityCounts.american/statistics.activeInstructors*100).toFixed(1)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* British */}
                  <div className="relative overflow-hidden rounded-lg shadow-md group hover:shadow-lg transition-all bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-600/10 rounded-full"></div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-600"></div>
                            <h3 className="font-semibold text-red-900">British</h3>
                          </div>
                          <div className="mt-3 flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-red-700">{dashboardStats.nationalityCounts.british}</span>
                            <span className="text-sm font-medium text-red-600">Instructors</span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-red-700 mb-1">
                              <span>Distribution &nbsp;</span>
                              <span>{(dashboardStats.nationalityCounts.british/statistics.activeInstructors*100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-red-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-red-600 rounded-full" 
                                style={{ width: `${(dashboardStats.nationalityCounts.british/statistics.activeInstructors*100).toFixed(1)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Canadian */}
                  <div className="relative overflow-hidden rounded-lg shadow-md group hover:shadow-lg transition-all bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-600/10 rounded-full"></div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                            <h3 className="font-semibold text-emerald-900">Canadian</h3>
                          </div>
                          <div className="mt-3 flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-emerald-700">{dashboardStats.nationalityCounts.canadian}</span>
                            <span className="text-sm font-medium text-emerald-600">Instructors</span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
                              <span>Distribution &nbsp;</span>
                              <span>{(dashboardStats.nationalityCounts.canadian/statistics.activeInstructors*100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-emerald-600 rounded-full" 
                                style={{ width: `${(dashboardStats.nationalityCounts.canadian/statistics.activeInstructors*100).toFixed(1)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Student Distribution */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg text-[#0A2463]">Student Distribution by School</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pb-6">
              <div className="grid grid-cols-1 gap-4">
                {/* Overview and Total */}
                <div className="bg-gradient-to-r from-[#0A2463] to-[#1A3473] rounded-lg shadow-md p-4 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wider">Total Students</h3>
                      <p className="text-3xl font-bold mt-1">{statistics.totalStudents}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* School Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* KFNA */}
                  <div className="relative overflow-hidden rounded-lg shadow-md group hover:shadow-lg transition-all">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700"></div>
                    <div className="absolute -right-6 -top-6 w-24 h-24 opacity-20">
                      <GraduationCap className="w-full h-full text-white" />
                    </div>
                    <div className="relative p-4 text-white z-10">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-white"></div>
                          <h3 className="font-semibold">KFNA</h3>
                        </div>
                        <div className="bg-white text-blue-700 text-xs font-bold uppercase rounded-full px-2 py-0.5">
                          Cadets
                        </div>
                      </div>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-bold">{statistics.studentsBySchool.knfa}</span>
                        <span className="text-sm font-medium">Cadets</span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Program Distribution</span>
                          <span>100%</span>
                        </div>
                        <div className="w-full bg-blue-500/30 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-white rounded-full" 
                            style={{ width: '100%' }}
                          ></div>
                        </div>
                        <div className="mt-2 text-xs opacity-90">Cadets Course</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* NFS East */}
                  <div className="relative overflow-hidden rounded-lg shadow-md group hover:shadow-lg transition-all">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700"></div>
                    <div className="absolute -right-6 -top-6 w-24 h-24 opacity-20">
                      <Users className="w-full h-full text-white" />
                    </div>
                    <div className="relative p-4 text-white z-10">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-white"></div>
                          <h3 className="font-semibold">NFS East</h3>
                        </div>
                        <div className="bg-white text-emerald-700 text-xs font-bold uppercase rounded-full px-2 py-0.5">
                          Mixed
                        </div>
                      </div>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-bold">{statistics.studentsBySchool.nfsEast}</span>
                        <span className="text-sm font-medium">Students</span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Aviation</span>
                          <span>27 ({(27/43*100).toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-emerald-500/30 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-emerald-300 rounded-full" 
                            style={{ width: `${(27/43*100).toFixed(0)}%` }}
                          ></div>
                        </div>
                        <div className="mt-2 text-xs">Aviation Course</div>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Refresher</span>
                          <span>16 ({(16/43*100).toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-emerald-500/30 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-white rounded-full" 
                            style={{ width: `${(16/43*100).toFixed(0)}%` }}
                          ></div>
                        </div>
                        <div className="mt-2 text-xs">Refresher Course</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* NFS West */}
                  <div className="relative overflow-hidden rounded-lg shadow-md group hover:shadow-lg transition-all">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                    <div className="absolute -right-6 -top-6 w-24 h-24 opacity-20">
                      <UserPlus className="w-full h-full text-white" />
                    </div>
                    <div className="relative p-4 text-white z-10">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-white"></div>
                          <h3 className="font-semibold">NFS West</h3>
                        </div>
                        <div className="bg-white text-blue-600 text-xs font-bold uppercase rounded-full px-2 py-0.5">
                          Refresher
                        </div>
                      </div>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-bold">{statistics.studentsBySchool.nfsWest}</span>
                        <span className="text-sm font-medium">Students</span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Program Distribution</span>
                          <span>100%</span>
                        </div>
                        <div className="w-full bg-blue-500/30 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-white rounded-full" 
                            style={{ width: '100%' }}
                          ></div>
                        </div>
                        <div className="mt-2 text-xs opacity-90">Refresher Course</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar added at the bottom of Left Column */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
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
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-[#0A2463]">My Tasks</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    value={newTask} 
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  />
                  <Button 
                    onClick={addTask}
                    size="icon"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id={`task-${task.id}`} 
                          checked={task.done} 
                          onCheckedChange={() => toggleTaskDone(task.id)}
                        />
                        <label 
                          htmlFor={`task-${task.id}`} 
                          className={`text-sm cursor-pointer ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}
                        >
                          {task.text}
                        </label>
                      </div>
                      <button 
                        onClick={() => deleteTask(task.id)} 
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {tasks.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No tasks yet. Add one above!
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications - moved under My Tasks */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg text-[#0A2463]">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div>
                <Notifications
                  instructors={instructors}
                  staffAttendance={staffAttendance}
                  staffLeave={staffLeave}
                  evaluations={evaluations}
                  courses={courses}
                  students={students}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Links - moved to bottom */}
          <Card className="shadow-sm mt-4">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg text-[#0A2463]">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                <Link href="/instructor-lookup" className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Instructor Lookup</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
                <Link href="/courses" className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">Course Management</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
