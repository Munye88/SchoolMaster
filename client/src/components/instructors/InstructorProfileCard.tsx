import { Instructor } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Phone, School, Award, User } from "lucide-react";
import { StandardInstructorAvatar } from "./StandardInstructorAvatar";

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
  
  // Get color for school
  const getSchoolColor = (schoolName: string) => {
    if (schoolName.includes("KFNA")) {
      return "#0A2463"; // Blue for KFNA
    } else if (schoolName.includes("NFS East")) {
      return "#2A7F46"; // Green for NFS East
    } else if (schoolName.includes("NFS West")) {
      return "#E86A33"; // Orange for NFS West
    }
    return "#0A2463"; // Default blue
  };

  // Get color class based on school for Tailwind classes
  const getSchoolColorClass = (schoolName: string) => {
    if (schoolName.includes("KFNA")) {
      return "bg-[#0A2463]"; // Blue for KFNA
    } else if (schoolName.includes("NFS East")) {
      return "bg-[#2A7F46]"; // Green for NFS East
    } else if (schoolName.includes("NFS West")) {
      return "bg-[#E86A33]"; // Orange for NFS West
    }
    return "bg-[#0A2463]"; // Default blue
  };
  
  const schoolColor = getSchoolColor(schoolName);
  const headerBgColorClass = getSchoolColorClass(schoolName);

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className={`${headerBgColorClass} text-white pb-2 flex flex-row items-center`}>
        <div className="mr-4">
          <StandardInstructorAvatar
            imageUrl={instructor.imageUrl}
            name={instructor.name}
            size="lg"
            schoolColor={schoolColor}
          />
        </div>
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