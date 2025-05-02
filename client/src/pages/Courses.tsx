import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getCourseStatus, calculateCourseProgress } from '@/utils/courseStatusHelpers';
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
import { 
  CalendarRange, 
  Clock, 
  Award, 
  BookOpen, 
  GraduationCap, 
  Search, 
  Filter, 
  CheckCircle2, 
  Timer, 
  Users, 
  School as SchoolIcon,
  LayoutGrid,
  LayoutList,
  ChevronRight,
  Bookmark,
  Calendar,
  Trophy,
  Archive,
  CalendarDays,
  UserCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/ui/print-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      { test: "ALCPT", score: "70" },
      { test: "ALCPT", score: "55" },
      { test: "ALCPT", score: "50" }
    ]
  },
  {
    id: 3,
    name: "Cadets",
    duration: "Three months",
    benchmarks: [
      { test: "ALCPT", score: "40" }
    ]
  }
];

// Function to check if a course is archived (completed more than 30 days ago)
const checkIfArchived = (course: Course) => {
  // First check the course status - only completed courses can be archived
  const status = getCourseStatus(course);
  if (status !== 'Completed') return false;
  
  // Then check if it's been more than 30 days since completion
  if (course.endDate) {
    const endDate = new Date(course.endDate);
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return endDate < thirtyDaysAgo;
  }
  return false;
};

export default function Courses() {
  const [selectedSchool, setSelectedSchool] = useState<number | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isArchiveView, setIsArchiveView] = useState<boolean>(false);

  // Get all courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Get schools for filtering
  const { data: schools = [], isLoading: isLoadingSchools } = useQuery<School[]>({
    queryKey: ["/api/schools"],
  });

  // Get school name by ID
  const getSchoolName = (id: number): string => {
    const school = schools.find((s: School) => s.id === id);
    return school ? school.name : "Unknown";
  };

  // Get school code by ID
  const getSchoolCode = (id: number): string => {
    const school = schools.find((s: School) => s.id === id);
    return school ? school.code : "";
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
  const getStatusBadgeClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'in progress': return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter courses by selected criteria
  const filteredCourses = courses.filter((course: Course) => {
    // Filter by school
    const schoolFilter = selectedSchool ? course.schoolId === selectedSchool : true;
    
    // Filter by search query
    const searchFilter = searchQuery 
      ? course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getSchoolName(course.schoolId).toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    // Filter based on whether we're in archive view
    const archiveFilter = isArchiveView ? checkIfArchived(course) : !checkIfArchived(course);
    
    // Filter by status tab - only applies when not in archive view
    let statusFilter = true;
    if (!isArchiveView) {
      if (activeTab === 'inProgress') {
        statusFilter = getCourseStatus(course) === 'In Progress';
      } else if (activeTab === 'upcoming') {
        statusFilter = getCourseStatus(course) === 'Upcoming';
      } else if (activeTab === 'completed') {
        statusFilter = getCourseStatus(course) === 'Completed';
      }
    }
    
    return schoolFilter && searchFilter && statusFilter && archiveFilter;
  });

  // Statistics for the summary cards
  const stats = {
    total: courses.length,
    inProgress: courses.filter(c => getCourseStatus(c) === 'In Progress').length,
    completed: courses.filter(c => getCourseStatus(c) === 'Completed').length,
    upcoming: courses.filter(c => getCourseStatus(c) === 'Upcoming').length,
    totalStudents: courses.reduce((acc, course) => acc + course.studentCount, 0),
    archived: courses.filter(c => checkIfArchived(c)).length,
  };

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
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0A2463] to-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Course Programs</h1>
          <p className="text-blue-100 text-lg">
            Explore our comprehensive ELT programs across all schools
          </p>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
            <Card className="bg-white/10 backdrop-blur border-none shadow-lg">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-blue-200">Total Courses</p>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur border-none shadow-lg">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-blue-200">Active Courses</p>
                    <p className="text-3xl font-bold text-white">{stats.inProgress}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Timer className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur border-none shadow-lg">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-blue-200">Total Students</p>
                    <p className="text-3xl font-bold text-white">{stats.totalStudents}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur border-none shadow-lg">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-blue-200">Completed Courses</p>
                    <p className="text-3xl font-bold text-white">{stats.completed}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur border-none shadow-lg">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-blue-200">Archived Courses</p>
                    <p className="text-3xl font-bold text-white">{stats.archived}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Archive className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div id="coursesContent" className="container mx-auto py-6 px-4">
        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-gray-800">{isArchiveView ? "Course Archive" : "Courses"}</h2>
                <div className="flex gap-2">
                  <Button 
                    variant={isArchiveView ? "outline" : "default"} 
                    size="sm"
                    onClick={() => setIsArchiveView(false)}
                    className={!isArchiveView ? "bg-blue-600" : ""}
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    Current Courses
                  </Button>
                  <Button 
                    variant={isArchiveView ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setIsArchiveView(true)}
                    className={isArchiveView ? "bg-purple-600" : ""}
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </Button>
                </div>
              </div>
              
              {!isArchiveView && (
                <Tabs value={activeTab} onValueChange={setActiveTab as (value: string) => void} className="w-full">
                  <TabsList className="bg-gray-100">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white">
                      All Courses
                    </TabsTrigger>
                    <TabsTrigger value="inProgress" className="data-[state=active]:bg-white">
                      <Timer className="h-4 w-4 mr-1" />
                      In Progress
                    </TabsTrigger>
                    <TabsTrigger value="upcoming" className="data-[state=active]:bg-white">
                      <Calendar className="h-4 w-4 mr-1" />
                      Upcoming
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-white">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Completed
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-10 w-full sm:w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              
              <div className="flex gap-2">
                <div className="bg-gray-100 rounded-md flex p-1">
                  <button 
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid View"
                  >
                    <LayoutGrid className="h-4 w-4 text-gray-600" />
                  </button>
                  <button 
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List View"
                  >
                    <LayoutList className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                
                <select 
                  className="bg-gray-100 border-none rounded-md px-3 text-sm text-gray-600 h-10 focus:ring-2 focus:ring-blue-500"
                  value={selectedSchool || ''}
                  onChange={(e) => setSelectedSchool(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">All Schools</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Course Display - Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length === 0 ? (
              <div className="col-span-3 py-10 text-center">
                <div className="inline-block p-3 rounded-full bg-gray-100 mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{isArchiveView ? "No archived courses found" : "No courses found"}</h3>
                <p className="text-gray-500">{isArchiveView ? "There are no courses that have been completed more than 30 days ago." : "Try adjusting your filters or search criteria."}</p>
              </div>
            ) : (
              filteredCourses.map((course) => {
                const colorScheme = getColorScheme(course.name);
                const progress = calculateCourseProgress(course);
                const status = getCourseStatus(course);
                const isCoursePastArchiveDate = checkIfArchived(course);
                
                return (
                  <Link key={course.id} href={`/courses/${course.id}`}>
                    <Card 
                      className={`overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer ${colorScheme.lightBg} border-0 shadow relative`}
                      style={{ borderTop: `3px solid ${colorScheme.borderTop}` }}
                    >
                      {isCoursePastArchiveDate && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 font-medium flex items-center gap-1">
                            <Archive className="h-3 w-3" />
                            Archived
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className={`${colorScheme.headerBg} text-white pb-4 pt-6`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2 mb-1">
                              {course.name}
                              <Badge variant="outline" className={getStatusBadgeClass(status)}>
                                {status}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="text-white/80 flex items-center gap-1">
                              <SchoolIcon className="h-3.5 w-3.5" />
                              {getSchoolName(course.schoolId)}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <CalendarRange className="h-4 w-4" />
                              {formatDate(course.startDate)} - {formatDate(course.endDate || '')}
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Users className="h-4 w-4" />
                              {course.studentCount} students
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm font-medium">
                              <span>Progress</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`${colorScheme.progressColor} h-2.5 rounded-full`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Award className="h-4 w-4" />
                            <span>Benchmark: {course.benchmark || 'Not specified'}</span>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="bg-white p-4 border-t flex justify-end">
                        <Button variant="ghost" size="sm" className={`${colorScheme.iconColor} flex gap-1 items-center`}>
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
        )}

        {/* Course Display - List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg border shadow overflow-hidden">
            {filteredCourses.length === 0 ? (
              <div className="py-10 text-center">
                <div className="inline-block p-3 rounded-full bg-gray-100 mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{isArchiveView ? "No archived courses found" : "No courses found"}</h3>
                <p className="text-gray-500">{isArchiveView ? "There are no courses that have been completed more than 30 days ago." : "Try adjusting your filters or search criteria."}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Course Name</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => {
                      const status = getCourseStatus(course);
                      const progress = calculateCourseProgress(course);
                      const colorScheme = getColorScheme(course.name);
                      const isCoursePastArchiveDate = checkIfArchived(course);
                      
                      return (
                        <TableRow key={course.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium flex items-center gap-2">
                            <div className={`w-2 h-5 rounded-sm ${colorScheme.iconColor.replace('text', 'bg')}`}></div>
                            {course.name}
                            {isCoursePastArchiveDate && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 font-medium ml-2 flex items-center gap-1">
                                <Archive className="h-3 w-3" />
                                Archived
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <SchoolIcon className="h-4 w-4 text-gray-500" />
                              {getSchoolName(course.schoolId)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeClass(status)}>
                              {status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(course.startDate)} - {formatDate(course.endDate || '')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span>{course.studentCount}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 w-24">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`${colorScheme.progressColor} h-2 rounded-full`}
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600 font-medium whitespace-nowrap">{Math.round(progress)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link href={`/courses/${course.id}`} className="inline-block">
                              <Button variant="ghost" size="sm" className={`${colorScheme.iconColor} flex gap-1 items-center`}>
                                View
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* Course Type Information Section */}
        <Accordion type="single" collapsible className="mt-8">
          <AccordionItem value="course-types" className="border px-4 rounded-md bg-white">
            <AccordionTrigger className="py-4">
              <h3 className="text-lg font-medium flex items-center">
                <Bookmark className="mr-2 h-5 w-5 text-blue-600" />
                Course Type Information
              </h3>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                {courseTypes.map((type) => (
                  <div key={type.id} className="border rounded-md p-4 bg-gray-50">
                    <h4 className="text-md font-semibold mb-2 flex items-center">
                      <GraduationCap className="mr-2 h-4 w-4 text-blue-600" />
                      {type.name} Course
                    </h4>
                    <div className="text-sm text-gray-600 mb-3">
                      <p><span className="font-medium">Duration:</span> {type.duration}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold mb-2 flex items-center">
                        <Trophy className="mr-1 h-3.5 w-3.5 text-amber-500" />
                        Benchmarks
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {type.benchmarks.map((benchmark, idx) => (
                          <div key={idx} className="flex items-center bg-white p-2 rounded border">
                            <div className={`w-1.5 h-5 rounded-sm ${benchmark.test === 'ALCPT' ? 'bg-blue-500' : benchmark.test === 'ECL' ? 'bg-purple-500' : 'bg-amber-500'}`}></div>
                            <span className="ml-2 flex-1 text-gray-700 text-sm">{benchmark.test}</span>
                            <Badge variant="outline" className="ml-auto">
                              {benchmark.score}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* Print Button */}
        <div className="flex justify-end mt-6">
          <PrintButton contentId="coursesContent" buttonText="Print Course List" />
        </div>
      </div>
    </div>
  );
}