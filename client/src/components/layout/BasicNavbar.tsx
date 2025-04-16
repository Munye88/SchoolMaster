import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useSchool } from "@/hooks/useSchool";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  Home, School, BookOpen, GraduationCap, ListChecks, BarChart2, Settings, Search, 
  LogOut, LogIn, UserCircle, BookText, BriefcaseBusiness, MessageSquare, AlertTriangle, 
  BrainCircuit, Users, Lightbulb, FileText, Award, LayoutDashboard, ClipboardList,
  Building2, UserCheck, BookMarked
} from "lucide-react";

const BasicNavbar = () => {
  const [location] = useLocation();
  const { schools, selectedSchool, selectSchool } = useSchool();
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

  // Close dropdowns when opening another one
  const handleToggleSchool = () => {
    setShowSchoolLinks(showSchoolLinks ? null : 'main');
    setShowDLILinks(false);
    setShowTrainingLinks(false);
    setShowAdminLinks(false);
  };
  
  const handleToggleDLI = () => {
    setShowDLILinks(!showDLILinks);
    setShowSchoolLinks(null);
    setShowTrainingLinks(false);
    setShowAdminLinks(false);
  };
  
  const handleToggleTraining = () => {
    setShowTrainingLinks(!showTrainingLinks);
    setShowSchoolLinks(null);
    setShowDLILinks(false);
    setShowAdminLinks(false);
  };
  
  const handleToggleAdmin = () => {
    setShowAdminLinks(!showAdminLinks);
    setShowSchoolLinks(null);
    setShowDLILinks(false);
    setShowTrainingLinks(false);
  };
  
  const handleSelectSchool = (school: { id: number; name: string; code: string; location?: string | null }) => {
    selectSchool(school);
    setShowSchoolLinks(school.code);
  };

  return (
    <div className="flex flex-col">
      {/* Top bar with brand */}
      <div className="bg-[#0A2463] text-white h-16 flex items-center px-6">
        <div className="flex-grow flex justify-center">
          <span className="font-bold text-xl tracking-wide">GOVCIO/SAMS ELT PROGRAM MANAGEMENT</span>
        </div>
        
        {/* User menu */}
        <div className="flex items-center space-x-4">
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="text-white">
            <UserCircle className="h-6 w-6" />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-6 top-12 bg-white shadow-lg rounded p-2 z-50">
              {user ? (
                <button onClick={handleLogout} className="text-red-500 flex items-center">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sign out</span>
                </button>
              ) : (
                <Link href="/auth" className="text-blue-500">Sign in</Link>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Main navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center h-14 relative">
            {/* Main nav items */}
            <div className="flex items-center space-x-2">
              {/* Dashboard */}
              <Link href="/" className={cn(
                "flex items-center h-10 px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md",
                isActive("/") && "text-[#0A2463] bg-gray-100 font-medium"
              )}>
                <Home className="h-4 w-4 mr-2" />
                <span>Dashboard</span>
              </Link>
              
              {/* Schools */}
              <div className="relative">
                <button onClick={handleToggleSchool} className={cn(
                  "flex items-center h-10 px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md",
                  (isActive("/schools") || showSchoolLinks) && "text-[#0A2463] bg-gray-100 font-medium"
                )}>
                  <School className="h-4 w-4 mr-2" />
                  <span>Schools</span>
                </button>
                
                {showSchoolLinks === 'main' && (
                  <div className="absolute left-0 top-full mt-1 bg-white border rounded shadow-lg z-50">
                    {schools.map(school => (
                      <button
                        key={school.id}
                        onClick={() => handleSelectSchool(school)}
                        className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                      >
                        {school.name}
                      </button>
                    ))}
                  </div>
                )}
                
                {showSchoolLinks && showSchoolLinks !== 'main' && (
                  <div className="absolute left-0 top-full mt-1 bg-white border rounded shadow-lg z-50">
                    <div className="px-4 py-2 bg-gray-50 border-b font-medium">Documents</div>
                    <Link href={`/schools/${showSchoolLinks}/instructor-profiles`} onClick={() => setShowSchoolLinks(null)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Instructor Profiles
                    </Link>
                    <Link href={`/schools/${showSchoolLinks}/timetable`} onClick={() => setShowSchoolLinks(null)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Timetable
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Courses */}
              <Link href="/courses" className={cn(
                "flex items-center h-10 px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md",
                isActive("/courses") && "text-[#0A2463] bg-gray-100 font-medium"
              )}>
                <BookOpen className="h-4 w-4 mr-2" />
                <span>Courses</span>
              </Link>
              
              {/* DLI */}
              <div className="relative">
                <button onClick={handleToggleDLI} className={cn(
                  "flex items-center h-10 px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md",
                  (isActive("/dli") || showDLILinks) && "text-[#0A2463] bg-gray-100 font-medium"
                )}>
                  <BookText className="h-4 w-4 mr-2" />
                  <span>DLI</span>
                </button>
                
                {showDLILinks && (
                  <div className="absolute left-0 top-full mt-1 bg-white border rounded shadow-lg z-50">
                    <Link href="/dli/book-order" onClick={() => setShowDLILinks(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Book Inventory
                    </Link>
                    <Link href="/dli/alcpt-order" onClick={() => setShowDLILinks(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100">
                      ALCPT Forms
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Test Tracker */}
              <Link href="/test-tracker" className={cn(
                "flex items-center h-10 px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md",
                isActive("/test-tracker") && "text-[#0A2463] bg-gray-100 font-medium"
              )}>
                <ListChecks className="h-4 w-4 mr-2" />
                <span>Test Tracker</span>
              </Link>
              
              {/* Reports */}
              <Link href="/reports" className={cn(
                "flex items-center h-10 px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md",
                isActive("/reports") && "text-[#0A2463] bg-gray-100 font-medium"
              )}>
                <BarChart2 className="h-4 w-4 mr-2" />
                <span>Reports</span>
              </Link>
              
              {/* Training & Development */}
              <div className="relative">
                <button onClick={handleToggleTraining} className={cn(
                  "flex items-center h-10 px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md",
                  (isActive("/training-development") || showTrainingLinks) && "text-[#0A2463] bg-gray-100 font-medium"
                )}>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  <span>Training</span>
                </button>
                
                {showTrainingLinks && (
                  <div className="absolute left-0 top-full mt-1 bg-white border rounded shadow-lg z-50">
                    <Link href="/training-development/leadership-skills" onClick={() => setShowTrainingLinks(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Leadership Skills
                    </Link>
                    <Link href="/training-development/conflict-resolution" onClick={() => setShowTrainingLinks(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Conflict Resolution
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Action Log */}
              <Link href="/action-log" className={cn(
                "flex items-center h-10 px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md",
                isActive("/action-log") && "text-[#0A2463] bg-gray-100 font-medium"
              )}>
                <ClipboardList className="h-4 w-4 mr-2" />
                <span>Action Log</span>
              </Link>
              
              {/* Recruitment */}
              <Link href="/recruitment" className={cn(
                "flex items-center h-10 px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md",
                isActive("/recruitment") && "text-[#0A2463] bg-gray-100 font-medium"
              )}>
                <Users className="h-4 w-4 mr-2" />
                <span>Recruitment</span>
              </Link>
              
              {/* Administration */}
              <div className="relative">
                <button onClick={handleToggleAdmin} className={cn(
                  "flex items-center h-10 px-3 py-2 text-sm text-gray-700 hover:text-[#0A2463] hover:bg-gray-100 rounded-md",
                  (isActive("/administration") || showAdminLinks) && "text-[#0A2463] bg-gray-100 font-medium"
                )}>
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Admin</span>
                </button>
                
                {showAdminLinks && (
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg z-50">
                    <div className="px-4 py-2 bg-gray-50 border-b font-medium">Documents</div>
                    <Link href="/administration/evaluation-guideline" onClick={() => setShowAdminLinks(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-100">
                      Evaluation Guideline
                    </Link>
                    <Link href="/administration/instructor-recognition" onClick={() => setShowAdminLinks(false)}
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100">
                      <Award className="h-4 w-4 mr-2 text-amber-600" />
                      Instructor Recognition
                    </Link>
                    <div className="px-4 py-2 bg-gray-50 border-b font-medium mt-1">Management</div>
                    <Link href="/management/schools" onClick={() => setShowAdminLinks(false)}
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100">
                      <Building2 className="h-4 w-4 mr-2 text-purple-600" />
                      Manage Schools
                    </Link>
                    <Link href="/management/instructors" onClick={() => setShowAdminLinks(false)}
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100">
                      <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                      Manage Instructors
                    </Link>
                    <Link href="/management/courses" onClick={() => setShowAdminLinks(false)}
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100">
                      <BookMarked className="h-4 w-4 mr-2 text-amber-600" />
                      Manage Courses
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Click outside handler */}
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