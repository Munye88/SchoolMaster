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
  
  // Get color class based on school
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

  const headerBgColor = getSchoolColorClass(schoolName);

  // Generate a unique cache-busting URL for images
  const getCacheBustedUrl = (url: string) => {
    if (!url) return '';
    // Create a timestamp with millisecond precision for better cache busting
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 8);
    // The format ensures maximum cache-busting effectiveness
    return `${url}?v=${timestamp}-${randomString}-${instructor.id}`;
  };

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className={`${headerBgColor} text-white pb-2 flex flex-row items-center`}>
        <div className="h-20 w-20 mr-4 rounded-full border-4 border-white overflow-hidden shadow-xl bg-[#0A2463] flex items-center justify-center">
          {instructor.imageUrl ? (
            <img 
              src={getCacheBustedUrl(instructor.imageUrl)} 
              alt={instructor.name}
              className="object-cover h-full w-full"
              onError={(e) => {
                // Hide the img element if it fails to load
                e.currentTarget.style.display = 'none';
                // Create initials fallback with consistent styling
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'h-full w-full flex items-center justify-center text-white font-bold text-xl';
                  fallback.innerText = getInitials(instructor.name);
                  parent.appendChild(fallback);
                }
              }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-white font-bold text-xl">
              {getInitials(instructor.name)}
            </div>
          )}
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