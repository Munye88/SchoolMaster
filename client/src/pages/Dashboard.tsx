import { useQuery } from "@tanstack/react-query";
import { 
  GraduationCap, BookOpen, Users, Clock, Calendar, Check, X, ChevronRight,
  User, UserCheck, Building, Activity, BarChart2
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

const Dashboard = () => {
  const { selectedSchool, currentSchool } = useSchool();
  
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
  const totalCourses = courses.length;
  const activeCourses = courses.filter(c => c.status === "In Progress").length;
  const completedCourses = courses.filter(c => c.status === "Completed").length;
  
  const formatDate = (date: Date | string) => {
    return format(new Date(date), "MMM dd, yyyy");
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
                <p className="text-sm text-gray-500 mb-1">Teachers</p>
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

          {/* Nationality Distribution */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg text-[#0A2463]">Staff Nationality Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex-1">
                  <div className="space-y-4">
                    {['American', 'British', 'Canadian', 'Australian'].map((nationality, index) => {
                      const count = instructors.filter(i => i.nationality === nationality).length;
                      const percentage = instructors.length > 0 ? (count / instructors.length) * 100 : 0;
                      return (
                        <div key={nationality} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{nationality}</span>
                            <span>{count} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <BarChart2 className="h-16 w-16 text-blue-200 mx-auto" />
                      <p className="mt-2 text-sm text-gray-500">View detailed charts in Reports</p>
                      <Link href="/reports" className="mt-2 inline-block text-blue-600 hover:underline text-sm">
                        View Reports
                      </Link>
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
            <CardContent className="p-4">
              <div className="space-y-4">
                {schools.map(school => {
                  const schoolStudents = students.filter(s => s.schoolId === school.id).length;
                  const percentage = totalStudents > 0 ? (schoolStudents / totalStudents) * 100 : 0;
                  return (
                    <div key={school.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{school.name}</span>
                        <span>{schoolStudents} students ({percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
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
