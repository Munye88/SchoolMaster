import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  ClipboardList, 
  Users, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Instructor } from "@shared/schema";
import { useSchool } from "@/hooks/useSchool";

interface StaffAttendance {
  id: number;
  date: string;
  instructorId: number;
  status: "present" | "absent" | "late" | "sick" | "paternity" | "pto" | "bereavement";
  timeIn: string | null;
  timeOut: string | null;
  comments: string | null;
  recordedBy: number | null;
}

interface StaffEvaluation {
  id: number;
  instructorId: number;
  evaluatorId: number;
  evaluationDate: string;
  overallRating: number;
  teachingEffectiveness: number;
  classroomManagement: number;
  professionalDevelopment: number;
  comments: string | null;
  recommendations: string | null;
  strengths: string | null;
  areasForImprovement: string | null;
  evaluationType: string;
}

export default function StaffModuleNavigation() {
  const [, setLocation] = useLocation();
  const { selectedSchool } = useSchool();

  // Fetch instructors for the selected school
  const { data: instructors = [] } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
  });

  const schoolInstructors = instructors.filter(instructor => 
    selectedSchool && instructor.schoolId === selectedSchool.id
  );

  // Fetch recent attendance data
  const { data: attendanceRecords = [] } = useQuery<StaffAttendance[]>({
    queryKey: ['/api/staff-attendance', selectedSchool?.id],
    queryFn: async () => {
      if (!selectedSchool) return [];
      
      const response = await fetch(`/api/staff-attendance?schoolId=${selectedSchool.id}&date=2025-07`);
      if (!response.ok) return [];
      
      return await response.json();
    },
    enabled: !!selectedSchool,
  });

  // Fetch recent evaluation data
  const { data: evaluationRecords = [] } = useQuery({
    queryKey: ['/api/evaluations', selectedSchool?.id],
    queryFn: async (): Promise<StaffEvaluation[]> => {
      if (!selectedSchool) return [];
      
      const response = await fetch('/api/evaluations');
      if (!response.ok) return [];
      
      const allEvaluations = await response.json();
      
      // Filter evaluations for instructors in the selected school
      const schoolInstructorIds = schoolInstructors.map(i => i.id);
      return allEvaluations.filter((evaluation: StaffEvaluation) => 
        schoolInstructorIds.includes(evaluation.instructorId)
      );
    },
    enabled: !!selectedSchool && schoolInstructors.length > 0,
  });

  // Calculate statistics
  const attendanceStats = {
    total: attendanceRecords.length,
    present: attendanceRecords.filter(r => r.status === "present").length,
    late: attendanceRecords.filter(r => r.status === "late").length,
    absent: attendanceRecords.filter(r => ["absent", "sick", "paternity", "pto", "bereavement"].includes(r.status)).length,
  };

  const evaluationStats = {
    total: evaluationRecords.length,
    avgRating: evaluationRecords.length > 0 
      ? Math.round(evaluationRecords.reduce((sum, evaluation) => sum + evaluation.overallRating, 0) / evaluationRecords.length * 10) / 10
      : 0,
    recent: evaluationRecords.filter(evaluation => {
      const evalDate = new Date(evaluation.evaluationDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return evalDate >= thirtyDaysAgo;
    }).length,
  };

  const handleNavigateToAttendance = () => {
    if (selectedSchool) {
      setLocation(`/schools/${selectedSchool.code}/staff-attendance`);
    }
  };

  const handleNavigateToEvaluations = () => {
    if (selectedSchool) {
      setLocation(`/schools/${selectedSchool.code}/staff-evaluations`);
    }
  };

  if (!selectedSchool) {
    return (
      <div className="text-center py-8">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No School Selected</h3>
        <p className="text-gray-500">Please select a school to view staff modules.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Staff Management</h1>
        <p className="text-gray-600">{selectedSchool.name} - {schoolInstructors.length} Instructors</p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Module */}
        <Card className="rounded-none hover:shadow-lg transition-shadow cursor-pointer" onClick={handleNavigateToAttendance}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-none">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Staff Attendance</CardTitle>
                  <p className="text-sm text-gray-600">Track daily attendance records</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Present</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600 rounded-none">
                    {attendanceStats.present}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-600">Late</span>
                  </div>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600 rounded-none">
                    {attendanceStats.late}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-600">Absent</span>
                  </div>
                  <Badge variant="outline" className="text-red-600 border-red-600 rounded-none">
                    {attendanceStats.absent}
                  </Badge>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600 mb-2">Quick Actions:</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="rounded-none">View Monthly Reports</Badge>
                  <Badge variant="secondary" className="rounded-none">Record Attendance</Badge>
                  <Badge variant="secondary" className="rounded-none">Export Data</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Module */}
        <Card className="rounded-none hover:shadow-lg transition-shadow cursor-pointer" onClick={handleNavigateToEvaluations}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-none">
                  <ClipboardList className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Staff Evaluations</CardTitle>
                  <p className="text-sm text-gray-600">Performance reviews and assessments</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <ClipboardList className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Total</span>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-600 rounded-none">
                    {evaluationStats.total}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Avg Rating</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600 rounded-none">
                    {evaluationStats.avgRating}/5
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Recent</span>
                  </div>
                  <Badge variant="outline" className="text-purple-600 border-purple-600 rounded-none">
                    {evaluationStats.recent}
                  </Badge>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600 mb-2">Quick Actions:</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="rounded-none">New Evaluation</Badge>
                  <Badge variant="secondary" className="rounded-none">View Reports</Badge>
                  <Badge variant="secondary" className="rounded-none">Analytics</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Buttons */}
      <div className="flex justify-center gap-4 pt-6">
        <Button 
          onClick={handleNavigateToAttendance}
          variant="outline" 
          className="rounded-none"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Go to Attendance
        </Button>
        <Button 
          onClick={handleNavigateToEvaluations}
          variant="outline" 
          className="rounded-none"
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          Go to Evaluations
        </Button>
      </div>

      {/* Recent Activity Summary */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-none">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Latest Attendance Records</p>
                  <p className="text-sm text-gray-600">July 2025 - {attendanceStats.total} records</p>
                </div>
              </div>
              <Badge variant="outline" className="rounded-none">
                {attendanceStats.present + attendanceStats.late} Active
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-none">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Performance Evaluations</p>
                  <p className="text-sm text-gray-600">Average rating: {evaluationStats.avgRating}/5</p>
                </div>
              </div>
              <Badge variant="outline" className="rounded-none">
                {evaluationStats.recent} This Month
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}