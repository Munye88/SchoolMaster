import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useSchool } from "@/hooks/useSchool";
import { cn } from "@/lib/utils";
import { 
  Home, School, BookOpen, GraduationCap, ListChecks, BarChart2, Settings, Search, Bell
} from "lucide-react";
import govcioLogo from "../../assets/govcio-logo.png";

const BasicNavbar = () => {
  const [location] = useLocation();
  const { schools, selectedSchool, setSelectedSchool, currentSchool } = useSchool();
  const [showSchoolLinks, setShowSchoolLinks] = useState<string | null>(null);
  
  const isActive = (path: string) => {
    return location === path || location.startsWith(path + "/");
  };

  return (
    <div className="flex flex-col">
      {/* Top bar with logo and brand */}
      <div className="bg-[#0A2463] text-white h-16 flex items-center px-6">
        {/* Left - Logo */}
        <div className="flex-shrink-0">
          <img src="/images/govcio-logo-white.svg" alt="GovCIO Logo" className="h-10" />
        </div>
        
        {/* Center - Title */}
        <div className="flex-grow flex justify-center">
          <span className="font-bold text-xl tracking-wide">GOVCIO/SAMS ELT PROGRAM</span>
        </div>
        
        {/* Right - Controls */}
        <div className="flex-shrink-0 flex items-center space-x-4">
          <div className="relative hidden md:block">
            <input 
              type="text"
              placeholder="Search..." 
              className="bg-[#1A3473] text-white border-none h-9 w-48 py-2 px-4 pr-10 rounded-lg text-sm"
            />
            <Search className="h-5 w-5 absolute right-3 top-2 text-gray-300" />
          </div>
          
          <button className="relative p-1 text-white">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>
          
          <div className="w-8 h-8 rounded-full bg-[#3E92CC] text-white flex items-center justify-center font-bold">
            AD
          </div>
        </div>
      </div>
      
      {/* Main navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            {/* Main nav links */}
            <nav className="flex space-x-4">
              <Link 
                href="/"
                className={cn(
                  "flex items-center px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md transition-colors",
                  isActive("/") && "text-[#0A2463] bg-gray-100 font-medium"
                )}
              >
                <Home className="h-4 w-4 mr-2" />
                <span>Dashboard</span>
              </Link>
              
              <div className="relative">
                <button
                  onClick={() => setShowSchoolLinks(showSchoolLinks ? null : 'main')}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md transition-colors",
                    (isActive("/schools") || showSchoolLinks) && "text-[#0A2463] bg-gray-100 font-medium"
                  )}
                >
                  <School className="h-4 w-4 mr-2" />
                  <span>Schools</span>
                </button>
                
                {showSchoolLinks === 'main' && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    {schools.map(school => (
                      <button
                        key={school.id}
                        onClick={() => {
                          setSelectedSchool(school.code);
                          setShowSchoolLinks(school.code);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                          selectedSchool === school.code && "text-[#0A2463] bg-gray-100 font-medium"
                        )}
                      >
                        {school.name}
                      </button>
                    ))}
                  </div>
                )}
                
                {showSchoolLinks && showSchoolLinks !== 'main' && (
                  <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 font-medium">
                      {schools.find(s => s.code === showSchoolLinks)?.name} Documents
                    </div>
                    <div className="py-1">
                      <Link 
                        href={`/schools/${showSchoolLinks}/instructor-profiles`}
                        onClick={() => setShowSchoolLinks(null)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                      >
                        Instructor Profiles
                      </Link>
                      <Link 
                        href={`/schools/${showSchoolLinks}/timetable`}
                        onClick={() => setShowSchoolLinks(null)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                      >
                        Timetable
                      </Link>
                      <Link 
                        href={`/schools/${showSchoolLinks}/student-day-schedule`}
                        onClick={() => setShowSchoolLinks(null)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                      >
                        Student Day Schedule
                      </Link>
                      <Link 
                        href={`/schools/${showSchoolLinks}/yearly-schedule`}
                        onClick={() => setShowSchoolLinks(null)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                      >
                        Yearly Schedule
                      </Link>
                      <Link 
                        href={`/schools/${showSchoolLinks}/sop`}
                        onClick={() => setShowSchoolLinks(null)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                      >
                        SOP
                      </Link>
                      <Link 
                        href={`/schools/${showSchoolLinks}/staff-evaluations`}
                        onClick={() => setShowSchoolLinks(null)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                      >
                        Staff Evaluations
                      </Link>
                      <Link 
                        href={`/schools/${showSchoolLinks}/staff-attendance`}
                        onClick={() => setShowSchoolLinks(null)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                      >
                        Staff Attendance
                      </Link>
                      <Link 
                        href={`/schools/${showSchoolLinks}/book-inventory`}
                        onClick={() => setShowSchoolLinks(null)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                      >
                        Book Inventory
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              <Link 
                href="/courses"
                className={cn(
                  "flex items-center px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md transition-colors",
                  isActive("/courses") && "text-[#0A2463] bg-gray-100 font-medium"
                )}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                <span>Courses</span>
              </Link>
              
              <Link 
                href="/students"
                className={cn(
                  "flex items-center px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md transition-colors", 
                  isActive("/students") && "text-[#0A2463] bg-gray-100 font-medium"
                )}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                <span>Students</span>
              </Link>
              
              <Link 
                href="/test-tracker"
                className={cn(
                  "flex items-center px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md transition-colors",
                  isActive("/test-tracker") && "text-[#0A2463] bg-gray-100 font-medium"
                )}
              >
                <ListChecks className="h-4 w-4 mr-2" />
                <span>Test Tracker</span>
              </Link>
              
              <Link 
                href="/reports"
                className={cn(
                  "flex items-center px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md transition-colors",
                  isActive("/reports") && "text-[#0A2463] bg-gray-100 font-medium"
                )}
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                <span>Reports</span>
              </Link>
              
              <div className="relative">
                <button
                  onClick={() => setShowSchoolLinks(showSchoolLinks === 'admin' ? null : 'admin')}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md transition-colors",
                    (isActive("/administration") || showSchoolLinks === 'admin') && "text-[#0A2463] bg-gray-100 font-medium"
                  )}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Administration</span>
                </button>
                
                {showSchoolLinks === 'admin' && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <Link 
                      href="/administration/company-policy"
                      onClick={() => setShowSchoolLinks(null)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      Company Policy
                    </Link>
                    <Link 
                      href="/administration/evaluation-guideline"
                      onClick={() => setShowSchoolLinks(null)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      Instructor Evaluation Guideline
                    </Link>
                    <Link 
                      href="/administration/employee-handbook"
                      onClick={() => setShowSchoolLinks(null)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      Employee Handbook
                    </Link>
                    <Link 
                      href="/administration/performance-policy"
                      onClick={() => setShowSchoolLinks(null)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      Performance Evaluation Policy
                    </Link>
                    <Link 
                      href="/administration/classroom-evaluation"
                      onClick={() => setShowSchoolLinks(null)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      Training Guide Classroom Evaluation
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Click outside handler to close dropdown */}
      {showSchoolLinks && (
        <div 
          className="fixed inset-0 bg-transparent z-40"
          onClick={() => setShowSchoolLinks(null)}
        />
      )}
    </div>
  );
};

export default BasicNavbar;