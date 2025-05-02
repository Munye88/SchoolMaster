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
          <Skeleton className="h-[300px] w-full" />
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
    <Card>
      <CardHeader className="bg-orange-400 text-white rounded-t-lg">
        <CardTitle className="text-white text-lg">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 px-5">
        <div className="space-y-4">
          {events && events.length > 0 ? (
            events.map(event => {
              const dateInfo = formatDate(event.start);
              const endTimeStr = format(new Date(event.end), "h:mm a");
              const timeRange = `${format(new Date(event.start), "h:mm a")} - ${endTimeStr}`;
              
              const { bgColor, lightBg, textColor } = getEventTypeAndColor(event.title);
              
              return (
                <div className="flex" key={event.id}>
                  <div className={`flex-shrink-0 w-16 h-16 rounded-lg ${lightBg} flex flex-col items-center justify-center text-center`}>
                    <p className="text-xs font-medium text-gray-600">{dateInfo.month}</p>
                    <p className={`text-xl font-bold ${textColor}`}>{dateInfo.day}</p>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center space-x-1">
                      <div className={`h-2 w-2 rounded-full ${bgColor}`}></div>
                      <p className={`font-medium ${textColor}`}>{event.title}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{timeRange}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No upcoming events scheduled.</p>
              <p className="text-sm mt-2">Create new events in the calendar.</p>
            </div>
          )}
          
          {/* View Calendar Link */}
          <div className="text-center mt-6">
            <Link href="/events">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white w-full">
                Open Full Calendar
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;
