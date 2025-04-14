import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, AlertTriangle, Calendar, X, Bookmark, UserMinus, 
  GraduationCap, Users, BookOpen, CheckCircle, Bell, Award
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StaffAttendance, StaffLeave, Evaluation, Instructor, Course, Student } from "@shared/schema";
import { useSchool } from '@/hooks/useSchool';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotificationsProps {
  instructors: Instructor[];
  staffAttendance: StaffAttendance[];
  staffLeave: StaffLeave[];
  evaluations: Evaluation[];
  courses?: Course[];
  students?: Student[];
}

type NotificationType = 
  | 'absent' 
  | 'leave' 
  | 'evaluation' 
  | 'student_change'
  | 'staff_change'
  | 'course_complete';

interface Notification {
  id: string | number;
  name: string;
  schoolId: number;
  reason: string;
  type: NotificationType;
  timestamp?: Date;
  priority?: 'high' | 'medium' | 'low';
}

const Notifications: React.FC<NotificationsProps> = ({
  instructors,
  staffAttendance,
  staffLeave,
  evaluations,
  courses = [],
  students = [],
}) => {
  const { selectedSchool } = useSchool();
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Find absent instructors (those marked absent in staff attendance)
  const absentInstructors = staffAttendance
    .filter(record => record.status === 'absent' && new Date(record.date).toDateString() === new Date().toDateString())
    .map(record => {
      const instructor = instructors.find(i => i.id === record.instructorId);
      return {
        id: record.instructorId,
        name: instructor?.name || `Instructor #${record.instructorId}`,
        schoolId: instructor?.schoolId || 0,
        reason: record.comments || 'No reason provided',
        type: 'absent' as NotificationType,
        priority: 'high' as 'high' | 'medium' | 'low', 
        timestamp: new Date(),
      };
    });

  // Find instructors on leave (active leave periods)
  const today = new Date();
  const instructorsOnLeave = staffLeave
    .filter(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      return today >= startDate && today <= endDate && leave.status === 'Approved';
    })
    .map(leave => {
      const instructor = instructors.find(i => i.id === leave.instructorId);
      return {
        id: leave.instructorId,
        name: instructor?.name || `Instructor #${leave.instructorId}`,
        schoolId: instructor?.schoolId || 0,
        reason: `${leave.leaveType || 'PTO'} - Returns ${format(new Date(leave.returnDate), 'MMM dd')}`,
        type: 'leave' as NotificationType,
        priority: 'medium' as 'high' | 'medium' | 'low',
        timestamp: new Date(leave.startDate),
      };
    });

  // Find instructors with low evaluation scores (below 85%)
  const lowPerformingInstructors = evaluations
    .filter(evaluation => evaluation.score < 85)
    .map(evaluation => {
      const instructor = instructors.find(i => i.id === evaluation.instructorId);
      return {
        id: evaluation.instructorId,
        name: instructor?.name || `Instructor #${evaluation.instructorId}`,
        schoolId: instructor?.schoolId || 0,
        reason: `${evaluation.score}% in ${evaluation.quarter}`,
        type: 'evaluation' as NotificationType,
        priority: 'high' as 'high' | 'medium' | 'low',
        timestamp: today,
      };
    });
    
  // Mock student count change notifications
  const studentChanges: Notification[] = [
    {
      id: 'student-1',
      name: 'Student Count Increased',
      schoolId: selectedSchool?.id || 0,
      reason: 'Class size increased from 24 to 27 students in Aviation course',
      type: 'student_change',
      priority: 'medium' as 'high' | 'medium' | 'low',
      timestamp: subDays(new Date(), 1),
    }
  ];
  
  // Mock staff changes
  const staffChanges: Notification[] = [
    {
      id: 'staff-1',
      name: 'New Instructor',
      schoolId: selectedSchool?.id || 0,
      reason: 'Sarah Johnson was added to the instructor roster',
      type: 'staff_change',
      priority: 'medium' as 'high' | 'medium' | 'low',
      timestamp: subDays(new Date(), 2),
    }
  ];
  
  // Mock course completions
  const courseCompletions: Notification[] = [
    {
      id: 'course-1',
      name: 'Course Completed',
      schoolId: selectedSchool?.id || 0,
      reason: 'Aviation English I has been completed',
      type: 'course_complete',
      priority: 'low' as 'high' | 'medium' | 'low',
      timestamp: subDays(new Date(), 3),
    }
  ];

  // Filter alerts based on selected school
  const filteredAbsentInstructors = selectedSchool 
    ? absentInstructors.filter(alert => alert.schoolId === selectedSchool.id)
    : absentInstructors;
    
  const filteredInstructorsOnLeave = selectedSchool
    ? instructorsOnLeave.filter(alert => alert.schoolId === selectedSchool.id)
    : instructorsOnLeave;
    
  const filteredLowPerformingInstructors = selectedSchool
    ? lowPerformingInstructors.filter(alert => alert.schoolId === selectedSchool.id)
    : lowPerformingInstructors;
    
  const filteredStudentChanges = selectedSchool
    ? studentChanges.filter(alert => alert.schoolId === selectedSchool.id)
    : studentChanges;
    
  const filteredStaffChanges = selectedSchool
    ? staffChanges.filter(alert => alert.schoolId === selectedSchool.id)
    : staffChanges;
    
  const filteredCourseCompletions = selectedSchool
    ? courseCompletions.filter(alert => alert.schoolId === selectedSchool.id)
    : courseCompletions;
  
  // Combine all alerts and fix possible type issues
  const correctTypeAlerts = [
    ...filteredAbsentInstructors, 
    ...filteredInstructorsOnLeave, 
    ...filteredLowPerformingInstructors,
    ...filteredStudentChanges,
    ...filteredStaffChanges,
    ...filteredCourseCompletions
  ].map(alert => ({
    ...alert,
    priority: alert.priority as 'high' | 'medium' | 'low' | undefined
  }));
  
  const allAlerts: Notification[] = correctTypeAlerts.sort((a, b) => {
    // Sort by priority first
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const aPriority = (a.priority || 'medium') as 'high' | 'medium' | 'low';
    const bPriority = (b.priority || 'medium') as 'high' | 'medium' | 'low';
    const priorityDiff = priorityOrder[aPriority] - priorityOrder[bPriority];
    
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by timestamp (newest first)
    return (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0);
  });
  
  // Filter alerts by tab
  const getFilteredAlerts = () => {
    if (activeTab === "all") return allAlerts;
    
    const typeMap: Record<string, NotificationType[]> = {
      "staff": ['absent', 'leave', 'evaluation', 'staff_change'],
      "students": ['student_change'],
      "courses": ['course_complete']
    };
    
    return allAlerts.filter(alert => typeMap[activeTab]?.includes(alert.type));
  };
  
  const filteredAlerts = getFilteredAlerts();
  
  // Get count badge for tabs
  const getCategoryCount = (category: string) => {
    const typeMap: Record<string, NotificationType[]> = {
      "all": ['absent', 'leave', 'evaluation', 'student_change', 'staff_change', 'course_complete'],
      "staff": ['absent', 'leave', 'evaluation', 'staff_change'],
      "students": ['student_change'],
      "courses": ['course_complete']
    };
    
    return allAlerts.filter(alert => typeMap[category]?.includes(alert.type)).length;
  };

  // If no alerts, show a friendly message
  if (allAlerts.length === 0) {
    return (
      <Card className="shadow-md border border-gray-200 overflow-hidden">
        <CardHeader className="p-4 pb-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-lg font-semibold text-[#0A2463] flex items-center">
            <Bell className="h-5 w-5 mr-2 text-green-500" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-full mb-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-gray-700 font-medium">All systems running smoothly</p>
            <p className="text-gray-500 text-sm mt-1">There are no notifications at this time</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border border-gray-200 overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="text-lg font-semibold text-[#0A2463] flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-blue-500" />
            Notifications
          </div>
          <Badge className="bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-300">
            {allAlerts.length} {allAlerts.length === 1 ? 'alert' : 'alerts'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 pt-2 bg-gray-50 border-b">
          <TabsList className="bg-gray-100 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-white flex items-center gap-1">
              <Bookmark className="h-4 w-4" />
              <span>All</span>
              <Badge variant="outline" className="ml-1 bg-gray-100 text-xs py-0 px-1.5 h-5">{getCategoryCount("all")}</Badge>
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-white flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Staff</span>
              <Badge variant="outline" className="ml-1 bg-gray-100 text-xs py-0 px-1.5 h-5">{getCategoryCount("staff")}</Badge>
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-white flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              <span>Students</span>
              <Badge variant="outline" className="ml-1 bg-gray-100 text-xs py-0 px-1.5 h-5">{getCategoryCount("students")}</Badge>
            </TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-white flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>Courses</span>
              <Badge variant="outline" className="ml-1 bg-gray-100 text-xs py-0 px-1.5 h-5">{getCategoryCount("courses")}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <ScrollArea className="h-[320px] w-full">
            <div className="p-3 space-y-2">
              {filteredAlerts.map((alert, index) => (
                <NotificationCard key={`${alert.type}-${alert.id}-${index}`} alert={alert} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="staff" className="mt-0">
          <ScrollArea className="h-[320px] w-full">
            <div className="p-3 space-y-2">
              {filteredAlerts.map((alert, index) => (
                <NotificationCard key={`${alert.type}-${alert.id}-${index}`} alert={alert} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="students" className="mt-0">
          <ScrollArea className="h-[320px] w-full">
            <div className="p-3 space-y-2">
              {filteredAlerts.map((alert, index) => (
                <NotificationCard key={`${alert.type}-${alert.id}-${index}`} alert={alert} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="courses" className="mt-0">
          <ScrollArea className="h-[320px] w-full">
            <div className="p-3 space-y-2">
              {filteredAlerts.map((alert, index) => (
                <NotificationCard key={`${alert.type}-${alert.id}-${index}`} alert={alert} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

// Notification Card Component
const NotificationCard: React.FC<{ alert: Notification }> = ({ alert }) => {
  // Determine color theme and icon based on alert type
  let badgeColor = '';
  let bgColor = '';
  let borderColor = '';
  let alertIcon = null;
  let label = '';
  
  switch (alert.type) {
    case 'absent':
      badgeColor = 'bg-red-100 text-red-800 border border-red-200';
      bgColor = 'bg-gradient-to-r from-red-50 to-red-100';
      borderColor = 'border-red-200';
      alertIcon = <X className="h-4 w-4 mr-2 text-red-600" />;
      label = 'Absent Today';
      break;
    case 'leave':
      badgeColor = 'bg-amber-100 text-amber-800 border border-amber-200';
      bgColor = 'bg-gradient-to-r from-amber-50 to-amber-100';
      borderColor = 'border-amber-200';
      alertIcon = <Calendar className="h-4 w-4 mr-2 text-amber-600" />;
      label = 'On Leave';
      break;
    case 'evaluation':
      badgeColor = 'bg-purple-100 text-purple-800 border border-purple-200';
      bgColor = 'bg-gradient-to-r from-purple-50 to-purple-100';
      borderColor = 'border-purple-200';
      alertIcon = <AlertCircle className="h-4 w-4 mr-2 text-purple-600" />;
      label = 'Low Score';
      break;
    case 'student_change':
      badgeColor = 'bg-blue-100 text-blue-800 border border-blue-200';
      bgColor = 'bg-gradient-to-r from-blue-50 to-blue-100';
      borderColor = 'border-blue-200';
      alertIcon = <GraduationCap className="h-4 w-4 mr-2 text-blue-600" />;
      label = 'Students';
      break;
    case 'staff_change':
      badgeColor = 'bg-green-100 text-green-800 border border-green-200';
      bgColor = 'bg-gradient-to-r from-green-50 to-green-100';
      borderColor = 'border-green-200';
      alertIcon = <UserMinus className="h-4 w-4 mr-2 text-green-600" />;
      label = 'Staff Update';
      break;
    case 'course_complete':
      badgeColor = 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      bgColor = 'bg-gradient-to-r from-indigo-50 to-indigo-100';
      borderColor = 'border-indigo-200';
      alertIcon = <Award className="h-4 w-4 mr-2 text-indigo-600" />;
      label = 'Course Complete';
      break;
  }
  
  // Priority indicator
  const getPriorityIndicator = () => {
    if (alert.priority === 'high') {
      return <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" />;
    } else if (alert.priority === 'medium') {
      return <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />;
    }
    return <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1" />;
  };
  
  // Format timestamp
  const getTimeDisplay = () => {
    if (!alert.timestamp) return '';
    
    const today = new Date();
    const alertDate = new Date(alert.timestamp);
    
    if (alertDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (alertDate.toDateString() === subDays(today, 1).toDateString()) {
      return 'Yesterday';
    } else {
      return format(alertDate, 'MMM dd');
    }
  };
  
  return (
    <div 
      className={`p-3 rounded-lg border shadow-sm hover:shadow-md transition-all ${bgColor} ${borderColor}`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="font-medium text-gray-800 flex items-center">
            {getPriorityIndicator()}
            {alert.name}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{getTimeDisplay()}</span>
            <Badge className={`text-xs px-2 py-0.5 ${badgeColor}`}>
              {label}
            </Badge>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600 mt-1">
          {alertIcon}
          <span>{alert.reason}</span>
        </div>
      </div>
    </div>
  );
};

export default Notifications;