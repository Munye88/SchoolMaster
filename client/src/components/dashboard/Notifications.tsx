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

// Notification Card Component
const NotificationCard: React.FC<{ 
  alert: Notification; 
  onDismiss: (id: string | number) => void;
}> = ({ alert, onDismiss }) => {
  // Determine color theme and icon based on alert type
  let colorScheme = {
    primary: '',   // Main card color
    secondary: '', // Accent color
    textColor: '', // Text color for badge
    borderColor: '',
    bgGradient: '',
    iconColor: '',
  };
  
  let alertIcon = null;
  let label = '';
  
  // Color schemes based on notification type
  switch (alert.type) {
    case 'absent':
      colorScheme = {
        primary: 'from-red-600 to-red-700',
        secondary: 'bg-red-50',
        textColor: 'text-red-900',
        borderColor: 'border-red-300',
        bgGradient: 'from-red-50 to-red-100',
        iconColor: 'text-red-100',
      };
      alertIcon = <X className="h-5 w-5 mr-2 text-white" />;
      label = 'Absent Today';
      break;
    case 'leave':
      colorScheme = {
        primary: 'from-amber-500 to-amber-600',
        secondary: 'bg-amber-50',
        textColor: 'text-amber-900',
        borderColor: 'border-amber-300',
        bgGradient: 'from-amber-50 to-amber-100',
        iconColor: 'text-amber-100',
      };
      alertIcon = <Calendar className="h-5 w-5 mr-2 text-white" />;
      label = 'On Leave';
      break;
    case 'evaluation':
      colorScheme = {
        primary: 'from-purple-600 to-purple-700',
        secondary: 'bg-purple-50',
        textColor: 'text-purple-900',
        borderColor: 'border-purple-300',
        bgGradient: 'from-purple-50 to-purple-100',
        iconColor: 'text-purple-100',
      };
      alertIcon = <AlertCircle className="h-5 w-5 mr-2 text-white" />;
      label = 'Low Score';
      break;
    case 'student_change':
      colorScheme = {
        primary: 'from-blue-600 to-blue-700',
        secondary: 'bg-blue-50',
        textColor: 'text-blue-900',
        borderColor: 'border-blue-300',
        bgGradient: 'from-blue-50 to-blue-100',
        iconColor: 'text-blue-100',
      };
      alertIcon = <GraduationCap className="h-5 w-5 mr-2 text-white" />;
      label = 'Students';
      break;
    case 'staff_change':
      colorScheme = {
        primary: 'from-green-600 to-green-700',
        secondary: 'bg-green-50',
        textColor: 'text-green-900',
        borderColor: 'border-green-300',
        bgGradient: 'from-green-50 to-green-100',
        iconColor: 'text-green-100',
      };
      alertIcon = <UserPlus className="h-5 w-5 mr-2 text-white" />;
      label = 'Staff Update';
      break;
    case 'course_complete':
      colorScheme = {
        primary: 'from-indigo-600 to-indigo-700',
        secondary: 'bg-indigo-50',
        textColor: 'text-indigo-900',
        borderColor: 'border-indigo-300',
        bgGradient: 'from-indigo-50 to-indigo-100',
        iconColor: 'text-indigo-100',
      };
      alertIcon = <Award className="h-5 w-5 mr-2 text-white" />;
      label = 'Course Update';
      break;
  }
  
  // Priority label
  const getPriorityLabel = () => {
    if (alert.priority === 'high') {
      return <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-white shadow-md flex items-center justify-center z-10" title="High Priority">
        <AlertTriangle className="h-3 w-3 text-white" />
      </div>;
    } else if (alert.priority === 'medium') {
      return <div className="absolute -top-1 -right-1 h-5 w-5 bg-amber-500 rounded-full border-2 border-white shadow-md flex items-center justify-center z-10" title="Medium Priority">
        <AlertCircle className="h-3 w-3 text-white" />
      </div>;
    }
    return null;
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
      className={`rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ${NOTIFICATION_ANIMATION} group relative overflow-hidden`}
    >
      {/* Priority indicator */}
      {getPriorityLabel()}
      
      {/* Header section with color based on notification type */}
      <div className={`bg-gradient-to-r ${colorScheme.primary} p-3 text-white relative`}>
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/30"></div>
          <div className="absolute right-6 bottom-0 w-8 h-8 rounded-full bg-white/20"></div>
          <div className="absolute left-6 top-2 w-6 h-6 rounded-full bg-white/20"></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 z-10">
            <div className="p-1.5 rounded-full bg-white/20 shadow-inner">
              {alertIcon}
            </div>
            <span className="font-bold">{alert.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {getTimeDisplay()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Content area */}
      <div className={`p-3 bg-gradient-to-b ${colorScheme.bgGradient}`}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 font-medium">{alert.reason}</p>
          
          {/* Dismiss button - always visible */}
          <button 
            className="h-7 w-7 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(alert.id);
            }}
            title="Dismiss notification"
          >
            <Trash2 className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        
        {/* Badge showing the notification type */}
        <div className="mt-2 flex justify-end">
          <Badge className={`${colorScheme.secondary} ${colorScheme.textColor} border ${colorScheme.borderColor} text-xs font-medium shadow-sm`}>
            {label}
          </Badge>
        </div>
      </div>
    </div>
  );
};

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
  
  // Find absent instructors (those marked absent in staff attendance)
  const absentInstructors = staffAttendance
    .filter(record => {
      const recordStatus = record.status?.toLowerCase();
      return recordStatus === 'absent' && new Date(record.date).toDateString() === new Date().toDateString();
    })
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
    
  // Course notifications
  const courseNotifications: Notification[] = courses
    .filter(course => {
      // Courses that are about to start (within 7 days) or end (within 7 days)
      const startDate = new Date(course.startDate);
      const endDate = new Date(course.endDate);
      const startDiff = differenceInDays(startDate, today);
      const endDiff = differenceInDays(endDate, today);
      
      return (startDiff <= 7 && startDiff >= 0) || (endDiff <= 7 && endDiff >= 0);
    })
    .map(course => {
      const startDate = new Date(course.startDate);
      const endDate = new Date(course.endDate);
      const startDiff = differenceInDays(startDate, today);
      const endDiff = differenceInDays(endDate, today);
      
      if (startDiff <= 7 && startDiff >= 0) {
        return {
          id: `course-start-${course.id}`,
          name: `${course.name} Starting Soon`,
          schoolId: course.schoolId,
          reason: `Course starts in ${startDiff} day${startDiff === 1 ? '' : 's'}`,
          type: 'course_complete' as NotificationType,
          priority: 'medium' as 'high' | 'medium' | 'low',
          timestamp: startDate,
        };
      } else {
        return {
          id: `course-end-${course.id}`,
          name: `${course.name} Ending Soon`,
          schoolId: course.schoolId,
          reason: `Course ends in ${endDiff} day${endDiff === 1 ? '' : 's'}`,
          type: 'course_complete' as NotificationType,
          priority: 'medium' as 'high' | 'medium' | 'low',
          timestamp: endDate,
        };
      }
    });
  
  // Student count change notifications
  const studentCountNotifications: Notification[] = [];
  if (students && students.length > 0) {
    // Group students by course
    const courseStudentCounts = students.reduce((acc, student) => {
      const courseId = student.courseId;
      if (!acc[courseId]) {
        acc[courseId] = 0;
      }
      acc[courseId]++;
      return acc;
    }, {} as Record<number, number>);
    
    // Create notifications for courses with large student counts
    Object.entries(courseStudentCounts).forEach(([courseId, count]) => {
      if (count > 25) {
        const course = courses.find(c => c.id === parseInt(courseId));
        if (course) {
          studentCountNotifications.push({
            id: `student-count-${courseId}`,
            name: 'High Enrollment',
            schoolId: course.schoolId,
            reason: `${course.name} has ${count} students enrolled`,
            type: 'student_change' as NotificationType,
            priority: 'medium' as 'high' | 'medium' | 'low',
            timestamp: today,
          });
        }
      }
    });
  }
  
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
    
  const filteredCourseNotifications = selectedSchool
    ? courseNotifications.filter(alert => alert.schoolId === selectedSchool.id)
    : courseNotifications;
    
  const filteredStudentCountNotifications = selectedSchool
    ? studentCountNotifications.filter(alert => alert.schoolId === selectedSchool.id)
    : studentCountNotifications;
  
  // Combine all alerts
  const allAlerts: Notification[] = [
    ...filteredAbsentInstructors, 
    ...filteredInstructorsOnLeave, 
    ...filteredLowPerformingInstructors,
    ...filteredCourseNotifications,
    ...filteredStudentCountNotifications
  ].sort((a, b) => {
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
  
  // Clear all notifications
  const handleClearAllNotifications = () => {
    const idsToAdd = filteredNonDismissedAlerts.map(alert => alert.id);
    setDismissedNotifications(prev => [...prev, ...idsToAdd]);
  };
  
  // Get count badge for tabs
  const getCategoryCount = (category: string) => {
    const nonDismissedAlerts = allAlerts.filter(
      alert => !dismissedNotifications.includes(alert.id)
    );
    
    const typeMap: Record<string, NotificationType[]> = {
      "all": ['absent', 'leave', 'evaluation', 'student_change', 'staff_change', 'course_complete'],
      "staff": ['absent', 'leave', 'evaluation', 'staff_change'],
      "students": ['student_change'],
      "courses": ['course_complete']
    };
    
    return nonDismissedAlerts.filter(alert => typeMap[category]?.includes(alert.type)).length;
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

  // Notification count
  // Calculate notification count  
  const notificationCount = filteredNonDismissedAlerts.length;
  
  return (
    <div>
      {/* Header with animation and gradient */}
      <div className="bg-gradient-to-r from-[#0A2463] via-[#1A3473] to-[#0A2463] rounded-t-xl p-4 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoMnYyaC0yek0zMCAzMGgydjJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full transform translate-x-20 -translate-y-20 blur-2xl"></div>
        
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold opacity-90 uppercase tracking-wider">Notifications</h3>
            <p className="text-3xl font-bold mt-1 flex items-baseline">
              {notificationCount}
              <span className="ml-2 text-sm opacity-80">Active Alerts</span>
            </p>
          </div>
          
          {/* Animated bell icon with pulse effect */}
          <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm shadow-inner border border-white/30">
            <div className={`relative ${notificationCount > 0 ? 'animate-bounce' : ''}`}>
              <Bell className="w-7 h-7 text-white" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border border-white flex items-center justify-center text-[10px] font-bold">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Category tabs with colorful indicators */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-x border-t border-gray-200">
        <div className="flex items-center w-full">
          <div className="flex-1 flex gap-1 overflow-x-auto py-1 px-1 scrollbar-none">
            <Button 
              variant={activeTab === "all" ? "default" : "ghost"}
              size="sm" 
              className={`whitespace-nowrap py-1 px-3 text-xs rounded-md ${
                activeTab === "all" 
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md" 
                  : "hover:bg-blue-100 text-gray-800 shadow-sm border border-gray-200"
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
              className={`whitespace-nowrap py-1 px-3 text-xs rounded-md ${
                activeTab === "staff" 
                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md" 
                  : "hover:bg-green-100 text-gray-800 shadow-sm border border-gray-200"
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
              className={`whitespace-nowrap py-1 px-3 text-xs rounded-md ${
                activeTab === "students" 
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md" 
                  : "hover:bg-purple-100 text-gray-800 shadow-sm border border-gray-200"
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
              className={`whitespace-nowrap py-1 px-3 text-xs rounded-md ${
                activeTab === "courses" 
                  ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md" 
                  : "hover:bg-amber-100 text-gray-800 shadow-sm border border-gray-200"
              }`}
              onClick={() => setActiveTab("courses")}
            >
              <BookOpen className="h-3 w-3 mr-1.5" />
              Courses <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === "courses" ? "bg-white/30" : "bg-gray-200"}`}>
                {getCategoryCount("courses")}
              </span>
            </Button>
          </div>
          
          {/* Clear all button */}
          {filteredNonDismissedAlerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 whitespace-nowrap text-xs flex items-center gap-1 py-1 px-2 hover:bg-red-50 hover:text-red-600 text-gray-500 border border-gray-200 shadow-sm"
              onClick={handleClearAllNotifications}
            >
              <Trash2 className="h-3 w-3" />
              Clear All
            </Button>
          )}
        </div>
      </div>
      
      {/* Notification list with scroll area */}
      <ScrollArea className="h-[240px] w-full border-x border-b border-gray-200 rounded-b-xl bg-gray-50 shadow-inner">
        <div className="space-y-3 p-3">
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

export default Notifications;