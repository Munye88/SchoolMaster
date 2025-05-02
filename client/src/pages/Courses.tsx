import { useQuery } from "@tanstack/react-query";
import { Course, School } from '@shared/schema';
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Timer, 
  Users, 
  CalendarDays,
} from "lucide-react";

export default function Courses() {
  // Get all courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Get schools for filtering
  const { data: schools = [], isLoading: isLoadingSchools } = useQuery<School[]>({
    queryKey: ["/api/schools"],
  });

  if (isLoadingCourses || isLoadingSchools) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col justify-center items-center h-80">
          <div className="w-16 h-16 relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
            <BookOpen className="h-6 w-6 text-blue-600 absolute inset-0 m-auto" />
          </div>
          <h3 className="text-xl font-semibold text-blue-900 mb-2">Loading Courses</h3>
          <p className="text-blue-600">Please wait while we retrieve course information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white p-8">
      {/* Page Header */}
      <div>
        <h1 className="text-[28px] font-bold text-[#0A2463] mb-1">Course Programs</h1>
        <p className="text-gray-600">
          Explore our comprehensive ELT programs across all schcohols
        </p>
      </div>
      
      {/* Statistics Cards */}
      <div className="flex flex-wrap gap-4 mt-6">
        <div className="bg-blue-700 text-white rounded-lg w-60 p-4 flex justify-between items-center">
          <div>
            <p className="text-white text-2xl font-bold">8</p>
            <p className="text-white/80 text-sm">Total Courses</p>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <BookOpen className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-blue-700 text-white rounded-lg w-60 p-4 flex justify-between items-center">
          <div>
            <p className="text-white text-2xl font-bold">6</p>
            <p className="text-white/80 text-sm">Active Courses</p>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Timer className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-blue-700 text-white rounded-lg w-60 p-4 flex justify-between items-center">
          <div>
            <p className="text-white text-2xl font-bold">431</p>
            <p className="text-white/80 text-sm">Total Students</p>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-blue-700 text-white rounded-lg w-60 p-4 flex justify-between items-center">
          <div>
            <p className="text-white text-2xl font-bold">2</p>
            <p className="text-white/80 text-sm">Completed Courses</p>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mt-6">
        <div className="flex space-x-1 border-b border-gray-200">
          <div className="bg-blue-700 text-white px-3 py-2 font-medium rounded-t-md">All Courses</div>
          <div className="text-gray-500 px-3 py-2 font-medium">Archive</div>
          <div className="text-gray-500 px-3 py-2 font-medium">Archived</div>
        </div>
      </div>
      
      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Refresher Course Card 1 */}
        <div className="bg-white rounded-lg shadow">
          <div className="bg-green-600 p-4 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Refresher</h3>
              <Badge className="bg-green-100 text-green-800 border-none">In progress</Badge>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-center text-sm mb-3">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-600">Apr 8 - Jun 25, 2025</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-600">28 Students</span>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between mb-1 text-sm">
                <span>Progress</span>
                <span>53%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '53%' }}></div>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Award className="h-4 w-4 mr-1 text-gray-500" />
              <span>Benchmark: ALCPT 70</span>
            </div>
          </div>
        </div>
        
        {/* Refresher Course Card 2 */}
        <div className="bg-white rounded-lg shadow">
          <div className="bg-green-600 p-4 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Refresher</h3>
              <Badge className="bg-green-100 text-green-800 border-none">In Progress</Badge>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-center text-sm mb-3">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-600">Apr 8 - Jun 25, 2025</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-600">8 Students</span>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between mb-1 text-sm">
                <span>Progress</span>
                <span>53%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '53%' }}></div>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Award className="h-4 w-4 mr-1 text-gray-500" />
              <span>Benchmark: ALCPT 70</span>
            </div>
          </div>
        </div>
        
        {/* Aviation Course Card */}
        <div className="bg-white rounded-lg shadow">
          <div className="bg-blue-600 p-4 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Aviation</h3>
              <Badge className="bg-blue-100 text-blue-800 border-none">Aviation</Badge>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-center text-sm mb-3">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-600">May 1 - Jul 10, 2025</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-600">42 Students</span>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between mb-1 text-sm">
                <span>Progress</span>
                <span>57%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '57%' }}></div>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Award className="h-4 w-4 mr-1 text-gray-500" />
              <span>Benchmark: ALCPT 65</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
