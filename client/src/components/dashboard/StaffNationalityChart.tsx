import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface NationalityStat {
  nationality: string;
  count: number;
}

const StaffNationalityChart = () => {
  const { data: nationalityStats, isLoading } = useQuery<NationalityStat[]>({
    queryKey: ['/api/statistics/nationalities'],
  });

  if (isLoading || !nationalityStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[#0A2463]">Staff by Nationality</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Define background colors for different nationalities
  const getBackgroundColor = (nationality: string, index: number) => {
    const colors = [
      'bg-[#0A2463] text-white', // Navy
      'bg-[#3E92CC] text-white', // Light blue
      'bg-[#FFD700] text-[#0A2463]', // Gold
      'bg-gray-500 text-white' // Gray for others
    ];
    
    // Use predefined colors for common nationalities, otherwise use index-based color
    switch (nationality) {
      case 'American':
        return colors[0];
      case 'British':
        return colors[1];
      case 'Canadian':
        return colors[2];
      default:
        return colors[index % colors.length];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#0A2463]">Staff by Nationality</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center">
          <div className="w-full">
            <div className="grid grid-cols-2 gap-4">
              {nationalityStats.map((stat, index) => (
                <div className="text-center" key={stat.nationality}>
                  <div className={`inline-block p-3 rounded-full ${getBackgroundColor(stat.nationality, index)}`}>
                    <span className="text-xl font-bold">{stat.count}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">{stat.nationality}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button className="bg-[#0A2463] hover:bg-[#071A4A]">
                View All Staff
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffNationalityChart;
