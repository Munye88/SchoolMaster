import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CalendarIcon, TrendingUpIcon, UsersIcon, BookOpenIcon, DownloadIcon, UploadIcon } from 'lucide-react';

// Privacy-compliant interfaces - no personal information
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

interface TestResult {
  id: number;
  courseName: string;
  testDate: Date;
  score: number;
  passingScore: number;
  type: string;
  status: "Pass" | "Fail";
  schoolId: number;
}

const TestTracker: React.FC = () => {
  // Navigation state
  const [selectedTestType, setSelectedTestType] = useState<'Book' | 'ALCPT' | 'ECL' | 'OPI'>('ALCPT');
  const [selectedMonth, setSelectedMonth] = useState<string>('January');
  const [selectedCycle, setSelectedCycle] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('all');

  // Mock schools data
  const schools = [
    { id: 349, name: 'KFNA' },
    { id: 350, name: 'NFS East' },
    { id: 351, name: 'NFS West' }
  ];

  // Privacy-compliant aggregate test data
  const aggregateTestData: AggregateTestData[] = [
    // KFNA School data
    {
      id: 1,
      month: "January",
      year: 2025,
      testType: "ALCPT",
      schoolId: 349,
      schoolName: "KFNA",
      studentCount: 45,
      averageScore: 76.2,
      passingScore: 75,
      passingRate: 82.2
    },
    {
      id: 2,
      month: "February", 
      year: 2025,
      testType: "ALCPT",
      schoolId: 349,
      schoolName: "KFNA",
      studentCount: 48,
      averageScore: 78.5,
      passingScore: 75,
      passingRate: 85.4
    },
    {
      id: 3,
      month: "March",
      year: 2025,
      testType: "ALCPT",
      schoolId: 349,
      schoolName: "KFNA",
      studentCount: 41,
      averageScore: 74.1,
      passingScore: 75,
      passingRate: 78.0
    },
    {
      id: 4,
      cycle: 1,
      year: 2025,
      testType: "Book",
      schoolId: 349,
      schoolName: "KFNA", 
      studentCount: 253,
      averageScore: 71.8,
      passingScore: 70,
      passingRate: 78.8
    },
    {
      id: 5,
      cycle: 2,
      year: 2025,
      testType: "Book",
      schoolId: 349,
      schoolName: "KFNA", 
      studentCount: 248,
      averageScore: 73.2,
      passingScore: 70,
      passingRate: 81.3
    },
    {
      id: 6,
      cycle: 3,
      year: 2025,
      testType: "Book",
      schoolId: 349,
      schoolName: "KFNA", 
      studentCount: 251,
      averageScore: 72.4,
      passingScore: 70,
      passingRate: 79.7
    },
    {
      id: 7,
      cycle: 4,
      year: 2025,
      testType: "Book",
      schoolId: 349,
      schoolName: "KFNA", 
      studentCount: 245,
      averageScore: 74.8,
      passingScore: 70,
      passingRate: 83.3
    },
    // KFNA - April and May ALCPT Tests
    {
      id: 8,
      month: "April",
      year: 2025,
      testType: "ALCPT",
      schoolId: 349,
      schoolName: "KFNA",
      studentCount: 245,
      averageScore: 79.3,
      passingScore: 75,
      passingRate: 87.8
    },
    {
      id: 9,
      month: "May",
      year: 2025,
      testType: "ALCPT",
      schoolId: 349,
      schoolName: "KFNA",
      studentCount: 253,
      averageScore: 77.6,
      passingScore: 75,
      passingRate: 84.2
    },
    // KFNA - ECL and OPI Tests
    {
      id: 10,
      month: "February",
      year: 2025,
      testType: "ECL",
      schoolId: 349,
      schoolName: "KFNA",
      studentCount: 248,
      averageScore: 69.4,
      passingScore: 65,
      passingRate: 76.6
    },
    {
      id: 11,
      month: "April",
      year: 2025,
      testType: "ECL",
      schoolId: 349,
      schoolName: "KFNA",
      studentCount: 245,
      averageScore: 71.2,
      passingScore: 65,
      passingRate: 80.4
    },
    {
      id: 12,
      month: "March",
      year: 2025,
      testType: "OPI",
      schoolId: 349,
      schoolName: "KFNA",
      studentCount: 251,
      averageScore: 2.7,
      passingScore: 2.5,
      passingRate: 85.3
    },
    {
      id: 13,
      month: "May",
      year: 2025,
      testType: "OPI",
      schoolId: 349,
      schoolName: "KFNA",
      studentCount: 253,
      averageScore: 2.9,
      passingScore: 2.5,
      passingRate: 89.7
    },

    // NFS East School - ALCPT Tests (January - May 2025)
    {
      id: 14,
      month: "January",
      year: 2025,
      testType: "ALCPT",
      schoolId: 350,
      schoolName: "NFS East",
      studentCount: 57,
      averageScore: 73.4,
      passingScore: 70,
      passingRate: 89.3
    },
    {
      id: 15,
      month: "February",
      year: 2025,
      testType: "ALCPT",
      schoolId: 350,
      schoolName: "NFS East",
      studentCount: 54,
      averageScore: 75.8,
      passingScore: 70,
      passingRate: 92.6
    },
    {
      id: 16,
      month: "March",
      year: 2025,
      testType: "ALCPT",
      schoolId: 350,
      schoolName: "NFS East",
      studentCount: 56,
      averageScore: 72.8,
      passingScore: 70,
      passingRate: 86.2
    },
    {
      id: 17,
      month: "April",
      year: 2025,
      testType: "ALCPT",
      schoolId: 350,
      schoolName: "NFS East",
      studentCount: 55,
      averageScore: 76.4,
      passingScore: 70,
      passingRate: 90.9
    },
    {
      id: 18,
      month: "May",
      year: 2025,
      testType: "ALCPT",
      schoolId: 350,
      schoolName: "NFS East",
      studentCount: 57,
      averageScore: 74.7,
      passingScore: 70,
      passingRate: 87.7
    },
    // NFS East - ECL Tests
    {
      id: 19,
      month: "January",
      year: 2025,
      testType: "ECL",
      schoolId: 350, 
      schoolName: "NFS East",
      studentCount: 57,
      averageScore: 68.7,
      passingScore: 65,
      passingRate: 75.0
    },
    {
      id: 20,
      month: "March",
      year: 2025,
      testType: "ECL",
      schoolId: 350, 
      schoolName: "NFS East",
      studentCount: 56,
      averageScore: 70.1,
      passingScore: 65,
      passingRate: 78.6
    },
    {
      id: 21,
      month: "May",
      year: 2025,
      testType: "ECL",
      schoolId: 350, 
      schoolName: "NFS East",
      studentCount: 57,
      averageScore: 71.3,
      passingScore: 65,
      passingRate: 82.5
    },
    // NFS East - Book and OPI Tests
    {
      id: 22,
      cycle: 1,
      year: 2025,
      testType: "Book",
      schoolId: 350,
      schoolName: "NFS East", 
      studentCount: 57,
      averageScore: 69.8,
      passingScore: 65,
      passingRate: 75.4
    },
    {
      id: 23,
      cycle: 2,
      year: 2025,
      testType: "Book",
      schoolId: 350,
      schoolName: "NFS East", 
      studentCount: 54,
      averageScore: 71.2,
      passingScore: 65,
      passingRate: 79.6
    },
    {
      id: 24,
      cycle: 3,
      year: 2025,
      testType: "Book",
      schoolId: 350,
      schoolName: "NFS East", 
      studentCount: 56,
      averageScore: 68.9,
      passingScore: 65,
      passingRate: 73.2
    },
    {
      id: 25,
      month: "February",
      year: 2025,
      testType: "OPI",
      schoolId: 350,
      schoolName: "NFS East",
      studentCount: 54,
      averageScore: 2.6,
      passingScore: 2.5,
      passingRate: 81.5
    },
    {
      id: 26,
      month: "April",
      year: 2025,
      testType: "OPI",
      schoolId: 350,
      schoolName: "NFS East",
      studentCount: 55,
      averageScore: 2.8,
      passingScore: 2.5,
      passingRate: 87.3
    },

    // NFS West School - ALCPT Tests (January - May 2025)
    {
      id: 27,
      month: "January",
      year: 2025,
      testType: "ALCPT",
      schoolId: 351,
      schoolName: "NFS West",
      studentCount: 121,
      averageScore: 74.9,
      passingScore: 70,
      passingRate: 84.2
    },
    {
      id: 28,
      month: "February",
      year: 2025,
      testType: "ALCPT",
      schoolId: 351,
      schoolName: "NFS West",
      studentCount: 118,
      averageScore: 76.3,
      passingScore: 70,
      passingRate: 88.1
    },
    {
      id: 29,
      month: "March",
      year: 2025,
      testType: "ALCPT",
      schoolId: 351,
      schoolName: "NFS West",
      studentCount: 120,
      averageScore: 73.7,
      passingScore: 70,
      passingRate: 82.5
    },
    {
      id: 30,
      month: "April",
      year: 2025,
      testType: "ALCPT",
      schoolId: 351,
      schoolName: "NFS West",
      studentCount: 119,
      averageScore: 77.8,
      passingScore: 70,
      passingRate: 90.8
    },
    {
      id: 31,
      month: "May",
      year: 2025,
      testType: "ALCPT",
      schoolId: 351,
      schoolName: "NFS West",
      studentCount: 121,
      averageScore: 75.2,
      passingScore: 70,
      passingRate: 86.0
    },
    // NFS West - OPI, ECL, and Book Tests
    {
      id: 32,
      month: "January",
      year: 2025,
      testType: "OPI",
      schoolId: 351,
      schoolName: "NFS West", 
      studentCount: 121,
      averageScore: 2.8,
      passingScore: 2.5,
      passingRate: 88.0
    },
    {
      id: 33,
      month: "March",
      year: 2025,
      testType: "OPI",
      schoolId: 351,
      schoolName: "NFS West", 
      studentCount: 120,
      averageScore: 2.9,
      passingScore: 2.5,
      passingRate: 91.7
    },
    {
      id: 34,
      month: "May",
      year: 2025,
      testType: "OPI",
      schoolId: 351,
      schoolName: "NFS West", 
      studentCount: 121,
      averageScore: 3.0,
      passingScore: 2.5,
      passingRate: 93.4
    },
    {
      id: 35,
      month: "February",
      year: 2025,
      testType: "ECL",
      schoolId: 351,
      schoolName: "NFS West", 
      studentCount: 118,
      averageScore: 67.5,
      passingScore: 65,
      passingRate: 81.8
    },
    {
      id: 36,
      month: "April",
      year: 2025,
      testType: "ECL",
      schoolId: 351,
      schoolName: "NFS West", 
      studentCount: 119,
      averageScore: 69.7,
      passingScore: 65,
      passingRate: 84.9
    },
    {
      id: 37,
      cycle: 1,
      year: 2025,
      testType: "Book",
      schoolId: 351,
      schoolName: "NFS West", 
      studentCount: 121,
      averageScore: 70.3,
      passingScore: 68,
      passingRate: 79.3
    },
    {
      id: 38,
      cycle: 2,
      year: 2025,
      testType: "Book",
      schoolId: 351,
      schoolName: "NFS West", 
      studentCount: 118,
      averageScore: 72.1,
      passingScore: 68,
      passingRate: 83.1
    },
    {
      id: 39,
      cycle: 3,
      year: 2025,
      testType: "Book",
      schoolId: 351,
      schoolName: "NFS West", 
      studentCount: 120,
      averageScore: 71.6,
      passingScore: 68,
      passingRate: 81.7
    },
    {
      id: 40,
      cycle: 4,
      year: 2025,
      testType: "Book",
      schoolId: 351,
      schoolName: "NFS West", 
      studentCount: 119,
      averageScore: 73.4,
      passingScore: 68,
      passingRate: 85.7
    }
  ];

  // Filter data based on selections with proper month/cycle navigation
  const filteredTestData = useMemo(() => {
    return aggregateTestData.filter(item => {
      const matchesSchool = selectedSchoolFilter === 'all' || 
        schools.find(s => s.id === item.schoolId)?.name === selectedSchoolFilter;
      
      const matchesTestType = item.testType === selectedTestType;
      const matchesYear = item.year === selectedYear;
      
      if (selectedTestType === 'Book') {
        return matchesSchool && matchesTestType && matchesYear && item.cycle === selectedCycle;
      } else {
        return matchesSchool && matchesTestType && matchesYear && item.month === selectedMonth;
      }
    });
  }, [selectedSchoolFilter, selectedTestType, selectedYear, selectedCycle, selectedMonth, schools]);

  // Enhanced debug function with proper state management
  const handleNavigationChange = (type: string, value: string) => {
    console.log(`📊 Test Tracker Navigation: ${type} changed to ${value}`);
    console.log('📊 Current state:', { selectedTestType, selectedMonth, selectedCycle, selectedYear, selectedSchoolFilter });
    
    switch(type) {
      case 'testType':
        console.log('📊 Setting test type to:', value);
        setSelectedTestType(value as 'Book' | 'ALCPT' | 'ECL' | 'OPI');
        break;
      case 'month':
        console.log('📊 Setting month to:', value);
        setSelectedMonth(value);
        break;
      case 'cycle':
        console.log('📊 Setting cycle to:', parseInt(value));
        setSelectedCycle(parseInt(value));
        break;
      case 'year':
        console.log('📊 Setting year to:', parseInt(value));
        setSelectedYear(parseInt(value));
        break;
      case 'school':
        console.log('📊 Setting school filter to:', value);
        setSelectedSchoolFilter(value);
        break;
      default:
        console.warn('📊 Unknown navigation type:', type);
    }
    
    // Log updated state after changes
    setTimeout(() => {
      console.log('📊 Updated state:', { 
        testType: selectedTestType, 
        month: selectedMonth, 
        cycle: selectedCycle, 
        year: selectedYear, 
        school: selectedSchoolFilter 
      });
    }, 100);
  };

  // Calculate statistics
  const totalStudents = filteredTestData.reduce((sum, item) => sum + item.studentCount, 0);
  const averageScore = filteredTestData.length > 0 
    ? filteredTestData.reduce((sum, item) => sum + item.averageScore, 0) / filteredTestData.length 
    : 0;
  const overallPassingRate = filteredTestData.length > 0
    ? filteredTestData.reduce((sum, item) => sum + item.passingRate, 0) / filteredTestData.length
    : 0;

  // Prepare chart data
  const chartData = filteredTestData.map(item => ({
    school: item.schoolName,
    students: item.studentCount,
    averageScore: item.averageScore,
    passingRate: item.passingRate
  }));

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const cycles = [1, 2, 3, 4];
  const years = [2024, 2025];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Tracker</h1>
          <p className="text-muted-foreground">
            Track and analyze test performance across all schools (Privacy compliant - no personal information displayed)
          </p>
        </div>
      </div>

      {/* Current Selection Display */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-600">Current View:</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {selectedTestType} Tests
            </Badge>
            {selectedTestType !== 'Book' ? (
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                {selectedMonth} {selectedYear}
              </Badge>
            ) : (
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                Cycle {selectedCycle} - {selectedYear}
              </Badge>
            )}
            <Badge variant="outline" className="border-green-300 text-green-700">
              {selectedSchoolFilter === 'all' ? 'All Schools' : selectedSchoolFilter}
            </Badge>
            <span className="text-sm text-gray-500 ml-2">
              ({filteredTestData.length} records found)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <Card className="relative z-10">
        <CardHeader>
          <CardTitle>Navigation & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Test Type</label>
              <Select value={selectedTestType} onValueChange={(value) => handleNavigationChange('testType', value)}>
                <SelectTrigger className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer">
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white border border-gray-200 shadow-xl rounded-md">
                  <SelectItem value="ALCPT" className="hover:bg-blue-50 cursor-pointer px-4 py-2">ALCPT Tests</SelectItem>
                  <SelectItem value="Book" className="hover:bg-blue-50 cursor-pointer px-4 py-2">Book Tests</SelectItem>
                  <SelectItem value="ECL" className="hover:bg-blue-50 cursor-pointer px-4 py-2">ECL Tests</SelectItem>
                  <SelectItem value="OPI" className="hover:bg-blue-50 cursor-pointer px-4 py-2">OPI Tests</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedTestType !== 'Book' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Month</label>
                <Select value={selectedMonth} onValueChange={(value) => handleNavigationChange('month', value)}>
                  <SelectTrigger className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent className="z-[100] bg-white border border-gray-200 shadow-xl rounded-md max-h-60 overflow-y-auto">
                    {months.map(month => (
                      <SelectItem key={month} value={month} className="hover:bg-blue-50 cursor-pointer px-4 py-2">{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cycle</label>
                <Select value={selectedCycle.toString()} onValueChange={(value) => handleNavigationChange('cycle', value)}>
                  <SelectTrigger className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer">
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent className="z-[100] bg-white border border-gray-200 shadow-xl rounded-md">
                    {cycles.map(cycle => (
                      <SelectItem key={cycle} value={cycle.toString()} className="hover:bg-blue-50 cursor-pointer px-4 py-2">Cycle {cycle}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Year</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => handleNavigationChange('year', value)}>
                <SelectTrigger className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white border border-gray-200 shadow-xl rounded-md">
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()} className="hover:bg-blue-50 cursor-pointer px-4 py-2">{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">School Filter</label>
              <Select value={selectedSchoolFilter} onValueChange={(value) => handleNavigationChange('school', value)}>
                <SelectTrigger className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer">
                  <SelectValue placeholder="All schools" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white border border-gray-200 shadow-xl rounded-md">
                  <SelectItem value="all" className="hover:bg-blue-50 cursor-pointer px-4 py-2">All Schools</SelectItem>
                  <SelectItem value="KFNA" className="hover:bg-blue-50 cursor-pointer px-4 py-2">KFNA</SelectItem>
                  <SelectItem value="NFS East" className="hover:bg-blue-50 cursor-pointer px-4 py-2">NFS East</SelectItem>
                  <SelectItem value="NFS West" className="hover:bg-blue-50 cursor-pointer px-4 py-2">NFS West</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Selection Display */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Current View:</strong> {selectedTestType} Tests - 
              {selectedTestType === 'Book' ? ` Cycle ${selectedCycle}` : ` ${selectedMonth}`} {selectedYear}
              {selectedSchoolFilter !== 'all' && ` - ${selectedSchoolFilter} Only`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUpIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{averageScore.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Passing Rate</p>
                <p className="text-2xl font-bold">{overallPassingRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Period</p>
                <p className="text-2xl font-bold">
                  {selectedTestType === 'Book' ? `C${selectedCycle}` : selectedMonth.slice(0, 3)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedTestType} Results - {selectedTestType === 'Book' ? `Cycle ${selectedCycle}` : selectedMonth} {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Average Score</TableHead>
                <TableHead>Passing Score</TableHead>
                <TableHead>Passing Rate</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTestData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.schoolName}</TableCell>
                  <TableCell>{item.studentCount}</TableCell>
                  <TableCell>{item.averageScore.toFixed(1)}</TableCell>
                  <TableCell>{item.passingScore}</TableCell>
                  <TableCell>{item.passingRate.toFixed(1)}%</TableCell>
                  <TableCell>
                    <Badge variant={item.passingRate >= 80 ? "default" : "secondary"}>
                      {item.passingRate >= 80 ? "Excellent" : item.passingRate >= 70 ? "Good" : "Needs Improvement"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance by School</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="school" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="averageScore" fill="#3b82f6" name="Average Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Passing Rates by School</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="school" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="passingRate" fill="#10b981" name="Passing Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestTracker;