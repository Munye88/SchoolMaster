import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
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
import { CalendarRange, Clock, Award, BookOpen } from "lucide-react";

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
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/courses"],
  });

  // Get schools for filtering
  const { data: schools = [], isLoading: isLoadingSchools } = useQuery({
    queryKey: ["/api/schools"],
  });

  // Filter courses by selected school
  const filteredCourses = selectedSchool 
    ? courses.filter(course => course.schoolId === selectedSchool)
    : courses;

  // Get school name by ID
  const getSchoolName = (id: number) => {
    const school = schools.find(s => s.id === id);
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
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Courses</h1>
        <p className="text-muted-foreground mb-6">
          View current and upcoming courses information for all schools
        </p>
        
        {/* School Filter */}
        <div className="flex items-center gap-2 mb-4">
          <label className="font-medium">Filter by School:</label>
          <select 
            className="p-2 border rounded-md"
            value={selectedSchool || ""}
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
        
        {/* Course Types Information */}
        <Accordion
          type="single"
          collapsible
          className="mb-8 border rounded-md"
          value={activeAccordion || ""}
          onValueChange={setActiveAccordion}
        >
          <AccordionItem value="course-types">
            <AccordionTrigger className="px-4 py-2">
              <span className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Course Types and Benchmarks
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
                          {type.benchmarks.map((benchmark, index) => (
                            <Badge 
                              key={index} 
                              className="flex items-center gap-1"
                              variant="outline"
                            >
                              <Award className="h-3 w-3" />
                              {benchmark.test}: {benchmark.score}
                            </Badge>
                          ))}
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
        <div className="text-center py-12 bg-muted rounded-lg">
          <h3 className="font-semibold text-xl mb-2">No Courses Found</h3>
          <p className="text-muted-foreground">
            {selectedSchool 
              ? "There are no courses available for the selected school." 
              : "There are no courses available in the system."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{course.name}</CardTitle>
                    <CardDescription>
                      {getSchoolName(course.schoolId)}
                    </CardDescription>
                  </div>
                  <Badge 
                    className={getBadgeColor(course.name)}
                    variant="secondary"
                  >
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CalendarRange className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">Start Date:</span>
                    <span className="ml-2 text-sm">{formatDate(course.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <CalendarRange className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">End Date:</span>
                    <span className="ml-2 text-sm">{formatDate(course.endDate || "")}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">Benchmark:</span>
                    <span className="ml-2 text-sm">{course.benchmark || "Not specified"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-3">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center">
                    <span className="text-xs font-medium mr-2">Progress:</span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className="text-xs ml-2">{course.progress}%</span>
                  </div>
                  <span className="text-xs">{course.studentCount} Students</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}