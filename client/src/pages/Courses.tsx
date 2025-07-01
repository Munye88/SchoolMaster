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
  if (course.status !== 'Completed') return false;
  
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

  // Add debugging for all courses
  console.log("---------- ALL COURSES STATUS & ARCHIVE STATE ----------");
  courses.forEach(course => {
    const isArchived = checkIfArchived(course);
    console.log(`Course ${course.name} (ID: ${course.id}): Status=${course.status}, Archived=${isArchived}`);
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
    
    // If we're on the completed tab, ignore archive status
    const isCompletedTab = activeTab === 'completed';
    
    // Filter based on whether we're in archive view
    // But if on completed tab, don't apply the archive filter
    const archiveFilter = isCompletedTab ? true : (isArchiveView ? checkIfArchived(course) : !checkIfArchived(course));
    
    // Filter by status tab - only applies when not in archive view
    let statusFilter = true;
    if (!isArchiveView) {
      if (activeTab === 'inProgress') {
        statusFilter = course.status === 'In Progress';
      } else if (activeTab === 'upcoming') {
        statusFilter = course.status === 'Starting Soon';
      } else if (activeTab === 'completed') {
        statusFilter = course.status === 'Completed';
      }
    }
    
    return schoolFilter && searchFilter && statusFilter && archiveFilter;
  });

  // Statistics for the summary cards
  const stats = {
    total: courses.length,
    inProgress: courses.filter(c => c.status === 'In Progress').length,
    completed: courses.filter(c => c.status === 'Completed').length,
    upcoming: courses.filter(c => c.status === 'Starting Soon').length,
    // Only count students from active "In Progress" courses
    totalStudents: courses
      .filter(c => c.status === 'In Progress')
      .reduce((acc, course) => acc + course.studentCount, 0),
    archived: courses.filter(c => checkIfArchived(c)).length,
  };

  // Get color scheme based on course name and school
  const getColorScheme = (courseName: string, schoolId?: number) => {
    // School-based color schemes
    if (schoolId) {
      const schoolCode = getSchoolCode(schoolId);
      
      // KFNA: Red theme
      if (schoolCode === 'KFNA') {
        return {
          headerBg: "bg-gradient-to-r from-red-700 to-red-500",
          lightBg: "bg-red-50",
          borderColor: "border-red-100",
          progressColor: "bg-red-600",
          iconColor: "text-red-500",
          borderTop: "#E4424D",
          accent: "red",
        };
      }
      
      // NFS East: Green theme
      if (schoolCode === 'NFS_EAST') {
        return {
          headerBg: "bg-gradient-to-r from-emerald-700 to-emerald-500",
          lightBg: "bg-emerald-50",
          borderColor: "border-emerald-100",
          progressColor: "bg-emerald-600",
          iconColor: "text-emerald-500",
          borderTop: "#22A783",
          accent: "emerald",
        };
      }
      
      // NFS West: Purple theme
      if (schoolCode === 'NFS_WEST') {
        return {
          headerBg: "bg-gradient-to-r from-violet-700 to-violet-500",
          lightBg: "bg-violet-50",
          borderColor: "border-violet-100",
          progressColor: "bg-violet-600",
          iconColor: "text-violet-500",
          borderTop: "#6247AA",
          accent: "violet",
        };
      }
    }
    
    // Fall back to course-based color schemes if no school or unrecognized school
    const name = courseName.toLowerCase();
    if (name.includes("aviation")) 
      return {
        headerBg: "bg-gradient-to-r from-blue-700 to-blue-500",
        lightBg: "bg-blue-50",
        borderColor: "border-blue-100",
        progressColor: "bg-blue-600",
        iconColor: "text-blue-500",
        borderTop: "#0A2463",
        accent: "blue",
      };
    if (name.includes("refresher")) 
      return {
        headerBg: "bg-gradient-to-r from-green-700 to-green-500",
        lightBg: "bg-green-50",
        borderColor: "border-green-100",
        progressColor: "bg-green-600",
        iconColor: "text-green-500",
        borderTop: "#4CB944",
        accent: "green",
      };
    if (name.includes("cadet")) 
      return {
        headerBg: "bg-gradient-to-r from-purple-700 to-purple-500",
        lightBg: "bg-purple-50",
        borderColor: "border-purple-100",
        progressColor: "bg-purple-600",
        iconColor: "text-purple-500",
        borderTop: "#8A4FFF",
        accent: "purple",
      };
    return {
      headerBg: "bg-gradient-to-r from-gray-700 to-gray-500",
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
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-gray-800 text-2xl font-bold mb-2">Course Programs</h1>
          <p className="text-gray-600 text-lg">
            Explore our comprehensive ELT programs across all schools
          </p>
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
            <Card className="bg-blue-50 border-none shadow-md">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Courses</p>
                    <p className="text-3xl font-bold text-blue-800">{stats.total}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-none shadow-md">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-green-700">Active Courses</p>
                    <p className="text-3xl font-bold text-green-800">{stats.inProgress}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Timer className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-amber-50 border-none shadow-md">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Total Students</p>
                    <p className="text-3xl font-bold text-amber-800">{stats.totalStudents}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-indigo-50 border-none shadow-md">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-indigo-700">Completed Courses</p>
                    <p className="text-3xl font-bold text-indigo-800">{stats.completed}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-none shadow-md">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Archived Courses</p>
                    <p className="text-3xl font-bold text-purple-800">{stats.archived}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Archive className="h-6 w-6 text-purple-600" />
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
                const colorScheme = getColorScheme(course.name, course.schoolId);
                const progress = calculateCourseProgress(course);
                const status = getCourseStatus(course);
                const isCoursePastArchiveDate = checkIfArchived(course);
                
                return (
                  <Link key={course.id} href={`/courses/${course.id}`}>
                    <Card 
                      className={`overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer ${colorScheme.lightBg} border-0 shadow relative rounded-none`}
                      style={{ borderTop: `3px solid ${colorScheme.borderTop}` }}
                    >
                      {isCoursePastArchiveDate && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 font-medium flex items-center gap-1 rounded-none">
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
                              <Badge variant="outline" className={`${getStatusBadgeClass(status)} rounded-none`}>
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
                            <div className="w-full bg-gray-200 rounded-none h-2.5">
                              <div 
                                className={`${colorScheme.progressColor} h-2.5 rounded-none`}
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
                        <Button variant="ghost" size="sm" className={`${colorScheme.iconColor} flex gap-1 items-center rounded-none`}>
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
          <div className="bg-white rounded-none shadow overflow-hidden">
            {filteredCourses.length === 0 ? (
              <div className="py-10 text-center">
                <div className="inline-block p-3 rounded-full bg-gray-100 mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{isArchiveView ? "No archived courses found" : "No courses found"}</h3>
                <p className="text-gray-500">{isArchiveView ? "There are no courses that have been completed more than 30 days ago." : "Try adjusting your filters or search criteria."}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Course Name</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Benchmark</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => {
                    const colorScheme = getColorScheme(course.name, course.schoolId);
                    const progress = calculateCourseProgress(course);
                    const status = getCourseStatus(course);
                    const isCoursePastArchiveDate = checkIfArchived(course);
                    
                    return (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div className="font-medium flex items-center gap-2">
                            {course.name}
                            {isCoursePastArchiveDate && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 font-medium flex items-center gap-1 text-xs rounded-none">
                                <Archive className="h-2.5 w-2.5" />
                                Archived
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <SchoolIcon className="h-3.5 w-3.5 text-gray-500" />
                            {getSchoolName(course.schoolId)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeClass(status)}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(course.startDate)} - {formatDate(course.endDate || '')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-gray-500" />
                            <span>{course.studentCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-24">
                            <div className="text-xs mb-1 text-right">{Math.round(progress)}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`${colorScheme.progressColor} h-1.5 rounded-full`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{course.benchmark || 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/courses/${course.id}`}>
                            <Button variant="ghost" size="sm" className={`${colorScheme.iconColor} flex gap-1 items-center`}>
                              Details
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        )}
        
        {/* Course Types Information */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 overflow-hidden">
          <Accordion type="single" collapsible>
            <AccordionItem value="courseTypes">
              <AccordionTrigger className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-blue-600" />
                Course Types and Benchmarks
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                {courseTypes.map((type) => (
                  <div key={type.id} className="mb-6 last:mb-0">
                    <div className="flex gap-2 items-center mb-3">
                      <GraduationCap className={`h-5 w-5 ${type.name === 'Aviation' ? 'text-blue-600' : type.name === 'Refresher' ? 'text-green-600' : 'text-purple-600'}`} />
                      <h3 className="text-lg font-medium">{type.name}</h3>
                      <span className="text-sm text-gray-500">({type.duration})</span>
                    </div>
                    
                    <div className="pl-7">
                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        Benchmarks:
                      </p>
                      <ul className="space-y-1 text-sm">
                        {type.benchmarks.map((benchmark, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="inline-block w-16 font-medium">{benchmark.test}:</span>
                            <span>{benchmark.score}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        {/* Print Button for Courses Report */}
        <div className="mt-4 text-right">
          <PrintButton contentId="coursesContent" buttonText="Print Courses Report" />
        </div>
      </div>
    </div>
  );
}
