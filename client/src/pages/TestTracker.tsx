import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Upload, Download, Filter, BarChart2 } from "lucide-react";
import { useSchool } from "@/hooks/useSchool";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Mock data for test results
interface TestResult {
  id: number;
  studentName: string;
  courseName: string;
  testDate: Date;
  score: number;
  passingScore: number;
  type: string;
  status: "Pass" | "Fail";
  schoolId: number;
}

const TestTracker = () => {
  const { selectedSchool, currentSchool } = useSchool();
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [testTypeFilter, setTestTypeFilter] = useState("all");
  
  // Mock test results
  const mockTestResults: TestResult[] = [
    {
      id: 1,
      studentName: "Ahmed Al-Farsi",
      courseName: "Aviation",
      testDate: new Date("2024-03-15"),
      score: 85,
      passingScore: 70,
      type: "Written",
      status: "Pass",
      schoolId: 1
    },
    {
      id: 2,
      studentName: "Mohammed Al-Qahtani",
      courseName: "Language Training",
      testDate: new Date("2024-03-10"),
      score: 92,
      passingScore: 80,
      type: "Oral",
      status: "Pass",
      schoolId: 1
    },
    {
      id: 3,
      studentName: "Khalid Al-Otaibi",
      courseName: "Technical Training",
      testDate: new Date("2024-02-28"),
      score: 65,
      passingScore: 75,
      type: "Practical",
      status: "Fail",
      schoolId: 2
    },
    {
      id: 4,
      studentName: "Abdullah Al-Shehri",
      courseName: "Aviation",
      testDate: new Date("2024-03-05"),
      score: 78,
      passingScore: 70,
      type: "Written",
      status: "Pass",
      schoolId: 2
    },
    {
      id: 5,
      studentName: "Saud Al-Saud",
      courseName: "Technical Training",
      testDate: new Date("2024-02-20"),
      score: 88,
      passingScore: 75,
      type: "Practical",
      status: "Pass",
      schoolId: 3
    },
    {
      id: 6,
      studentName: "Faisal Al-Shamari",
      courseName: "Language Training",
      testDate: new Date("2024-03-12"),
      score: 72,
      passingScore: 80,
      type: "Oral",
      status: "Fail",
      schoolId: 3
    }
  ];
  
  // Filter test results
  const filteredTestResults = mockTestResults.filter(result => 
    (selectedSchool ? result.schoolId === currentSchool?.id : true) &&
    (courseFilter === "all" || result.courseName === courseFilter) &&
    (testTypeFilter === "all" || result.type === testTypeFilter) &&
    (result.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
     result.courseName.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Calculate passing rate
  const passingRate = filteredTestResults.length > 0
    ? Math.round((filteredTestResults.filter(r => r.status === "Pass").length / filteredTestResults.length) * 100)
    : 0;
  
  // Get unique courses and test types for filters
  const uniqueCourses = Array.from(new Set(mockTestResults.map(r => r.courseName)));
  const uniqueTestTypes = Array.from(new Set(mockTestResults.map(r => r.type)));
  
  // Format date helper
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Handle Excel import
  const handleImportExcel = () => {
    // This would be implemented with Excel import functionality
    alert("Excel import functionality would be implemented here using ExcelJS.");
  };

  return (
    <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {selectedSchool && currentSchool 
              ? `${currentSchool.name} Test Tracker` 
              : 'Test Tracker'}
          </h1>
          <p className="text-gray-500 mt-1">Monitor student performance and test results</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={handleImportExcel}
            className="flex-1 sm:flex-none"
          >
            <Upload className="mr-2 h-4 w-4" /> Import Excel
          </Button>
          
          <Button className="bg-[#0A2463] hover:bg-[#071A4A] flex-1 sm:flex-none">
            <BarChart2 className="mr-2 h-4 w-4" /> View Analysis
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTestResults.length}</div>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passingRate}%</div>
            <Progress 
              value={passingRate} 
              className="h-2 mt-2" 
              indicatorClassName={passingRate >= 75 ? "bg-green-500" : passingRate >= 60 ? "bg-yellow-500" : "bg-red-500"}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTestResults.length > 0
                ? Math.round(filteredTestResults.reduce((sum, result) => sum + result.score, 0) / filteredTestResults.length)
                : 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Out of 100</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tests by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {uniqueTestTypes.map(type => {
                const count = filteredTestResults.filter(r => r.type === type).length;
                return (
                  <Badge key={type} variant="outline" className="bg-gray-100">
                    {type}: {count}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>PowerBI Analytics</CardTitle>
          <CardDescription>
            Comprehensive test performance analysis and trends
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <BarChart2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">PowerBI Integration</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              This section would integrate with PowerBI to display interactive visualizations
              of test results and student performance metrics.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="all" className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All Tests</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="passed">Passed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search tests..." 
                className="pl-9 w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {uniqueCourses.map(course => (
                  <SelectItem key={course} value={course}>{course}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={testTypeFilter} onValueChange={setTestTypeFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Test Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTestTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Test Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Passing Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTestResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <p className="text-gray-500">
                          {searchQuery || courseFilter !== "all" || testTypeFilter !== "all"
                            ? "No test results match your search criteria." 
                            : "No test results available."}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTestResults.map(result => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.id}</TableCell>
                        <TableCell>{result.studentName}</TableCell>
                        <TableCell>{result.courseName}</TableCell>
                        <TableCell>{result.type}</TableCell>
                        <TableCell>{formatDate(result.testDate)}</TableCell>
                        <TableCell className="font-medium">{result.score}</TableCell>
                        <TableCell>{result.passingScore}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            result.status === "Pass" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {result.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                ...
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Result</DropdownMenuItem>
                              <DropdownMenuItem>Print Report</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Other tabs would filter the results accordingly */}
        <TabsContent value="recent">
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              Recent tests view (last 30 days)
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="passed">
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              Passed tests view
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="failed">
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              Failed tests view
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default TestTracker;
