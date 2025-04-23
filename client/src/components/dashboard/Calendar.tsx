import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Event, School } from '@shared/schema';
import { useSchool } from '@/hooks/useSchool';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendarProps {
  className?: string;
}

export function Calendar({ className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { selectedSchool, schools } = useSchool();
  
  // Use selectedSchool as the current school
  const currentSchool = selectedSchool;
  
  // Fetch all events or school-specific events based on selection
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: selectedSchool 
      ? ['/api/schools', selectedSchool.id, 'events']
      : ['/api/events'],
    enabled: !selectedSchool || !!selectedSchool?.id,
  });
  
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Function to get Hijri date (simple approximation)
  const getHijriDate = (date: Date): string => {
    try {
      // Formula based on a rough approximation
      // Hijri calendar started on July 16, 622 CE
      const gregorianYear = date.getFullYear();
      const gregorianMonth = date.getMonth() + 1; // JavaScript months are 0-based
      const gregorianDay = date.getDate();
      
      // Approximate conversion to Hijri date
      // This is a very simple formula that doesn't account for precise lunar calendar adjustments
      const hijriYear = Math.floor((gregorianYear - 622) / 0.97);
      
      // Approximate month - shifting by about 10 days per month
      const monthNames = [
        "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", 
        "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban", 
        "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
      ];
      
      // Simple approximation - shift months by 9 (30-day offset vs lunar ~29.5 days)
      let hijriMonth = (gregorianMonth + 9) % 12;
      if (hijriMonth === 0) hijriMonth = 12;
      
      // Approximate day - simplistic approach
      let hijriDay = gregorianDay;
      if (hijriDay > 29) hijriDay = 29; // Hijri months never exceed 30 days
      
      return `${hijriDay} ${monthNames[hijriMonth - 1]} ${hijriYear} AH`;
    } catch (err) {
      return "Hijri date unavailable";
    }
  };

  // Function to get school name by ID
  const getSchoolName = (schoolId: number | null) => {
    if (!schoolId) return 'All Schools';
    
    if (currentSchool && currentSchool.id === schoolId) {
      return currentSchool.name;
    }
    
    // If we're showing events for all schools, try to get the school name
    const schoolMap: Record<number, string> = {
      1: 'KNFA',
      350: 'NFS East',
      351: 'NFS West'
    };
    
    return schoolMap[schoolId] || 'Unknown School';
  };

  // Function to get school color by ID
  const getSchoolColor = (schoolId: number | null): string => {
    if (!schoolId) return "bg-gray-100";
    
    // Color mapping for schools
    const schoolColorMap: Record<number, string> = {
      1: "bg-blue-100", // KNFA
      350: "bg-green-100", // NFS East
      351: "bg-purple-100" // NFS West
    };
    
    return schoolColorMap[schoolId] || "bg-gray-100";
  };

  // Function to determine if an event is a student day
  const isStudentDay = (event: Event): boolean => {
    return event.title.toLowerCase().includes("student day") || 
           event.description?.toLowerCase().includes("student day") || 
           false;
  };
  
  const renderDay = (day: Date) => {
    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isCurrentDay = isToday(day);
    const dayEvents = events?.filter(event => isSameDay(new Date(event.start), day)) || [];
    const hasEvents = dayEvents.length > 0;
    
    // Check if there are any student days for this date
    const studentDayEvents = dayEvents.filter(isStudentDay);
    const hasStudentDay = studentDayEvents.length > 0;
    
    // Get the first student day event to determine coloring
    const firstStudentDayEvent = studentDayEvents[0];
    
    // Determine background color for student days by school
    let dayBgColor = "";
    if (hasStudentDay && firstStudentDayEvent.schoolId) {
      if (firstStudentDayEvent.schoolId === 1) {
        dayBgColor = "bg-blue-50"; // KNFA
      } else if (firstStudentDayEvent.schoolId === 350) {
        dayBgColor = "bg-green-50"; // NFS East
      } else if (firstStudentDayEvent.schoolId === 351) {
        dayBgColor = "bg-purple-50"; // NFS West
      }
    }
    
    // Get Hijri date for hover
    const hijriDate = getHijriDate(day);
    
    const dayContent = (
      <>
        {format(day, 'd')}
        {hasEvents && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-0.5">
              {dayEvents.slice(0, 3).map((event, index) => {
                // Use school-specific colors for the event indicators
                let dotColor = "bg-blue-500";
                if (event.schoolId === 1) dotColor = "bg-blue-500"; // KNFA
                if (event.schoolId === 350) dotColor = "bg-green-500"; // NFS East
                if (event.schoolId === 351) dotColor = "bg-purple-500"; // NFS West
                
                return (
                  <div key={index} className={`h-1 w-1 rounded-full ${dotColor}`} />
                );
              })}
              {dayEvents.length > 3 && (
                <div className="h-1 w-1 rounded-full bg-gray-300" />
              )}
            </div>
          </div>
        )}
      </>
    );
    
    // Both tooltipped and non-tooltipped days share these classes
    const baseClasses = cn(
      "h-10 w-10 flex items-center justify-center rounded-full text-sm relative",
      !isCurrentMonth && "text-gray-400",
      isCurrentDay && "bg-blue-100 font-bold text-blue-800",
      hasStudentDay && dayBgColor, // Apply school-specific background color for student days
      "hover:bg-gray-100 cursor-pointer"
    );
    
    // If there are no events, just return the day without a tooltip
    if (!hasEvents) {
      return (
        <TooltipProvider key={day.toString()}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={baseClasses}>
                {dayContent}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="p-2">
              <div className="text-xs">
                <div className="font-semibold">{format(day, 'MMMM d, yyyy')}</div>
                <div className="text-gray-500 mt-1">{hijriDate}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    // If there are events, show event details in tooltip
    return (
      <TooltipProvider key={day.toString()}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(baseClasses, hasEvents && !isCurrentDay && "font-semibold")}>
              {dayContent}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="p-0 max-w-[250px]">
            <div className="p-2">
              <div className="font-semibold mb-1">{format(day, 'MMMM d, yyyy')}</div>
              <div className="text-xs text-gray-500 mb-2">{hijriDate}</div>
              <div className="space-y-2">
                {dayEvents.map(event => {
                  // Determine border color based on school
                  let borderColor = "border-gray-400";
                  if (event.schoolId === 1) borderColor = "border-blue-500"; // KNFA
                  if (event.schoolId === 350) borderColor = "border-green-500"; // NFS East
                  if (event.schoolId === 351) borderColor = "border-purple-500"; // NFS West
                  
                  return (
                    <div key={event.id} className={`text-xs border-l-2 ${borderColor} pl-2`}>
                      <div className="font-medium">{event.title}</div>
                      <div className="flex items-center text-gray-500 mt-0.5">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                        </span>
                      </div>
                      {event.schoolId !== null && (
                        <div className="flex items-center text-gray-500 mt-0.5">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{getSchoolName(event.schoolId)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  return (
    <div className={cn("bg-white rounded-lg shadow p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendar
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
            className="h-8 w-8 p-0 flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="h-8 w-8 p-0 flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map(renderDay)}
      </div>
      
      {isLoading && (
        <div className="flex justify-center mt-4">
          <span className="text-sm text-gray-500">Loading events...</span>
        </div>
      )}
      
      {events && events.length > 0 && (
        <div className="mt-4 border-t pt-2">
          <h3 className="text-sm font-medium mb-2">Upcoming Events</h3>
          <div className="space-y-2 max-h-40 overflow-auto">
            {events
              .filter(event => new Date(event.start) >= new Date())
              .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
              .slice(0, 5)
              .map(event => {
                // Get school label color based on schoolId
                let schoolColor = "bg-gray-100 text-gray-600";
                if (event.schoolId === 1) schoolColor = "bg-blue-100 text-blue-600"; // KNFA
                if (event.schoolId === 350) schoolColor = "bg-green-100 text-green-600"; // NFS East
                if (event.schoolId === 351) schoolColor = "bg-purple-100 text-purple-600"; // NFS West
                
                // Get school name using the same function as above
                const schoolName = getSchoolName(event.schoolId);
                
                return (
                  <div key={event.id} className="flex items-start text-xs border-b border-gray-100 pb-2">
                    <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{event.title}</p>
                        {event.schoolId !== null && (
                          <span className={`${schoolColor} text-xs px-2 py-0.5 rounded-full ml-2`}>
                            {schoolName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-gray-500 mt-1">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>
                          {format(new Date(event.start), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500 mt-0.5">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-gray-500 mt-1 line-clamp-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}