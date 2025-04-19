import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "wouter";
import { type Course, type Instructor } from "@shared/schema";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Target, Calendar } from "lucide-react";
import { getCourseStatus } from "@/utils/courseStatusHelpers";

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  // Fetch instructor for this course
  const { data: instructor } = useQuery<Instructor>({
    queryKey: ['/api/instructors', course.instructorId],
  });

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "MMM dd, yyyy");
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-[#0A2463] p-4">
        <h3 className="text-white font-semibold text-lg">{course.name}</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="bg-[#1A3473] px-3 py-1 rounded-full text-white text-xs">{getCourseStatus(course)}</span>
          <span className="text-white text-sm">{course.studentCount} Officers</span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">Start Date:</span>
          <span className="text-sm font-medium">{formatDate(course.startDate)}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">End Date:</span>
          <span className="text-sm font-medium">{course.endDate ? formatDate(course.endDate) : 'TBD'}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">Instructor:</span>
          <span className="text-sm font-medium">{instructor?.name || 'Loading...'}</span>
        </div>
        
        {/* Benchmark */}
        <div className="flex justify-between mb-4 items-center">
          <div className="flex items-center">
            <Target className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-sm text-gray-500">Benchmark:</span>
          </div>
          <span className="text-sm font-medium">{course.benchmark || 'N/A'}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-[#3E92CC] h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
          </div>
        </div>
        
        <Link href={`/courses/${course.id}`}>
          <a className="block text-center mt-4 text-sm font-medium text-[#3E92CC] hover:text-blue-700">
            View Course Details
          </a>
        </Link>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
