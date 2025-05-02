import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Event } from '@shared/schema';
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
  const { selectedSchool } = useSchool();
  
  // Fetch all events or school-specific events based on selection
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: selectedSchool 
      ? ['/api/schools', selectedSchool.id, 'events']
      : ['/api/events'],
    enabled: true,
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
  
  // Day colors by day of week
  const dayColors = [
    { bg: 'bg-red-100', text: 'text-red-700', hover: 'hover:bg-red-200' }, // Sunday
    { bg: 'bg-orange-100', text: 'text-orange-700', hover: 'hover:bg-orange-200' }, // Monday
    { bg: 'bg-green-100', text: 'text-green-700', hover: 'hover:bg-green-200' }, // Tuesday
    { bg: 'bg-blue-100', text: 'text-blue-700', hover: 'hover:bg-blue-200' }, // Wednesday
    { bg: 'bg-green-100', text: 'text-green-700', hover: 'hover:bg-green-200' }, // Thursday
    { bg: 'bg-blue-100', text: 'text-blue-700', hover: 'hover:bg-blue-200' }, // Friday
    { bg: 'bg-purple-100', text: 'text-purple-700', hover: 'hover:bg-purple-200' }, // Saturday
  ];

  const renderDay = (day: Date) => {
    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isCurrentDay = isToday(day);
    const dayOfWeek = day.getDay();
    const { bg, text, hover } = dayColors[dayOfWeek];
    const dayEvents = events?.filter(event => isSameDay(new Date(event.start), day)) || [];
    const hasEvents = dayEvents.length > 0;
    
    // Function to get school name by ID
    const getSchoolName = (schoolId: number | null) => {
      if (!schoolId) return 'All Schools';
      
      if (selectedSchool && selectedSchool.id === schoolId) {
        return selectedSchool.name;
      }
      
      // If we're showing events for all schools, try to get the school name
      const schoolMap: Record<number, string> = {
        1: 'KNFA',
        350: 'KNFA',
        2: 'NFS East',
        351: 'NFS East',
        3: 'NFS West',
        352: 'NFS West'
      };
      
      return schoolMap[schoolId] || 'Unknown School';
    };
    
    // Group events by school for color coding
    const schoolEvents = {
      knfa: dayEvents.filter(e => e.schoolId === 1 || e.schoolId === 350),
      nfsEast: dayEvents.filter(e => e.schoolId === 2 || e.schoolId === 351),
      nfsWest: dayEvents.filter(e => e.schoolId === 3 || e.schoolId === 352),
      other: dayEvents.filter(e => !e.schoolId || (e.schoolId !== 1 && e.schoolId !== 2 && e.schoolId !== 3 && 
                                                 e.schoolId !== 350 && e.schoolId !== 351 && e.schoolId !== 352))
    };
    
    const hasKnfaEvents = schoolEvents.knfa.length > 0;
    const hasNfsEastEvents = schoolEvents.nfsEast.length > 0;
    const hasNfsWestEvents = schoolEvents.nfsWest.length > 0;
    const hasOtherEvents = schoolEvents.other.length > 0;
    
    const dayContent = (
      <>
        <div className="relative">
          {format(day, 'd')}
        </div>
        {hasEvents && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-0.5">
              {hasKnfaEvents && <div className="h-1.5 w-1.5 rounded-full bg-blue-600 shadow-sm" />}
              {hasNfsEastEvents && <div className="h-1.5 w-1.5 rounded-full bg-green-600 shadow-sm" />}
              {hasNfsWestEvents && <div className="h-1.5 w-1.5 rounded-full bg-purple-600 shadow-sm" />}
              {hasOtherEvents && <div className="h-1.5 w-1.5 rounded-full bg-gray-600 shadow-sm" />}
            </div>
          </div>
        )}
      </>
    );
    
    // If there are no events, just return the day without a tooltip
    if (!hasEvents) {
      return (
        <div 
          key={day.toString()} 
          className={cn(
            "h-10 w-10 flex items-center justify-center rounded-lg text-sm relative",
            !isCurrentMonth && "opacity-40",
            isCurrentMonth && bg,
            isCurrentMonth && text,
            isCurrentMonth && hover,
            isCurrentDay && "ring-2 ring-blue-500 ring-offset-2 font-bold",
            "cursor-pointer transition-all"
          )}
        >
          {dayContent}
        </div>
      );
    }
    
    // If there are events, wrap in a tooltip
    return (
      <TooltipProvider key={day.toString()}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={cn(
                "h-10 w-10 flex items-center justify-center rounded-lg text-sm relative",
                !isCurrentMonth && "opacity-40",
                isCurrentMonth && bg,
                isCurrentMonth && text,
                isCurrentMonth && hover,
                isCurrentDay && "ring-2 ring-blue-500 ring-offset-2 font-bold",
                hasEvents && !isCurrentDay && "font-semibold",
                "cursor-pointer transition-all"
              )}
            >
              {dayContent}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="p-0 max-w-[250px]">
            <div className="p-2">
              <div className="font-semibold mb-1">{format(day, 'MMMM d, yyyy')}</div>
              <div className="space-y-2">
                {dayEvents.map(event => (
                  <div key={event.id} className="text-xs border-l-2 border-blue-500 pl-2">
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
                ))}
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
        {[
          { day: 'Sun', color: 'text-red-500' },
          { day: 'Mon', color: 'text-orange-500' },
          { day: 'Tue', color: 'text-green-600' },
          { day: 'Wed', color: 'text-blue-500' },
          { day: 'Thu', color: 'text-green-600' },
          { day: 'Fri', color: 'text-blue-700' },
          { day: 'Sat', color: 'text-purple-600' }
        ].map(({ day, color }) => (
          <div key={day} className={`text-center text-xs font-medium ${color}`}>
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
      
      {/* Upcoming Events section removed */}
    </div>
  );
}