import { useQuery } from "@tanstack/react-query";
import { GraduationCap, BookOpen, Users } from "lucide-react";
import { Course, Instructor } from "@shared/schema";
import StatsCard from "@/components/dashboard/StatsCard";
import CourseCard from "@/components/dashboard/CourseCard";
import SchoolDistributionChart from "@/components/dashboard/SchoolDistributionChart";
import StaffNationalityChart from "@/components/dashboard/StaffNationalityChart";
import InstructorProfileCard from "@/components/dashboard/InstructorProfileCard";
import RecentActivities from "@/components/dashboard/RecentActivities";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import { useSchool } from "@/hooks/useSchool";
import { Link } from "wouter";

const Dashboard = () => {
  const { selectedSchool, currentSchool } = useSchool();
  
  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: selectedSchool 
      ? ['/api/schools', currentSchool?.id, 'courses'] 
      : ['/api/courses'],
    enabled: !selectedSchool || !!currentSchool?.id,
  });
  
  // Fetch instructors
  const { data: instructors = [], isLoading: instructorsLoading } = useQuery<Instructor[]>({
    queryKey: selectedSchool 
      ? ['/api/schools', currentSchool?.id, 'instructors'] 
      : ['/api/instructors'],
    enabled: !selectedSchool || !!currentSchool?.id,
  });
  
  // Get the featured instructor (first one for now)
  const featuredInstructor = instructors[0];
  
  // Calculate total students
  const totalStudents = courses.reduce((sum, course) => sum + course.studentCount, 0);
  
  return (
    <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#0A2463]">
          {selectedSchool && currentSchool 
            ? `Welcome to ${currentSchool.name} Management` 
            : 'Welcome to School Management System'}
        </h2>
        <p className="text-gray-500 mt-1">Here's what's happening across your schools today.</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Total Students" 
          value={totalStudents}
          icon={GraduationCap}
          iconColor="text-[#3E92CC]"
          iconBgColor="bg-blue-100"
          changeText="+12% since last month"
          isPositiveChange={true}
        />
        
        <StatsCard 
          title="Active Courses" 
          value={courses.filter(c => c.status === "In Progress").length}
          icon={BookOpen}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
          changeText={`${courses.filter(c => c.status === "Starting Soon").length} new this month`}
          isPositiveChange={true}
        />
        
        <StatsCard 
          title="Total Staff" 
          value={instructors.length}
          icon={Users}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          changeText="2 pending approvals"
          isPositiveChange={false}
        />
      </div>
      
      {/* Current Courses Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#0A2463]">Current Courses</h2>
          <Link href="/courses">
            <a className="text-sm font-medium text-[#3E92CC] hover:text-blue-700">View All Courses</a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.slice(0, 3).map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
      
      {/* School and Staff Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SchoolDistributionChart />
        <StaffNationalityChart />
      </div>
      
      {/* Featured Instructor Profile */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#0A2463]">Instructor Profile</h2>
          <Link href="/instructors">
            <a className="text-sm font-medium text-[#3E92CC] hover:text-blue-700">View All Instructors</a>
          </Link>
        </div>
        
        <InstructorProfileCard 
          instructor={featuredInstructor} 
          isLoading={instructorsLoading} 
        />
      </div>
      
      {/* Recent Activities and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivities limit={4} />
        </div>
        <div>
          <UpcomingEvents limit={3} />
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
