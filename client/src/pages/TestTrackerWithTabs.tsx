import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordsPerPage = 50;
  
  // Search functionality
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [quickStats, setQuickStats] = useState<boolean>(true);
  
  // Modal states
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showManualEntry, setShowManualEntry] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Fetch data
  const { data: testScores = [], isLoading: testLoading, error: testError } = useQuery<TestResult[]>({
    queryKey: ['/api/test-scores']
  });

  const { data: schools = [], isLoading: schoolsLoading } = useQuery<any[]>({
    queryKey: ['/api/schools']
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Constants
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const cycles = ['all', '1', '2', '3', '4'];
  const months_with_all = ['all', ...months];
  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  // Process test data - Convert individual records for display
  const processedTestData = useMemo(() => {
    if (testLoading || schoolsLoading || !testScores || !schools) {
      return [];
    }

    console.log('🔍 Processing', testScores.length, 'test scores');
    
    const schoolMap = new Map(schools?.map((school: any) => [school.id, school.name]) || []);
    const processedData: ProcessedTestData[] = [];

    // Convert each test score to display format
    testScores.forEach((score: any, index: number) => {
      const testDate = new Date(score.testDate);
      const year = testDate.getFullYear();
      const monthName = months[testDate.getMonth()];
      const schoolName = schoolMap.get(score.schoolId) || score.school || 'Unknown';
      
      // Determine test type - ensure consistent naming
      let testType = score.testType || score.type;
      if (!testType && score.courseName) {
        const courseUpper = score.courseName.toUpperCase();
        if (courseUpper.includes('ALCPT')) testType = 'ALCPT';
        else if (courseUpper.includes('BOOK')) testType = 'Book';
        else if (courseUpper.includes('ECL')) testType = 'ECL';
        else if (courseUpper.includes('OPI')) testType = 'OPI';
      }
      
      // Ensure consistent test type naming
      if (testType === 'Book Test') testType = 'Book';
      if (!testType) testType = 'Unknown';

      const item: ProcessedTestData = {
        id: score.id || (index + 1),
        testType: testType,
        year: year,
        schoolName,
        averageScore: score.percentage || score.score || 0,
        passingRate: score.percentage >= (score.passingScore || 75) ? 100 : 0,
        studentCount: 1, // Each record represents one student
      };

      if (testType === 'Book') {
        // Calculate cycle based on month (1-3=Q1, 4-6=Q2, 7-9=Q3, 10-12=Q4)
        const month = testDate.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
        item.cycle = Math.ceil(month / 3);
      } else {
        item.month = monthName;
      }

      processedData.push(item);
    });

    console.log('✅ Created', processedData.length, 'individual records');
    return processedData;
  }, [testScores, schools, testLoading, schoolsLoading]);

  // Filter data based on selections - Show all records for selected test type
  const filteredData = useMemo(() => {
    if (!processedTestData || processedTestData.length === 0) {
      console.log('⚠️ No processed data available');
      return [];
    }

    console.log(`🔍 Filtering ${processedTestData.length} records with:`, {
      testType: selectedTestType,
      month: selectedMonth,
      cycle: selectedCycle,
      year: selectedYear,
      school: selectedSchool,
      search: searchTerm
    });

    let filtered = processedTestData.filter(item => {
      // Always filter by test type
      if (item.testType !== selectedTestType) return false;
      
      // Filter by year
      if (item.year !== selectedYear) return false;
      
      // Filter by school if not 'all'
      if (selectedSchool !== 'all' && item.schoolName !== selectedSchool) return false;
      
      // For monthly navigation, show records for selected month/cycle
      if (selectedTestType === 'Book') {
        // Show all cycles if none selected, or specific cycle
        if (selectedCycle !== 'all' && (!item.cycle || item.cycle.toString() !== selectedCycle)) {
          return false;
        }
      } else {
        // Show all months if none selected, or specific month
        if (selectedMonth !== 'all' && item.month !== selectedMonth) {
          return false;
        }
      }

      // Apply search filter if search term is provided
      if (searchTerm && searchTerm.trim() !== '') {
        const search = searchTerm.toLowerCase();
        return (
          item.schoolName.toLowerCase().includes(search) ||
          item.testType.toLowerCase().includes(search) ||
          item.averageScore.toString().includes(search) ||
          (item.month && item.month.toLowerCase().includes(search)) ||
          (item.cycle && item.cycle.toString().includes(search))
        );
      }

      return true;
    });

    console.log(`✅ Filtered to ${filtered.length} records`);
    return filtered;
  }, [processedTestData, selectedTestType, selectedMonth, selectedCycle, selectedYear, selectedSchool]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, recordsPerPage]);

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  // Reset pagination when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Effect to reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [selectedTestType, selectedMonth, selectedCycle, selectedYear, selectedSchool]);

  // Upload handler
  const handleFileUpload = async () => {
    if (!uploadFile) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    
    try {
      const response = await fetch('/api/test-scores/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Test scores uploaded successfully"
        });
        queryClient.invalidateQueries({ queryKey: ['/api/test-scores'] });
        setShowUploadModal(false);
        setUploadFile(null);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload test scores",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Edit handler
  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setShowEditModal(true);
  };

  // Delete handler
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this test record?')) {
      return;
    }

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/test-scores/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Test record deleted successfully"
        });
        queryClient.invalidateQueries({ queryKey: ['/api/test-scores'] });
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete test record",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Save edit handler
  const handleSaveEdit = async (editedData: any) => {
    try {
      const response = await fetch(`/api/test-scores/${editingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Test record updated successfully"
        });
        queryClient.invalidateQueries({ queryKey: ['/api/test-scores'] });
        setShowEditModal(false);
        setEditingRecord(null);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update test record",
        variant: "destructive"
      });
    }
  };

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
        <div className="flex gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 text-white border hover:bg-blue-700 transition-colors"
          >
            Upload Test File
          </button>
          <button
            onClick={() => setShowManualEntry(true)}
            className="px-4 py-2 bg-green-600 text-white border hover:bg-green-700 transition-colors"
          >
            Manual Entry
          </button>
        </div>
      </div>

      {/* Search and Current Selection Display */}
      <Card className="bg-blue-50 border-blue-200 rounded-none">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search records by school, test type, score..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            
            {/* Current View Summary */}
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
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Panel - Database Overview */}
      <Card className="bg-gray-50 border-gray-200 rounded-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-lg">Database Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-white p-3 border">
              <div className="text-2xl font-bold text-blue-600">
                {processedTestData?.filter(r => r.testType === 'ALCPT').length || 0}
              </div>
              <div className="text-sm text-gray-600">ALCPT Tests</div>
            </div>
            <div className="bg-white p-3 border">
              <div className="text-2xl font-bold text-green-600">
                {processedTestData?.filter(r => r.testType === 'Book').length || 0}
              </div>
              <div className="text-sm text-gray-600">Book Tests</div>
            </div>
            <div className="bg-white p-3 border">
              <div className="text-2xl font-bold text-purple-600">
                {processedTestData?.filter(r => r.testType === 'ECL').length || 0}
              </div>
              <div className="text-sm text-gray-600">ECL Tests</div>
            </div>
            <div className="bg-white p-3 border">
              <div className="text-2xl font-bold text-red-600">
                {processedTestData?.filter(r => r.testType === 'OPI').length || 0}
              </div>
              <div className="text-sm text-gray-600">OPI Tests</div>
            </div>
          </div>
          <div className="text-center mt-4 p-2 bg-blue-100 border">
            <span className="text-lg font-semibold text-blue-800">
              Total Records: {processedTestData?.length || 0}
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
              <p>No records found for the selected filters</p>
              <div className="mt-4 text-sm bg-blue-50 p-4 rounded border">
                <p className="font-medium text-gray-700">Total Database Records: {processedTestData?.length || 0}</p>
                <p className="text-gray-600 mt-2">Try adjusting your filters or search terms:</p>
                <ul className="text-left text-gray-600 mt-2 space-y-1">
                  <li>• Change test type (ALCPT, Book, ECL, OPI)</li>
                  <li>• Select different year (2024-2030)</li>
                  <li>• Choose "All Months" or "All Cycles"</li>
                  <li>• Clear search term if active</li>
                </ul>
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
                    <TableHead className="text-center px-4 py-3 border-r">Year</TableHead>
                    <TableHead className="text-center px-4 py-3 border-r">Score</TableHead>
                    <TableHead className="text-center px-4 py-3 border-r">Status</TableHead>
                    <TableHead className="text-center px-4 py-3">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((item) => (
                    <TableRow key={item.id} className="border-b">
                      <TableCell className="text-center px-4 py-3 border-r font-medium">
                        {item.schoolName}
                      </TableCell>
                      <TableCell className="text-center px-4 py-3 border-r">
                        {item.testType}
                      </TableCell>
                      <TableCell className="text-center px-4 py-3 border-r">
                        {item.testType === 'Book' ? `Cycle ${item.cycle}` : item.month}
                      </TableCell>
                      <TableCell className="text-center px-4 py-3 border-r">
                        {item.year}
                      </TableCell>
                      <TableCell className="text-center px-4 py-3 border-r">
                        <Badge variant={item.averageScore >= 75 ? "default" : "destructive"} className="rounded-none">
                          {item.averageScore}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center px-4 py-3">
                        <Badge variant={item.averageScore >= 75 ? "default" : "destructive"} className="rounded-none">
                          {item.averageScore >= 75 ? 'Pass' : 'Fail'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination Controls */}
              {filteredData.length > recordsPerPage && (
                <div className="flex items-center justify-between mt-4 px-4 py-3 border-t">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, filteredData.length)} of {filteredData.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-md border">
            <h3 className="text-lg font-semibold mb-4">Upload Test Scores File</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Excel file (.xlsx)
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>File should contain columns:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Student Name</li>
                  <li>School</li>
                  <li>Test Type (ALCPT, Book, ECL, OPI)</li>
                  <li>Score</li>
                  <li>Test Date</li>
                </ul>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleFileUpload}
                  disabled={!uploadFile || isUploading}
                  className="px-4 py-2 bg-blue-600 text-white border hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white border hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-lg border">
            <h3 className="text-lg font-semibold mb-4">Add Test Score Manually</h3>
            <ManualEntryForm 
              schools={schools}
              onSave={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/test-scores'] });
                setShowManualEntry(false);
              }}
              onCancel={() => setShowManualEntry(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Manual Entry Form Component
function ManualEntryForm({ schools, onSave, onCancel }: {
  schools: any[];
  onSave: () => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    studentName: '',
    schoolId: '',
    testType: 'ALCPT',
    score: '',
    maxScore: '100',
    testDate: new Date().toISOString().split('T')[0],
    instructor: '',
    course: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.studentName || !formData.schoolId || !formData.score) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/test-scores/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          score: parseInt(formData.score),
          maxScore: parseInt(formData.maxScore),
          schoolId: parseInt(formData.schoolId)
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Test score added successfully"
        });
        onSave();
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save test score",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Student Name *</label>
          <input
            type="text"
            value={formData.studentName}
            onChange={(e) => setFormData({...formData, studentName: e.target.value})}
            className="w-full p-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">School *</label>
          <select
            value={formData.schoolId}
            onChange={(e) => setFormData({...formData, schoolId: e.target.value})}
            className="w-full p-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value="">Select School</option>
            {schools.map(school => (
              <option key={school.id} value={school.id}>{school.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Test Type *</label>
          <select
            value={formData.testType}
            onChange={(e) => setFormData({...formData, testType: e.target.value})}
            className="w-full p-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value="ALCPT">ALCPT</option>
            <option value="Book">Book Test</option>
            <option value="ECL">ECL</option>
            <option value="OPI">OPI</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Score *</label>
          <input
            type="number"
            value={formData.score}
            onChange={(e) => setFormData({...formData, score: e.target.value})}
            className="w-full p-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Score</label>
          <input
            type="number"
            value={formData.maxScore}
            onChange={(e) => setFormData({...formData, maxScore: e.target.value})}
            className="w-full p-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Test Date</label>
          <input
            type="date"
            value={formData.testDate}
            onChange={(e) => setFormData({...formData, testDate: e.target.value})}
            className="w-full p-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instructor</label>
          <input
            type="text"
            value={formData.instructor}
            onChange={(e) => setFormData({...formData, instructor: e.target.value})}
            className="w-full p-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Course</label>
        <input
          type="text"
          value={formData.course}
          onChange={(e) => setFormData({...formData, course: e.target.value})}
          className="w-full p-2 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-green-600 text-white border hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Test Score'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white border hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}