import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TestResult {
  id: number;
  studentName: string;
  school: string;
  schoolId: number;
  testType: string;
  score: number;
  maxScore: number;
  percentage: number;
  testDate: string;
  instructor: string;
  course: string;
  level: string;
  uploadDate: string;
  courseName: string;
  type: string;
  passingScore: number;
  status: string;
}

interface ProcessedTestData {
  id: number;
  testType: string;
  year: number;
  schoolName: string;
  averageScore: number;
  passingRate: number;
  studentCount: number;
  month?: string;
  cycle?: number;
}

export default function TestTrackerWithTabs() {
  // State for navigation
  const [selectedTestType, setSelectedTestType] = useState<string>('ALCPT');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedSchool, setSelectedSchool] = useState<string>('all');

  // Fetch data
  const { data: testScores = [], isLoading: testLoading, error: testError } = useQuery<TestResult[]>({
    queryKey: ['/api/test-scores']
  });

  const { data: schools = [], isLoading: schoolsLoading } = useQuery<any[]>({
    queryKey: ['/api/schools']
  });

  // Constants
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const cycles = ['all', '1', '2', '3', '4'];
  const months_with_all = ['all', ...months];
  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  // Process test data
  const processedTestData = useMemo(() => {
    if (testLoading || schoolsLoading || !testScores || !schools) {
      return [];
    }

    console.log('🔍 Processing', testScores.length, 'test scores');
    
    const schoolMap = new Map(schools?.map((school: any) => [school.id, school.name]) || []);
    const aggregatedData: ProcessedTestData[] = [];
    const groups = new Map<string, TestResult[]>();

    // Group test scores
    testScores.forEach((score: any) => {
      const testDate = new Date(score.testDate);
      const year = testDate.getFullYear();
      const monthName = months[testDate.getMonth()];
      const schoolName = schoolMap.get(score.schoolId) || score.school || 'Unknown';
      
      // Determine test type
      let testType = score.testType || score.type;
      if (!testType && score.courseName) {
        const courseUpper = score.courseName.toUpperCase();
        if (courseUpper.includes('ALCPT')) testType = 'ALCPT';
        else if (courseUpper.includes('BOOK')) testType = 'Book';
        else if (courseUpper.includes('ECL')) testType = 'ECL';
        else if (courseUpper.includes('OPI')) testType = 'OPI';
      }

      if (testType === 'Book') {
        // For Book tests, use cycle instead of month
        const cycle = Math.ceil(testDate.getMonth() / 3) + 1;
        const key = `${testType}-${cycle}-${year}-${score.schoolId}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(score);
      } else {
        // For other tests, use month
        const key = `${testType}-${monthName}-${year}-${score.schoolId}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(score);
      }
    });

    // Create aggregated data
    let id = 1;
    groups.forEach((scores, key) => {
      const [testType, timePeriod, year, schoolId] = key.split('-');
      const schoolName = schoolMap.get(parseInt(schoolId)) || 'Unknown School';
      
      const totalScore = scores.reduce((sum, s) => sum + (s.score || 0), 0);
      const averageScore = Math.round(totalScore / scores.length);
      const passingScores = scores.filter(s => (s.percentage || 0) >= (s.passingScore || 75));
      const passingRate = Math.round((passingScores.length / scores.length) * 100);

      const item: ProcessedTestData = {
        id: id++,
        testType,
        year: parseInt(year),
        schoolName,
        averageScore,
        passingRate,
        studentCount: scores.length,
      };

      if (testType === 'Book') {
        item.cycle = parseInt(timePeriod);
      } else {
        item.month = timePeriod;
      }

      aggregatedData.push(item);
    });

    console.log('✅ Created', aggregatedData.length, 'aggregated records');
    return aggregatedData;
  }, [testScores, schools, testLoading, schoolsLoading]);

  // Filter data based on selections - Show all records for selected test type
  const filteredData = useMemo(() => {
    if (!processedTestData || processedTestData.length === 0) {
      return [];
    }

    return processedTestData.filter(item => {
      // Always filter by test type
      if (item.testType !== selectedTestType) return false;
      
      // Filter by year
      if (item.year !== selectedYear) return false;
      
      // Filter by school if not 'all'
      if (selectedSchool !== 'all' && item.schoolName !== selectedSchool) return false;
      
      // For monthly navigation, show records for selected month/cycle
      if (selectedTestType === 'Book') {
        // Show all cycles if none selected, or specific cycle
        return selectedCycle === 'all' || (item.cycle && item.cycle.toString() === selectedCycle);
      } else {
        // Show all months if none selected, or specific month
        return selectedMonth === 'all' || item.month === selectedMonth;
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

  if (testLoading || schoolsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading test data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Tracker</h1>
          <p className="text-muted-foreground">
            Track and analyze test performance across all schools - Monthly Results View
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

      {/* Test Type Tabs */}
      <Card className="rounded-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-center">Test Type Selection</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-2">
            {['ALCPT', 'Book', 'ECL', 'OPI'].map((testType) => (
              <button
                key={testType}
                onClick={() => setSelectedTestType(testType)}
                className={`px-4 py-3 border text-sm font-medium transition-colors ${
                  selectedTestType === testType
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {testType}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Month/Cycle Navigation Tabs */}
      <Card className="rounded-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-center">
            {selectedTestType === 'Book' ? 'Cycle Selection' : 'Month Selection'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {selectedTestType === 'Book' ? (
            <div className="grid grid-cols-4 gap-2">
              {cycles.map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setSelectedCycle(cycle.toString())}
                  className={`px-4 py-3 border text-sm font-medium transition-colors ${
                    selectedCycle === cycle.toString()
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cycle === 'all' ? 'All Cycles' : `Cycle ${cycle}`}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {months_with_all.map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`px-3 py-2 border text-xs font-medium transition-colors ${
                    selectedMonth === month
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {month === 'all' ? 'All' : month.slice(0, 3)}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Year and School Selection */}
      <Card className="rounded-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-center">Year and School Selection</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Year Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-center block">Year</label>
              <div className="grid grid-cols-4 gap-1">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-3 py-2 border text-xs font-medium transition-colors ${
                      selectedYear === year
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* School Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-center block">School</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'all', label: 'All Schools' },
                  { value: 'KFNA', label: 'KFNA' },
                  { value: 'NFS East', label: 'NFS East' },
                  { value: 'NFS West', label: 'NFS West' }
                ].map((school) => (
                  <button
                    key={school.value}
                    onClick={() => setSelectedSchool(school.value)}
                    className={`px-3 py-2 border text-xs font-medium transition-colors ${
                      selectedSchool === school.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {school.label}
                  </button>
                ))}
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
              <p>No data found for the selected filters</p>
              <div className="mt-4 text-xs text-left bg-gray-50 p-3">
                <p><strong>Debug Info:</strong></p>
                <p>Test Scores: {testScores?.length || 0} records</p>
                <p>Schools: {Array.isArray(schools) ? schools.length : 0} records</p>
                <p>Processed: {processedTestData?.length || 0} records</p>
                <p>Filtered: {filteredData?.length || 0} records</p>
                <p>Loading: {testLoading ? 'Yes' : 'No'}</p>
                <p>Selected: {selectedTestType} | {selectedMonth} | {selectedCycle} | {selectedYear} | {selectedSchool}</p>
                <p>Selected: {selectedTestType}, {selectedTestType === 'Book' ? `Cycle ${selectedCycle}` : selectedMonth}, {selectedYear}, {selectedSchool}</p>
              </div>
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
                      <TableCell className="text-center px-4 py-3 border-r font-medium">
                        {item.schoolName}
                      </TableCell>
                      <TableCell className="text-center px-4 py-3 border-r">
                        {item.testType}
                      </TableCell>
                      <TableCell className="text-center px-4 py-3 border-r">
                        {item.testType === 'Book' ? `Cycle ${item.cycle}` : item.month} {item.year}
                      </TableCell>
                      <TableCell className="text-center px-4 py-3 border-r">
                        {item.studentCount}
                      </TableCell>
                      <TableCell className="text-center px-4 py-3 border-r">
                        <Badge variant={item.averageScore >= 75 ? "default" : "destructive"} className="rounded-none">
                          {item.averageScore}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center px-4 py-3">
                        <Badge variant={item.passingRate >= 80 ? "default" : "destructive"} className="rounded-none">
                          {item.passingRate}%
                        </Badge>
                      </TableCell>
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
}