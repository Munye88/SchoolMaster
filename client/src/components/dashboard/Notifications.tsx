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
import { StaffAttendance, StaffLeave, Evaluation, Instructor, Course } from "@shared/schema";
import { useSchool } from '@/hooks/useSchool';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Set a smaller height for the notification panel to match other dashboard components
const NOTIFICATION_PANEL_HEIGHT = "h-[120px]";

// New animation classes for notifications
const NOTIFICATION_ANIMATION = "animate-in fade-in slide-in-from-right-3 duration-300";

interface NotificationsProps {
  instructors?: Instructor[];
  staffAttendance?: StaffAttendance[];
  staffLeave?: StaffLeave[];
  evaluations?: Evaluation[];
  courses?: Course[];
  limit?: number;
  showFilter?: boolean;
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
      alertIcon = <X className="h-4 w-4 mr-1 text-white" />;
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
      alertIcon = <Calendar className="h-4 w-4 mr-1 text-white" />;
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
      alertIcon = <AlertCircle className="h-4 w-4 mr-1 text-white" />;
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
      alertIcon = <GraduationCap className="h-4 w-4 mr-1 text-white" />;
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
      alertIcon = <UserPlus className="h-4 w-4 mr-1 text-white" />;
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
      alertIcon = <Award className="h-4 w-4 mr-1 text-white" />;
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
      <div className={`bg-gradient-to-r ${colorScheme.primary} p-2 text-white relative`}>
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/30"></div>
          <div className="absolute right-6 bottom-0 w-8 h-8 rounded-full bg-white/20"></div>
          <div className="absolute left-6 top-2 w-6 h-6 rounded-full bg-white/20"></div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 z-10">
            <div className="p-1 rounded-full bg-white/20 shadow-inner">
              {alertIcon}
            </div>
            <span className="font-bold text-xs">{alert.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {getTimeDisplay()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Content area */}
      <div className={`p-2 bg-gradient-to-b ${colorScheme.bgGradient}`}>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-700 font-medium">{alert.reason}</p>
          
          {/* Dismiss button - always visible */}
          <button 
            className="h-6 w-6 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm transition-colors duration-200"
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
  instructors = [],
  staffAttendance = [],
  staffLeave = [],
  evaluations = [],
  courses = [],
  limit,
  showFilter = true,
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
      // Check if dates exist and are valid
      if (!course.startDate || !course.endDate) return false;
      
      try {
        // Try to create Date objects to validate them
        const startDate = new Date(course.startDate);
        const endDate = new Date(course.endDate);
        
        // Make sure they're valid dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
        
        const startDiff = differenceInDays(startDate, today);
        const endDiff = differenceInDays(endDate, today);
        
        return (startDiff <= 7 && startDiff >= 0) || (endDiff <= 7 && endDiff >= 0);
      } catch (error) {
        return false;
      }
    })
    .map(course => {
      // Create Date objects (we know they're valid from the filter)
      const startDate = new Date(course.startDate);
      // Handle nullable endDate
      const endDate = course.endDate ? new Date(course.endDate) : new Date();
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
  
  // Student count change notifications - based on course enrollment
  const studentCountNotifications: Notification[] = courses
    .filter(course => course.studentCount > 50) // High enrollment threshold
    .map(course => ({
      id: `student-count-${course.id}`,
      name: 'High Enrollment',
      schoolId: course.schoolId,
      reason: `${course.name} has ${course.studentCount} students enrolled`,
      type: 'student_change' as NotificationType,
      priority: 'medium' as 'high' | 'medium' | 'low',
      timestamp: today,
    }));
  
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
  let filteredNonDismissedAlerts = filteredAlerts.filter(
    alert => !dismissedNotifications.includes(alert.id)
  );
  
  // Apply limit if provided
  if (limit && filteredNonDismissedAlerts.length > limit) {
    filteredNonDismissedAlerts = filteredNonDismissedAlerts.slice(0, limit);
  }
  
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
    <div className="bg-white rounded-xl shadow-sm border-[1px] border-gray-100">
      {/* Header that matches the static notification style */}
      <div className="p-4">
        <h2 className="text-[#0B1D51] text-2xl font-bold mb-4">Notifications</h2>
      
        {/* Active Alerts Header */}
        <div className="flex justify-between items-center bg-[#F8FAFC] p-3 rounded-xl mb-3">
          <div className="flex items-center">
            <span className="text-[#0B1D51] text-2xl font-bold">{notificationCount}</span>
            <span className="text-[#0B1D51] text-xl font-bold ml-3">ACTIVE ALERTS</span>
          </div>
          <Bell className="h-6 w-6 text-[#0B1D51]" />
        </div>
      </div>
      
      {/* Category tabs with colorful indicators - only shown when showFilter is true */}
      {showFilter && <div className="flex items-center justify-between p-2 bg-gray-50 border-x border-t border-gray-200">
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
      </div>}
      
      {/* Notification list - matching the static notification style */}
      <div className="px-4">
        <div className="space-y-4">
          {filteredNonDismissedAlerts.length > 0 ? (
            filteredNonDismissedAlerts.map((alert, index) => (
              <div key={`${alert.type}-${alert.id}-${index}`} className="bg-[#F8FAFC] p-2 rounded-xl mb-2">
                <div className="flex items-center gap-3 mb-1">
                  {alert.priority === 'high' && (
                    <div className="bg-amber-400 rounded-full w-6 h-6 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className="text-[#0B1D51] text-lg font-semibold">{alert.name}</span>
                </div>
                <p className="text-[#0B1D51] text-base mt-1">{alert.reason}</p>
                <div className="flex justify-between mt-2">
                  <div className="bg-[#E3E9F7] px-4 py-1 rounded-full text-[#0B1D51] font-medium">
                    {alert.timestamp ? (isToday(new Date(alert.timestamp)) ? 'Today' : format(new Date(alert.timestamp), 'MMM dd')) : 'Today'}
                  </div>
                  <button 
                    onClick={() => handleDismissNotification(alert.id)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
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
      </div>
    </div>
  );
};

export default Notifications;