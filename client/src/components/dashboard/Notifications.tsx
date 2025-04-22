import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, AlertTriangle, Calendar, X, Bookmark, UserMinus, 
  GraduationCap, Users, BookOpen, CheckCircle, Bell, Award,
  Play, Trash2, UserPlus, UsersIcon
} from 'lucide-react';
import { format, subDays, isToday, differenceInDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StaffAttendance, StaffLeave, Evaluation, Instructor, Course, Student } from "@shared/schema";
import { useSchool } from '@/hooks/useSchool';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Set a smaller height for the notification panel to match other dashboard components
const NOTIFICATION_PANEL_HEIGHT = "h-[220px]";

// New animation classes for notifications
const NOTIFICATION_ANIMATION = "animate-in fade-in slide-in-from-right-3 duration-300";

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
  
  // State for dismissed notifications
  const [dismissedNotifications, setDismissedNotifications] = useState<(string | number)[]>(() => {
    const savedDismissed = localStorage.getItem('dismissed_notifications');
    return savedDismissed ? JSON.parse(savedDismissed) : [];
  });
  
  // Save dismissed notifications to localStorage
  useEffect(() => {
    localStorage.setItem('dismissed_notifications', JSON.stringify(dismissedNotifications));
  }, [dismissedNotifications]);
  
  // Handle dismissing a notification
  const handleDismissNotification = (id: string | number) => {
    setDismissedNotifications(prev => [...prev, id]);
  };
  
  // Clear all notifications
  const handleClearAllNotifications = () => {
    const idsToAdd = filteredAlerts.map(alert => alert.id);
    setDismissedNotifications(prev => [...prev, ...idsToAdd]);
  };
  
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
  
  // Filter out dismissed notifications
  const filteredNonDismissedAlerts = filteredAlerts.filter(
    alert => !dismissedNotifications.includes(alert.id)
  );
  
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
      <Card className="shadow-xl border border-gray-200 overflow-hidden rounded-xl">
        <CardHeader className="p-4 pb-3 border-b bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
          <CardTitle className="text-lg font-semibold text-[#0A2463] flex items-center">
            <Bell className="h-5 w-5 mr-2 text-green-500" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center p-6 animate-in fade-in duration-500">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-full mb-3 shadow-inner">
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
    <div>
      <div className="bg-gradient-to-r from-[#0A2463] via-[#1A3473] to-[#0A2463] rounded-xl shadow-xl p-4 text-white mb-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoMnYyaC0yek0zMCAzMGgydjJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full transform translate-x-20 -translate-y-20 blur-2xl"></div>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wider">Notifications</h3>
            <p className="text-3xl font-bold mt-1 flex items-baseline">
              {allAlerts.length}
              <span className="ml-2 text-sm opacity-80">Active Alerts</span>
            </p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm shadow-inner border border-white/30 animate-pulse">
            <Bell className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center w-full">
          <div className="flex-1 flex gap-2 bg-white/90 p-1 rounded-lg shadow-md border border-gray-200 backdrop-blur-sm">
          <Button 
            variant={activeTab === "all" ? "default" : "ghost"}
            size="sm" 
            className={`py-1 px-3 text-xs rounded-md ${
              activeTab === "all" 
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg" 
                : "hover:bg-blue-100 text-gray-800"
            }`}
            onClick={() => setActiveTab("all")}
          >
            <Bookmark className="h-3 w-3 mr-1.5" />
            All <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === "all" ? "bg-white/30" : "bg-gray-200"}`}>
              {getCategoryCount("all")}
            </span>
          </Button>
          <Button 
            variant={activeTab === "staff" ? "default" : "ghost"}
            size="sm" 
            className={`py-1 px-3 text-xs rounded-md ${
              activeTab === "staff" 
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg" 
                : "hover:bg-green-100 text-gray-800"
            }`}
            onClick={() => setActiveTab("staff")}
          >
            <Users className="h-3 w-3 mr-1.5" />
            Staff <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === "staff" ? "bg-white/30" : "bg-gray-200"}`}>
              {getCategoryCount("staff")}
            </span>
          </Button>
          <Button 
            variant={activeTab === "students" ? "default" : "ghost"}
            size="sm" 
            className={`py-1 px-3 text-xs rounded-md ${
              activeTab === "students" 
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg" 
                : "hover:bg-purple-100 text-gray-800"
            }`}
            onClick={() => setActiveTab("students")}
          >
            <GraduationCap className="h-3 w-3 mr-1.5" />
            Students <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === "students" ? "bg-white/30" : "bg-gray-200"}`}>
              {getCategoryCount("students")}
            </span>
          </Button>
          <Button 
            variant={activeTab === "courses" ? "default" : "ghost"}
            size="sm" 
            className={`py-1 px-3 text-xs rounded-md ${
              activeTab === "courses" 
                ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg" 
                : "hover:bg-amber-100 text-gray-800"
            }`}
            onClick={() => setActiveTab("courses")}
          >
            <BookOpen className="h-3 w-3 mr-1.5" />
            Courses <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === "courses" ? "bg-white/30" : "bg-gray-200"}`}>
              {getCategoryCount("courses")}
            </span>
          </Button>
          </div>
          
          {filteredNonDismissedAlerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 text-xs flex items-center gap-1 py-1 px-3 hover:bg-red-50 hover:text-red-600 text-gray-500"
              onClick={handleClearAllNotifications}
            >
              <Trash2 className="h-3 w-3" />
              Clear All
            </Button>
          )}
        </div>
      </div>
      
      <ScrollArea className="h-[240px] w-full mt-2">
        <div className="space-y-3">
          {filteredNonDismissedAlerts.length > 0 ? (
            filteredNonDismissedAlerts.map((alert, index) => (
              <NotificationCard 
                key={`${alert.type}-${alert.id}-${index}`} 
                alert={alert} 
                onDismiss={handleDismissNotification} 
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-md text-gray-500 animate-in fade-in duration-300">
              <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm border border-gray-100 mb-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-800">No Active Alerts</p>
              <p className="text-xs text-gray-500 mt-1 text-center max-w-[200px]">
                There are no notifications in the {activeTab === "all" ? "system" : activeTab} category at this time
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// Notification Card Component
const NotificationCard: React.FC<{ 
  alert: Notification, 
  onDismiss: (id: string | number) => void 
}> = ({ alert, onDismiss }) => {
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
      className={`p-3 rounded-xl border ${bgColor} ${borderColor} shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${NOTIFICATION_ANIMATION} relative group`}
      style={{
        backgroundImage: 'radial-gradient(circle at 80% 10%, rgba(255, 255, 255, 0.8), transparent 25%)'
      }}
    >
      {/* Dismiss button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="absolute right-2 top-2 h-5 w-5 rounded-full bg-gray-100/80 hover:bg-gray-200 flex items-center justify-center border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(alert.id);
              }}
            >
              <X className="h-3 w-3 text-gray-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">Dismiss notification</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="font-medium text-gray-800 flex items-center">
            {getPriorityIndicator()}
            <span className="font-semibold">{alert.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 bg-white/50 px-1.5 py-0.5 rounded-full border border-white/60 shadow-sm">
              {getTimeDisplay()}
            </span>
            <Badge className={`text-xs font-medium px-2 py-0.5 shadow-sm ${badgeColor}`}>
              {label}
            </Badge>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-700 mt-2 p-1.5 pl-2 bg-white/40 backdrop-blur-sm border border-white/60 rounded-lg">
          {alertIcon}
          <span>{alert.reason}</span>
        </div>
      </div>
    </div>
  );
};

export default Notifications;