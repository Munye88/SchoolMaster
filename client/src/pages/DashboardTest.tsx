import { useState, useEffect } from "react";
import { School as SchoolIcon, User, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSchool } from "@/hooks/useSchool";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

const DashboardTest = () => {
  // Fetch all required data
  const { data: courses = [] } = useQuery({ queryKey: ["/api/courses"] });
  const { data: schools = [] } = useQuery({ queryKey: ["/api/schools"] });
  const { data: students = [] } = useQuery({ queryKey: ["/api/students"] });
  const { data: instructors = [] } = useQuery({ queryKey: ["/api/instructors"] });
  
  const formatDate = (date: string | Date) => {
    return format(new Date(date), "MMM dd, yyyy");
  };

  // Calculate statistics
  const totalStudents = 396;
  const totalInstructors = 73;
  const totalSchools = 4;
  const totalCourses = 8;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-[#001e4d] py-4 px-6 text-white flex justify-between items-center rounded">
        <h1 className="text-2xl font-bold">GOVCIO-SAMS ELT PROGRAM</h1>
        <div className="text-right">
          <div className="text-sm opacity-80">Fri, May 03, 2025</div>
        </div>
      </div>

      <div className="text-gray-700 italic text-center text-sm">
        "Leadership is not about being in charge. It is about taking care of those in your charge." - Simon Shek
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Students */}
        <Card className="bg-[#0074D9] text-white shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm opacity-90">Total Students</h3>
                <p className="text-4xl font-bold mt-1">{totalStudents}</p>
                <div className="mt-3 flex items-center text-xs">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  <span>5 last 30 days</span>
                </div>
              </div>
              <div className="bg-blue-700/40 p-3 rounded-lg">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructors */}
        <Card className="bg-[#2ECC40] text-white shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm opacity-90">Instructors</h3>
                <p className="text-4xl font-bold mt-1">{totalInstructors}</p>
                <div className="mt-3 flex items-center text-xs">
                  <span className="flex items-center">
                    <span className="w-3 h-3 mr-1 rounded-full bg-white"></span>
                    100% staffed
                  </span>
                </div>
              </div>
              <div className="bg-green-700/40 p-3 rounded-lg">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schools */}
        <Card className="bg-[#FF851B] text-white shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm opacity-90">Schools</h3>
                <p className="text-4xl font-bold mt-1">{totalSchools}</p>
                <div className="mt-3 flex items-center text-xs">
                  <ArrowDown className="w-3 h-3 mr-1" />
                  <span>1 last 30 days</span>
                </div>
              </div>
              <div className="bg-orange-700/40 p-3 rounded-lg">
                <SchoolIcon className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses */}
        <Card className="bg-[#FF851B] text-white shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm opacity-90">Courses</h3>
                <p className="text-4xl font-bold mt-1">{totalCourses}</p>
                <div className="mt-3 flex items-center text-xs">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  <span>2 last 30 days</span>
                </div>
              </div>
              <div className="bg-orange-700/40 p-3 rounded-lg">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Courses Section */}
      <Card className="shadow-sm border-0">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-lg font-semibold text-[#001e4d]">Active Courses</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-[#0047AB] text-white p-4 rounded-lg mb-4 flex justify-between items-center">
            <h2 className="font-semibold text-lg">ACTIVE COURSES</h2>
            <div className="bg-[#0047AB]/60 text-white text-2xl font-bold w-10 h-10 rounded-md flex items-center justify-center">6</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Refresher Card 1 - Purple */}
            <div className="rounded-lg shadow-md overflow-hidden">
              <div className="bg-[#f0e6ff] p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-[#9c59f3]"></div>
                  <h3 className="font-semibold text-[#4b247a]">Refresher</h3>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#4b247a]">93</span>
                  <span className="text-sm font-medium text-[#6b3daa]">Students</span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-[#6b3daa] mb-1">
                    <span>Progress</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full bg-[#e1d0ff] rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-[#9c59f3] rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Refresher Card 2 - Orange */}
            <div className="rounded-lg shadow-md overflow-hidden">
              <div className="bg-[#fff2e6] p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-[#ff9d4d]"></div>
                  <h3 className="font-semibold text-[#8a4f20]">Refresher</h3>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#8a4f20]">8</span>
                  <span className="text-sm font-medium text-[#b36521]">Students</span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-[#b36521] mb-1">
                    <span>Progress</span>
                    <span>50%</span>
                  </div>
                  <div className="w-full bg-[#ffe0c2] rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-[#ff9d4d] rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Refresher Card 3 - Blue */}
            <div className="rounded-lg shadow-md overflow-hidden">
              <div className="bg-[#e6f5ff] p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-[#4da6ff]"></div>
                  <h3 className="font-semibold text-[#0d5c9e]">16 Students</h3>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#0d5c9e]">16</span>
                  <span className="text-sm font-medium text-[#2182c7]">Students</span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-[#2182c7] mb-1">
                    <span>Progress</span>
                    <span>10%</span>
                  </div>
                  <div className="w-full bg-[#c2e3ff] rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-[#4da6ff] rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events and Tasks Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm border-0">
          <CardHeader className="p-4 pb-2 border-b flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-[#001e4d]">Upcoming Events</CardTitle>
            <Button variant="link" className="text-blue-600 p-0 h-auto">View All</Button>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-center py-8 text-gray-500">
              No events scheduled
            </div>
            <div className="mt-4 flex justify-center">
              <Button className="bg-[#001e4d] hover:bg-[#00285f]">Open Full Calendar</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardHeader className="p-4 pb-2 border-b flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-[#001e4d]">My Tasks</CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Minimize</span>
              <span className="h-1 w-5 bg-gray-600 rounded-full"></span>
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-center py-8 text-gray-500">
              No tasks available
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardTest;
