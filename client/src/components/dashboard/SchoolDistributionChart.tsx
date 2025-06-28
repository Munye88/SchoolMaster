import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

interface SchoolStat {
  id: number;
  name: string;
  code: string;
  instructorCount: number;
  courseCount: number;
  studentCount: number;
}

const SchoolDistributionChart = () => {
  const queryClient = useQueryClient();
  
  const { data: schoolStats, isLoading, error } = useQuery<SchoolStat[]>({
    queryKey: ['/api/statistics/schools'],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Force cache invalidation on mount
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/statistics/schools'] });
  }, [queryClient]);

  // Add debug logging
  console.log("🏫 DISTRIBUTION CHART RECEIVING DATA:");
  console.log("📊 Raw schoolStats:", schoolStats);
  console.log("⏳ Loading:", isLoading);
  console.log("❌ Error:", error);
  
  if (schoolStats && schoolStats.length > 0) {
    console.log(`📈 Received ${schoolStats.length} schools from API`);
    schoolStats.forEach(school => {
      console.log(`🏛️ ${school.name} (${school.code}): ${school.instructorCount} instructors, ${school.studentCount} students`);
    });
  } else {
    console.log("⚠️ No school statistics data received or empty array");
  }

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

  // Filter out test schools and only show main schools
  const mainSchools = schoolStats.filter(school => 
    ['KFNA', 'NFS_EAST', 'NFS_WEST'].includes(school.code)
  );

  // Calculate total students for percentage calculation
  const totalStudents = mainSchools.reduce((sum, school) => sum + school.studentCount, 0);

  // Define color codes for each school
  const schoolColors = {
    'KFNA': 'bg-[#0A2463]', // Navy
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
            {mainSchools.map(school => {
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
