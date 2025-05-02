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
    const archiveFilter = isArchiveView ? isArchived(course) : !isArchived(course);
    
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

  // Function to check if a course is archived (completed more than 30 days ago)
  const isArchived = (course: Course) => {
    if (course.endDate) {
      const endDate = new Date(course.endDate);
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return endDate < thirtyDaysAgo;
    }
    return false;
  };

  // Statistics for the summary cards
  const stats = {
    total: courses.length,
    inProgress: courses.filter(c => getCourseStatus(c) === 'In Progress').length,
    completed: courses.filter(c => getCourseStatus(c) === 'Completed').length,
    upcoming: courses.filter(c => getCourseStatus(c) === 'Upcoming').length,
    totalStudents: courses.reduce((acc, course) => acc + course.studentCount, 0),
    archived: courses.filter(c => isArchived(c)).length,
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
                    <p className="text-3xl font-bold">{stats.total}</p>
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
                    <p className="text-3xl font-bold">{stats.inProgress}</p>
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
                    <p className="text-3xl font-bold">{stats.totalStudents}</p>
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
                    <p className="text-3xl font-bold">{stats.completed}</p>
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
                    <p className="text-3xl font-bold">{stats.archived}</p>
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
                
                <PrintButton contentId="coursesContent" className="h-10" />
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter by School:</span>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  !selectedSchool 
                    ? "bg-blue-100 text-blue-800" 
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedSchool(null)}
              >
                All Schools
              </button>
              
              {schools.map((school: School) => (
                <button
                  key={school.id}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    selectedSchool === school.id 
                      ? school.code === "KFNA" ? "bg-blue-100 text-blue-800" 
                        : school.code === "NFS_EAST" ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedSchool(school.id)}
                >
                  <SchoolIcon className="h-3 w-3" />
                  {school.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Course Types Information */}
        <Accordion
          type="single"
          collapsible
          className="mb-6 border rounded-lg shadow-sm overflow-hidden bg-white"
          value={activeAccordion || ""}
          onValueChange={setActiveAccordion}
        >
          <AccordionItem value="course-types" className="border-0">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
              <span className="flex items-center">
                <div className="mr-3 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                  <Bookmark className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium">Course Types and Benchmarks</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="overflow-x-auto">
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
                                  <Trophy className="h-3 w-3" />
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
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* No courses message */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border shadow-sm">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-xl mb-2">No Courses Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchQuery 
                ? `No courses match your search "${searchQuery}". Try different keywords or clear the search.`
                : selectedSchool 
                  ? "There are no courses available for the selected school." 
                  : "There are no courses available in the system."}
            </p>
            {(searchQuery || selectedSchool || activeTab !== 'all') && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSchool(null);
                  setActiveTab('all');
                }}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course: Course) => {
                  const colors = getColorScheme(course.name);
                  const courseStatus = getCourseStatus(course);
                  
                  return (
                    <Card 
                      key={course.id} 
                      className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-t-4 rounded-md"
                      style={{ borderTopColor: colors.borderTop }}
                    >
                      <CardHeader className={`pb-3`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="font-bold text-lg">{course.name}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <SchoolIcon className="h-3 w-3 mr-1" />
                              {getSchoolName(course.schoolId)}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col gap-1">
                            {isArchiveView && (
                              <Badge 
                                className="bg-purple-100 text-purple-800 border-purple-200"
                                variant="outline"
                              >
                                <Archive className="h-3 w-3 mr-1" />
                                Archived
                              </Badge>
                            )}
                            <Badge 
                              className={`${getStatusBadgeClass(courseStatus)}`}
                              variant="outline"
                            >
                              {courseStatus}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className={`p-4 border-y ${colors.borderColor} ${colors.lightBg}`}>
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
                            <Trophy className={`h-4 w-4 mr-2 ${colors.iconColor}`} />
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
                            <span className="text-sm font-bold">{calculateCourseProgress(course)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${colors.progressColor}`}
                              style={{ width: `${calculateCourseProgress(course)}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <GraduationCap className="h-4 w-4 text-gray-600" />
                              </div>
                              <span className="text-sm ml-2 font-medium text-gray-700">{course.studentCount} Students</span>
                            </div>
                            <Link href={`/courses/${course.id}`}>
                              <Button 
                                className={`text-sm font-medium text-white px-3 py-1.5 rounded-md`}
                                size="sm"
                                style={{
                                  backgroundColor: colors.borderTop,
                                }}
                              >
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
            
            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Name</TableHead>
                        <TableHead>School</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Benchmark</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCourses.map((course) => {
                        const colors = getColorScheme(course.name);
                        const courseStatus = getCourseStatus(course);
                        
                        return (
                          <TableRow key={course.id}>
                            <TableCell className="font-medium">{course.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <SchoolIcon className="h-3 w-3 mr-1" />
                                {getSchoolName(course.schoolId)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <CalendarRange className={`h-4 w-4 mr-1 ${colors.iconColor}`} />
                                <span className="text-sm">
                                  {formatDate(course.startDate)} - {formatDate(course.endDate || "")}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {course.benchmark || "Not set"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1 text-gray-500" />
                                {course.studentCount}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center w-32">
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mr-2">
                                  <div 
                                    className={`h-full ${colors.progressColor}`}
                                    style={{ width: `${calculateCourseProgress(course)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium">{calculateCourseProgress(course)}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {isArchiveView && (
                                  <Badge 
                                    className="bg-purple-100 text-purple-800 border-purple-200"
                                    variant="outline"
                                  >
                                    <Archive className="h-3 w-3 mr-1" />
                                    Archived
                                  </Badge>
                                )}
                                <Badge 
                                  className={`${getStatusBadgeClass(courseStatus)}`}
                                  variant="outline"
                                >
                                  {courseStatus}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Link href={`/courses/${course.id}`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className={`${colors.iconColor} hover:${colors.lightBg}`}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                  Details
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}