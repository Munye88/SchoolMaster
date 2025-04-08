import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, UserPlus, FileText, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface RecentActivitiesProps {
  limit?: number;
}

const RecentActivities = ({ limit = 4 }: RecentActivitiesProps) => {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities/recent', { limit }],
  });

  // Activity type icons
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course_added':
        return <Plus className="h-5 w-5 text-[#3E92CC]" />;
      case 'instructor_added':
        return <UserPlus className="h-5 w-5 text-green-600" />;
      case 'reports_submitted':
        return <FileText className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  // Activity type background colors
  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'course_added':
        return 'bg-blue-100';
      case 'instructor_added':
        return 'bg-green-100';
      case 'reports_submitted':
        return 'bg-yellow-100';
      default:
        return 'bg-red-100';
    }
  };

  // Format relative time
  const formatTime = (timestamp: Date) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[#0A2463] text-lg">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#0A2463] text-lg">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.map(activity => (
            <div className="flex items-start" key={activity.id}>
              <div className={`${getActivityBgColor(activity.type)} p-2 rounded-full`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="ml-4">
                <p className="text-[#0A2463] font-medium">{activity.description}</p>
                <p className="text-sm text-gray-500">{formatTime(activity.timestamp)}</p>
              </div>
            </div>
          ))}
          
          {/* View All Link */}
          <div className="text-center mt-6">
            <a href="#" className="text-sm font-medium text-[#3E92CC] hover:text-blue-700">
              View All Activities
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
