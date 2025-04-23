import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { toHijri } from 'hijri-converter';
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
  
  const renderDay = (day: Date) => {
    const isCurrentMonth = isSameMonth(day, currentMonth);
    const isCurrentDay = isToday(day);
    const dayEvents = events?.filter(event => isSameDay(new Date(event.start), day)) || [];
    const hasEvents = dayEvents.length > 0;
    
    // Convert to Hijri date
    const hijriDate = toHijri(day.getFullYear(), day.getMonth() + 1, day.getDate());
    const isFirstDayOfHijriMonth = hijriDate.hd === 1;
    
    // Function to get school name by ID
    const getSchoolName = (schoolId: number | null) => {
      if (!schoolId) return 'All Schools';
      
      if (selectedSchool && selectedSchool.id === schoolId) {
        return selectedSchool.name;
      }
      
      // If we're showing events for all schools, try to get the school name
      const schoolMap: Record<number, string> = {
        1: 'KNFA',
        2: 'NFS East',
        3: 'NFS West',
        350: 'KNFA',
        351: 'NFS East',
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
          {isFirstDayOfHijriMonth && (
            <div className="absolute -top-2 -right-2 text-[8px] text-amber-600 font-semibold">
              {hijriDate.hm}/1
            </div>
          )}
        </div>
        {hasEvents && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-0.5">
              {hasKnfaEvents && <div className="h-1 w-1 rounded-full bg-blue-500" />}
              {hasNfsEastEvents && <div className="h-1 w-1 rounded-full bg-green-500" />}
              {hasNfsWestEvents && <div className="h-1 w-1 rounded-full bg-purple-500" />}
              {hasOtherEvents && <div className="h-1 w-1 rounded-full bg-gray-500" />}
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
            "h-10 w-10 flex items-center justify-center rounded-full text-sm relative",
            !isCurrentMonth && "text-gray-400",
            isCurrentDay && "bg-blue-100 font-bold text-blue-800",
            "hover:bg-gray-100 cursor-pointer"
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
                "h-10 w-10 flex items-center justify-center rounded-full text-sm relative",
                !isCurrentMonth && "text-gray-400",
                isCurrentDay && "bg-blue-100 font-bold text-blue-800",
                hasEvents && !isCurrentDay && "font-semibold",
                "hover:bg-gray-100 cursor-pointer"
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
                if (event.schoolId === 1) schoolColor = "bg-blue-100 text-blue-600";
                if (event.schoolId === 2) schoolColor = "bg-green-100 text-green-600";
                if (event.schoolId === 3) schoolColor = "bg-purple-100 text-purple-600";
                
                // Get school name
                const getSchoolName = (schoolId: number | null) => {
                  if (!schoolId) return 'All Schools';
                  
                  if (selectedSchool && selectedSchool.id === schoolId) {
                    return selectedSchool.name;
                  }
                  
                  const schoolMap: Record<number, string> = {
                    1: 'KNFA',
                    2: 'NFS East',
                    3: 'NFS West',
                    350: 'KNFA',
                    351: 'NFS East',
                    352: 'NFS West'
                  };
                  
                  return schoolMap[schoolId] || 'Unknown School';
                };
                
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