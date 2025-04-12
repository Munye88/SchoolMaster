import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Upload, 
  Download, 
  Filter, 
  BarChart2, 
  PieChart, 
  FileText, 
  User, 
  Flag, 
  UserCheck, 
  ArrowUpRight, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp,
  Calendar
} from "lucide-react";
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
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart as RechartPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Area,
  AreaChart
} from "recharts";

// TestData types
interface AggregateTestData {
  id: number;
  cycle?: number;
  month?: string;
  year: number;
  testType: 'Book' | 'ALCPT' | 'ECL' | 'OPI';
  schoolId: number;
  schoolName: string;
  studentCount: number;
  averageScore: number;
  passingScore: number;
  passingRate: number;
}

// Missing interface for backward compatibility
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

// Missing interface for backward compatibility
interface Instructor {
  id: number;
  name: string;
  nationality: string;
  credentials: string;
  startDate: string;
  score: number;
  courses: string[];
  testsPassed: number;
  testsFailed: number;
}

const TestTracker = () => {
  const { selectedSchool, schools } = useSchool();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTestType, setSelectedTestType] = useState("Book");
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState("April");
  const [selectedCycle, setSelectedCycle] = useState(1);
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState("all");
  
  // Mock instructor data with nationalities for the PowerBI visualization
  const mockInstructors: Instructor[] = [
    // American instructors (20 total)
    { id: 1, name: "John Smith", nationality: "American", credentials: "MA TESOL", startDate: "2022-01-15", score: 92, courses: ["Aviation", "MMSC-223"], testsPassed: 24, testsFailed: 2 },
    { id: 2, name: "Michael Johnson", nationality: "American", credentials: "MA Applied Linguistics", startDate: "2021-05-20", score: 89, courses: ["Aviation", "Technical English"], testsPassed: 18, testsFailed: 3 },
    { id: 3, name: "Robert Williams", nationality: "American", credentials: "PhD Education", startDate: "2020-11-10", score: 94, courses: ["Aviation English II", "MMSC-224"], testsPassed: 30, testsFailed: 1 },
    { id: 4, name: "David Miller", nationality: "American", credentials: "MA TESOL", startDate: "2022-03-05", score: 88, courses: ["Refresher", "MMSC-223"], testsPassed: 15, testsFailed: 2 },
    { id: 5, name: "James Wilson", nationality: "American", credentials: "BA English, CELTA", startDate: "2021-08-12", score: 87, courses: ["Aviation", "Technical English"], testsPassed: 20, testsFailed: 4 },
    { id: 6, name: "Daniel Taylor", nationality: "American", credentials: "MA Linguistics", startDate: "2022-02-18", score: 91, courses: ["Aviation English II", "Refresher"], testsPassed: 22, testsFailed: 2 },
    { id: 7, name: "Matthew Brown", nationality: "American", credentials: "MA TESOL", startDate: "2021-07-10", score: 90, courses: ["Aviation", "MMSC-224"], testsPassed: 21, testsFailed: 2 },
    
    // British instructors (15 total)
    { id: 8, name: "William Thompson", nationality: "British", credentials: "MA TESOL", startDate: "2022-01-20", score: 90, courses: ["Technical English", "MMSC-224"], testsPassed: 19, testsFailed: 2 },
    { id: 9, name: "Thomas Anderson", nationality: "British", credentials: "DELTA, BA English", startDate: "2021-06-15", score: 86, courses: ["Refresher", "MMSC-223"], testsPassed: 16, testsFailed: 3 },
    { id: 10, name: "George Roberts", nationality: "British", credentials: "MA Applied Linguistics", startDate: "2020-09-12", score: 93, courses: ["Aviation", "Technical English"], testsPassed: 25, testsFailed: 1 },
    { id: 11, name: "Edward Phillips", nationality: "British", credentials: "CELTA, MA TESOL", startDate: "2022-04-10", score: 87, courses: ["Aviation English II", "Refresher"], testsPassed: 17, testsFailed: 3 },
    { id: 12, name: "Charles Martin", nationality: "British", credentials: "MEd TESOL", startDate: "2021-10-05", score: 91, courses: ["Aviation", "MMSC-223"], testsPassed: 23, testsFailed: 1 },
    
    // Canadian instructors (10 total)
    { id: 13, name: "Andrew Clark", nationality: "Canadian", credentials: "MEd TESOL", startDate: "2021-03-22", score: 89, courses: ["Aviation", "MMSC-223"], testsPassed: 21, testsFailed: 2 },
    { id: 14, name: "Richard Mitchell", nationality: "Canadian", credentials: "MA Linguistics", startDate: "2020-10-05", score: 92, courses: ["Technical English", "MMSC-224"], testsPassed: 23, testsFailed: 1 },
    { id: 15, name: "Peter Walker", nationality: "Canadian", credentials: "BA English, CELTA", startDate: "2022-02-01", score: 85, courses: ["Aviation English II", "Refresher"], testsPassed: 14, testsFailed: 3 }
  ];
  
  // Enhanced test results
  const mockTestResults: TestResult[] = [
    // KNFA School (schoolId: 1)
    {
      id: 1,
      studentName: "Ahmed Al-Farsi",
      courseName: "Aviation",
      testDate: new Date("2024-03-15"),
      score: 85,
      passingScore: 75,
      type: "ALCPT",
      status: "Pass",
      schoolId: 1
    },
    {
      id: 2,
      studentName: "Mohammed Al-Qahtani",
      courseName: "Aviation",
      testDate: new Date("2024-02-10"),
      score: 72,
      passingScore: 75,
      type: "ALCPT",
      status: "Fail",
      schoolId: 1
    },
    {
      id: 3,
      studentName: "Ahmed Al-Farsi",
      courseName: "Aviation",
      testDate: new Date("2024-01-20"),
      score: 80,
      passingScore: 75,
      type: "ALCPT",
      status: "Pass",
      schoolId: 1
    },
    {
      id: 4,
      studentName: "Tariq Al-Ghamdi",
      courseName: "Refresher",
      testDate: new Date("2024-03-12"),
      score: 50,
      passingScore: 45,
      type: "ALCPT",
      status: "Pass",
      schoolId: 1
    },
    {
      id: 5,
      studentName: "Fahad Al-Mutairi",
      courseName: "Refresher",
      testDate: new Date("2024-02-05"),
      score: 42,
      passingScore: 45,
      type: "ALCPT",
      status: "Fail",
      schoolId: 1
    },
    {
      id: 6,
      studentName: "Ali Al-Zahrani",
      courseName: "MMSC-223",
      testDate: new Date("2024-03-10"),
      score: 55,
      passingScore: 45,
      type: "ALCPT",
      status: "Pass",
      schoolId: 1
    },
    {
      id: 7,
      studentName: "Saad Al-Dosari",
      courseName: "MMSC-223",
      testDate: new Date("2024-02-22"),
      score: 48,
      passingScore: 45,
      type: "Book Test",
      status: "Pass",
      schoolId: 1
    },
    
    // NFS East School (schoolId: 2)
    {
      id: 8,
      studentName: "Khalid Al-Otaibi",
      courseName: "Aviation English II",
      testDate: new Date("2024-03-18"),
      score: 65,
      passingScore: 70,
      type: "ALCPT",
      status: "Fail",
      schoolId: 2
    },
    {
      id: 9,
      studentName: "Abdullah Al-Shehri",
      courseName: "Aviation English II",
      testDate: new Date("2024-03-05"),
      score: 78,
      passingScore: 70,
      type: "ALCPT",
      status: "Pass",
      schoolId: 2
    },
    {
      id: 10,
      studentName: "Omar Al-Harbi",
      courseName: "Technical English",
      testDate: new Date("2024-02-28"),
      score: 65,
      passingScore: 60,
      type: "ECL",
      status: "Pass",
      schoolId: 2
    },
    {
      id: 11,
      studentName: "Majid Al-Qahtani",
      courseName: "Technical English",
      testDate: new Date("2024-01-15"),
      score: 55,
      passingScore: 60,
      type: "ECL",
      status: "Fail",
      schoolId: 2
    },
    {
      id: 12,
      studentName: "Abdullah Al-Shehri",
      courseName: "Aviation English II",
      testDate: new Date("2024-02-10"),
      score: 72,
      passingScore: 70,
      type: "Book Test",
      status: "Pass",
      schoolId: 2
    },
    
    // NFS West School (schoolId: 3)
    {
      id: 13,
      studentName: "Saud Al-Saud",
      courseName: "Aviation",
      testDate: new Date("2024-02-20"),
      score: 88,
      passingScore: 75,
      type: "ALCPT",
      status: "Pass",
      schoolId: 3
    },
    {
      id: 14,
      studentName: "Faisal Al-Shamari",
      courseName: "MMSC-224",
      testDate: new Date("2024-03-12"),
      score: 42,
      passingScore: 45,
      type: "ALCPT",
      status: "Fail",
      schoolId: 3
    },
    {
      id: 15,
      studentName: "Ibrahim Al-Dossary",
      courseName: "Technical English",
      testDate: new Date("2024-01-25"),
      score: 68,
      passingScore: 60,
      type: "Book Test",
      status: "Pass",
      schoolId: 3
    },
    {
      id: 16,
      studentName: "Hassan Al-Qurashi",
      courseName: "Refresher",
      testDate: new Date("2024-02-08"),
      score: 50,
      passingScore: 45,
      type: "ECL",
      status: "Pass",
      schoolId: 3
    },
    {
      id: 17,
      studentName: "Faisal Al-Shamari",
      courseName: "MMSC-224",
      testDate: new Date("2024-02-15"),
      score: 40,
      passingScore: 45,
      type: "Book Test",
      status: "Fail",
      schoolId: 3
    },
    {
      id: 18,
      studentName: "Saud Al-Saud",
      courseName: "Aviation",
      testDate: new Date("2024-01-10"),
      score: 80,
      passingScore: 75,
      type: "ALCPT",
      status: "Pass",
      schoolId: 3
    }
  ];
  
  // Mock aggregate test data for cycle-based Book tests
  const bookTestData: AggregateTestData[] = Array.from({ length: 15 }, (_, i) => [
    // KNFA (schoolId: 349)
    {
      id: i * 3 + 1,
      cycle: i + 1,
      year: 2025,
      testType: 'Book' as 'Book',
      schoolId: 349,
      schoolName: 'KNFA',
      studentCount: Math.floor(Math.random() * 10) + 20,
      averageScore: Math.floor(Math.random() * 15) + 75,
      passingScore: 75,
      passingRate: Math.floor(Math.random() * 20) + 75
    },
    // NFS East (schoolId: 350)
    {
      id: i * 3 + 2,
      cycle: i + 1,
      year: 2025,
      testType: 'Book' as 'Book',
      schoolId: 350,
      schoolName: 'NFS East',
      studentCount: Math.floor(Math.random() * 10) + 18,
      averageScore: Math.floor(Math.random() * 15) + 72,
      passingScore: 75, 
      passingRate: Math.floor(Math.random() * 20) + 70
    },
    // NFS West (schoolId: 351)
    {
      id: i * 3 + 3,
      cycle: i + 1,
      year: 2025,
      testType: 'Book' as 'Book',
      schoolId: 351,
      schoolName: 'NFS West',
      studentCount: Math.floor(Math.random() * 10) + 15,
      averageScore: Math.floor(Math.random() * 15) + 70,
      passingScore: 75,
      passingRate: Math.floor(Math.random() * 20) + 65
    }
  ]).flat();

  // Mock aggregate test data for monthly ALCPT, ECL, and OPI tests
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const testTypes = ['ALCPT', 'ECL', 'OPI'];

  const monthlyTestData: AggregateTestData[] = months.flatMap((month, mIndex) => 
    testTypes.flatMap((testType, tIndex) => [
      // KNFA (schoolId: 349)
      {
        id: mIndex * 9 + tIndex * 3 + 1 + 100,
        month,
        year: 2025,
        testType: testType as 'ALCPT' | 'ECL' | 'OPI',
        schoolId: 349,
        schoolName: 'KNFA',
        studentCount: Math.floor(Math.random() * 8) + 12,
        averageScore: Math.floor(Math.random() * 20) + 70,
        passingScore: 70,
        passingRate: Math.floor(Math.random() * 25) + 70
      },
      // NFS East (schoolId: 350)
      {
        id: mIndex * 9 + tIndex * 3 + 2 + 100,
        month,
        year: 2025,
        testType: testType as 'ALCPT' | 'ECL' | 'OPI',
        schoolId: 350,
        schoolName: 'NFS East',
        studentCount: Math.floor(Math.random() * 8) + 10,
        averageScore: Math.floor(Math.random() * 20) + 65,
        passingScore: 70,
        passingRate: Math.floor(Math.random() * 25) + 65
      },
      // NFS West (schoolId: 351)
      {
        id: mIndex * 9 + tIndex * 3 + 3 + 100,
        month,
        year: 2025,
        testType: testType as 'ALCPT' | 'ECL' | 'OPI',
        schoolId: 351,
        schoolName: 'NFS West',
        studentCount: Math.floor(Math.random() * 8) + 8,
        averageScore: Math.floor(Math.random() * 20) + 60,
        passingScore: 70,
        passingRate: Math.floor(Math.random() * 25) + 60
      }
    ])
  );

  // All test data combined
  const allTestData = [...bookTestData, ...monthlyTestData];

  // Filter test data based on selections
  const filteredTestData = allTestData.filter(data => {
    // Filter by test type
    const testTypeMatch = data.testType === selectedTestType;
    
    // Filter by school 
    const schoolMatch = selectedSchoolFilter === 'all' || data.schoolId.toString() === selectedSchoolFilter;
    
    // Filter by cycle or month depending on test type
    const periodMatch = 
      (selectedTestType === 'Book' && data.cycle === selectedCycle) ||
      (selectedTestType !== 'Book' && data.month === selectedMonth);
    
    // Filter by year
    const yearMatch = data.year === selectedYear;
    
    return testTypeMatch && schoolMatch && periodMatch && yearMatch;
  });

  // Get all filtered Book test data for comparing cycles (regardless of selected cycle)
  const allBookTestData = allTestData.filter(data => 
    data.testType === 'Book' && 
    (selectedSchoolFilter === 'all' || data.schoolId.toString() === selectedSchoolFilter)
  );

  // Get all filtered monthly test data for the selected test type (regardless of selected month)
  const allMonthlyData = allTestData.filter(data => 
    data.testType === selectedTestType &&
    data.testType !== 'Book' &&
    (selectedSchoolFilter === 'all' || data.schoolId.toString() === selectedSchoolFilter)
  );
  
  // Format date helper
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Reference to hidden file input
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  
  // Handle Excel file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Here we'd use a library like ExcelJS to parse the Excel file
      // For now, simulate importing data from the attached excel file
      alert(`Importing data from "${file.name}"...`);
      
      // In a real implementation, we would:
      // 1. Read the Excel file using FileReader
      // 2. Parse it with ExcelJS or a similar library
      // 3. Map the data to our application state
      // 4. Update the UI to show the imported data
      
      // For the demo, we're just showing that we've detected the Excel file
      console.log("Excel file selected:", file.name);
      
      // Simulate a successful import
      setTimeout(() => {
        alert("Test data imported successfully from Excel file!");
      }, 1000);
    }
  };
  
  // Trigger file input click
  const handleImportExcel = () => {
    // Create a file input if it doesn't exist
    if (!fileInputRef) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx,.xls';
      input.style.display = 'none';
      input.onchange = handleFileChange as any;
      document.body.appendChild(input);
      setFileInputRef(input);
    }
    
    // Trigger the file input click
    if (fileInputRef) {
      fileInputRef.click();
    }
  };

  return (
    <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0A2463] to-[#3E92CC]">
            {selectedSchoolFilter !== 'all'
              ? `${schools.find(s => s.id.toString() === selectedSchoolFilter)?.name} Test Tracker` 
              : 'Test Tracker'}
          </h1>
          <p className="text-gray-600 mt-1 font-medium">Track and analyze aggregate test results across all schools</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={handleImportExcel}
            className="flex-1 sm:flex-none border-[#0A2463] text-[#0A2463] hover:bg-[#0A2463]/10 transition-all duration-200"
          >
            <Upload className="mr-2 h-4 w-4" /> Import Excel
          </Button>
          
          <Button className="bg-[#0A2463] hover:bg-[#071A4A] flex-1 sm:flex-none shadow-md hover:shadow-lg transition-all duration-200">
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </div>
      
      {/* Test Type Selector */}
      <Tabs defaultValue="Book" className="mb-6" onValueChange={(value) => setSelectedTestType(value as 'Book' | 'ALCPT' | 'ECL' | 'OPI')}>
        <TabsList className="mb-2">
          <TabsTrigger value="Book" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Book Tests
          </TabsTrigger>
          <TabsTrigger value="ALCPT" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            ALCPT
          </TabsTrigger>
          <TabsTrigger value="ECL" className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            ECL
          </TabsTrigger>
          <TabsTrigger value="OPI" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            OPI
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 rounded-lg p-1">
        {/* School Filter */}
        <Card className="shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <Select value={selectedSchoolFilter} onValueChange={setSelectedSchoolFilter}>
              <SelectTrigger className="bg-white border-blue-100">
                <Flag className="h-4 w-4 mr-2 text-blue-500" />
                <SelectValue placeholder="Select School" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools.map(school => (
                  <SelectItem key={school.id} value={school.id.toString()}>{school.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        {/* Period Selector - Either Cycle (for Book tests) or Month (for other tests) */}
        <Card className="shadow-sm bg-gradient-to-r from-purple-50 to-blue-50 border border-blue-100 hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            {selectedTestType === 'Book' ? (
              <Select value={selectedCycle.toString()} onValueChange={(value) => setSelectedCycle(parseInt(value))}>
                <SelectTrigger className="bg-white border-blue-100">
                  <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                  <SelectValue placeholder="Select Cycle" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 15 }, (_, i) => (
                    <SelectItem key={i+1} value={(i+1).toString()}>Cycle {i+1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="bg-white border-blue-100">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>
        
        {/* Year Selector */}
        <Card className="shadow-sm bg-gradient-to-r from-indigo-50 to-purple-50 border border-purple-100 hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="bg-white border-purple-100">
                <Clock className="h-4 w-4 mr-2 text-purple-500" />
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      
      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Students Card */}
        <Card className="shadow-md border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-gray-700">
              <User className="h-5 w-5 mr-2 text-blue-500" />
              <span>Total Students</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {filteredTestData.reduce((sum, data) => sum + data.studentCount, 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedTestType === 'Book' ? `Cycle ${selectedCycle}` : selectedMonth} {selectedYear}
            </p>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-gray-500 border-t">
            <span>Across all schools</span>
          </CardFooter>
        </Card>
        
        {/* Passing Rate Card */}
        <Card className="shadow-md border-t-4 border-t-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-gray-700">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
              <span>Pass Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {filteredTestData.length > 0
                ? Math.round(filteredTestData.reduce((sum, data) => sum + data.passingRate, 0) / filteredTestData.length)
                : 0}%
            </div>
            <Progress 
              value={filteredTestData.length > 0
                ? Math.round(filteredTestData.reduce((sum, data) => sum + data.passingRate, 0) / filteredTestData.length)
                : 0} 
              className="h-2 mt-2 bg-green-100"
            />
            <div className="h-2 mt-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  filteredTestData.length > 0 && 
                  Math.round(filteredTestData.reduce((sum, data) => sum + data.passingRate, 0) / filteredTestData.length) >= 85 
                    ? "bg-green-500" 
                    : "bg-red-500"
                }`} 
                style={{ 
                  width: `${filteredTestData.length > 0
                    ? Math.round(filteredTestData.reduce((sum, data) => sum + data.passingRate, 0) / filteredTestData.length)
                    : 0}%` 
                }}
              ></div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-gray-500 border-t flex items-center justify-between">
            <span>Benchmark: 85%</span>
            <Badge className={
              filteredTestData.length > 0 && 
              Math.round(filteredTestData.reduce((sum, data) => sum + data.passingRate, 0) / filteredTestData.length) >= 85
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }>
              {filteredTestData.length > 0 && 
               Math.round(filteredTestData.reduce((sum, data) => sum + data.passingRate, 0) / filteredTestData.length) >= 85
                ? "PASS"
                : "FAIL"
              }
            </Badge>
          </CardFooter>
        </Card>
        
        {/* Average Score Card */}
        <Card className="shadow-md border-t-4 border-t-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-gray-700">
              <Award className="h-5 w-5 mr-2 text-purple-500" />
              <span>Average Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {filteredTestData.length > 0
                ? Math.round(filteredTestData.reduce((sum, data) => sum + data.averageScore, 0) / filteredTestData.length)
                : 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Out of 100 possible points</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-600">Passing Score:</span>
              <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">
                {filteredTestData[0]?.passingScore || 0}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-gray-500 border-t">
            <span>Performance indicator</span>
          </CardFooter>
        </Card>
        
        {/* School Comparison Card */}
        <Card className="shadow-md border-t-4 border-t-indigo-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium text-gray-700">
              <Flag className="h-5 w-5 mr-2 text-indigo-500" />
              <span>School Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* KNFA */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-blue-700">KNFA</span>
                  <span className="text-xs font-medium text-blue-700">
                    {filteredTestData.find(d => d.schoolId === 349)?.averageScore || 0}
                  </span>
                </div>
                <Progress 
                  value={filteredTestData.find(d => d.schoolId === 349)?.averageScore || 0} 
                  max={100}
                  className="h-2 bg-blue-200"
                />
              </div>
              
              {/* NFS East */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-green-700">NFS East</span>
                  <span className="text-xs font-medium text-green-700">
                    {filteredTestData.find(d => d.schoolId === 350)?.averageScore || 0}
                  </span>
                </div>
                <Progress 
                  value={filteredTestData.find(d => d.schoolId === 350)?.averageScore || 0} 
                  max={100}
                  className="h-2 bg-green-200"
                />
              </div>
              
              {/* NFS West */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-orange-700">NFS West</span>
                  <span className="text-xs font-medium text-orange-700">
                    {filteredTestData.find(d => d.schoolId === 351)?.averageScore || 0}
                  </span>
                </div>
                <Progress 
                  value={filteredTestData.find(d => d.schoolId === 351)?.averageScore || 0} 
                  max={100}
                  className="h-2 bg-orange-200"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-gray-500 border-t">
            <span>Average scores by school</span>
          </CardFooter>
        </Card>
      </div>
      
      {/* Test Data Visualization Section */}
      <Card className="mb-8 shadow-lg border-none overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#0A2463] to-[#3E92CC] text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {selectedTestType === 'Book' 
                  ? `Book Test Analytics - Cycle ${selectedCycle}` 
                  : `${selectedTestType} Test Analytics - ${selectedMonth} ${selectedYear}`}
              </CardTitle>
              <CardDescription className="text-blue-100 mt-1">
                Comprehensive {selectedTestType} test performance analysis across all schools
              </CardDescription>
            </div>
            <Button className="mt-4 md:mt-0 gap-2 bg-white text-[#0A2463] hover:bg-blue-100 transition-all duration-300">
              <Download size={16} /> Export Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 bg-gradient-to-b from-blue-50 to-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* School Comparison Chart */}
            <Card className="shadow-md border border-blue-100 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 bg-blue-50 border-b border-blue-100">
                <CardTitle className="text-lg font-semibold text-[#0A2463] flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5 text-blue-600" />
                  School Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filteredTestData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="schoolName" />
                      <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                      <Tooltip formatter={(value, name) => [value, name === 'studentCount' ? 'Students' : name]} />
                      <Legend />
                      <Bar 
                        yAxisId="left"
                        dataKey="averageScore" 
                        name="Average Score" 
                        fill="#4285F4" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="passingRate" 
                        name="Pass Rate (%)" 
                        fill="#34A853" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        yAxisId="left"
                        dataKey="studentCount" 
                        name="Student Count" 
                        fill="#FBBC05" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Trend Analysis */}
            {selectedTestType === 'Book' ? (
              // Book Test Cycles Trend
              <Card className="shadow-md border border-green-100 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-2 bg-green-50 border-b border-green-100">
                  <CardTitle className="text-lg font-semibold text-[#0A2463] flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                    Book Test Cycles Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={allBookTestData.filter(data => data.schoolId.toString() === (selectedSchoolFilter === 'all' ? '349' : selectedSchoolFilter)).sort((a, b) => (a.cycle || 0) - (b.cycle || 0))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="cycle" label={{ value: 'Cycle', position: 'insideBottomRight', offset: -5 }} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="averageScore" 
                          name="Average Score" 
                          stroke="#4285F4" 
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="passingRate" 
                          name="Passing Rate" 
                          stroke="#34A853" 
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Monthly Test Trend
              <Card className="shadow-md border border-green-100 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-2 bg-green-50 border-b border-green-100">
                  <CardTitle className="text-lg font-semibold text-[#0A2463] flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                    {selectedTestType} Monthly Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={allMonthlyData.filter(data => 
                          data.schoolId.toString() === (selectedSchoolFilter === 'all' ? '349' : selectedSchoolFilter) &&
                          data.testType === selectedTestType
                        )}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="averageScore" 
                          name="Average Score" 
                          stroke="#4285F4" 
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="passingRate" 
                          name="Passing Rate" 
                          stroke="#34A853" 
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* School Comparison PieChart */}
            <Card className="shadow-md border border-purple-100 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 bg-purple-50 border-b border-purple-100">
                <CardTitle className="text-lg font-semibold text-[#0A2463] flex items-center">
                  <PieChart className="mr-2 h-5 w-5 text-purple-600" />
                  Student Distribution by School
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPieChart>
                      <Pie
                        data={[
                          { 
                            name: "KNFA", 
                            value: filteredTestData.find(d => d.schoolId === 349)?.studentCount || 0, 
                            color: "#4285F4" 
                          },
                          { 
                            name: "NFS East", 
                            value: filteredTestData.find(d => d.schoolId === 350)?.studentCount || 0, 
                            color: "#34A853" 
                          },
                          { 
                            name: "NFS West", 
                            value: filteredTestData.find(d => d.schoolId === 351)?.studentCount || 0, 
                            color: "#FBBC05" 
                          }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell key="KNFA" fill="#4285F4" />
                        <Cell key="NFS East" fill="#34A853" />
                        <Cell key="NFS West" fill="#FBBC05" />
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
                      <Legend />
                    </RechartPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Passing Score Analysis */}
            <Card className="shadow-md border border-orange-100 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2 bg-orange-50 border-b border-orange-100">
                <CardTitle className="text-lg font-semibold text-[#0A2463] flex items-center">
                  <Award className="mr-2 h-5 w-5 text-orange-600" />
                  Pass/Fail Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filteredTestData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="schoolName" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="passingRate" 
                        name="Pass Rate (%)" 
                        radius={[0, 4, 4, 0]}
                      >
                        {filteredTestData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.passingRate >= 85 ? "#34A853" : "#EA4335"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                      <span className="text-sm font-medium">Pass (≥85%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                      <span className="text-sm font-medium">Fail (&lt;85%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 max-w-3xl mx-auto mb-4">
              This test analytics dashboard provides comprehensive performance analysis across all schools.
              The data visualizations help school administrators identify trends and areas for improvement.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button className="bg-[#0A2463] hover:bg-[#071A4A] gap-2">
                <Download size={16} /> Export Test Results
              </Button>
              <Button variant="outline" className="border-[#0A2463] text-[#0A2463] gap-2">
                <FileText size={16} /> Generate PDF Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="all" className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="all">All Tests</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="passed">Passed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
            <TabsTrigger value="nationality" className="flex items-center">
              <Flag className="h-4 w-4 mr-1" /> Nationality Analysis
            </TabsTrigger>
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

        {/* Nationality Analysis Tab - PowerBI Style */}
        <TabsContent value="nationality">
          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle>Instructor Nationality Analysis</CardTitle>
                  <CardDescription>
                    Performance breakdown by instructor nationality (American, British, Canadian)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                  <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Nationalities</SelectItem>
                      <SelectItem value="American">American</SelectItem>
                      <SelectItem value="British">British</SelectItem>
                      <SelectItem value="Canadian">Canadian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <div className="mr-2 p-2 bg-blue-100 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <CardTitle className="text-sm font-medium">Instructor Distribution</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartPieChart>
                          <Pie
                            data={[
                              { name: "American", value: mockInstructors.filter(i => i.nationality === "American").length, color: "#2563EB" },
                              { name: "British", value: mockInstructors.filter(i => i.nationality === "British").length, color: "#DC2626" },
                              { name: "Canadian", value: mockInstructors.filter(i => i.nationality === "Canadian").length, color: "#16A34A" }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {[
                              { name: "American", color: "#2563EB" },
                              { name: "British", color: "#DC2626" },
                              { name: "Canadian", color: "#16A34A" }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} instructors`, 'Count']} />
                        </RechartPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <div className="mr-2 p-2 bg-green-100 rounded-full">
                        <UserCheck className="h-4 w-4 text-green-600" />
                      </div>
                      <CardTitle className="text-sm font-medium">Performance Scores</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            {
                              name: "American",
                              avgScore: Math.round(mockInstructors
                                .filter(i => i.nationality === "American")
                                .reduce((sum, i) => sum + i.score, 0) / 
                                (mockInstructors.filter(i => i.nationality === "American").length || 1)),
                              count: mockInstructors.filter(i => i.nationality === "American").length,
                              color: "#2563EB"
                            },
                            {
                              name: "British",
                              avgScore: Math.round(mockInstructors
                                .filter(i => i.nationality === "British")
                                .reduce((sum, i) => sum + i.score, 0) / 
                                (mockInstructors.filter(i => i.nationality === "British").length || 1)),
                              count: mockInstructors.filter(i => i.nationality === "British").length,
                              color: "#DC2626"
                            },
                            {
                              name: "Canadian",
                              avgScore: Math.round(mockInstructors
                                .filter(i => i.nationality === "Canadian")
                                .reduce((sum, i) => sum + i.score, 0) / 
                                (mockInstructors.filter(i => i.nationality === "Canadian").length || 1)),
                              count: mockInstructors.filter(i => i.nationality === "Canadian").length,
                              color: "#16A34A"
                            }
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Average Score']} />
                          <Legend />
                          <Bar 
                            dataKey="avgScore" 
                            name="Average Score" 
                            fill="#0A2463" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <div className="mr-2 p-2 bg-red-100 rounded-full">
                        <Flag className="h-4 w-4 text-red-600" />
                      </div>
                      <CardTitle className="text-sm font-medium">Test Pass Rates</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart 
                          outerRadius={90} 
                          width={730} 
                          height={250} 
                          data={[
                            {
                              nationality: "American",
                              passRate: Math.round(mockInstructors
                                .filter(i => i.nationality === "American")
                                .reduce((sum, i) => sum + (i.testsPassed / (i.testsPassed + i.testsFailed) * 100), 0) / 
                                (mockInstructors.filter(i => i.nationality === "American").length || 1)),
                              students: 120,
                              courses: 5
                            },
                            {
                              nationality: "British",
                              passRate: Math.round(mockInstructors
                                .filter(i => i.nationality === "British")
                                .reduce((sum, i) => sum + (i.testsPassed / (i.testsPassed + i.testsFailed) * 100), 0) / 
                                (mockInstructors.filter(i => i.nationality === "British").length || 1)),
                              students: 95,
                              courses: 4
                            },
                            {
                              nationality: "Canadian",
                              passRate: Math.round(mockInstructors
                                .filter(i => i.nationality === "Canadian")
                                .reduce((sum, i) => sum + (i.testsPassed / (i.testsPassed + i.testsFailed) * 100), 0) / 
                                (mockInstructors.filter(i => i.nationality === "Canadian").length || 1)),
                              students: 75,
                              courses: 3
                            }
                          ]}
                        >
                          <PolarGrid />
                          <PolarAngleAxis dataKey="nationality" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar name="Pass Rate" dataKey="passRate" stroke="#0A2463" fill="#0A2463" fillOpacity={0.6} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Pass Rate']} />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Instructors Table by Nationality */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Instructor Performance Details</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead>Credentials</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Tests Passed</TableHead>
                      <TableHead>Pass Rate</TableHead>
                      <TableHead>Courses</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockInstructors
                      .filter(i => nationalityFilter === 'all' || i.nationality === nationalityFilter)
                      .map(instructor => (
                        <TableRow key={instructor.id}>
                          <TableCell className="font-medium">{instructor.name}</TableCell>
                          <TableCell>
                            <Badge className={
                              instructor.nationality === "American" ? "bg-blue-100 text-blue-800" :
                              instructor.nationality === "British" ? "bg-red-100 text-red-800" :
                              "bg-green-100 text-green-800"
                            }>
                              {instructor.nationality}
                            </Badge>
                          </TableCell>
                          <TableCell>{instructor.credentials}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={
                                instructor.score >= 90 ? "text-green-600 font-medium" :
                                instructor.score >= 80 ? "text-blue-600 font-medium" :
                                "text-yellow-600 font-medium"
                              }>
                                {instructor.score}%
                              </span>
                              <Progress 
                                value={instructor.score} 
                                className={`h-2 w-20 ${
                                  instructor.score >= 90 ? "bg-green-500" :
                                  instructor.score >= 80 ? "bg-blue-500" :
                                  "bg-yellow-500"
                                }`}
                              />
                            </div>
                          </TableCell>
                          <TableCell>{instructor.testsPassed} / {instructor.testsPassed + instructor.testsFailed}</TableCell>
                          <TableCell>
                            {Math.round((instructor.testsPassed / (instructor.testsPassed + instructor.testsFailed)) * 100)}%
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {instructor.courses.map(course => (
                                <Badge key={course} variant="outline" className="bg-gray-100 text-xs">
                                  {course}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 max-w-3xl mx-auto mb-4">
                  This nationality analysis helps identify performance variations and strengths among 
                  instructors from different backgrounds. The passing score requirement for instructors is 85%.
                </p>
                <Button className="bg-[#0A2463] hover:bg-[#071A4A] gap-2">
                  <FileText size={16} /> Export Nationality Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default TestTracker;
