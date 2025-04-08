import { Instructor } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Phone, School, Award, User } from "lucide-react";

interface InstructorProfileCardProps {
  instructor: Instructor;
  schoolName: string;
}

export function InstructorProfileCard({ instructor, schoolName }: InstructorProfileCardProps) {
  // Format date as "June 20, 2021"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Get color class based on nationality
  const getNationalityColor = (nationality: string) => {
    switch (nationality) {
      case "American":
        return "bg-blue-100 text-blue-800";
      case "British":
        return "bg-red-100 text-red-800";
      case "Canadian":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-[#0A2463] text-white pb-2 flex flex-row items-center">
        <Avatar className="h-14 w-14 mr-4 border-2 border-white">
          {instructor.imageUrl ? (
            <img src={instructor.imageUrl} alt={instructor.name} />
          ) : (
            <AvatarFallback className="bg-blue-200 text-[#0A2463]">
              {getInitials(instructor.name)}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h2 className="text-xl font-bold">{instructor.name}</h2>
          <p className="text-sm text-blue-100">{instructor.role || "ELT Instructor"}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Nationality:</span>
            <Badge className={getNationalityColor(instructor.nationality)}>
              {instructor.nationality}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Start Date:</span>
            <span>{formatDate(instructor.startDate)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Credentials:</span>
            <span>{instructor.credentials}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <School className="h-4 w-4 text-gray-500" />
            <span className="font-medium">School:</span>
            <span>{schoolName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Compound:</span>
            <span>{instructor.compound}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Phone:</span>
            <span>{instructor.phone}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Status:</span>
            <Badge variant={instructor.accompaniedStatus === "Accompanied" ? "default" : "outline"}>
              {instructor.accompaniedStatus}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}