import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, FileSpreadsheet, Download, BarChart3, TrendingUp, 
  Users, Target, Calendar, CheckCircle, AlertCircle, Clock
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useSchool } from "@/hooks/useSchool";
import { format } from "date-fns";

interface TestScore {
  id: number;
  studentName: string;
  school: string;
  schoolId: number;
  testType: 'ALCPT' | 'Book Test' | 'ECL' | 'OPI';
  score: number;
  maxScore: number;
  percentage: number;
  testDate: string;
  instructor: string;
  course: string;
  level: string;
  uploadDate: string;
}

interface TestStatistics {
  totalTests: number;
  averageScore: number;
  passRate: number;
  byTestType: Record<string, {
    count: number;
    average: number;
    passRate: number;
  }>;
  bySchool: Record<string, {
    count: number;
    average: number;
    passRate: number;
  }>;
  trends: Array<{
    month: string;
    averageScore: number;
    testCount: number;
  }>;
}

export default function TestTrackerEnhanced() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filterSchool, setFilterSchool] = useState<string>('all');
  const [filterTestType, setFilterTestType] = useState<string>('all');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedSchool, schools } = useSchool();

  // Fetch test scores with real-time updates
  const { data: testScores = [], isLoading: isLoadingScores } = useQuery<TestScore[]>({
    queryKey: ['/api/test-scores', filterSchool, filterTestType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterSchool !== 'all') params.append('school', filterSchool);
      if (filterTestType !== 'all') params.append('testType', filterTestType);
      
      const response = await fetch(`/api/test-scores?${params}`);
      if (!response.ok) throw new Error('Failed to fetch test scores');
      return response.json();
    },
    refetchInterval: 30000 // Update every 30 seconds
  });

  // Fetch statistics
  const { data: statistics, isLoading: isLoadingStats } = useQuery<TestStatistics>({
    queryKey: ['/api/test-scores/statistics', filterSchool, filterTestType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterSchool !== 'all') params.append('school', filterSchool);
      if (filterTestType !== 'all') params.append('testType', filterTestType);
      
      const response = await fetch(`/api/test-scores/statistics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return response.json();
    },
    refetchInterval: 30000
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/test-scores/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/test-scores'] });
      queryClient.invalidateQueries({ queryKey: ['/api/test-scores/statistics'] });
      setSelectedFile(null);
      toast({
        title: "Success",
        description: `Uploaded ${data.processedRows} test scores successfully`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an Excel file to upload",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    uploadMutation.mutate(formData);
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/api/test-scores/template';
    link.download = 'test-scores-template.xlsx';
    link.click();
  };

  const exportData = () => {
    const params = new URLSearchParams();
    if (filterSchool !== 'all') params.append('school', filterSchool);
    if (filterTestType !== 'all') params.append('testType', filterTestType);
    
    const link = document.createElement('a');
    link.href = `/api/test-scores/export?${params}`;
    link.download = `test-scores-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    link.click();
  };

  const testTypeColors = {
    'ALCPT': '#3B82F6',
    'Book Test': '#10B981',
    'ECL': '#F59E0B',
    'OPI': '#EF4444'
  };

  if (isLoadingScores || isLoadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading test tracker data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Test Tracker</h1>
        <div className="flex space-x-2">
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button onClick={exportData} variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Test Scores</CardTitle>
          <p className="text-sm text-gray-600">
            Upload an Excel file with test scores (ALCPT, Book Test, ECL, OPI) to automatically calculate averages and statistics
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="excel-file">Select Excel File</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={uploadMutation.isPending}
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: .xlsx, .xls
              </p>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
                className="w-full"
              >
                {uploadMutation.isPending ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Test Scores
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Excel Format Requirements:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Student Name, School, Test Type (ALCPT/Book Test/ECL/OPI)</li>
              <li>• Score, Max Score, Test Date, Instructor, Course, Level</li>
              <li>• Download the template for the exact format</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="school-filter">Filter by School</Label>
              <select
                id="school-filter"
                value={filterSchool}
                onChange={(e) => setFilterSchool(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Schools</option>
                {schools.map(school => (
                  <option key={school.id} value={school.code}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="test-type-filter">Filter by Test Type</Label>
              <select
                id="test-type-filter"
                value={filterTestType}
                onChange={(e) => setFilterTestType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Test Types</option>
                <option value="ALCPT">ALCPT</option>
                <option value="Book Test">Book Test</option>
                <option value="ECL">ECL</option>
                <option value="OPI">OPI</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold text-blue-600">{statistics?.totalTests || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-green-600">{statistics?.averageScore?.toFixed(1) || 0}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-purple-600">{statistics?.passRate?.toFixed(1) || 0}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-orange-600">
                  {statistics?.trends?.[statistics.trends.length - 1]?.testCount || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Test Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(statistics?.byTestType || {}).map(([type, data]) => ({
                testType: type,
                average: data.average,
                count: data.count,
                passRate: data.passRate
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="testType" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="#3B82F6" name="Average Score %" />
                <Bar dataKey="passRate" fill="#10B981" name="Pass Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* School Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by School</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(statistics?.bySchool || {}).map(([school, data]) => ({
                school,
                average: data.average,
                count: data.count,
                passRate: data.passRate
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="school" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="#F59E0B" name="Average Score %" />
                <Bar dataKey="count" fill="#EF4444" name="Test Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Score Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={statistics?.trends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="averageScore" stroke="#3B82F6" name="Average Score %" />
              <Line type="monotone" dataKey="testCount" stroke="#10B981" name="Test Count" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Test Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Scores</CardTitle>
        </CardHeader>
        <CardContent>
          {testScores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No test scores uploaded yet</p>
              <p className="text-sm">Upload an Excel file to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Student</th>
                    <th className="text-left p-2">School</th>
                    <th className="text-left p-2">Test Type</th>
                    <th className="text-left p-2">Score</th>
                    <th className="text-left p-2">Percentage</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Instructor</th>
                  </tr>
                </thead>
                <tbody>
                  {testScores.slice(0, 10).map((score) => (
                    <tr key={score.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{score.studentName}</td>
                      <td className="p-2">{score.school}</td>
                      <td className="p-2">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `${testTypeColors[score.testType]}20`,
                            color: testTypeColors[score.testType]
                          }}
                        >
                          {score.testType}
                        </span>
                      </td>
                      <td className="p-2">{score.score}/{score.maxScore}</td>
                      <td className="p-2">
                        <span className={`font-medium ${
                          score.percentage >= 70 ? 'text-green-600' : 
                          score.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {score.percentage}%
                        </span>
                      </td>
                      <td className="p-2">{format(new Date(score.testDate), 'MMM dd, yyyy')}</td>
                      <td className="p-2">{score.instructor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {testScores.length > 10 && (
                <div className="text-center py-4 text-gray-500">
                  Showing 10 of {testScores.length} test scores
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}