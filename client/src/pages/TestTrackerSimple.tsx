import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TestResult {
  id: number;
  studentName?: string;
  score: number;
  courseName: string;
  testDate: string;
  passingScore: number;
  type: string;
  status: "Pass" | "Fail";
  schoolId: number;
}

interface SchoolData {
  id: number;
  name: string;
  code: string;
}

interface ProcessedTestData {
  id: number;
  testType: 'ALCPT' | 'Book' | 'ECL' | 'OPI';
  month?: string;
  cycle?: number;
  year: number;
  schoolName: string;
  averageScore: number;
  passingRate: number;
  studentCount: number;
}

const TestTrackerSimple: React.FC = () => {
  const [selectedTestType, setSelectedTestType] = useState<'ALCPT' | 'Book' | 'ECL' | 'OPI'>('ALCPT');
  const [selectedMonth, setSelectedMonth] = useState<string>('January');
  const [selectedCycle, setSelectedCycle] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedSchool, setSelectedSchool] = useState<string>('all');

  // Fetch test scores and schools data with production debugging
  const { data: testScores = [], isLoading: testLoading } = useQuery<TestResult[]>({
    queryKey: ['/api/test-scores'],
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000,
  });

  const { data: schools = [], isLoading: schoolsLoading } = useQuery<SchoolData[]>({
    queryKey: ['/api/schools'],
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const cycles = [1, 2, 3, 4];
  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  // Process real test data into aggregated format
  const processedTestData = useMemo(() => {
    // Enhanced production debugging
    console.log('🔍 Test Tracker Data Processing - API Response Check');
    console.log('📊 Test Scores Type:', typeof testScores, 'Is Array:', Array.isArray(testScores));
    console.log('🏫 Schools Type:', typeof schools, 'Is Array:', Array.isArray(schools));
    console.log('📈 Raw Test Scores Sample:', testScores?.slice(0, 2));
    console.log('🎯 Loading States:', { testLoading, schoolsLoading });
    
    if (testLoading || schoolsLoading) {
      console.log('⏳ Still loading data...');
      return [];
    }
    
    if (!testScores || !Array.isArray(testScores) || testScores.length === 0) {
      console.warn('⚠️ No test scores available for test tracker');
      console.log('📊 Test scores data:', testScores);
      return [];
    }
    
    if (!schools || !Array.isArray(schools) || schools.length === 0) {
      console.warn('⚠️ No schools data available for test tracker');
      console.log('🏫 Schools data:', schools);
      return [];
    }

    console.log('✅ Processing test data:', { testScoresCount: testScores.length, schoolsCount: schools.length });
    const schoolMap = new Map(schools.map(school => [school.id, school.name]));
    console.log('🏫 School mapping created:', Array.from(schoolMap.entries()));
    const aggregatedData: ProcessedTestData[] = [];

    // Group test scores by test type, time period, and school
    const groups = new Map<string, TestResult[]>();

    testScores.forEach((score, index) => {
      // Enhanced error handling for production
      try {
        const testDate = new Date(score.testDate);
        if (isNaN(testDate.getTime())) {
          console.warn('⚠️ Invalid test date for score:', score);
          return;
        }
        
        const year = testDate.getFullYear();
        const month = testDate.toLocaleString('default', { month: 'long' });
        
        // Debug first few records with enhanced logging
        if (index < 3) {
          console.log('✅ Processing score:', { 
            id: score.id, 
            type: score.type, 
            courseName: score.courseName,
            testDate: score.testDate, 
            year, 
            month,
            schoolId: score.schoolId
          });
        }
        
        // Determine test type from course name or type field
        let testType: 'ALCPT' | 'Book' | 'ECL' | 'OPI' = 'ALCPT';
        const courseUpper = (score.courseName || '').toUpperCase();
        const typeUpper = (score.type || '').toUpperCase();
        
        if (courseUpper.includes('BOOK') || typeUpper.includes('BOOK') || courseUpper.includes('QUIZ')) {
          testType = 'Book';
        } else if (courseUpper.includes('ECL') || typeUpper.includes('ECL')) {
          testType = 'ECL';
        } else if (courseUpper.includes('OPI') || typeUpper.includes('OPI')) {
          testType = 'OPI';
        } else if (courseUpper.includes('ALCPT') || typeUpper.includes('ALCPT')) {
          testType = 'ALCPT';
        }

        // Determine cycle for Book tests (quarterly)
        const cycle = Math.ceil((testDate.getMonth() + 1) / 3);
        
        const key = testType === 'Book' 
          ? `${testType}-${cycle}-${year}-${score.schoolId}`
          : `${testType}-${month}-${year}-${score.schoolId}`;

        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(score);
      } catch (error) {
        console.error('Error processing test score:', error, score);
      }
    });

    console.log('Created groups:', groups.size);

    // Create aggregated records
    groups.forEach((scores, key) => {
      const [testType, period, yearStr, schoolIdStr] = key.split('-');
      const year = parseInt(yearStr);
      const schoolId = parseInt(schoolIdStr);
      const schoolName = schoolMap.get(schoolId) || 'Unknown';

      const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
      const averageScore = Math.round(totalScore / scores.length);
      const passCount = scores.filter(score => score.status === 'Pass').length;
      const passingRate = Math.round((passCount / scores.length) * 100);

      const processedItem: ProcessedTestData = {
        id: aggregatedData.length + 1,
        testType: testType as 'ALCPT' | 'Book' | 'ECL' | 'OPI',
        year,
        schoolName,
        averageScore,
        passingRate,
        studentCount: scores.length
      };

      if (testType === 'Book') {
        processedItem.cycle = parseInt(period);
      } else {
        processedItem.month = period;
      }

      aggregatedData.push(processedItem);
    });

    console.log('Final aggregated data:', aggregatedData.length);
    return aggregatedData;
  }, [testScores, schools, testLoading, schoolsLoading]);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return processedTestData.filter(item => {
      if (item.testType !== selectedTestType) return false;
      if (selectedSchool !== 'all' && item.schoolName !== selectedSchool) return false;
      if (item.year !== selectedYear) return false;
      
      if (selectedTestType === 'Book') {
        return item.cycle === selectedCycle;
      } else {
        return item.month === selectedMonth;
      }
    });
  }, [processedTestData, selectedTestType, selectedMonth, selectedCycle, selectedYear, selectedSchool]);

  // Chart data
  const chartData = filteredData.map(item => ({
    school: item.schoolName,
    averageScore: item.averageScore,
    passingRate: item.passingRate,
    students: item.studentCount
  }));

  const handleTestTypeChange = (value: string) => {
    console.log('Test type changed to:', value);
    setSelectedTestType(value as 'ALCPT' | 'Book' | 'ECL' | 'OPI');
  };

  const handleMonthChange = (value: string) => {
    console.log('Month changed to:', value);
    setSelectedMonth(value);
  };

  const handleCycleChange = (value: string) => {
    console.log('Cycle changed to:', value);
    setSelectedCycle(parseInt(value));
  };

  const handleYearChange = (value: string) => {
    console.log('Year changed to:', value);
    setSelectedYear(parseInt(value));
  };

  const handleSchoolChange = (value: string) => {
    console.log('School changed to:', value);
    setSelectedSchool(value);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Tracker</h1>
          <p className="text-muted-foreground">
            Track and analyze test performance across all schools
          </p>
        </div>
      </div>

      {/* Current Selection Display */}
      <Card className="bg-blue-50 border-blue-200 rounded-none">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <span className="text-sm font-medium text-gray-600">Current View:</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 rounded-none">
              {selectedTestType} Tests
            </Badge>
            {selectedTestType !== 'Book' ? (
              <Badge variant="outline" className="border-blue-300 text-blue-700 rounded-none">
                {selectedMonth} {selectedYear}
              </Badge>
            ) : (
              <Badge variant="outline" className="border-blue-300 text-blue-700 rounded-none">
                Cycle {selectedCycle} - {selectedYear}
              </Badge>
            )}
            <Badge variant="outline" className="border-green-300 text-green-700 rounded-none">
              {selectedSchool === 'all' ? 'All Schools' : selectedSchool}
            </Badge>
            <span className="text-sm text-gray-500">
              ({filteredData.length} records found)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <Card className="rounded-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-center">Navigation & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            {/* Test Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-center block">Test Type</label>
              <Select value={selectedTestType} onValueChange={handleTestTypeChange}>
                <SelectTrigger className="rounded-none h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-0">
                  <SelectItem value="ALCPT" className="rounded-none">ALCPT Tests</SelectItem>
                  <SelectItem value="Book" className="rounded-none">Book Tests</SelectItem>
                  <SelectItem value="ECL" className="rounded-none">ECL Tests</SelectItem>
                  <SelectItem value="OPI" className="rounded-none">OPI Tests</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Month or Cycle */}
            {selectedTestType !== 'Book' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-center block">Month</label>
                <Select value={selectedMonth} onValueChange={handleMonthChange}>
                  <SelectTrigger className="rounded-none h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-0">
                    {months.map(month => (
                      <SelectItem key={month} value={month} className="rounded-none">{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-center block">Cycle</label>
                <Select value={selectedCycle.toString()} onValueChange={handleCycleChange}>
                  <SelectTrigger className="rounded-none h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-0">
                    {cycles.map(cycle => (
                      <SelectItem key={cycle} value={cycle.toString()} className="rounded-none">Cycle {cycle}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Year */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-center block">Year</label>
              <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="rounded-none h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-0">
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()} className="rounded-none">{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* School Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-center block">School</label>
              <Select value={selectedSchool} onValueChange={handleSchoolChange}>
                <SelectTrigger className="rounded-none h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-0">
                  <SelectItem value="all" className="rounded-none">All Schools</SelectItem>
                  <SelectItem value="KFNA" className="rounded-none">KFNA</SelectItem>
                  <SelectItem value="NFS East" className="rounded-none">NFS East</SelectItem>
                  <SelectItem value="NFS West" className="rounded-none">NFS West</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Debug Info */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-center block">Results</label>
              <div className="text-sm bg-gray-100 p-2 rounded-none h-10 flex items-center justify-center border">
                {filteredData.length} records
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Chart */}
      {filteredData.length > 0 && (
        <Card className="rounded-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-center">Test Results Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="school" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="averageScore" fill="#3b82f6" name="Average Score" />
                  <Bar dataKey="passingRate" fill="#10b981" name="Passing Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card className="rounded-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-center">Detailed Results</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border rounded-none p-4">
              No data found for the selected filters
            </div>
          ) : (
            <div className="border rounded-none overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="text-center px-4 py-3 border-r">School</TableHead>
                    <TableHead className="text-center px-4 py-3 border-r">Test Type</TableHead>
                    <TableHead className="text-center px-4 py-3 border-r">Period</TableHead>
                    <TableHead className="text-center px-4 py-3 border-r">Students</TableHead>
                    <TableHead className="text-center px-4 py-3 border-r">Avg Score</TableHead>
                    <TableHead className="text-center px-4 py-3">Passing Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id} className="border-b">
                      <TableCell className="text-center font-medium px-4 py-3 border-r">{item.schoolName}</TableCell>
                      <TableCell className="text-center px-4 py-3 border-r">{item.testType}</TableCell>
                      <TableCell className="text-center px-4 py-3 border-r">
                        {item.testType === 'Book' ? `Cycle ${item.cycle}` : item.month} {item.year}
                      </TableCell>
                      <TableCell className="text-center px-4 py-3 border-r">{item.studentCount}</TableCell>
                      <TableCell className="text-center px-4 py-3 border-r">{item.averageScore}%</TableCell>
                      <TableCell className="text-center px-4 py-3">{item.passingRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestTrackerSimple;