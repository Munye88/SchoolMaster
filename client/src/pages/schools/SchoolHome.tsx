import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchool } from "@/hooks/useSchool";
import { useEffect } from "react";
import { 
  Users, 
  Calendar, 
  ClipboardCheck, 
  UserCheck, 
  BookOpen, 
  CalendarDays,
  FileText,
  MessageSquare,
  CalendarX
} from "lucide-react";

export default function SchoolHome() {
  const { schoolCode } = useParams<{ schoolCode: string }>();
  const { schools, setSelectedSchool } = useSchool();
  
  // Find the school based on the code
  const school = schools?.find(s => s.code === schoolCode);
  
  // Set the selected school when component mounts
  useEffect(() => {
    if (school) {
      setSelectedSchool(school);
    }
  }, [school, setSelectedSchool]);

  // Get school statistics
  const { data: instructors = [] } = useQuery({
    queryKey: ['/api/instructors'],
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['/api/courses'],
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ['/api/staff-attendance'],
  });

  if (!school) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">School Not Found</h1>
          <p className="text-gray-600">The requested school could not be found.</p>
        </div>
      </div>
    );
  }

  const schoolInstructors = instructors.filter(i => i.schoolId === school.id);
  const schoolCourses = courses.filter(c => c.schoolId === school.id);
  const schoolAttendance = attendance.filter(a => 
    schoolInstructors.some(instructor => instructor.id === a.instructorId)
  );

  const getSchoolColor = () => {
    if (school.name.includes("KFNA")) return "from-[#0A2463] to-[#1E40AF]";
    if (school.name.includes("NFS East")) return "from-[#059669] to-[#10B981]";
    if (school.name.includes("NFS West")) return "from-[#7C3AED] to-[#A855F7]";
    return "from-blue-600 to-blue-800";
  };

  const getSchoolAccent = () => {
    if (school.name.includes("KFNA")) return "#0A2463";
    if (school.name.includes("NFS East")) return "#059669";
    if (school.name.includes("NFS West")) return "#7C3AED";
    return "#2563EB";
  };

  const quickLinks = [
    {
      title: "Staff Attendance",
      description: "Track and manage instructor attendance",
      icon: UserCheck,
      path: `/schools/${schoolCode}/staff-attendance`,
      color: "text-green-600"
    },
    {
      title: "Staff Evaluations",
      description: "View and manage staff evaluations",
      icon: ClipboardCheck,
      path: `/schools/${schoolCode}/staff-evaluations`,
      color: "text-blue-600"
    },
    {
      title: "Instructor Profiles",
      description: "View detailed instructor information",
      icon: Users,
      path: `/schools/${schoolCode}/instructor-profiles`,
      color: "text-purple-600"
    },
    {
      title: "Timetable",
      description: "View and manage class schedules",
      icon: Calendar,
      path: `/schools/${schoolCode}/timetable`,
      color: "text-orange-600"
    },
    {
      title: "Staff Leave Tracker",
      description: "Manage staff leave requests and approvals",
      icon: CalendarX,
      path: `/schools/${schoolCode}/staff-leave-tracker`,
      color: "text-red-600"
    },
    {
      title: "Staff Counseling",
      description: "Access staff counseling records",
      icon: MessageSquare,
      path: `/schools/${schoolCode}/staff-counseling`,
      color: "text-indigo-600"
    },
    {
      title: "Book Inventory",
      description: "Manage textbooks and materials",
      icon: BookOpen,
      path: `/schools/${schoolCode}/book-inventory`,
      color: "text-amber-600"
    },
    {
      title: "Yearly Schedule",
      description: "View academic calendar and events",
      icon: CalendarDays,
      path: `/schools/${schoolCode}/yearly-schedule`,
      color: "text-teal-600"
    }
  ];

  return (
    <div className="flex-1 p-8 bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className={`bg-gradient-to-r ${getSchoolColor()} text-white rounded-lg p-6`}>
          <h1 className="text-3xl font-bold mb-2">{school.name}</h1>
          <p className="text-lg opacity-90">School Management Dashboard</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Instructors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: getSchoolAccent() }}>
              {schoolInstructors.length}
            </div>
            <p className="text-xs text-muted-foreground">Active teaching staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: getSchoolAccent() }}>
              {schoolCourses.filter(c => c.status === "In Progress").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: getSchoolAccent() }}>
              {schoolAttendance.filter(a => a.status === "present").length}
            </div>
            <p className="text-xs text-muted-foreground">Present today</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <Link key={index} href={link.path}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <link.icon className={`h-6 w-6 ${link.color} group-hover:scale-110 transition-transform`} />
                    <CardTitle className="text-sm font-medium group-hover:text-gray-900">
                      {link.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs">
                    {link.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and activities at {school.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            <p className="mb-2">• {schoolInstructors.length} instructors currently assigned</p>
            <p className="mb-2">• {schoolCourses.length} total courses scheduled</p>
            <p className="mb-2">• {schoolAttendance.length} attendance records this month</p>
            <p>• Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}