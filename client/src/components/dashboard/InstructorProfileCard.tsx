import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instructor, School } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface InstructorProfileCardProps {
  instructor?: Instructor;
  isLoading?: boolean;
}

const InstructorProfileCard = ({ instructor, isLoading = false }: InstructorProfileCardProps) => {
  const { data: school } = useQuery<School>({
    queryKey: ['/api/schools', instructor?.schoolId],
    enabled: !!instructor,
  });

  // Format date helper function
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), "MMMM d, yyyy");
  };

  if (isLoading || !instructor) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card>
      <CardContent className="p-6 md:flex">
        <div className="md:w-1/4 flex flex-col items-center mb-6 md:mb-0">
          {instructor.imageUrl ? (
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#3E92CC] shadow-lg">
              <img 
                src={instructor.imageUrl} 
                alt={instructor.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  const target = e.currentTarget;
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-32 h-32 rounded-full bg-[#0A2463] flex items-center justify-center text-white text-3xl font-bold">${getInitials(instructor.name)}</div>`;
                  }
                }}
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-[#0A2463] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {getInitials(instructor.name)}
            </div>
          )}
          <h3 className="mt-4 font-bold text-lg text-[#0A2463] text-center">{instructor.name}</h3>
          <p className="text-gray-500 text-sm text-center">{instructor.role || 'Instructor'}</p>
        </div>
        
        <div className="md:w-3/4 md:pl-6 md:border-l border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Nationality</h4>
              <p className="text-[#0A2463] font-medium">{instructor.nationality}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Credentials</h4>
              <p className="text-[#0A2463] font-medium">{instructor.credentials}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
              <p className="text-[#0A2463] font-medium">{formatDate(instructor.startDate)}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Compound</h4>
              <p className="text-[#0A2463] font-medium">{instructor.compound}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">School</h4>
              <p className="text-[#0A2463] font-medium">{school?.name || 'Loading...'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Phone</h4>
              <p className="text-[#0A2463] font-medium">{instructor.phone}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Status</h4>
              <p className="text-[#0A2463] font-medium">{instructor.accompaniedStatus}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Current Course Load</h4>
              <p className="text-[#0A2463] font-medium">2 Active Courses</p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap space-x-4">
            <Link href={`/instructors/${instructor.id}`}>
              <Button className="bg-[#0A2463] hover:bg-[#071A4A] mb-2">
                View Full Profile
              </Button>
            </Link>
            <Button variant="outline" className="border-[#0A2463] text-[#0A2463] hover:bg-gray-100 mb-2">
              Schedule Meeting
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstructorProfileCard;
