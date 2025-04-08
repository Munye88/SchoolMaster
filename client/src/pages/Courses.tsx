import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Course, Instructor, School } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Plus, CalendarDays, Users, Clock } from "lucide-react";
import { useSchool } from "@/hooks/useSchool";
import CourseCard from "@/components/dashboard/CourseCard";
import CourseForm from "@/components/courses/CourseForm";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Courses = () => {
  const { selectedSchool, currentSchool } = useSchool();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch courses based on selected school
  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: selectedSchool 
      ? ['/api/schools', currentSchool?.id, 'courses'] 
      : ['/api/courses'],
    enabled: !selectedSchool || !!currentSchool?.id,
  });
  
  // Fetch all instructors for reference
  const { data: instructors = [] } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
  });
  
  // Fetch all schools for reference
  const { data: schools = [] } = useQuery<School[]>({
    queryKey: ['/api/schools'],
  });
  
  // Filter courses based on search query
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get instructor name by ID
  const getInstructorName = (instructorId: number) => {
    const instructor = instructors.find(i => i.id === instructorId);
    return instructor?.name || 'Unknown';
  };
  
  // Get school name by ID
  const getSchoolName = (schoolId: number) => {
    const school = schools.find(s => s.id === schoolId);
    return school?.name || 'Unknown';
  };
  
  // Format date helper
  const formatDate = (date: Date | string) => {
    return format(new Date(date), "MMM dd, yyyy");
  };
  
  // Group courses by status
  const inProgressCourses = filteredCourses.filter(course => course.status === "In Progress");
  const startingSoonCourses = filteredCourses.filter(course => course.status === "Starting Soon");
  const completedCourses = filteredCourses.filter(course => course.status === "Completed");
  const notStartedCourses = filteredCourses.filter(course => course.status === "Not Started");

  return (
    <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {selectedSchool && currentSchool 
              ? `${currentSchool.name} Courses` 
              : 'All Courses'}
          </h1>
          <p className="text-gray-500 mt-1">Manage and monitor all training courses</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search courses..." 
              className="pl-9 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0A2463] hover:bg-[#071A4A]">
                <Plus className="mr-2 h-4 w-4" /> Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
              </DialogHeader>
              <CourseForm onSuccess={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="grid" className="mb-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center text-sm text-gray-500">
            <span>Total: {filteredCourses.length} courses</span>
          </div>
        </div>
        
        <TabsContent value="grid" className="mt-6">
          {coursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-[250px]" />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-gray-100 p-3 mb-4">
                  <CalendarDays className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium">No courses found</h3>
                <p className="text-sm text-gray-500 mt-1 text-center max-w-md">
                  {searchQuery 
                    ? "No courses match your search criteria. Try a different search term." 
                    : "There are no courses available at the moment. Add a new course to get started."}
                </p>
                <Button 
                  onClick={() => setIsFormOpen(true)} 
                  className="mt-4 bg-[#0A2463] hover:bg-[#071A4A]"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Course
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {inProgressCourses.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold text-[#0A2463] mb-4">In Progress</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {inProgressCourses.map(course => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                </>
              )}
              
              {startingSoonCourses.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold text-[#0A2463] mb-4">Starting Soon</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {startingSoonCourses.map(course => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                </>
              )}
              
              {notStartedCourses.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold text-[#0A2463] mb-4">Not Started</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {notStartedCourses.map(course => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                </>
              )}
              
              {completedCourses.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold text-[#0A2463] mb-4">Completed</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedCourses.map(course => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="list" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Benchmark</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coursesLoading ? (
                    [1, 2, 3, 4, 5].map(i => (
                      <TableRow key={i}>
                        <TableCell colSpan={9}>
                          <Skeleton className="h-10 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <p className="text-gray-500">
                          {searchQuery 
                            ? "No courses match your search criteria." 
                            : "No courses available."}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map(course => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell>{getSchoolName(course.schoolId)}</TableCell>
                        <TableCell>{getInstructorName(course.instructorId)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-400" />
                            {course.studentCount}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(course.startDate)}</TableCell>
                        <TableCell>{course.endDate ? formatDate(course.endDate) : 'TBD'}</TableCell>
                        <TableCell>{course.benchmark || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            course.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                            course.status === "Starting Soon" ? "bg-yellow-100 text-yellow-800" :
                            course.status === "Completed" ? "bg-green-100 text-green-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {course.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-100 rounded-full h-2 max-w-[100px]">
                            <div 
                              className="bg-[#3E92CC] h-2 rounded-full" 
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{course.progress}%</span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Courses;
