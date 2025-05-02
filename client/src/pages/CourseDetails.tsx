import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { format } from "date-fns";
import { Course, School } from "@shared/schema";
import { getCourseStatus, calculateCourseProgress } from "@/utils/courseStatusHelpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarRange,
  Award,
  Users,
  BookOpen,
  BarChart,
  ChevronLeft,
  Clock,
  GraduationCap,
  Building2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PrintButton } from "@/components/ui/print-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>(); // Get course ID from URL params
  const courseId = parseInt(id);

  // Fetch individual course data
  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    // This endpoint needs to be implemented on the server side
  });

  // Get schools for displaying school name
  const { data: schools = [], isLoading: isLoadingSchools } = useQuery<School[]>({
    queryKey: ["/api/schools"],
  });

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return format(new Date(dateStr), "MMMM d, yyyy");
    } catch (error) {
      return dateStr;
    }
  };

  // Get school name by ID
  const getSchoolName = (id: number): string => {
    const school = schools.find((s: School) => s.id === id);
    return school ? school.name : "Unknown";
  };

  // Generate color scheme based on course name
  const getColorScheme = (courseName: string) => {
    const name = (courseName || "").toLowerCase();
    if (name.includes("aviation"))
      return {
        headerBg: "bg-gradient-to-r from-blue-600 to-blue-500",
        lightBg: "bg-blue-50",
        borderColor: "border-blue-100",
        progressColor: "bg-blue-600",
        iconColor: "text-blue-500",
        borderTop: "#0A2463",
        accent: "blue",
      };
    if (name.includes("refresher"))
      return {
        headerBg: "bg-gradient-to-r from-green-600 to-green-500",
        lightBg: "bg-green-50",
        borderColor: "border-green-100",
        progressColor: "bg-green-600",
        iconColor: "text-green-500",
        borderTop: "#4CB944",
        accent: "green",
      };
    if (name.includes("cadet"))
      return {
        headerBg: "bg-gradient-to-r from-purple-600 to-purple-500",
        lightBg: "bg-purple-50",
        borderColor: "border-purple-100",
        progressColor: "bg-purple-600",
        iconColor: "text-purple-500",
        borderTop: "#8A4FFF",
        accent: "purple",
      };
    return {
      headerBg: "bg-gradient-to-r from-gray-600 to-gray-500",
      lightBg: "bg-gray-50",
      borderColor: "border-gray-100",
      progressColor: "bg-gray-600",
      iconColor: "text-gray-500",
      borderTop: "#718096",
      accent: "gray",
    };
  };

  // Loading state
  if (isLoadingCourse || isLoadingSchools) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col justify-center items-center h-80">
          <div className="w-16 h-16 relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
            <BookOpen className="h-6 w-6 text-blue-600 absolute inset-0 m-auto" />
          </div>
          <h3 className="text-xl font-semibold text-blue-900 mb-2">Loading Course Details</h3>
          <p className="text-blue-600">Please wait while we retrieve the course information...</p>
        </div>
      </div>
    );
  }

  // Error state - course not found
  if (!course) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Course Not Found</h2>
          <p className="text-red-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Link href="/courses">
            <Button className="bg-red-600 hover:bg-red-700">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to All Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get color scheme based on course name
  const colors = getColorScheme(course.name);

  // Dummy data for demonstration (in a real app, these would come from the API)
  const testResults = [
    { id: 1, testName: "ALCPT", testDate: "2025-02-15", score: 75, passingScore: 70, status: "Pass" },
    { id: 2, testName: "Book Test", testDate: "2025-03-10", score: 82, passingScore: 80, status: "Pass" },
    { id: 3, testName: "ALCPT", testDate: "2025-04-05", score: 68, passingScore: 70, status: "Fail" },
  ];

  const instructors = [
    { id: 1, name: "John Smith", role: "Lead Instructor" },
    { id: 2, name: "Jane Doe", role: "Assistant Instructor" },
  ];

  const schedule = [
    { day: "Monday", time: "09:00 - 12:00", topic: "Grammar Practice" },
    { day: "Tuesday", time: "09:00 - 12:00", topic: "Vocabulary Building" },
    { day: "Wednesday", time: "09:00 - 12:00", topic: "Listening Comprehension" },
    { day: "Thursday", time: "09:00 - 12:00", topic: "Speaking Practice" },
    { day: "Friday", time: "09:00 - 12:00", topic: "Written Assessments" },
  ];

  return (
    <div className="container mx-auto py-6">
      {/* Back button and print button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/courses">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
        </div>
        <PrintButton contentId="courseDetailsContent" />
      </div>

      <div id="courseDetailsContent">
        {/* Course Header */}
        <Card
          className="mb-8 overflow-hidden border-t-4 shadow-md"
          style={{ borderTopColor: colors.borderTop }}
        >
          <CardHeader className={`${colors.headerBg} pb-6 text-white`}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center">
                  <BookOpen className="h-6 w-6 mr-2" />
                  <CardTitle className="text-2xl font-bold">{course.name}</CardTitle>
                </div>
                <CardDescription className="text-white text-opacity-90 mt-1">
                  <div className="flex items-center mt-1">
                    <Building2 className="h-4 w-4 mr-1" />
                    {getSchoolName(course.schoolId)}
                  </div>
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Badge 
                  className="bg-white bg-opacity-30 text-white border-none px-3 py-1 text-sm"
                >
                  {getCourseStatus(course)}
                </Badge>
                <Badge 
                  className="bg-white bg-opacity-30 text-white border-none px-3 py-1 text-sm"
                  variant="outline"
                >
                  <GraduationCap className="h-4 w-4 mr-1" />
                  {course.studentCount} Students
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Key Information */}
              <Card className={`${colors.lightBg} border ${colors.borderColor}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Course Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <CalendarRange className={`h-4 w-4 mr-2 ${colors.iconColor}`} />
                        <span className="text-sm font-medium">Start Date:</span>
                      </div>
                      <span className="text-sm bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                        {formatDate(course.startDate)}
                      </span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <CalendarRange className={`h-4 w-4 mr-2 ${colors.iconColor}`} />
                        <span className="text-sm font-medium">End Date:</span>
                      </div>
                      <span className="text-sm bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                        {formatDate(course.endDate || "")}
                      </span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <Clock className={`h-4 w-4 mr-2 ${colors.iconColor}`} />
                        <span className="text-sm font-medium">Duration:</span>
                      </div>
                      <span className="text-sm bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                        {/* Calculate duration based on start and end dates */}
                        {course.endDate ? `${Math.ceil((new Date(course.endDate).getTime() - new Date(course.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months` : "6 months"}
                      </span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <Award className={`h-4 w-4 mr-2 ${colors.iconColor}`} />
                        <span className="text-sm font-medium">Benchmark:</span>
                      </div>
                      <span className="text-sm bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                        {course.benchmark || "Not Set"}
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className={`h-4 w-4 mr-2 ${colors.iconColor}`} />
                        <span className="text-sm font-medium">Course ID:</span>
                      </div>
                      <span className="text-sm bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                        {course.id}
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Progress */}
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Course Progress</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pb-6">
                  <div className="w-32 h-32 relative mb-4">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        className="stroke-current text-gray-200"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`stroke-current ${colors.progressColor}`}
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={`${Math.round(calculateCourseProgress(course))}, 100`}
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text
                        x="18"
                        y="20.35"
                        className="text-3xl font-bold"
                        textAnchor="middle"
                        fill={colors.borderTop}
                      >
                        {Math.round(calculateCourseProgress(course))}%
                      </text>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    {Math.round(calculateCourseProgress(course)) < 100
                      ? "Course is in progress"
                      : "Course is complete"}
                  </p>
                </CardContent>
              </Card>

              {/* Student Info */}
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Student Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-4">
                    <div className={`w-20 h-20 rounded-full ${colors.lightBg} flex items-center justify-center`}>
                      <Users className={`h-10 w-10 ${colors.iconColor}`} />
                    </div>
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-3xl">{course.studentCount}</h3>
                    <p className="text-sm text-gray-600 mt-1">Total Students</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Course Information Could Be Added Here */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
