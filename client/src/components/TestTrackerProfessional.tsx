import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Plus, BookOpen, FileText, Headphones, MessageSquare, TrendingUp, Users } from 'lucide-react';

interface TestResult {
  id: string;
  testType: 'ALCPT' | 'Book Test' | 'ECL' | 'OPI';
  courseType: 'Cadets' | 'Refresher' | 'Aviation Officers';
  school: 'KFNA' | 'NFS East' | 'NFS West';
  period: string; // Cycle 1-20 for Book Test, Month for ALCPT/ECL/OPI
  year: number;
  numberOfStudents: number;
  averageScore: number;
  passingScore: number;
  dateCreated: string;
}

const TestTrackerProfessional: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState<'ALCPT' | 'Book Test' | 'ECL' | 'OPI'>('ALCPT');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedSchool, setSelectedSchool] = useState<string>('All Schools');

  // Form state
  const [formData, setFormData] = useState({
    testType: 'ALCPT' as 'ALCPT' | 'Book Test' | 'ECL' | 'OPI',
    courseType: 'Cadets' as 'Cadets' | 'Refresher' | 'Aviation Officers',
    school: 'KFNA' as 'KFNA' | 'NFS East' | 'NFS West',
    period: '',
    year: 2025,
    numberOfStudents: 0,
    averageScore: 0
  });

  const testTypeIcons = {
    'ALCPT': BookOpen,
    'Book Test': FileText,
    'ECL': Headphones,
    'OPI': MessageSquare
  };

  const getPassingScore = (testType: string, courseType: string): number => {
    if (testType === 'Book Test') return 66;
    if (testType === 'ALCPT') {
      return courseType === 'Aviation Officers' ? 80 : 50;
    }
    if (testType === 'ECL') {
      return courseType === 'Aviation Officers' ? 80 : 50;
    }
    if (testType === 'OPI') return 2;
    return 50;
  };

  const getPeriodOptions = (testType: string): string[] => {
    if (testType === 'Book Test') {
      return Array.from({ length: 20 }, (_, i) => `Cycle ${i + 1}`);
    }
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  };

  const handleAddResult = () => {
    const passingScore = getPassingScore(formData.testType, formData.courseType);
    const newResult: TestResult = {
      id: Date.now().toString(),
      testType: formData.testType,
      courseType: formData.courseType,
      school: formData.school,
      period: formData.period,
      year: formData.year,
      numberOfStudents: formData.numberOfStudents,
      averageScore: formData.averageScore,
      passingScore,
      dateCreated: new Date().toISOString()
    };

    setTestResults([...testResults, newResult]);
    setIsAddDialogOpen(false);
    setFormData({
      testType: 'ALCPT',
      courseType: 'Cadets',
      school: 'KFNA',
      period: '',
      year: 2025,
      numberOfStudents: 0,
      averageScore: 0
    });
  };

  const getFilteredResults = () => {
    return testResults.filter(result => 
      result.testType === activeTab &&
      result.year === selectedYear &&
      (selectedSchool === 'All Schools' || result.school === selectedSchool)
    );
  };

  const getChartData = () => {
    const filteredResults = getFilteredResults();
    
    if (activeTab === 'OPI') {
      // Pie chart data for OPI
      const passCount = filteredResults.filter(r => r.averageScore >= r.passingScore).length;
      const failCount = filteredResults.length - passCount;
      
      return [
        { name: 'Pass (2/2)', value: passCount, color: '#10b981' },
        { name: 'Fail (Below 2/2)', value: failCount, color: '#ef4444' }
      ];
    } else {
      // Bar chart data for other tests
      return filteredResults.map(result => ({
        period: result.period,
        score: result.averageScore,
        passingScore: result.passingScore,
        students: result.numberOfStudents,
        school: result.school,
        courseType: result.courseType
      }));
    }
  };

  const getStatistics = () => {
    const filteredResults = getFilteredResults();
    const totalStudents = filteredResults.reduce((sum, r) => sum + r.numberOfStudents, 0);
    const avgScore = filteredResults.length > 0 
      ? filteredResults.reduce((sum, r) => sum + r.averageScore, 0) / filteredResults.length 
      : 0;
    const passingResults = filteredResults.filter(r => r.averageScore >= r.passingScore);
    const passingRate = filteredResults.length > 0 ? (passingResults.length / filteredResults.length) * 100 : 0;

    return {
      totalTests: filteredResults.length,
      totalStudents,
      averageScore: Math.round(avgScore * 10) / 10,
      passingRate: Math.round(passingRate)
    };
  };

  const stats = getStatistics();
  const chartData = getChartData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test Tracker</h2>
          <p className="text-gray-600">Manage and track test results across all programs</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-none">
              <Plus className="h-4 w-4 mr-2" />
              Add Test Result
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-none">
            <DialogHeader>
              <DialogTitle>Add New Test Result</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="testType">Test Type</Label>
                <Select value={formData.testType} onValueChange={(value: any) => setFormData({ ...formData, testType: value })}>
                  <SelectTrigger className="rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="ALCPT">ALCPT</SelectItem>
                    <SelectItem value="Book Test">Book Test</SelectItem>
                    <SelectItem value="ECL">ECL</SelectItem>
                    <SelectItem value="OPI">OPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="courseType">Course Type</Label>
                <Select value={formData.courseType} onValueChange={(value: any) => setFormData({ ...formData, courseType: value })}>
                  <SelectTrigger className="rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="Cadets">Cadets</SelectItem>
                    <SelectItem value="Refresher">Refresher</SelectItem>
                    <SelectItem value="Aviation Officers">Aviation Officers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="school">School</Label>
                <Select value={formData.school} onValueChange={(value: any) => setFormData({ ...formData, school: value })}>
                  <SelectTrigger className="rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="KFNA">KFNA</SelectItem>
                    <SelectItem value="NFS East">NFS East</SelectItem>
                    <SelectItem value="NFS West">NFS West</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="period">Period</Label>
                <Select value={formData.period} onValueChange={(value) => setFormData({ ...formData, period: value })}>
                  <SelectTrigger className="rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {getPeriodOptions(formData.testType).map(period => (
                      <SelectItem key={period} value={period}>{period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="year">Year</Label>
                <Select value={formData.year.toString()} onValueChange={(value) => setFormData({ ...formData, year: parseInt(value) })}>
                  <SelectTrigger className="rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {[2024, 2025, 2026, 2027].map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="numberOfStudents">Number of Students</Label>
                <Input
                  type="number"
                  value={formData.numberOfStudents}
                  onChange={(e) => setFormData({ ...formData, numberOfStudents: parseInt(e.target.value) || 0 })}
                  placeholder="Enter number of students"
                  className="rounded-none"
                />
              </div>

              <div>
                <Label htmlFor="averageScore">Average Score</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.averageScore}
                  onChange={(e) => setFormData({ ...formData, averageScore: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter average score"
                  className="rounded-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Passing score: {getPassingScore(formData.testType, formData.courseType)}
                  {formData.testType === 'OPI' ? '/2' : '/100'}
                </p>
              </div>

              <Button onClick={handleAddResult} className="w-full rounded-none">
                Add Test Result
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div>
          <Label htmlFor="year">Year</Label>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32 rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {[2024, 2025, 2026, 2027].map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="school">School</Label>
          <Select value={selectedSchool} onValueChange={setSelectedSchool}>
            <SelectTrigger className="w-40 rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="All Schools">All Schools</SelectItem>
              <SelectItem value="KFNA">KFNA</SelectItem>
              <SelectItem value="NFS East">NFS East</SelectItem>
              <SelectItem value="NFS West">NFS West</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Test Type Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-4 rounded-none">
          {(['ALCPT', 'Book Test', 'ECL', 'OPI'] as const).map((testType) => {
            const Icon = testTypeIcons[testType];
            return (
              <TabsTrigger key={testType} value={testType} className="flex items-center gap-2 rounded-none">
                <Icon className="h-4 w-4" />
                {testType}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTests}</div>
              <p className="text-xs text-muted-foreground">Recorded results</p>
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Tested students</p>
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}</div>
              <p className="text-xs text-muted-foreground">
                {activeTab === 'OPI' ? 'Out of 2' : 'Out of 100'}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passing Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.passingRate}%</div>
              <p className="text-xs text-muted-foreground">Above passing score</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Content */}
        <div className="mt-6">
          {(['ALCPT', 'Book Test', 'ECL', 'OPI'] as const).map((testType) => (
            <TabsContent key={testType} value={testType}>
              <Card className="rounded-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-center">
                    {React.createElement(testTypeIcons[testType], { className: "h-5 w-5" })}
                    {testType} Results - {selectedYear}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {testType === 'OPI' ? (
                    <div className="h-96 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {(chartData as any[]).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-96 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis />
                          <Tooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white p-3 border rounded shadow">
                                    <p className="font-semibold">{label}</p>
                                    <p>Score: {data.score}</p>
                                    <p>Students: {data.students}</p>
                                    <p>School: {data.school}</p>
                                    <p>Course: {data.courseType}</p>
                                    <p>Passing: {data.passingScore}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="score" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </div>
      </Tabs>

      {/* Recent Results Table */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-center">Recent Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-center p-2">Test Type</th>
                  <th className="text-center p-2">Course</th>
                  <th className="text-center p-2">School</th>
                  <th className="text-center p-2">Period</th>
                  <th className="text-center p-2">Students</th>
                  <th className="text-center p-2">Average Score</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredResults().slice(0, 10).map((result) => (
                  <tr key={result.id} className="border-b">
                    <td className="p-2 text-center">{result.testType}</td>
                    <td className="p-2 text-center">{result.courseType}</td>
                    <td className="p-2 text-center">{result.school}</td>
                    <td className="p-2 text-center">{result.period}</td>
                    <td className="p-2 text-center">{result.numberOfStudents}</td>
                    <td className="p-2 text-center">{result.averageScore}</td>
                    <td className="p-2 text-center">
                      <Badge variant={result.averageScore >= result.passingScore ? "default" : "destructive"} className="rounded-none">
                        {result.averageScore >= result.passingScore ? "Pass" : "Fail"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestTrackerProfessional;