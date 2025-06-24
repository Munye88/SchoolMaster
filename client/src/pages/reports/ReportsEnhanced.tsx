import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, Download, Calendar, Users, BookOpen, 
  TrendingUp, AlertTriangle, CheckCircle, Clock,
  BarChart3, PieChart, Activity, Target
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip, PieChart as RechartsPieChart, Cell } from 'recharts';
import { format } from "date-fns";

interface ReportData {
  summary: {
    totalInstructors: number;
    totalStudents: number;
    activeCourses: number;
    completionRate: number;
    avgEvaluation: number;
  };
  schoolPerformance: Array<{
    school: string;
    instructors: number;
    students: number;
    courses: number;
    avgScore: number;
  }>;
  trends: Array<{
    month: string;
    enrollments: number;
    completions: number;
    evaluations: number;
  }>;
  recommendations: string[];
  keyInsights: string[];
}

export default function ReportsEnhanced() {
  const [dateRange, setDateRange] = useState({
    start: format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  // Fetch real-time report data
  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ['/api/reports/dashboard', dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/reports/dashboard?start=${dateRange.start}&end=${dateRange.end}`);
      if (!response.ok) throw new Error('Failed to fetch report data');
      return response.json();
    },
    refetchInterval: 30000 // Update every 30 seconds for real-time data
  });

  const exportReport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/reports/export?format=${format}&start=${dateRange.start}&end=${dateRange.end}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GOVCIO_SAMS_Report_${format.toUpperCase()}_${format === 'pdf' ? '.pdf' : '.xlsx'}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const schoolColors = ['#E4424D', '#22A783', '#6247AA'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading real-time report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">GOVCIO-SAMS ELT Program Reports</h1>
        <div className="flex space-x-2">
          <Button onClick={() => exportReport('pdf')} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={() => exportReport('excel')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Report Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Instructors</p>
                <p className="text-2xl font-bold text-blue-600">{reportData?.summary.totalInstructors || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-green-600">{reportData?.summary.totalStudents || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-orange-600">{reportData?.summary.activeCourses || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{reportData?.summary.completionRate || 0}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Evaluation</p>
                <p className="text-2xl font-bold text-red-600">{reportData?.summary.avgEvaluation || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* School Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>School Performance Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData?.schoolPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="school" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="instructors" fill="#3B82F6" name="Instructors" />
              <Bar dataKey="students" fill="#10B981" name="Students" />
              <Bar dataKey="courses" fill="#F59E0B" name="Courses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trends Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData?.trends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="enrollments" fill="#3B82F6" name="Enrollments" />
              <Bar dataKey="completions" fill="#10B981" name="Completions" />
              <Bar dataKey="evaluations" fill="#F59E0B" name="Evaluations" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData?.keyInsights?.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <p className="text-gray-800">{insight}</p>
              </div>
            )) || (
              <div className="text-center text-gray-500 py-4">
                No insights available for the selected date range
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData?.recommendations?.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                <Target className="h-5 w-5 text-orange-600 mt-0.5" />
                <p className="text-gray-800">{recommendation}</p>
              </div>
            )) || (
              <div className="text-center text-gray-500 py-4">
                No recommendations available for the selected date range
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              This comprehensive report covers the GOVCIO-SAMS ELT Program performance from{' '}
              <strong>{format(new Date(dateRange.start), 'MMMM d, yyyy')}</strong> to{' '}
              <strong>{format(new Date(dateRange.end), 'MMMM d, yyyy')}</strong>.
            </p>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">Executive Summary</h3>
            <p className="text-gray-700">
              The program currently serves <strong>{reportData?.summary.totalStudents || 0} students</strong> across 
              three schools with <strong>{reportData?.summary.totalInstructors || 0} instructors</strong> delivering{' '}
              <strong>{reportData?.summary.activeCourses || 0} active courses</strong>. 
              The overall completion rate stands at <strong>{reportData?.summary.completionRate || 0}%</strong> with 
              an average evaluation score of <strong>{reportData?.summary.avgEvaluation || 0}%</strong>.
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">Generated Report Details</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Real-time data integration across all three schools (KFNA, NFS East, NFS West)</li>
              <li>Comprehensive instructor performance analytics</li>
              <li>Student enrollment and completion tracking</li>
              <li>Course effectiveness and progress monitoring</li>
              <li>Automated insights and recommendations based on current trends</li>
            </ul>

            <p className="text-sm text-gray-500 mt-4">
              Report generated on {format(new Date(), 'MMMM d, yyyy')} at {format(new Date(), 'h:mm a')} GMT
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}