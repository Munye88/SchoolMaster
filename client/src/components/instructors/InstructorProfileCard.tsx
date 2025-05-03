import { Instructor } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
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
      return "#4A5899"; // Professional blue-purple for NFS West (was orange)
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
      return "bg-[#4A5899]"; // Professional blue-purple for NFS West (was orange)
    }
    return "bg-[#0A2463]"; // Default blue
  };
  
  const schoolColor = getSchoolColor(schoolName);
  const headerBgColorClass = getSchoolColorClass(schoolName);

  // Style to match the example screenshot
  return (
    <Card className="overflow-hidden border border-gray-200 shadow-md max-w-lg mx-auto">
      {/* Header with white background and profile picture */}
      <div className="bg-white p-6 flex items-center">
        <div className="mr-4">
          <StandardInstructorAvatar
            imageUrl={instructor.imageUrl}
            name={instructor.name}
            size="lg"
            schoolColor={schoolColor}
          />
        </div>
        <div className="text-[#0A2463]">
          <h2 className="text-2xl font-bold">{instructor.name}</h2>
          <p className="text-sm mt-1">{instructor.role || "ELT Instructor"}</p>
        </div>
      </div>
      
      {/* Content section with instructor details */}
      <CardContent className="pt-6 pb-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-500" />
            <div className="flex items-center">
              <span className="font-medium mr-2">Nationality:</span>
              <Badge className={getNationalityColor(instructor.nationality)}>
                {instructor.nationality}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <span className="font-medium mr-2">Start Date:</span>
              <span>{formatDate(instructor.startDate)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5 text-gray-500" />
            <div>
              <span className="font-medium mr-2">Credentials:</span>
              <span>{instructor.credentials}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <School className="h-5 w-5 text-gray-500" />
            <div>
              <span className="font-medium mr-2">School:</span>
              <span>{schoolName}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-500" />
            <div>
              <span className="font-medium mr-2">Compound:</span>
              <span>{instructor.compound}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-500" />
            <div>
              <span className="font-medium mr-2">Phone:</span>
              <span>{instructor.phone}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <span className="font-medium mr-2">Status:</span>
              <Badge variant="outline" className={instructor.accompaniedStatus === "Accompanied" 
                ? "bg-green-100 text-green-800 border-green-300" 
                : "bg-gray-100 text-gray-800 border-gray-300"}>
                {instructor.accompaniedStatus}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}