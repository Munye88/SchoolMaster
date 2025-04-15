import { useState } from "react";
import { 
  GraduationCap, BookOpen, Users, Clock, Calendar, Check, X, ChevronRight,
  User, UserCheck, Building, Activity, BarChart2, Trash2, Plus, UserPlus
} from "lucide-react";
import { School as SchoolIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSchool } from "@/hooks/useSchool";
import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/dashboard/Calendar";
// Import staffAttendance, evaluations, and staffLeave for Notifications
import type { Instructor, StaffAttendance, Evaluation, StaffLeave } from "@shared/schema";
import Notifications from "@/components/dashboard/Notifications";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip, Cell } from 'recharts';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import govcioLogo from "../assets/images/govcio-logo-updated.png";

const DashboardSimple = () => {
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
  
  // Fetch courses with simple query structure
  const { data: courses = [] } = useQuery({
    queryKey: ['/api/courses'],
  });
  
  // Fetch instructors with simple query structure
  const { data: instructors = [] } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
  });

  // Fetch schools with simple query structure
  const { data: schools = [] } = useQuery({
    queryKey: ['/api/schools'],
  });
  
  // Fetch students with simple query structure
  const { data: students = [] } = useQuery({
    queryKey: ['/api/students'],
  });

  // Events query
  const { data: events = [] } = useQuery({
    queryKey: ['/api/events'],
  });
  
  // Staff attendance 
  const { data: staffAttendance = [] } = useQuery<StaffAttendance[]>({
    queryKey: ['/api/staff-attendance'],
  });

  // Staff leave
  const { data: staffLeave = [] } = useQuery<StaffLeave[]>({
    queryKey: ['/api/staff-leave'],
  });
  
  // Evaluations
  const { data: evaluations = [] } = useQuery<Evaluation[]>({
    queryKey: ['/api/evaluations'],
  });
  
  // Fixed statistics to avoid complex calculations and hooks issues
  const statistics = {
    totalStudents: students.length || 120,
    activeInstructors: instructors.length || 45,
    totalSchools: schools.length || 3,
    totalCourses: 5,
    activeCourses: 3, 
    completedCourses: 2
  };
  
  // Staff nationality data for bar chart
  const nationalityData = [
    { name: 'American', value: 20, color: '#4299E1' },  // blue
    { name: 'British', value: 15, color: '#48BB78' },   // green
    { name: 'Canadian', value: 10, color: '#F6AD55' }   // orange
  ];
  
  const formatDate = (date: Date | string) => {
    return format(new Date(date), "MMM dd, yyyy");
  };
  
  // Save tasks to localStorage when updated
  const saveAndSetTasks = (newTasks: {id: number; text: string; done: boolean}[]) => {
    localStorage.setItem('dashboard_tasks', JSON.stringify(newTasks));
    setTasks(newTasks);
  };
  
  const addTask = () => {
    if (newTask.trim() !== '') {
      const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
      saveAndSetTasks([...tasks, { id: newId, text: newTask.trim(), done: false }]);
      setNewTask('');
    }
  };
  
  const toggleTaskDone = (id: number) => {
    saveAndSetTasks(tasks.map(task => 
      task.id === id ? { ...task, done: !task.done } : task
    ));
  };
  
  const deleteTask = (id: number) => {
    saveAndSetTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto py-6 px-6 bg-gradient-to-b from-gray-50 to-white">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <img src={govcioLogo} alt="GovCIO Logo" className="h-12" />
          <div>
            <p className="text-sm text-gray-600 italic">
              "Education is the most powerful weapon which you can use to change the world." — Nelson Mandela
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="bg-white text-gray-700 px-2 py-1.5 rounded-md shadow-sm border border-gray-200 flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> 
            <span className="font-medium text-xs">{format(new Date(), "EEEE, MMMM dd, yyyy")}</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Students</p>
                <h3 className="text-2xl font-bold">{statistics.totalStudents}</h3>
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
                <h3 className="text-2xl font-bold">{statistics.activeInstructors}</h3>
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
                <h3 className="text-2xl font-bold">{statistics.totalSchools}</h3>
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
                <h3 className="text-2xl font-bold">{statistics.totalCourses}</h3>
                <p className="text-xs text-yellow-600 mt-1">{statistics.activeCourses} active</p>
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
                
                {/* Simplified Course Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* KFNA Course */}
                  <div className="relative overflow-hidden rounded-lg shadow-md group hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-600/10 rounded-full"></div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                            <h3 className="font-semibold text-blue-900">Aviation</h3>
                          </div>
                          <div className="mt-3 flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-blue-700">27</span>
                            <span className="text-sm font-medium text-blue-600">Students</span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
                              <span>Progress</span>
                              <span>65%</span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full" 
                                style={{ width: `65%` }}
                              ></div>
                            </div>
                            <div className="mt-2 text-xs text-blue-600">
                              KFNA | Started: 2025-01-15
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NFS East Course */}
                  <div className="relative overflow-hidden rounded-lg shadow-md group hover:shadow-lg transition-all bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-600/10 rounded-full"></div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                            <h3 className="font-semibold text-emerald-900">Electronics</h3>
                          </div>
                          <div className="mt-3 flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-emerald-700">22</span>
                            <span className="text-sm font-medium text-emerald-600">Students</span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
                              <span>Progress</span>
                              <span>45%</span>
                            </div>
                            <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-emerald-600 rounded-full" 
                                style={{ width: `45%` }}
                              ></div>
                            </div>
                            <div className="mt-2 text-xs text-emerald-600">
                              NFS East | Started: 2025-02-01
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NFS West Course */}
                  <div className="relative overflow-hidden rounded-lg shadow-md group hover:shadow-lg transition-all bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-600/10 rounded-full"></div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                            <h3 className="font-semibold text-amber-900">Communications</h3>
                          </div>
                          <div className="mt-3 flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-amber-700">18</span>
                            <span className="text-sm font-medium text-amber-600">Students</span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-amber-700 mb-1">
                              <span>Progress</span>
                              <span>75%</span>
                            </div>
                            <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-amber-600 rounded-full" 
                                style={{ width: `75%` }}
                              ></div>
                            </div>
                            <div className="mt-2 text-xs text-amber-600">
                              NFS West | Started: 2025-01-20
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

          {/* Simplified To-Do List */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-[#0A2463]">To-Do List</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Input
                    type="text"
                    placeholder="Add a new task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="flex-1 py-2"
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  />
                  <Button onClick={addTask} size="sm" className="px-3">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-100 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          id={`task-${task.id}`} 
                          checked={task.done} 
                          onCheckedChange={() => toggleTaskDone(task.id)} 
                        />
                        <label 
                          htmlFor={`task-${task.id}`} 
                          className={`text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}
                        >
                          {task.text}
                        </label>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)} className="h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Calendar */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-[#0A2463]">Calendar</CardTitle>
                <Link href="/calendar" className="text-blue-600 hover:underline text-sm font-medium">View All</Link>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CalendarComponent />
            </CardContent>
          </Card>
          
          {/* Notifications */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-[#0A2463]">Notifications</CardTitle>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:underline text-sm font-medium">
                  Mark All Read
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Notifications />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardSimple;