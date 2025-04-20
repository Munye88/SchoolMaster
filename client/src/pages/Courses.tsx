import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getCourseStatus } from '@/utils/courseStatusHelpers';
import { Course, School } from '@shared/schema';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarRange, Clock, Award, BookOpen, GraduationCap } from "lucide-react";
import { PrintButton } from "@/components/ui/print-button";

// Course type information
const courseTypes = [
  {
    id: 1,
    name: "Aviation",
    duration: "One year",
    benchmarks: [
      { test: "ALCPT", score: "80" },
      { test: "ECL", score: "80" },
      { test: "OPI", score: "2/2" }
    ]
  },
  {
    id: 2,
    name: "Refresher",
    duration: "Six months",
    benchmarks: [
      { test: "ALCPT", score: "55" }
    ]
  },
  {
    id: 3,
    name: "MMSC",
    duration: "Six months",
    benchmarks: [
      { test: "ALCPT", score: "45" }
    ]
  },
  {
    id: 4,
    name: "Cadets",
    duration: "Three months",
    benchmarks: [
      { test: "ALCPT", score: "40" }
    ]
  }
];

export default function Courses() {
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  // Get all courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Get schools for filtering
  const { data: schools = [], isLoading: isLoadingSchools } = useQuery<School[]>({
    queryKey: ["/api/schools"],
  });

  // Filter courses by selected school
  const filteredCourses: Course[] = selectedSchool 
    ? courses.filter((course: Course) => course.schoolId === selectedSchool)
    : courses;

  // Get school name by ID
  const getSchoolName = (id: number): string => {
    const school = schools.find((s: School) => s.id === id);
    return school ? school.name : "Unknown";
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch (error) {
      return dateStr;
    }
  };

  // Get appropriate badge color based on course name
  const getBadgeColor = (courseName: string) => {
    const name = courseName.toLowerCase();
    if (name.includes("aviation")) return "bg-blue-500";
    if (name.includes("refresher")) return "bg-green-500";
    if (name.includes("mmsc")) return "bg-amber-500";
    if (name.includes("cadet")) return "bg-purple-500";
    return "bg-gray-500";
  };

  if (isLoadingCourses || isLoadingSchools) {
    return (
      <div id="coursesContent" className="container mx-auto py-6">
        <div className="flex flex-col justify-center items-center h-80">
          <div className="w-16 h-16 relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
            <BookOpen className="h-6 w-6 text-blue-600 absolute inset-0 m-auto" />
          </div>
          <h3 className="text-xl font-semibold text-blue-900 mb-2">Loading Courses</h3>
          <p className="text-blue-600">Please wait while we retrieve course information...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="coursesContent" className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0A2463] to-blue-600 bg-clip-text text-transparent mb-4">
          Course Programs
        </h1>
        <p className="text-gray-600 mb-6">
          Explore our comprehensive ELT programs across all schools
        </p>
        
        {/* Navigation and Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 p-1 bg-blue-50 rounded-lg border border-blue-100 w-full md:w-auto">
            <button 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                !selectedSchool 
                  ? "bg-white text-blue-700 shadow-sm" 
                  : "text-gray-600 hover:text-blue-700 hover:bg-blue-100"
              }`}
              onClick={() => setSelectedSchool(null)}
            >
              All Schools
            </button>
            
            {schools.map((school: School) => (
              <button
                key={school.id}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedSchool === school.id 
                    ? "bg-white text-blue-700 shadow-sm" 
                    : "text-gray-600 hover:text-blue-700 hover:bg-blue-100"
                }`}
                onClick={() => setSelectedSchool(school.id)}
              >
                {school.name}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <PrintButton contentId="coursesContent" />
            <div className="relative w-full md:w-64">
              <input 
                type="text" 
                placeholder="Search courses..." 
                className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
            </div>
          </div>
        </div>
        
        {/* Course Types Information */}
        <Accordion
          type="single"
          collapsible
          className="mb-8 border border-blue-100 rounded-lg shadow-sm overflow-hidden bg-white"
          value={activeAccordion || ""}
          onValueChange={setActiveAccordion}
        >
          <AccordionItem value="course-types">
            <AccordionTrigger className="px-4 py-3 bg-blue-50 hover:bg-blue-100">
              <span className="flex items-center">
                <div className="mr-3 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium text-blue-900">Course Types and Benchmarks</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Benchmarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          {type.duration}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {type.benchmarks.map((benchmark, index) => {
                            // Colorful badges based on test type
                            const getTestColor = (test: string) => {
                              switch(test.toLowerCase()) {
                                case 'alcpt': return 'bg-blue-100 text-blue-700 border-blue-200';
                                case 'ecl': return 'bg-amber-100 text-amber-700 border-amber-200';
                                case 'opi': return 'bg-purple-100 text-purple-700 border-purple-200';
                                default: return 'bg-gray-100 text-gray-700 border-gray-200';
                              }
                            };
                            
                            return (
                              <Badge 
                                key={index} 
                                className={`flex items-center gap-1 px-3 py-1 ${getTestColor(benchmark.test)}`}
                                variant="outline"
                              >
                                <Award className="h-3 w-3" />
                                <span className="font-medium">{benchmark.test}:</span> {benchmark.score}
                              </Badge>
                            );
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      {/* Course Cards */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-lg border border-blue-100">
          <BookOpen className="h-12 w-12 text-blue-300 mx-auto mb-4" />
          <h3 className="font-semibold text-xl mb-2 text-blue-800">No Courses Found</h3>
          <p className="text-blue-600">
            {selectedSchool 
              ? "There are no courses available for the selected school." 
              : "There are no courses available in the system."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course: Course) => {
            // Get color scheme based on course name
            const getColorScheme = (courseName: string) => {
              const name = courseName.toLowerCase();
              if (name.includes("aviation")) 
                return {
                  headerBg: "bg-gradient-to-r from-blue-600 to-blue-500",
                  lightBg: "bg-blue-50",
                  borderColor: "border-blue-100",
                  progressColor: "bg-blue-600",
                  iconColor: "text-blue-500",
                };
              if (name.includes("refresher")) 
                return {
                  headerBg: "bg-gradient-to-r from-green-600 to-green-500",
                  lightBg: "bg-green-50",
                  borderColor: "border-green-100",
                  progressColor: "bg-green-600",
                  iconColor: "text-green-500",
                };
              if (name.includes("mmsc")) 
                return {
                  headerBg: "bg-gradient-to-r from-amber-600 to-amber-500",
                  lightBg: "bg-amber-50",
                  borderColor: "border-amber-100",
                  progressColor: "bg-amber-600",
                  iconColor: "text-amber-500",
                };
              if (name.includes("cadet")) 
                return {
                  headerBg: "bg-gradient-to-r from-purple-600 to-purple-500",
                  lightBg: "bg-purple-50",
                  borderColor: "border-purple-100",
                  progressColor: "bg-purple-600",
                  iconColor: "text-purple-500",
                };
              return {
                headerBg: "bg-gradient-to-r from-gray-600 to-gray-500",
                lightBg: "bg-gray-50",
                borderColor: "border-gray-100",
                progressColor: "bg-gray-600",
                iconColor: "text-gray-500",
              };
            };
            
            const colors = getColorScheme(course.name);
            
            return (
              <Card 
                key={course.id} 
                className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border-t-4 rounded-md"
                style={{ borderTopColor: colors.headerBg.includes("blue") ? "#0A2463" : 
                         colors.headerBg.includes("green") ? "#4CB944" : 
                         colors.headerBg.includes("amber") ? "#FF8811" : 
                         colors.headerBg.includes("purple") ? "#8A4FFF" : "#718096" }}
              >
                <CardHeader className={`${colors.headerBg} pb-4 text-white`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-bold">{course.name}</CardTitle>
                      <CardDescription className="text-white text-opacity-90 mt-1">
                        {getSchoolName(course.schoolId)}
                      </CardDescription>
                    </div>
                    <Badge 
                      className="bg-white bg-opacity-30 text-white font-medium border-none"
                    >
                      {course.status === "In Progress" ? "In Progress" : getCourseStatus(course)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className={`${colors.lightBg} p-4 border-b ${colors.borderColor}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-gray-700">
                      <CalendarRange className={`h-4 w-4 mr-2 ${colors.iconColor}`} />
                      <span className="text-sm font-medium">Period:</span>
                    </div>
                    <span className="text-sm bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                      {formatDate(course.startDate)} - {formatDate(course.endDate || "")}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-gray-700">
                      <Award className={`h-4 w-4 mr-2 ${colors.iconColor}`} />
                      <span className="text-sm font-medium">Benchmark:</span>
                    </div>
                    <span className="text-sm font-medium px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
                      {course.benchmark || "Not set"}
                    </span>
                  </div>
                </CardContent>
                
                <CardFooter className="px-4 py-3 bg-white">
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Course Progress</span>
                      <span className="text-sm font-bold">{course.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors.progressColor}`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="text-sm ml-2 font-medium text-gray-700">{course.studentCount} Students</span>
                      </div>
                      <button className={`text-sm font-medium text-white px-3 py-1.5 rounded-md ${colors.headerBg} shadow-sm`}>
                        View Details
                      </button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}