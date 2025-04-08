import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface SchoolStat {
  id: number;
  name: string;
  code: string;
  instructorCount: number;
  courseCount: number;
  studentCount: number;
}

const SchoolDistributionChart = () => {
  const { data: schoolStats, isLoading } = useQuery<SchoolStat[]>({
    queryKey: ['/api/statistics/schools'],
  });

  if (isLoading || !schoolStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[#0A2463]">Student Distribution by School</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Calculate total students for percentage calculation
  const totalStudents = schoolStats.reduce((sum, school) => sum + school.studentCount, 0);

  // Define color codes for each school
  const schoolColors = {
    'KNFA': 'bg-[#0A2463]', // Navy
    'NFS_EAST': 'bg-[#3E92CC]', // Light blue
    'NFS_WEST': 'bg-[#FFD700]' // Gold
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#0A2463]">Student Distribution by School</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <div className="w-full">
            {schoolStats.map(school => {
              const percentage = totalStudents ? Math.round((school.studentCount / totalStudents) * 100) : 0;
              const colorClass = schoolColors[school.code as keyof typeof schoolColors] || 'bg-gray-500';
              
              return (
                <div className="flex items-center mb-4" key={school.id}>
                  <div className={`w-3 h-3 rounded-full ${colorClass} mr-2`}></div>
                  <span className="text-sm">{school.name} - {school.studentCount} Students</span>
                  <div className="ml-auto w-1/2 bg-gray-100 rounded-full h-2">
                    <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
            
            <div className="mt-8 flex justify-center">
              <Button className="bg-[#0A2463] hover:bg-[#071A4A]">
                View Detailed Report
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolDistributionChart;
