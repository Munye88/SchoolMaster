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

  // Fetch test scores and schools data
  const { data: testScores = [], isLoading: testLoading } = useQuery<TestResult[]>({
    queryKey: ['/api/test-scores'],
    refetchInterval: 30000,
  });

  const { data: schools = [], isLoading: schoolsLoading } = useQuery<SchoolData[]>({
    queryKey: ['/api/schools'],
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const cycles = [1, 2, 3, 4];
  const years = [2024, 2025];

  // Process real test data into aggregated format
  const processedTestData = useMemo(() => {
    if (testLoading || schoolsLoading || !testScores.length || !schools.length) {
      console.log('Data loading or empty:', { testLoading, schoolsLoading, testScoresLength: testScores.length, schoolsLength: schools.length });
      return [];
    }

    console.log('Processing test data:', { testScoresCount: testScores.length, schoolsCount: schools.length });
    const schoolMap = new Map(schools.map(school => [school.id, school.name]));
    const aggregatedData: ProcessedTestData[] = [];

    // Group test scores by test type, time period, and school
    const groups = new Map<string, TestResult[]>();

    testScores.forEach((score, index) => {
      const testDate = new Date(score.testDate);
      const year = testDate.getFullYear();
      const month = testDate.toLocaleString('default', { month: 'long' });
      
      // Debug first few records
      if (index < 3) {
        console.log('Processing score:', { score, testDate, year, month });
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
              {selectedSchool === 'all' ? 'All Schools' : selectedSchool}
            </Badge>
            <span className="text-sm text-gray-500 ml-2">
              ({filteredData.length} records found)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Navigation & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Test Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Type</label>
              <Select value={selectedTestType} onValueChange={handleTestTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALCPT">ALCPT Tests</SelectItem>
                  <SelectItem value="Book">Book Tests</SelectItem>
                  <SelectItem value="ECL">ECL Tests</SelectItem>
                  <SelectItem value="OPI">OPI Tests</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Month or Cycle */}
            {selectedTestType !== 'Book' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <Select value={selectedMonth} onValueChange={handleMonthChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Cycle</label>
                <Select value={selectedCycle.toString()} onValueChange={handleCycleChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cycles.map(cycle => (
                      <SelectItem key={cycle} value={cycle.toString()}>Cycle {cycle}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Year */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* School Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">School</label>
              <Select value={selectedSchool} onValueChange={handleSchoolChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  <SelectItem value="KFNA">KFNA</SelectItem>
                  <SelectItem value="NFS East">NFS East</SelectItem>
                  <SelectItem value="NFS West">NFS West</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Debug Info */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Debug</label>
              <div className="text-xs bg-gray-100 p-2 rounded">
                Results: {filteredData.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Chart */}
      {filteredData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No data found for the selected filters
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Avg Score</TableHead>
                  <TableHead>Passing Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.schoolName}</TableCell>
                    <TableCell>{item.testType}</TableCell>
                    <TableCell>
                      {item.testType === 'Book' ? `Cycle ${item.cycle}` : item.month} {item.year}
                    </TableCell>
                    <TableCell>{item.studentCount}</TableCell>
                    <TableCell>{item.averageScore}%</TableCell>
                    <TableCell>{item.passingRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestTrackerSimple;