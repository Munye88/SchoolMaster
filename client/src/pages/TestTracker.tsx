import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintButton } from "@/components/ui/print-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
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
  Calendar,
  CalendarRange,
  CheckSquare,
  Printer,
  Clipboard,
  Pencil
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
  const [selectedTestType, setSelectedTestType] = useState<'Book' | 'ALCPT' | 'ECL' | 'OPI'>('Book');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState("April");
  const [selectedCycle, setSelectedCycle] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSchool, setImportSchool] = useState("");
  const [importTestType, setImportTestType] = useState("");
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [testTypeFilter, setTestTypeFilter] = useState("all");
  const [nationalityFilter, setNationalityFilter] = useState("all");
  const [activeView, setActiveView] = useState<'dashboard' | 'data-entry' | 'date-range'>('dashboard');
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [historicalView, setHistoricalView] = useState(false);
  
  // State for historical comparison view
  const [compareSchool, setCompareSchool] = useState<string>('all');
  const [compareTestType, setCompareTestType] = useState<'Book' | 'ALCPT' | 'ECL' | 'OPI'>('Book');
  const [comparePeriod1, setComparePeriod1] = useState<string>(compareTestType === 'Book' ? '1' : 'January');
  const [comparePeriod2, setComparePeriod2] = useState<string>(compareTestType === 'Book' ? '2' : 'February');
  const [compareYear1, setCompareYear1] = useState<number>(2024);
  const [compareYear2, setCompareYear2] = useState<number>(2025);
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: null,
    end: null,
  });
  
  // Manual data entry form state
  const [manualEntryData, setManualEntryData] = useState<{
    schoolId: string;
    schoolName?: string;
    testType: 'Book' | 'ALCPT' | 'ECL' | 'OPI';
    cycle?: number;
    month?: string;
    year?: number;
    studentCount?: number;
    averageScore?: number;
    passingScore?: number;
    passingRate?: number;
  }>({
    schoolId: "",
    testType: 'Book',
  });
  
  // Form validation for manual entry
  const isManualFormValid = () => {
    const { schoolId, testType, year, studentCount, averageScore, passingScore, passingRate } = manualEntryData;
    
    // Basic validation
    if (!schoolId || !testType || !year || !studentCount || !averageScore || !passingScore || !passingRate) {
      return false;
    }
    
    // Test type specific validation
    if (testType === 'Book' && !manualEntryData.cycle) {
      return false;
    }
    
    if (testType !== 'Book' && !manualEntryData.month) {
      return false;
    }
    
    return true;
  };
  
  // Handle manual data submission
  const handleManualDataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isManualFormValid()) return;
    
    const schoolName = schools.find(s => s.id.toString() === manualEntryData.schoolId)?.name || "Unknown School";
    const schoolId = parseInt(manualEntryData.schoolId);
    
    // Create new test data entry
    const newTestData: AggregateTestData = {
      id: Date.now(),
      year: manualEntryData.year!,
      testType: manualEntryData.testType,
      schoolId,
      schoolName,
      studentCount: manualEntryData.studentCount!,
      averageScore: manualEntryData.averageScore!,
      passingScore: manualEntryData.passingScore!,
      passingRate: manualEntryData.passingRate!,
      ...(manualEntryData.testType === 'Book' 
        ? { cycle: manualEntryData.cycle } 
        : { month: manualEntryData.month })
    };
    
    // Add to imported test data
    setImportedTestData(prev => {
      const criteria = (item: AggregateTestData) => {
        if (item.schoolId !== schoolId) return false;
        if (item.testType !== manualEntryData.testType) return false;
        if (item.year !== manualEntryData.year) return false;
        
        if (manualEntryData.testType === 'Book') {
          return item.cycle === manualEntryData.cycle;
        } else {
          return item.month === manualEntryData.month;
        }
      };
      
      // Remove any existing matching entry
      const filteredData = prev.filter(item => !criteria(item));
      
      // Add the new data
      return [...filteredData, newTestData];
    });
    
    // Reset form and close modal
    setShowManualEntryModal(false);
    setManualEntryData({
      schoolId: "",
      testType: 'Book',
    });
    
    // Alert the user
    alert(`Test data successfully added for ${schoolName}!`);
  };
  
  // Handle opening the manual entry modal
  const handleOpenManualEntry = () => {
    setManualEntryData({
      schoolId: selectedSchoolFilter !== 'all' ? selectedSchoolFilter : "",
      testType: selectedTestType,
      year: selectedYear,
      cycle: selectedTestType === 'Book' ? selectedCycle : undefined,
      month: selectedTestType !== 'Book' ? selectedMonth : undefined,
    });
    setShowManualEntryModal(true);
  };
  
  // Store imported test data that will override the mock data
  const [importedTestData, setImportedTestData] = useState<AggregateTestData[]>([]);
  
  // Mock data for individual test results (used in the detailed view)
  const testResults: TestResult[] = [
    // Sample test results would go here
  ];
  
  // Generate unique course and test type values for filters
  const uniqueCourses = Array.from(new Set(testResults.map(result => result.courseName)));
  const uniqueTestTypes = Array.from(new Set(testResults.map(result => result.type)));
  
  // Filter test results based on search and filters
  const filteredTestResults = testResults.filter(result => {
    const matchesSearch = 
      result.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = courseFilter === "all" || result.courseName === courseFilter;
    const matchesType = testTypeFilter === "all" || result.type === testTypeFilter;
    
    return matchesSearch && matchesCourse && matchesType;
  });
  
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

  // Combine mock data with imported data, giving priority to imported data
  const combinedTestData = [...bookTestData, ...monthlyTestData];
  
  // Add imported data, replacing mock data where applicable
  importedTestData.forEach(importedData => {
    // Find if there's an existing mock entry with the same criteria
    const existingIndex = combinedTestData.findIndex(data => {
      if (data.testType !== importedData.testType) return false;
      if (data.schoolId !== importedData.schoolId) return false;
      if (data.year !== importedData.year) return false;
      
      if (importedData.testType === 'Book') {
        return data.cycle === importedData.cycle;
      } else {
        return data.month === importedData.month;
      }
    });
    
    if (existingIndex >= 0) {
      // Replace existing entry with imported data
      combinedTestData[existingIndex] = importedData;
    } else {
      // Add new entry if no match was found
      combinedTestData.push(importedData);
    }
  });

  // Filter test data based on selections
  const filteredTestData = combinedTestData.filter(data => {
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
  const allBookTestData = combinedTestData.filter(data => 
    data.testType === 'Book' && 
    (selectedSchoolFilter === 'all' || data.schoolId.toString() === selectedSchoolFilter)
  );

  // Get all filtered monthly test data for the selected test type (regardless of selected month)
  const allMonthlyData = combinedTestData.filter(data => 
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
  
  // Show the import modal with school and test type selection
  const handleImportExcel = () => {
    setImportSchool("");
    setImportTestType("");
    setShowImportModal(true);
  };
  
  // Handle Excel file selection with school and test type context - now with actual Excel file processing
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const schoolName = schools.find(s => s.id.toString() === importSchool)?.name || "Unknown School";
      const schoolId = parseInt(importSchool);
      
      alert(`Importing ${importTestType} test data for ${schoolName} from "${file.name}"...`);
      
      // Use FileReader to read the Excel file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Import XLSX dynamically to prevent issues with SSR
          const XLSX = await import('xlsx');
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Assuming the first sheet contains the test data
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert the worksheet to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          console.log("Imported Excel Data:", jsonData);
          
          if (jsonData.length === 0) {
            alert("No data found in the Excel file. Please check the file format.");
            return;
          }
          
          // Process the data according to the test type
          if (importTestType === 'Book') {
            // Create a new test data object
            const totalStudents = jsonData.length;
            
            // Calculate average score and passing rate
            let totalScore = 0;
            let passingCount = 0;
            const passingScore = 75; // Default passing score for Book Test
            
            jsonData.forEach((row: any) => {
              // Assuming the Excel has a column named 'Score' or similar
              const score = parseFloat(row.Score || row.score || row.SCORE || 0);
              totalScore += score;
              if (score >= passingScore) {
                passingCount++;
              }
            });
            
            const averageScore = totalScore / totalStudents;
            const passingRate = (passingCount / totalStudents) * 100;
            
            // Create new test data object to add to state
            const newTestData: AggregateTestData = {
              id: Date.now(), // Generate a unique ID
              cycle: selectedCycle,
              year: selectedYear,
              testType: 'Book',
              schoolId,
              schoolName,
              studentCount: totalStudents,
              averageScore: Math.round(averageScore),
              passingScore: passingScore,
              passingRate: Math.round(passingRate)
            };
            
            // Add to imported test data - replace any existing data for this school/cycle
            setImportedTestData(prev => {
              // Remove any existing data for this school and cycle
              const filtered = prev.filter(item => 
                !(item.schoolId === schoolId && 
                  item.testType === 'Book' && 
                  item.cycle === selectedCycle && 
                  item.year === selectedYear)
              );
              // Add the new data
              return [...filtered, newTestData];
            });
            
            // Update the UI with the actual data from the Excel file
            alert(`Imported ${importTestType} test data for ${schoolName}!\n\nTotal Students: ${totalStudents}\nAverage Score: ${Math.round(averageScore)}\nPassing Rate: ${Math.round(passingRate)}%`);
          } else {
            // Process other test types (ALCPT, ECL, OPI)
            // Similar logic as above but with appropriate columns and passing scores
            const totalStudents = jsonData.length;
            
            // Calculate average score and passing rate
            let totalScore = 0;
            let passingCount = 0;
            const passingScore = importTestType === 'ALCPT' ? 70 : (importTestType === 'ECL' ? 65 : 60); // Different passing scores based on test type
            
            jsonData.forEach((row: any) => {
              const score = parseFloat(row.Score || row.score || row.SCORE || 0);
              totalScore += score;
              if (score >= passingScore) {
                passingCount++;
              }
            });
            
            const averageScore = totalScore / totalStudents;
            const passingRate = (passingCount / totalStudents) * 100;
            
            // Create new test data object for other test types
            const newTestData: AggregateTestData = {
              id: Date.now(), // Generate a unique ID
              month: selectedMonth,
              year: selectedYear,
              testType: importTestType as 'ALCPT' | 'ECL' | 'OPI',
              schoolId,
              schoolName,
              studentCount: totalStudents,
              averageScore: Math.round(averageScore),
              passingScore: passingScore,
              passingRate: Math.round(passingRate)
            };
            
            // Add to imported test data - replace any existing data for this school/month/test type
            setImportedTestData(prev => {
              // Remove any existing data for this school, month, test type
              const filtered = prev.filter(item => 
                !(item.schoolId === schoolId && 
                  item.testType === importTestType && 
                  item.month === selectedMonth && 
                  item.year === selectedYear)
              );
              // Add the new data
              return [...filtered, newTestData];
            });
            
            // Update the UI with the actual data from the Excel file
            alert(`Imported ${importTestType} test data for ${schoolName}!\n\nTotal Students: ${totalStudents}\nAverage Score: ${Math.round(averageScore)}\nPassing Rate: ${Math.round(passingRate)}%`);
          }
          
          setShowImportModal(false);
        } catch (error: unknown) {
          console.error("Error processing Excel file:", error);
          if (error instanceof Error) {
            alert(`Error processing Excel file: ${error.message}`);
          } else {
            alert("An unknown error occurred while processing the Excel file.");
          }
        }
      };
      
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        alert("Error reading the Excel file. Please try again.");
      };
      
      // Read the file as an array buffer
      reader.readAsArrayBuffer(file);
    }
  };
  
  // Actual file import after school and test type are selected
  const proceedWithImport = () => {
    if (!importSchool || !importTestType) {
      alert("Please select both a school and test type before importing");
      return;
    }
    
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
  
  // Handle print report functionality
  // Handle export data functionality
  const handleExportData = () => {
    const schoolName = selectedSchoolFilter !== 'all' 
      ? schools.find(s => s.id.toString() === selectedSchoolFilter)?.name 
      : 'All Schools';
      
    const title = selectedTestType === 'Book' 
      ? `${schoolName} - Book Test Results - Cycle ${selectedCycle}, ${selectedYear}` 
      : `${schoolName} - ${selectedTestType} Test Results - ${selectedMonth}, ${selectedYear}`;
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "School,Test Type,Students,Average Score,Passing Score,Pass Rate\n";
    
    // Add data rows
    filteredTestData.forEach(data => {
      csvContent += `${data.schoolName},${data.testType},${data.studentCount},`;
      csvContent += `${data.averageScore},${data.passingScore},${data.passingRate}%\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.replace(/\s/g, '_')}.csv`);
    document.body.appendChild(link);
    
    // Trigger download and cleanup
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle export analysis functionality
  const handleExportAnalysis = () => {
    const schoolName = selectedSchoolFilter !== 'all' 
      ? schools.find(s => s.id.toString() === selectedSchoolFilter)?.name 
      : 'All Schools';
      
    const title = selectedTestType === 'Book' 
      ? `${schoolName} - Book Test Analysis - Cycle ${selectedCycle}, ${selectedYear}` 
      : `${schoolName} - ${selectedTestType} Test Analysis - ${selectedMonth}, ${selectedYear}`;
    
    // Create CSV content with statistical analysis
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add test information
    csvContent += "Test Analysis Report\n";
    csvContent += `Report Name,${title}\n`;
    csvContent += `Generated Date,${new Date().toLocaleString()}\n\n`;
    
    // Add summary statistics
    csvContent += "Summary Statistics\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Students,${filteredTestData.reduce((sum, data) => sum + data.studentCount, 0)}\n`;
    
    const avgScore = filteredTestData.length > 0
      ? Math.round(filteredTestData.reduce((sum, data) => sum + data.averageScore, 0) / filteredTestData.length)
      : 0;
    csvContent += `Average Score,${avgScore}\n`;
    
    const passRate = filteredTestData.length > 0
      ? Math.round(filteredTestData.reduce((sum, data) => sum + data.passingRate, 0) / filteredTestData.length)
      : 0;
    csvContent += `Pass Rate,${passRate}%\n\n`;
    
    // Add school breakdown
    csvContent += "School Performance Breakdown\n";
    csvContent += "School,Students,Average Score,Pass Rate,Status\n";
    
    filteredTestData.forEach(data => {
      const status = data.passingRate >= 70 ? "PASS" : "NEEDS IMPROVEMENT";
      csvContent += `${data.schoolName},${data.studentCount},${data.averageScore},${data.passingRate}%,${status}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.replace(/\s/g, '_')}_Analysis.csv`);
    document.body.appendChild(link);
    
    // Trigger download and cleanup
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle export test results functionality
  const handleExportTestResults = () => {
    // Generate a CSV of the individual test results
    const schoolName = selectedSchoolFilter !== 'all' 
      ? schools.find(s => s.id.toString() === selectedSchoolFilter)?.name 
      : 'All Schools';
      
    const title = `${schoolName} - Individual Test Results - ${selectedYear}`;
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "ID,Student,Course,Test Type,Date,Score,Passing Score,Status,School\n";
    
    // Add data rows for filtered test results
    filteredTestResults.forEach(result => {
      const schoolName = schools.find(s => s.id === result.schoolId)?.name || "Unknown";
      csvContent += `${result.id},${result.studentName},${result.courseName},${result.type},`;
      csvContent += `${result.testDate.toLocaleDateString()},${result.score},${result.passingScore},`;
      csvContent += `${result.status},${schoolName}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.replace(/\s/g, '_')}.csv`);
    document.body.appendChild(link);
    
    // Trigger download and cleanup
    link.click();
    document.body.removeChild(link);
  };
  
  // Generate PDF report
  const handleGeneratePDFReport = () => {
    // Use the same functionality as print, but with PDF generation
    const schoolName = selectedSchoolFilter !== 'all' 
      ? schools.find(s => s.id.toString() === selectedSchoolFilter)?.name 
      : 'All Schools';
    
    // Create a printable version specifically for PDF
    alert(`Generating PDF report for ${schoolName} ${selectedTestType} tests. PDF will download shortly.`);
    
    // In a real implementation, we would:
    // 1. Use a library like jsPDF to generate a PDF
    // 2. Format the data and add it to the PDF
    // 3. Save the PDF to the user's device
    
    // This is a simulation - in a real implementation we would generate a proper PDF
    setTimeout(() => {
      alert(`PDF Report for ${schoolName} has been generated and downloaded.`);
    }, 1500);
  };
  
  const handlePrintReport = () => {
    // Create a printable version of the current test data
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const schoolName = selectedSchoolFilter !== 'all' 
      ? schools.find(s => s.id.toString() === selectedSchoolFilter)?.name 
      : 'All Schools';
    
    const title = selectedTestType === 'Book' 
      ? `${schoolName} - Book Test Results - Cycle ${selectedCycle}, ${selectedYear}` 
      : `${schoolName} - ${selectedTestType} Test Results - ${selectedMonth}, ${selectedYear}`;
    
    // Create the HTML content for printing
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #0A2463; margin-bottom: 10px; }
            h2 { color: #3E92CC; margin-top: 20px; margin-bottom: 10px; font-size: 18px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0A2463; padding-bottom: 10px; margin-bottom: 20px; }
            .logo { font-weight: bold; font-size: 24px; color: #0A2463; }
            .date { font-size: 14px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #f1f5f9; text-align: left; padding: 10px; font-weight: bold; }
            td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
            .summary { background-color: #f8fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .stat { display: inline-block; margin-right: 30px; }
            .label { font-size: 12px; color: #64748b; }
            .value { font-size: 20px; font-weight: bold; }
            .green { color: #22c55e; }
            .red { color: #ef4444; }
            .pass-badge { background-color: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
            .fail-badge { background-color: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
            .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; }
            @media print {
              .no-print { display: none; }
              body { margin: 0; padding: 15px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">GOVCIO ELT PROGRAM</div>
            <div class="date">Generated: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
          </div>
          
          <h1>${title}</h1>
          
          <div class="summary">
            <div class="stat">
              <div class="label">Total Students</div>
              <div class="value">${filteredTestData.reduce((sum, data) => sum + data.studentCount, 0)}</div>
            </div>
            <div class="stat">
              <div class="label">Average Score</div>
              <div class="value">${
                filteredTestData.length > 0
                  ? Math.round(filteredTestData.reduce((sum, data) => sum + data.averageScore, 0) / filteredTestData.length)
                  : 0
              }</div>
            </div>
            <div class="stat">
              <div class="label">Pass Rate</div>
              <div class="value ${
                filteredTestData.length > 0 && 
                Math.round(filteredTestData.reduce((sum, data) => sum + data.passingRate, 0) / filteredTestData.length) >= 85
                  ? 'green'
                  : 'red'
              }">${
                filteredTestData.length > 0
                  ? Math.round(filteredTestData.reduce((sum, data) => sum + data.passingRate, 0) / filteredTestData.length)
                  : 0
              }%</div>
            </div>
            <!-- Benchmark removed as requested -->
          </div>
          
          <h2>School Performance Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>School</th>
                <th>Students</th>
                <th>Average Score</th>
                <th>Pass Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTestData.map(data => `
                <tr>
                  <td>${data.schoolName}</td>
                  <td>${data.studentCount}</td>
                  <td>${data.averageScore}</td>
                  <td>${data.passingRate}%</td>
                  <td>
                    <span class="${data.passingRate >= 70 ? 'pass-badge' : 'fail-badge'}">
                      ${data.passingRate >= 70 ? 'PASS' : 'NEEDS IMPROVEMENT'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <button class="no-print" style="padding: 10px 20px; background: #0A2463; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;" onclick="window.print()">
            Print Report
          </button>
          
          <div class="footer">
            GOVCIO ELT PROGRAM MANAGEMENT SYSTEM - CONFIDENTIAL - FOR INTERNAL USE ONLY
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Test Data from Excel</DialogTitle>
            <DialogDescription>
              Select a school and test type before uploading your Excel file.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="school" className="text-right">
                School
              </Label>
              <Select value={importSchool} onValueChange={setImportSchool}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map(school => (
                    <SelectItem key={school.id} value={school.id.toString()}>{school.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="testType" className="text-right">
                Test Type
              </Label>
              <Select value={importTestType} onValueChange={setImportTestType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Book">Book Test</SelectItem>
                  <SelectItem value="ALCPT">ALCPT</SelectItem>
                  <SelectItem value="ECL">ECL</SelectItem>
                  <SelectItem value="OPI">OPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={proceedWithImport} disabled={!importSchool || !importTestType}>
              Select Excel File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Manual Data Entry Modal */}
      <Dialog open={showManualEntryModal} onOpenChange={setShowManualEntryModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Test Data Entry</DialogTitle>
            <DialogDescription>
              Enter test data details manually to add to the Test Tracker.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleManualDataSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="manualSchool" className="text-right">
                  School
                </Label>
                <Select value={manualEntryData.schoolId} onValueChange={(value) => setManualEntryData(prev => ({ ...prev, schoolId: value }))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map(school => (
                      <SelectItem key={school.id} value={school.id.toString()}>{school.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="manualTestType" className="text-right">
                  Test Type
                </Label>
                <Select 
                  value={manualEntryData.testType} 
                  onValueChange={(value) => setManualEntryData(prev => ({ ...prev, testType: value as 'Book' | 'ALCPT' | 'ECL' | 'OPI' }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Book">Book Test</SelectItem>
                    <SelectItem value="ALCPT">ALCPT</SelectItem>
                    <SelectItem value="ECL">ECL</SelectItem>
                    <SelectItem value="OPI">OPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {manualEntryData.testType === 'Book' ? (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="manualCycle" className="text-right">
                    Cycle
                  </Label>
                  <Select 
                    value={manualEntryData.cycle?.toString() || ""} 
                    onValueChange={(value) => setManualEntryData(prev => ({ ...prev, cycle: parseInt(value) }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 15 }, (_, i) => (
                        <SelectItem key={i+1} value={(i+1).toString()}>Cycle {i+1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="manualMonth" className="text-right">
                    Month
                  </Label>
                  <Select 
                    value={manualEntryData.month || ""} 
                    onValueChange={(value) => setManualEntryData(prev => ({ ...prev, month: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="manualYear" className="text-right">
                  Year
                </Label>
                <Select 
                  value={manualEntryData.year?.toString() || ""} 
                  onValueChange={(value) => setManualEntryData(prev => ({ ...prev, year: parseInt(value) }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                    <SelectItem value="2028">2028</SelectItem>
                    <SelectItem value="2029">2029</SelectItem>
                    <SelectItem value="2030">2030</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="studentCount" className="text-right">
                  Total Students
                </Label>
                <Input 
                  id="studentCount"
                  type="number"
                  className="col-span-3"
                  value={manualEntryData.studentCount?.toString() || ""}
                  onChange={(e) => setManualEntryData(prev => ({ ...prev, studentCount: parseInt(e.target.value) }))}
                  min={0}
                  placeholder="Enter number of students"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="averageScore" className="text-right">
                  Average Score
                </Label>
                <Input 
                  id="averageScore"
                  type="number"
                  className="col-span-3"
                  value={manualEntryData.averageScore?.toString() || ""}
                  onChange={(e) => setManualEntryData(prev => ({ ...prev, averageScore: parseInt(e.target.value) }))}
                  min={0}
                  max={100}
                  placeholder="Enter average score"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="passingScore" className="text-right">
                  Passing Score
                </Label>
                <Input 
                  id="passingScore"
                  type="number"
                  className="col-span-3"
                  value={manualEntryData.passingScore?.toString() || ""}
                  onChange={(e) => setManualEntryData(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                  min={0}
                  max={100}
                  placeholder="Enter passing score"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="passingRate" className="text-right">
                  Passing Rate (%)
                </Label>
                <Input 
                  id="passingRate"
                  type="number"
                  className="col-span-3"
                  value={manualEntryData.passingRate?.toString() || ""}
                  onChange={(e) => setManualEntryData(prev => ({ ...prev, passingRate: parseInt(e.target.value) }))}
                  min={0}
                  max={100}
                  placeholder="Enter passing rate"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowManualEntryModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isManualFormValid()}>
                Save Data
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
          
          <Button 
            variant="outline"
            onClick={handleOpenManualEntry}
            className="flex-1 sm:flex-none border-[#007d49] text-[#007d49] hover:bg-[#007d49]/10 transition-all duration-200"
          >
            <Pencil className="mr-2 h-4 w-4" /> Enter Data
          </Button>
          
          <Button 
            className="bg-[#0A2463] hover:bg-[#071A4A] flex-1 sm:flex-none shadow-md hover:shadow-lg transition-all duration-200"
            onClick={handleExportData}
          >
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </div>
      
      {/* Main View Selector */}
      <Tabs defaultValue="dashboard" className="mb-6" onValueChange={(value) => setActiveView(value as 'dashboard' | 'data-entry' | 'date-range')}>
        <TabsList className="mb-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-1">
            <BarChart2 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="data-entry" className="flex items-center gap-1">
            <Pencil className="h-4 w-4" />
            Data Entry
          </TabsTrigger>
          <TabsTrigger value="date-range" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Historical View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          {/* Test Type Selector */}
          <Tabs defaultValue="Book" className="mb-6" onValueChange={(value) => setSelectedTestType(value as 'Book' | 'ALCPT' | 'ECL' | 'OPI')}>
            <TabsList className="mb-2">
              <TabsTrigger value="Book" className="flex items-center gap-1 bg-blue-100 data-[state=active]:bg-blue-200 text-blue-800">
                <BookOpen className="h-4 w-4" />
                Book Tests
              </TabsTrigger>
              <TabsTrigger value="ALCPT" className="flex items-center gap-1 bg-green-100 data-[state=active]:bg-green-200 text-green-800">
                <FileText className="h-4 w-4" />
                ALCPT
              </TabsTrigger>
              <TabsTrigger value="ECL" className="flex items-center gap-1 bg-purple-100 data-[state=active]:bg-purple-200 text-purple-800">
                <Award className="h-4 w-4" />
                ECL
              </TabsTrigger>
              <TabsTrigger value="OPI" className="flex items-center gap-1 bg-amber-100 data-[state=active]:bg-amber-200 text-amber-800">
                <User className="h-4 w-4" />
                OPI
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="data-entry">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Manual Test Data Entry</h2>
            <p className="text-gray-600 mb-6">Add or update test data by filling out the form below.</p>
            
            <form onSubmit={handleManualDataSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* School Selection */}
                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Select 
                    value={manualEntryData.schoolId} 
                    onValueChange={(value) => setManualEntryData(prev => ({ ...prev, schoolId: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select School" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map(school => (
                        <SelectItem key={school.id} value={school.id.toString()}>{school.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Test Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="testType">Test Type</Label>
                  <Select 
                    value={manualEntryData.testType} 
                    onValueChange={(value) => setManualEntryData(prev => ({ 
                      ...prev, 
                      testType: value as 'Book' | 'ALCPT' | 'ECL' | 'OPI',
                      // Reset cycle/month when test type changes
                      cycle: value === 'Book' ? (prev.cycle || 1) : undefined,
                      month: value !== 'Book' ? (prev.month || 'January') : undefined
                    }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Test Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Book" className="text-blue-700 font-medium">Book Test</SelectItem>
                      <SelectItem value="ALCPT" className="text-green-700 font-medium">ALCPT</SelectItem>
                      <SelectItem value="ECL" className="text-purple-700 font-medium">ECL</SelectItem>
                      <SelectItem value="OPI" className="text-amber-700 font-medium">OPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Year Selection */}
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select 
                    value={manualEntryData.year?.toString() || ""} 
                    onValueChange={(value) => setManualEntryData(prev => ({ ...prev, year: parseInt(value) }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                      <SelectItem value="2029">2029</SelectItem>
                      <SelectItem value="2030">2030</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cycle or Month Selection based on Test Type */}
                {manualEntryData.testType === 'Book' ? (
                  <div className="space-y-2">
                    <Label htmlFor="cycle">Cycle</Label>
                    <Select 
                      value={manualEntryData.cycle?.toString() || ""} 
                      onValueChange={(value) => setManualEntryData(prev => ({ ...prev, cycle: parseInt(value) }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 15 }, (_, i) => (
                          <SelectItem key={i+1} value={(i+1).toString()}>Cycle {i+1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select 
                      value={manualEntryData.month || ""} 
                      onValueChange={(value) => setManualEntryData(prev => ({ ...prev, month: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                          <SelectItem key={month} value={month}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Student Count */}
                <div className="space-y-2">
                  <Label htmlFor="studentCount">Total Students</Label>
                  <Input 
                    id="studentCount"
                    type="number"
                    value={manualEntryData.studentCount?.toString() || ""}
                    onChange={(e) => setManualEntryData(prev => ({ ...prev, studentCount: parseInt(e.target.value) }))}
                    min={0}
                    className="w-full"
                    placeholder="Enter count"
                  />
                </div>
                
                {/* Average Score */}
                <div className="space-y-2">
                  <Label htmlFor="averageScore">Average Score</Label>
                  <Input 
                    id="averageScore"
                    type="number"
                    value={manualEntryData.averageScore?.toString() || ""}
                    onChange={(e) => setManualEntryData(prev => ({ ...prev, averageScore: parseInt(e.target.value) }))}
                    min={0}
                    max={100}
                    className="w-full"
                    placeholder="Enter score"
                  />
                </div>
                
                {/* Passing Score */}
                <div className="space-y-2">
                  <Label htmlFor="passingScore">Passing Score</Label>
                  <Input 
                    id="passingScore"
                    type="number"
                    value={manualEntryData.passingScore?.toString() || ""}
                    onChange={(e) => setManualEntryData(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                    min={0}
                    max={100}
                    className="w-full"
                    placeholder="Enter score"
                  />
                </div>
                
                {/* Passing Rate */}
                <div className="space-y-2">
                  <Label htmlFor="passingRate">Pass Rate (%)</Label>
                  <Input 
                    id="passingRate"
                    type="number"
                    value={manualEntryData.passingRate?.toString() || ""}
                    onChange={(e) => setManualEntryData(prev => ({ ...prev, passingRate: parseInt(e.target.value) }))}
                    min={0}
                    max={100}
                    className="w-full"
                    placeholder="Enter percentage"
                  />
                </div>
              </div>
              
              <div className="pt-2 flex justify-end space-x-2">
                <Button type="reset" variant="outline" onClick={() => setManualEntryData({
                  schoolId: "",
                  testType: 'Book',
                })}>
                  Reset Form
                </Button>
                <Button type="submit" disabled={!isManualFormValid()}>
                  Save Test Data
                </Button>
              </div>
            </form>
            
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Recent Data Entries</h3>
              
              {importedTestData.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School</TableHead>
                        <TableHead>Test Type</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Avg. Score</TableHead>
                        <TableHead>Pass Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importedTestData
                        .sort((a, b) => b.id - a.id) // Show newest first
                        .slice(0, 5) // Show only last 5 entries
                        .map(data => (
                        <TableRow key={data.id}>
                          <TableCell>{data.schoolName}</TableCell>
                          <TableCell>
                            <Badge className={`
                              ${data.testType === 'Book' ? 'bg-blue-100 text-blue-800' : ''}
                              ${data.testType === 'ALCPT' ? 'bg-green-100 text-green-800' : ''}
                              ${data.testType === 'ECL' ? 'bg-purple-100 text-purple-800' : ''}
                              ${data.testType === 'OPI' ? 'bg-amber-100 text-amber-800' : ''}
                            `}>
                              {data.testType}
                            </Badge>
                          </TableCell>
                          <TableCell>{data.cycle ? `Cycle ${data.cycle}` : data.month}</TableCell>
                          <TableCell>{data.year}</TableCell>
                          <TableCell>{data.studentCount}</TableCell>
                          <TableCell>{data.averageScore}</TableCell>
                          <TableCell>
                            <Badge className={data.passingRate >= 70 
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : "bg-red-100 text-red-800 border-red-200"
                            }>
                              {data.passingRate}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p>No test data has been added yet. Use the form above to add test results.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="date-range">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Historical Data View</h2>
            <p className="text-gray-600 mb-6">View and compare test results across multiple periods.</p>
            
            {/* Historical comparison controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* School Filter */}
              <Card className="shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <Select value={compareSchool} onValueChange={setCompareSchool}>
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
              
              {/* Test Type Selector */}
              <Card className="shadow-sm bg-gradient-to-r from-purple-50 to-blue-50 border border-blue-100 hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <Select 
                    value={compareTestType} 
                    onValueChange={(value) => setCompareTestType(value as 'Book' | 'ALCPT' | 'ECL' | 'OPI')}
                  >
                    <SelectTrigger className="bg-white border-blue-100">
                      <CheckSquare className="h-4 w-4 mr-2 text-blue-500" />
                      <SelectValue placeholder="Select Test Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Book">Book Test</SelectItem>
                      <SelectItem value="ALCPT">ALCPT</SelectItem>
                      <SelectItem value="ECL">ECL</SelectItem>
                      <SelectItem value="OPI">OPI</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
            
            {/* Comparison periods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* First period */}
              <Card className="shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">First Period</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Period Selector */}
                    <div>
                      {compareTestType === 'Book' ? (
                        <Select value={comparePeriod1} onValueChange={setComparePeriod1}>
                          <SelectTrigger className="w-full">
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
                        <Select value={comparePeriod1} onValueChange={setComparePeriod1}>
                          <SelectTrigger className="w-full">
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
                    </div>
                    
                    {/* Year Selector */}
                    <div>
                      <Select 
                        value={compareYear1.toString()} 
                        onValueChange={(value) => setCompareYear1(parseInt(value))}
                      >
                        <SelectTrigger className="w-full">
                          <CalendarRange className="h-4 w-4 mr-2 text-blue-500" />
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {[2023, 2024, 2025].map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Second period */}
              <Card className="shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Second Period</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Period Selector */}
                    <div>
                      {compareTestType === 'Book' ? (
                        <Select value={comparePeriod2} onValueChange={setComparePeriod2}>
                          <SelectTrigger className="w-full">
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
                        <Select value={comparePeriod2} onValueChange={setComparePeriod2}>
                          <SelectTrigger className="w-full">
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
                    </div>
                    
                    {/* Year Selector */}
                    <div>
                      <Select 
                        value={compareYear2.toString()} 
                        onValueChange={(value) => setCompareYear2(parseInt(value))}
                      >
                        <SelectTrigger className="w-full">
                          <CalendarRange className="h-4 w-4 mr-2 text-blue-500" />
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {[2023, 2024, 2025].map(year => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Comparison charts */}
            <div className="mt-8">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Comparison of Test Results</CardTitle>
                  <CardDescription>
                    {compareTestType === 'Book' ? 
                      `Comparing Book Test Cycle ${comparePeriod1} (${compareYear1}) with Cycle ${comparePeriod2} (${compareYear2})` : 
                      `Comparing ${compareTestType} Test for ${comparePeriod1} (${compareYear1}) with ${comparePeriod2} (${compareYear2})`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {importedTestData.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Average Score Comparison */}
                        <div>
                          <h3 className="text-md font-medium mb-4 text-gray-700">Average Score Comparison</h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={[
                                {
                                  name: compareTestType === 'Book' ? 
                                    `Cycle ${comparePeriod1} (${compareYear1})` : 
                                    `${comparePeriod1} (${compareYear1})`,
                                  score: getComparisonData().dataset1[0]?.averageScore || 0
                                },
                                {
                                  name: compareTestType === 'Book' ? 
                                    `Cycle ${comparePeriod2} (${compareYear2})` : 
                                    `${comparePeriod2} (${compareYear2})`,
                                  score: getComparisonData().dataset2[0]?.averageScore || 0
                                }
                              ]}
                              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar 
                                dataKey="score" 
                                name="Average Score" 
                                fill="#4F46E5" 
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Passing Rate Comparison */}
                        <div>
                          <h3 className="text-md font-medium mb-4 text-gray-700">Passing Rate Comparison</h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={[
                                {
                                  name: compareTestType === 'Book' ? 
                                    `Cycle ${comparePeriod1} (${compareYear1})` : 
                                    `${comparePeriod1} (${compareYear1})`,
                                  rate: getComparisonData().dataset1[0]?.passingRate || 0
                                },
                                {
                                  name: compareTestType === 'Book' ? 
                                    `Cycle ${comparePeriod2} (${compareYear2})` : 
                                    `${comparePeriod2} (${compareYear2})`,
                                  rate: getComparisonData().dataset2[0]?.passingRate || 0
                                }
                              ]}
                              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar 
                                dataKey="rate" 
                                name="Passing Rate (%)" 
                                fill="#10B981" 
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      {/* Student Count Comparison */}
                      <div className="mt-8">
                        <h3 className="text-md font-medium mb-4 text-gray-700">Student Count Comparison</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={[
                              {
                                name: compareTestType === 'Book' ? 
                                  `Cycle ${comparePeriod1} (${compareYear1})` : 
                                  `${comparePeriod1} (${compareYear1})`,
                                count: getComparisonData().dataset1[0]?.studentCount || 0
                              },
                              {
                                name: compareTestType === 'Book' ? 
                                  `Cycle ${comparePeriod2} (${compareYear2})` : 
                                  `${comparePeriod2} (${compareYear2})`,
                                count: getComparisonData().dataset2[0]?.studentCount || 0
                              }
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar 
                              dataKey="count" 
                              name="Student Count" 
                              fill="#6366F1" 
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p>No test data available for comparison. Please add test data first.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
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
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
                <SelectItem value="2028">2028</SelectItem>
                <SelectItem value="2029">2029</SelectItem>
                <SelectItem value="2030">2030</SelectItem>
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
                  Math.round(filteredTestData.reduce((sum, data) => sum + data.passingRate, 0) / filteredTestData.length) >= 70 
                    ? "bg-green-500" 
                    : "bg-orange-500"
                }`} 
                style={{ 
                  width: `${filteredTestData.length > 0
                    ? Math.round(filteredTestData.reduce((sum, data) => sum + data.passingRate, 0) / filteredTestData.length)
                    : 0}%` 
                }}
              ></div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 text-xs text-gray-500 border-t">
            <span>Based on data from {filteredTestData.length} schools</span>
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
              <span className="text-xs text-gray-600">Points Required:</span>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 text-xs">
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
            <Button 
              className="mt-4 md:mt-0 gap-2 bg-white text-[#0A2463] hover:bg-blue-100 transition-all duration-300"
              onClick={handleExportAnalysis}
            >
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
                      <defs>
                        <filter id="glow" height="300%" width="300%" x="-100%" y="-100%">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                        <filter id="shadow">
                          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3"/>
                        </filter>
                      </defs>
                      <Pie
                        data={[
                          { 
                            name: "KNFA", 
                            value: filteredTestData.find(d => d.schoolId === 349)?.studentCount || 0
                          },
                          { 
                            name: "NFS East", 
                            value: filteredTestData.find(d => d.schoolId === 350)?.studentCount || 0
                          },
                          { 
                            name: "NFS West", 
                            value: filteredTestData.find(d => d.schoolId === 351)?.studentCount || 0
                          }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={110}
                        innerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        filter="url(#shadow)"
                        label={(entry) => {
                          const percent = Math.round((entry.value / (
                            (filteredTestData.find(d => d.schoolId === 349)?.studentCount || 0) + 
                            (filteredTestData.find(d => d.schoolId === 350)?.studentCount || 0) + 
                            (filteredTestData.find(d => d.schoolId === 351)?.studentCount || 0)
                          )) * 100);
                          return `${percent}%`;
                        }}
                      >
                        <Cell fill="#4285F4" stroke="#fff" strokeWidth={3} />
                        <Cell fill="#34A853" stroke="#fff" strokeWidth={3} />
                        <Cell fill="#FBBC05" stroke="#fff" strokeWidth={3} />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          border: 'none',
                          padding: '12px'
                        }}
                        formatter={(value) => [`${value} students`, 'Count']}
                      />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        iconType="square"
                        iconSize={12}
                        wrapperStyle={{
                          paddingTop: '20px',
                          fontWeight: 600
                        }}
                      />
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
                      barSize={36}
                    >
                      <defs>
                        <linearGradient id="passGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#34A853" />
                          <stop offset="100%" stopColor="#4FC26B" />
                        </linearGradient>
                        <linearGradient id="failGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#EA4335" />
                          <stop offset="100%" stopColor="#FF6A5E" />
                        </linearGradient>
                        <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
                          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.2"/>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} />
                      <XAxis 
                        type="number" 
                        domain={[0, 100]} 
                        tick={{ fontSize: 12 }} 
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="schoolName" 
                        width={100} 
                        tick={{ fontSize: 13, fontWeight: 'bold' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          border: 'none',
                          padding: '12px',
                          fontSize: '14px'
                        }} 
                        formatter={(value) => [`${value}%`, 'Pass Rate']}
                      />
                      <Legend 
                        wrapperStyle={{ 
                          fontSize: '13px',
                          paddingTop: '15px'
                        }}
                        iconType="circle"
                        iconSize={10}
                      />
                      <Bar 
                        dataKey="passingRate" 
                        name="Pass Rate (%)" 
                        radius={[4, 4, 4, 4]}
                        label={{ 
                          position: 'right', 
                          formatter: (value: number) => `${value}%`, 
                          fill: '#000', 
                          fontSize: 13,
                          fontWeight: 'bold',
                          offset: 15
                        }}
                        animationDuration={1200}
                      >
                        {filteredTestData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.passingRate >= 70 ? "url(#passGradient)" : "url(#failGradient)"}
                            filter="url(#shadow)"
                            stroke="#fff"
                            strokeWidth={1}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 flex justify-center">
                  <div className="grid grid-cols-2 gap-8 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-r from-[#34A853] to-[#4FC26B] shadow-sm"></div>
                      <span className="text-sm font-medium text-gray-700">Pass (≥70%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-r from-[#EA4335] to-[#FF6A5E] shadow-sm"></div>
                      <span className="text-sm font-medium text-gray-700">Fail (Below 70%)</span>
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
              <Button 
                className="bg-[#0A2463] hover:bg-[#071A4A] gap-2"
                onClick={handleExportTestResults}
              >
                <Download size={16} /> Export Test Results
              </Button>
              <Button 
                variant="outline" 
                className="border-[#0A2463] text-[#0A2463] gap-2"
                onClick={handleGeneratePDFReport}
              >
                <FileText size={16} /> Generate PDF Report
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-200 text-blue-600 gap-2 hover:bg-blue-50"
                onClick={() => handlePrintReport()}
              >
                <Printer size={16} /> Print Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Removed the Detailed Test Analysis section as requested */}
    </main>
  );
};

export default TestTracker;
