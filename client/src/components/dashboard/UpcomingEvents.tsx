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
      <CardHeader>
        <CardTitle className="text-[#0A2463] text-lg">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events && events.length > 0 ? (
            events.map(event => {
              const dateInfo = formatDate(event.start);
              const endTimeStr = format(new Date(event.end), "h:mm a");
              const timeRange = `${format(new Date(event.start), "h:mm a")} - ${endTimeStr}`;
              
              return (
                <div className="flex" key={event.id}>
                  <div className="flex-shrink-0 w-12 text-center">
                    <p className="text-sm text-gray-500">{dateInfo.month}</p>
                    <p className="text-xl font-bold text-[#0A2463]">{dateInfo.day}</p>
                  </div>
                  <div className="ml-4 border-l border-gray-200 pl-4">
                    <p className="font-medium text-[#0A2463]">{event.title}</p>
                    <p className="text-sm text-gray-500">{timeRange}</p>
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
              <Button className="bg-[#0A2463] hover:bg-[#071A4A]">
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
