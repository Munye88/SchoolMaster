import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "wouter";

interface UpcomingEventsProps {
  limit?: number;
}

// Function to determine event type and color
const getEventTypeAndColor = (title: string) => {
  const titleLower = title.toLowerCase();
  
  // Define color mapping for different event types
  if (titleLower.includes('student day') || titleLower.includes('student') || titleLower.includes('class')) {
    return {
      type: 'Student Day',
      bgColor: 'bg-purple-500',
      textColor: 'text-purple-700',
      lightBg: 'bg-purple-100'
    };
  } else if (titleLower.includes('meeting') || titleLower.includes('conference')) {
    return {
      type: 'Meeting',
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-700',
      lightBg: 'bg-blue-100'
    };
  } else if (titleLower.includes('test') || titleLower.includes('exam') || titleLower.includes('assessment')) {
    return {
      type: 'Test',
      bgColor: 'bg-green-500',
      textColor: 'text-green-700',
      lightBg: 'bg-green-100'
    };
  } else if (titleLower.includes('holiday') || titleLower.includes('break')) {
    return {
      type: 'Holiday',
      bgColor: 'bg-red-500',
      textColor: 'text-red-700',
      lightBg: 'bg-red-100'
    };
  } else {
    return {
      type: 'Other',
      bgColor: 'bg-amber-500',
      textColor: 'text-amber-700',
      lightBg: 'bg-amber-100'
    };
  }
};

const UpcomingEvents = ({ limit = 3 }: UpcomingEventsProps) => {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events/upcoming', { limit }],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[#0A2463] text-lg">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Format date helper
  const formatDate = (date: Date) => {
    return {
      month: format(new Date(date), "MMM").toUpperCase(),
      day: format(new Date(date), "dd"),
      time: format(new Date(date), "h:mm a") + " - " + format(new Date(date), "h:mm a")
    };
  };

  return (
    <Card className="border shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col">
          {events && events.length > 0 ? (
            <>
              {events.slice(0, 1).map(event => {
                const dateInfo = formatDate(event.start);
                const endTimeStr = format(new Date(event.end), "h:mm a");
                const timeRange = `${format(new Date(event.start), "h:mm a")} - ${endTimeStr}`;
                
                // Always use 'Student Day' styling for consistency
                return (
                  <div className="flex p-3" key={event.id}>
                    <div className="flex-shrink-0 w-16 h-20 rounded-md bg-purple-600 flex flex-col items-center justify-center text-center text-white">
                      <p className="text-sm font-medium uppercase">{dateInfo.month}</p>
                      <p className="text-3xl font-bold">{dateInfo.day}</p>
                    </div>
                    <div className="ml-4 flex-1 flex flex-col justify-center">
                      <p className="text-base font-semibold text-gray-800">{event.title}</p>
                      <p className="text-gray-600 mt-1 text-sm">{timeRange}</p>
                    </div>
                  </div>
                );
              })}
              
              {/* Open Calendar Button - Navy Blue */}
              <div className="mt-0">
                <Link href="/events">
                  <Button className="bg-[#0B1D51] hover:bg-[#1334A3] text-white w-full py-2 rounded-none text-sm font-medium">
                    Open Calendar
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-4 text-gray-500">
                <p>No upcoming events scheduled.</p>
                <p className="text-xs mt-1">Create new events in the calendar.</p>
              </div>
              
              <div className="mt-0">
                <Link href="/events">
                  <Button className="bg-[#0B1D51] hover:bg-[#1334A3] text-white w-full py-2 rounded-none text-sm font-medium">
                    Open Calendar
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;