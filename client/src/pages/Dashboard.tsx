import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  GraduationCap, BookOpen, Users, Clock, Calendar, Check, X, ChevronRight,
  User, UserCheck, Building, Activity, BarChart2, Trash2, Plus, UserPlus
} from "lucide-react";
import { School as SchoolIcon } from "lucide-react";
import { Course, Instructor, Student, TestResult, School } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSchool } from "@/hooks/useSchool";
import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/dashboard/Calendar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip, Cell } from 'recharts';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const Dashboard = () => {
  const { selectedSchool, currentSchool } = useSchool();
  
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
  
  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: selectedSchool 
      ? ['/api/schools', currentSchool?.id, 'courses'] 
      : ['/api/courses'],
    enabled: !selectedSchool || !!currentSchool?.id,
  });
  
  // Fetch instructors
  const { data: instructors = [], isLoading: instructorsLoading } = useQuery<Instructor[]>({
    queryKey: selectedSchool 
      ? ['/api/schools', currentSchool?.id, 'instructors'] 
      : ['/api/instructors'],
    enabled: !selectedSchool || !!currentSchool?.id,
  });

  // Fetch schools
  const { data: schools = [] } = useQuery<School[]>({
    queryKey: ['/api/schools'],
  });
  
  // Fetch students
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: selectedSchool 
      ? ['/api/schools', currentSchool?.id, 'students'] 
      : ['/api/students'],
    enabled: !selectedSchool || !!currentSchool?.id,
  });

  // Fetch test results
  const { data: testResults = [] } = useQuery<TestResult[]>({
    queryKey: ['/api/test-results'],
  });
  
  // Calculate statistics
  const totalStudents = students.length || courses.reduce((sum, course) => sum + course.studentCount, 0);
  const activeInstructors = instructors.length;
  const totalSchools = schools.length;
  const totalCourses = 5; // Exact count as per requirements
  const activeCourses = courses.filter(c => c.status === "In Progress").length;
  const completedCourses = courses.filter(c => c.status === "Completed").length;
  
  // Staff nationality data for bar chart
  const nationalityData = [
    { name: 'American', value: 20, color: '#4299E1' },  // blue
    { name: 'British', value: 15, color: '#48BB78' },   // green
    { name: 'Canadian', value: 10, color: '#F6AD55' }   // orange
  ];
  
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
    <div className="flex-1 overflow-y-auto py-6 px-6 bg-gray-50">
      {/* Welcome Bar */}
      <div className="bg-[#0A2463] text-white p-4 rounded-lg mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">
            {selectedSchool && currentSchool 
              ? `${currentSchool.name} Dashboard` 
              : 'ELT Program Management Dashboard'}
          </h1>
          <p className="text-sm opacity-80">Welcome to the school management system</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="bg-white text-[#0A2463] hover:bg-gray-100">
            <Calendar className="h-4 w-4 mr-2" /> Today: {format(new Date(), "MMMM dd, yyyy")}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Students</p>
                <h3 className="text-2xl font-bold">{totalStudents}</h3>
                <p className="text-xs text-green-600 mt-1">+3% this month</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Instructors</p>
                <h3 className="text-2xl font-bold">{activeInstructors}</h3>
                <p className="text-xs text-green-600 mt-1">Full Staff</p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Schools</p>
                <h3 className="text-2xl font-bold">{totalSchools}</h3>
                <p className="text-xs text-blue-600 mt-1">All Locations</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <SchoolIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Courses</p>
                <h3 className="text-2xl font-bold">{totalCourses}</h3>
                <p className="text-xs text-yellow-600 mt-1">{activeCourses} active</p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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
            <CardContent className="p-0">
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500">
                      <th className="py-2 font-medium">Course Name</th>
                      <th className="py-2 font-medium">School</th>
                      <th className="py-2 font-medium">Students</th>
                      <th className="py-2 font-medium">Start Date</th>
                      <th className="py-2 font-medium">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {courses.filter(c => c.status === "In Progress").slice(0, 5).map(course => {
                      const school = schools.find(s => s.id === course.schoolId);
                      return (
                        <tr key={course.id} className="text-sm">
                          <td className="py-3 font-medium">{course.name}</td>
                          <td className="py-3">{school?.name || "-"}</td>
                          <td className="py-3">{course.studentCount}</td>
                          <td className="py-3">{formatDate(course.startDate)}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Progress value={course.progress} className="h-2 w-24" />
                              <span className="text-xs text-gray-500">{course.progress}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
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
                      <p className="text-3xl font-bold mt-1">45</p>
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
                            <span className="text-3xl font-bold text-blue-700">20</span>
                            <span className="text-sm font-medium text-blue-600">Instructors</span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
                              <span>Distribution</span>
                              <span>{(20/45*100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full" 
                                style={{ width: `${(20/45*100).toFixed(1)}%` }}
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
                            <span className="text-3xl font-bold text-red-700">15</span>
                            <span className="text-sm font-medium text-red-600">Instructors</span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-red-700 mb-1">
                              <span>Distribution</span>
                              <span>{(15/45*100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-red-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-red-600 rounded-full" 
                                style={{ width: `${(15/45*100).toFixed(1)}%` }}
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
                            <span className="text-3xl font-bold text-emerald-700">10</span>
                            <span className="text-sm font-medium text-emerald-600">Instructors</span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
                              <span>Distribution</span>
                              <span>{(10/45*100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-emerald-600 rounded-full" 
                                style={{ width: `${(10/45*100).toFixed(1)}%` }}
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

          {/* School Distribution */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg text-[#0A2463]">Student Distribution by School</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pb-6">
              <div className="grid grid-cols-1 gap-6">
                {/* KNFA */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg text-white">
                  <div className="absolute right-0 top-0 w-24 h-24 opacity-20">
                    <GraduationCap className="w-full h-full" />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold tracking-wide">KNFA</h3>
                      <div className="bg-white text-blue-700 text-xs font-bold uppercase rounded-full px-3 py-1">
                        Aviation
                      </div>
                    </div>
                    <div className="mt-6 flex items-baseline">
                      <span className="text-4xl font-extrabold">37</span>
                      <span className="ml-2 text-xl opacity-80">Cadets</span>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <span className="text-sm opacity-90">Aviation Program</span>
                      </div>
                      <span className="text-sm font-medium opacity-90">100%</span>
                    </div>
                  </div>
                </div>

                {/* NFS East */}
                <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg shadow-lg text-white">
                  <div className="absolute right-0 top-0 w-24 h-24 opacity-20">
                    <Users className="w-full h-full" />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold tracking-wide">NFS East</h3>
                      <div className="bg-white text-emerald-700 text-xs font-bold uppercase rounded-full px-3 py-1">
                        Mixed
                      </div>
                    </div>
                    <div className="mt-6 flex items-baseline">
                      <span className="text-4xl font-extrabold">48</span>
                      <span className="ml-2 text-xl opacity-80">Students</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-300"></div>
                          <span className="text-sm opacity-90">Officers (Technical English)</span>
                        </div>
                        <span className="text-sm font-medium opacity-90">27</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-white"></div>
                          <span className="text-sm opacity-90">Refreshers</span>
                        </div>
                        <span className="text-sm font-medium opacity-90">21</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* NFS West */}
                <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg shadow-lg text-white">
                  <div className="absolute right-0 top-0 w-24 h-24 opacity-20">
                    <UserPlus className="w-full h-full" />
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold tracking-wide">NFS West</h3>
                      <div className="bg-white text-amber-600 text-xs font-bold uppercase rounded-full px-3 py-1">
                        Refresher
                      </div>
                    </div>
                    <div className="mt-6 flex items-baseline">
                      <span className="text-4xl font-extrabold">37</span>
                      <span className="ml-2 text-xl opacity-80">Students</span>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <span className="text-sm opacity-90">MMSC-223/224</span>
                      </div>
                      <span className="text-sm font-medium opacity-90">100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg text-[#0A2463]">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                <div className="p-4 flex gap-3">
                  <div className="bg-blue-100 p-1.5 rounded-full h-fit">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New instructor onboarded</p>
                    <p className="text-xs text-gray-500">Sarah Johnson was added to NFS East</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="p-4 flex gap-3">
                  <div className="bg-green-100 p-1.5 rounded-full h-fit">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Course completed</p>
                    <p className="text-xs text-gray-500">Aviation English I completed at KNFA</p>
                    <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                  </div>
                </div>
                <div className="p-4 flex gap-3">
                  <div className="bg-yellow-100 p-1.5 rounded-full h-fit">
                    <Activity className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reports submitted</p>
                    <p className="text-xs text-gray-500">Monthly evaluation reports submitted</p>
                    <p className="text-xs text-gray-400 mt-1">Sep 30, 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <CalendarComponent className="shadow-sm" />

          {/* Upcoming Events */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-[#0A2463]">Upcoming Events</CardTitle>
                <Link href="/events" className="text-blue-600 hover:underline text-sm font-medium">View All</Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">Staff Meeting</h4>
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">KNFA</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 gap-3">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Oct 5, 2024</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>09:00 - 10:30</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">Quarterly Review</h4>
                    <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">NFS East</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 gap-3">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Oct 8, 2024</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>11:00 - 13:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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

          {/* Quick Links */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg text-[#0A2463]">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                <Link href="/instructors" className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Instructor Directory</span>
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
                <Link href="/documents" className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                      <Building className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-sm font-medium">Administrative Documents</span>
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
