import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TestData {
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

  // Sample test data
  const testData: TestData[] = [
    { id: 1, testType: 'ALCPT', month: 'January', year: 2025, schoolName: 'KFNA', averageScore: 85, passingRate: 78, studentCount: 45 },
    { id: 2, testType: 'ALCPT', month: 'January', year: 2025, schoolName: 'NFS East', averageScore: 82, passingRate: 75, studentCount: 23 },
    { id: 3, testType: 'ALCPT', month: 'January', year: 2025, schoolName: 'NFS West', averageScore: 88, passingRate: 82, studentCount: 34 },
    { id: 4, testType: 'ALCPT', month: 'February', year: 2025, schoolName: 'KFNA', averageScore: 87, passingRate: 80, studentCount: 42 },
    { id: 5, testType: 'ALCPT', month: 'February', year: 2025, schoolName: 'NFS East', averageScore: 84, passingRate: 77, studentCount: 25 },
    { id: 6, testType: 'ALCPT', month: 'March', year: 2025, schoolName: 'KFNA', averageScore: 89, passingRate: 85, studentCount: 38 },
    { id: 7, testType: 'ECL', month: 'January', year: 2025, schoolName: 'KFNA', averageScore: 92, passingRate: 88, studentCount: 28 },
    { id: 8, testType: 'ECL', month: 'February', year: 2025, schoolName: 'NFS East', averageScore: 90, passingRate: 86, studentCount: 19 },
    { id: 9, testType: 'Book', cycle: 1, year: 2025, schoolName: 'KFNA', averageScore: 78, passingRate: 72, studentCount: 52 },
    { id: 10, testType: 'Book', cycle: 2, year: 2025, schoolName: 'NFS West', averageScore: 81, passingRate: 75, studentCount: 47 },
  ];

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const cycles = [1, 2, 3, 4];
  const years = [2024, 2025];

  // Filter data based on selections
  const filteredData = useMemo(() => {
    return testData.filter(item => {
      if (item.testType !== selectedTestType) return false;
      if (selectedSchool !== 'all' && item.schoolName !== selectedSchool) return false;
      if (item.year !== selectedYear) return false;
      
      if (selectedTestType === 'Book') {
        return item.cycle === selectedCycle;
      } else {
        return item.month === selectedMonth;
      }
    });
  }, [selectedTestType, selectedMonth, selectedCycle, selectedYear, selectedSchool]);

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