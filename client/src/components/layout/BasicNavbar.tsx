import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useSchool } from "@/hooks/useSchool";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  Home, School, BookOpen, GraduationCap, ListChecks, BarChart2, Settings, Search, Bell,
  LogOut, LogIn, UserCircle, BookText, BriefcaseBusiness, MessageSquare, AlertTriangle, 
  BrainCircuit, Users, Lightbulb, FileText, Award, LayoutDashboard
} from "lucide-react";
import govcioLogo from "../../assets/images/govcio-logo-updated.png";

const BasicNavbar = () => {
  const [location] = useLocation();
  const { schools, selectedSchool, selectSchool } = useSchool();
  
  console.log("BasicNavbar: schools", schools);
  console.log("BasicNavbar: selectedSchool", selectedSchool);
  const { user, logoutMutation } = useAuth();
  const [showSchoolLinks, setShowSchoolLinks] = useState<string | null>(null);
  const [showAdminLinks, setShowAdminLinks] = useState<boolean>(false);
  const [showTrainingLinks, setShowTrainingLinks] = useState<boolean>(false);
  const [showDLILinks, setShowDLILinks] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  
  const isActive = (path: string) => {
    return location === path || location.startsWith(path + "/");
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="flex flex-col">
      {/* Top bar with brand */}
      <div className="bg-[#0A2463] text-white h-16 flex items-center px-6">
        {/* Left side - Logo */}
        <div className="flex-shrink-0 w-24 mr-2">
          <img src={govcioLogo} alt="GovCIO Logo" className="h-10" />
        </div>
        
        {/* Center - Title */}
        <div className="flex-grow flex justify-center">
          <span className="font-bold text-xl tracking-wide">GOVCIO/SAMS ELT PROGRAM MANAGEMENT</span>
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
          
          {/* User menu */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)} 
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#3E92CC] text-white flex items-center justify-center font-bold">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : user?.username.substring(0, 2).toUpperCase()}
              </div>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="font-medium text-sm">{user?.name || user?.username}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
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
                          console.log("Selecting school:", school);
                          selectSchool(school);
                          setShowSchoolLinks(school.code);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 transition-colors",
                          selectedSchool?.code === school.code && "text-[#0A2463] bg-gray-100 font-medium"
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
                      <Link 
                        href={`/schools/${showSchoolLinks}/staff-leave-tracker`}
                        onClick={() => setShowSchoolLinks(null)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                      >
                        Staff Leave Tracker
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
              
              <div className="relative">
                <button
                  onClick={() => {
                    // Toggle DLI dropdown and close others
                    setShowDLILinks(!showDLILinks);
                    if (showSchoolLinks) setShowSchoolLinks(null);
                    if (showAdminLinks) setShowAdminLinks(false);
                    if (showTrainingLinks) setShowTrainingLinks(false);
                  }}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md transition-colors",
                    (isActive("/dli") || showDLILinks) && "text-[#0A2463] bg-gray-100 font-medium"
                  )}
                >
                  <BookText className="h-4 w-4 mr-2" />
                  <span>DLI</span>
                </button>
                
                {showDLILinks && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <Link 
                      href="/dli/book-order"
                      onClick={() => setShowDLILinks(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      <BookOpen className="h-4 w-4 mr-2 text-indigo-600" />
                      DLI Book Inventory
                    </Link>
                    <Link 
                      href="/dli/alcpt-order"
                      onClick={() => setShowDLILinks(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      <ListChecks className="h-4 w-4 mr-2 text-emerald-600" />
                      ALCPT Forms
                    </Link>
                    <Link 
                      href="/dli/answer-sheets"
                      onClick={() => setShowDLILinks(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      <FileText className="h-4 w-4 mr-2 text-purple-600" />
                      Answer Sheets
                    </Link>
                  </div>
                )}
              </div>
              
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
                  onClick={() => {
                    setShowTrainingLinks(!showTrainingLinks);
                    // Close other links if open
                    if (showSchoolLinks) setShowSchoolLinks(null);
                    if (showAdminLinks) setShowAdminLinks(false);
                  }}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md transition-colors",
                    (isActive("/training-development") || showTrainingLinks) && "text-[#0A2463] bg-gray-100 font-medium"
                  )}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  <span>Training & Development</span>
                </button>
                
                {showTrainingLinks && (
                  <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200 text-xs font-medium uppercase text-gray-500">
                      Leadership Resources
                    </div>
                    
                    <Link 
                      href="/training-development/leadership-skills"
                      onClick={() => setShowTrainingLinks(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <BriefcaseBusiness className="h-4 w-4 mr-2 text-blue-600" />
                      Leadership Skills
                    </Link>
                    <Link 
                      href="/training-development/communication-techniques"
                      onClick={() => setShowTrainingLinks(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                      Communication Techniques
                    </Link>
                    <Link 
                      href="/training-development/conflict-resolution"
                      onClick={() => setShowTrainingLinks(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2 text-blue-600" />
                      Conflict Resolution
                    </Link>
                    <Link 
                      href="/training-development/decision-making"
                      onClick={() => setShowTrainingLinks(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <BrainCircuit className="h-4 w-4 mr-2 text-blue-600" />
                      Decision Making
                    </Link>
                    <Link 
                      href="/training-development/team-building"
                      onClick={() => setShowTrainingLinks(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Users className="h-4 w-4 mr-2 text-blue-600" />
                      Team Building
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  onClick={() => {
                    setShowAdminLinks(!showAdminLinks); 
                    // Close school links if open, to avoid having multiple dropdowns open
                    if (showSchoolLinks) setShowSchoolLinks(null);
                    if (showTrainingLinks) setShowTrainingLinks(false);
                  }}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md transition-colors",
                    (isActive("/administration") || showAdminLinks) && "text-[#0A2463] bg-gray-100 font-medium"
                  )}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Administration</span>
                </button>
                
                {showAdminLinks && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium uppercase text-gray-500">
                      Documents
                    </div>
                    {/* Company Policy link removed as requested */}
                    <Link 
                      href="/administration/evaluation-guideline"
                      onClick={() => setShowAdminLinks(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      Instructor Evaluation Guideline
                    </Link>
                    <Link 
                      href="/administration/employee-handbook"
                      onClick={() => setShowAdminLinks(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      Employee Handbook
                    </Link>
                    <Link 
                      href="/administration/performance-policy"
                      onClick={() => setShowAdminLinks(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      Performance Evaluation Policy
                    </Link>
                    <Link 
                      href="/administration/classroom-evaluation"
                      onClick={() => setShowAdminLinks(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      Training Guide Classroom Evaluation
                    </Link>
                    
                    <Link 
                      href="/administration/instructor-recognition"
                      onClick={() => setShowAdminLinks(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      <Award className="h-4 w-4 mr-2 text-amber-600" />
                      Instructor Recognition
                    </Link>

                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium uppercase text-gray-500 mt-2">
                      Management
                    </div>
                    <Link 
                      href="/management/schools"
                      onClick={() => setShowAdminLinks(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      Manage Schools
                    </Link>
                    <Link 
                      href="/management/instructors"
                      onClick={() => setShowAdminLinks(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      Manage Instructors
                    </Link>
                    <Link 
                      href="/management/courses"
                      onClick={() => setShowAdminLinks(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      Manage Courses
                    </Link>
                    <Link 
                      href="/management/students"
                      onClick={() => setShowAdminLinks(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      Manage Students
                    </Link>
                    <Link 
                      href="/management/dashboard"
                      onClick={() => setShowAdminLinks(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2 text-blue-600" />
                      Manage Dashboard
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Click outside handler to close dropdowns */}
      {(showSchoolLinks || showUserMenu || showAdminLinks || showTrainingLinks || showDLILinks) && (
        <div 
          className="fixed inset-0 bg-transparent z-40"
          onClick={() => {
            setShowSchoolLinks(null);
            setShowUserMenu(false);
            setShowAdminLinks(false);
            setShowTrainingLinks(false);
            setShowDLILinks(false);
          }}
        />
      )}
    </div>
  );
};

export default BasicNavbar;