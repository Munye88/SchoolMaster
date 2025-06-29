import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useSchool } from "@/hooks/useSchool";
import { cn } from "@/lib/utils";
import { 
  Home, School, Users, BookOpen, GraduationCap, ListChecks, 
  BarChart2, ChevronDown, ChevronUp, Settings, 
  Calendar, BookIcon, Clock, CalendarDays, ClipboardList, UserSquare,
  Clipboard, CheckSquare, Search, Bell
} from "lucide-react";
import { Input } from "@/components/ui/input";

const SimpleHorizontalNavbar = () => {
  const [location] = useLocation();
  const { schools, selectedSchool, setSelectedSchool, currentSchool } = useSchool();
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  
  const schoolDropdownRef = useRef<HTMLLIElement>(null);
  const adminDropdownRef = useRef<HTMLLIElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(event.target as Node)) {
        setSchoolDropdownOpen(false);
      }
      
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setAdminDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const isActive = (path: string) => {
    return location === path || location.startsWith(path + "/");
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top bar with logo, search and notifications */}
      <div className="bg-[#0A2463] text-white h-16 flex items-center justify-between px-4 lg:px-8">
        {/* Logo and site name */}
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0A2463] font-bold mr-3">
            SMS
          </div>
          <span className="font-bold text-xl hidden md:block">School Manager</span>
        </div>
        
        {/* Center - Page title */}
        <h1 className="text-xl font-semibold hidden lg:block">
          {selectedSchool ? `${currentSchool?.name} Dashboard` : 'Dashboard'}
        </h1>
        
        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Input 
              type="text" 
              placeholder="Search..." 
              className="bg-[#1A3473] text-white border-none h-9 w-56 py-2 px-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3E92CC] focus:border-transparent placeholder-gray-300"
            />
            <Search className="h-5 w-5 absolute right-3 top-2 text-gray-300" />
          </div>
          
          {/* Notifications */}
          <button className="relative p-1 text-white">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>
          
          {/* User Profile */}
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#3E92CC] text-white flex items-center justify-center font-bold">
              AD
            </div>
            <div className="ml-2 hidden md:block">
              <p className="text-sm font-medium">Admin</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main horizontal navbar */}
      <nav className="bg-white shadow-md z-10">
        <div className="flex items-center h-12 px-4 overflow-x-auto scrollbar-hide">
          {/* Main navigation links */}
          <ul className="flex space-x-1">
            {/* Dashboard */}
            <li>
              <Link href="/" className={cn(
                "flex items-center px-3 py-2 text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                isActive("/") && "text-[#0A2463] bg-gray-100 font-medium"
              )}>
                <Home className="h-4 w-4 mr-2" />
                <span>Dashboard</span>
              </Link>
            </li>
            
            {/* Schools Dropdown */}
            <li className="relative" ref={schoolDropdownRef}>
              <button 
                onClick={() => setSchoolDropdownOpen(!schoolDropdownOpen)}
                className={cn(
                  "flex items-center px-3 py-2 text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                  (isActive("/schools") || schoolDropdownOpen) && "text-[#0A2463] bg-gray-100 font-medium"
                )}
              >
                <School className="h-4 w-4 mr-2" />
                <span>Schools</span>
                {schoolDropdownOpen ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
              </button>
              
              {schoolDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white shadow-lg py-1 z-50 border border-gray-200">
                  {schools.map(school => (
                    <div key={school.id} className="px-2 py-1">
                      <button
                        onClick={() => {
                          setSelectedSchool(school.code);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors text-left",
                          selectedSchool === school.code && "text-[#0A2463] bg-gray-100 font-medium"
                        )}
                      >
                        <div className="flex items-center">
                          <School className="h-4 w-4 mr-2" />
                          <span>{school.name}</span>
                        </div>
                        {selectedSchool === school.code ? 
                          <ChevronUp size={16} className="ml-1" /> : 
                          <ChevronDown size={16} className="ml-1" />
                        }
                      </button>
                      
                      {selectedSchool === school.code && (
                        <div className="ml-6 grid gap-1 mt-1 border-l-2 border-[#0A2463] pl-2">
                          <Link href={`/schools/${school.code}/instructor-profiles`} 
                            onClick={() => setSchoolDropdownOpen(false)}
                            className={cn(
                            "flex items-center px-3 py-1.5 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                            isActive(`/schools/${school.code}/instructor-profiles`) && "text-[#0A2463] bg-gray-100 font-medium"
                          )}>
                            <UserSquare className="h-3.5 w-3.5 mr-2" />
                            <span>Instructor Profiles</span>
                          </Link>
                          
                          <Link href={`/schools/${school.code}/timetable`} 
                            onClick={() => setSchoolDropdownOpen(false)}
                            className={cn(
                            "flex items-center px-3 py-1.5 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                            isActive(`/schools/${school.code}/timetable`) && "text-[#0A2463] bg-gray-100 font-medium"
                          )}>
                            <Clock className="h-3.5 w-3.5 mr-2" />
                            <span>Timetable</span>
                          </Link>
                          
                          <Link href={`/schools/${school.code}/student-day-schedule`} 
                            onClick={() => setSchoolDropdownOpen(false)}
                            className={cn(
                            "flex items-center px-3 py-1.5 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                            isActive(`/schools/${school.code}/student-day-schedule`) && "text-[#0A2463] bg-gray-100 font-medium"
                          )}>
                            <Calendar className="h-3.5 w-3.5 mr-2" />
                            <span>Student Day Schedule</span>
                          </Link>
                          
                          <Link href={`/schools/${school.code}/yearly-schedule`} 
                            onClick={() => setSchoolDropdownOpen(false)}
                            className={cn(
                            "flex items-center px-3 py-1.5 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                            isActive(`/schools/${school.code}/yearly-schedule`) && "text-[#0A2463] bg-gray-100 font-medium"
                          )}>
                            <CalendarDays className="h-3.5 w-3.5 mr-2" />
                            <span>Yearly Schedule</span>
                          </Link>
                          
                          <Link href={`/schools/${school.code}/sop`} 
                            onClick={() => setSchoolDropdownOpen(false)}
                            className={cn(
                            "flex items-center px-3 py-1.5 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                            isActive(`/schools/${school.code}/sop`) && "text-[#0A2463] bg-gray-100 font-medium"
                          )}>
                            <ClipboardList className="h-3.5 w-3.5 mr-2" />
                            <span>SOP</span>
                          </Link>
                          
                          <Link href={`/schools/${school.code}/staff-evaluations`} 
                            onClick={() => setSchoolDropdownOpen(false)}
                            className={cn(
                            "flex items-center px-3 py-1.5 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                            isActive(`/schools/${school.code}/staff-evaluations`) && "text-[#0A2463] bg-gray-100 font-medium"
                          )}>
                            <Clipboard className="h-3.5 w-3.5 mr-2" />
                            <span>Staff Evaluations</span>
                          </Link>
                          
                          <Link href={`/schools/${school.code}/staff-attendance`} 
                            onClick={() => setSchoolDropdownOpen(false)}
                            className={cn(
                            "flex items-center px-3 py-1.5 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                            isActive(`/schools/${school.code}/staff-attendance`) && "text-[#0A2463] bg-gray-100 font-medium"
                          )}>
                            <CheckSquare className="h-3.5 w-3.5 mr-2" />
                            <span>Staff Attendance</span>
                          </Link>
                          
                          <Link href={`/schools/${school.code}/book-inventory`}
                            onClick={() => setSchoolDropdownOpen(false)}
                            className={cn(
                            "flex items-center px-3 py-1.5 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                            isActive(`/schools/${school.code}/book-inventory`) && "text-[#0A2463] bg-gray-100 font-medium"
                          )}>
                            <BookIcon className="h-3.5 w-3.5 mr-2" />
                            <span>Book Inventory</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </li>
            
            {/* Courses */}
            <li>
              <Link href="/courses" className={cn(
                "flex items-center px-3 py-2 text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                isActive("/courses") && "text-[#0A2463] bg-gray-100 font-medium"
              )}>
                <BookOpen className="h-4 w-4 mr-2" />
                <span>Courses</span>
              </Link>
            </li>
            
            {/* Students */}
            <li>
              <Link href="/students" className={cn(
                "flex items-center px-3 py-2 text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                isActive("/students") && "text-[#0A2463] bg-gray-100 font-medium"
              )}>
                <GraduationCap className="h-4 w-4 mr-2" />
                <span>Students</span>
              </Link>
            </li>
            
            {/* Test Tracker */}
            <li>
              <Link href="/test-tracker" className={cn(
                "flex items-center px-3 py-2 text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                isActive("/test-tracker") && "text-[#0A2463] bg-gray-100 font-medium"
              )}>
                <ListChecks className="h-4 w-4 mr-2" />
                <span>Test Tracker</span>
              </Link>
            </li>
            
            {/* Reports */}
            <li>
              <Link href="/reports" className={cn(
                "flex items-center px-3 py-2 text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                isActive("/reports") && "text-[#0A2463] bg-gray-100 font-medium"
              )}>
                <BarChart2 className="h-4 w-4 mr-2" />
                <span>Reports</span>
              </Link>
            </li>
            
            {/* Administration Dropdown */}
            <li className="relative" ref={adminDropdownRef}>
              <button 
                onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                className={cn(
                  "flex items-center px-3 py-2 text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                  (isActive("/administration") || adminDropdownOpen) && "text-[#0A2463] bg-gray-100 font-medium"
                )}
              >
                <Settings className="h-4 w-4 mr-2" />
                <span>Administration</span>
                {adminDropdownOpen ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
              </button>
              
              {adminDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg py-1 z-50 border border-gray-200">
                  <Link 
                    href="/administration/company-policy" 
                    onClick={() => setAdminDropdownOpen(false)}
                    className={cn(
                    "block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                    isActive("/administration/company-policy") && "text-[#0A2463] bg-gray-100 font-medium"
                  )}>
                    Company Policy
                  </Link>
                  <Link 
                    href="/administration/evaluation-guideline" 
                    onClick={() => setAdminDropdownOpen(false)}
                    className={cn(
                    "block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                    isActive("/administration/evaluation-guideline") && "text-[#0A2463] bg-gray-100 font-medium"
                  )}>
                    Instructor Evaluation Guideline
                  </Link>
                  <Link 
                    href="/administration/employee-handbook" 
                    onClick={() => setAdminDropdownOpen(false)}
                    className={cn(
                    "block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                    isActive("/administration/employee-handbook") && "text-[#0A2463] bg-gray-100 font-medium"
                  )}>
                    Employee Handbook
                  </Link>
                  <Link 
                    href="/administration/performance-policy" 
                    onClick={() => setAdminDropdownOpen(false)}
                    className={cn(
                    "block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                    isActive("/administration/performance-policy") && "text-[#0A2463] bg-gray-100 font-medium"
                  )}>
                    Performance Evaluation Policy
                  </Link>
                  <Link 
                    href="/administration/classroom-evaluation" 
                    onClick={() => setAdminDropdownOpen(false)}
                    className={cn(
                    "block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                    isActive("/administration/classroom-evaluation") && "text-[#0A2463] bg-gray-100 font-medium"
                  )}>
                    Training Guide Classroom Evaluation
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default SimpleHorizontalNavbar;