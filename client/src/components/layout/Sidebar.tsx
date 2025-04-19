import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useSchool } from "@/hooks/useSchool";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { School as SchoolType } from "@shared/schema";
import { 
  Home, School as SchoolIcon, BookOpen, GraduationCap, ListChecks, BarChart2, Settings, LogOut, 
  BookText, BriefcaseBusiness, MessageSquare, AlertTriangle, BrainCircuit, Users, 
  Lightbulb, FileText, Award, LayoutDashboard, ClipboardList, Building2, UserCheck, 
  BookMarked, ChevronDown, Menu, X, Activity, PanelRight, Calendar, Clock, UserCog,
  ClipboardCheck, CheckSquare, Eye, CalendarDays, CalendarX
} from "lucide-react";

const Sidebar = () => {
  const [location] = useLocation();
  const { schools, selectedSchool, selectSchool } = useSchool();
  const { user, logoutMutation } = useAuth();
  
  const [collapsed, setCollapsed] = useState(false);
  const [showSchoolLinks, setShowSchoolLinks] = useState<string | null>(null);
  const [showAdminLinks, setShowAdminLinks] = useState<boolean>(false);
  const [showTrainingLinks, setShowTrainingLinks] = useState<boolean>(false);
  const [showDLILinks, setShowDLILinks] = useState<boolean>(false);
  const [showManageLinks, setShowManageLinks] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  
  const isActive = (path: string) => {
    return location === path || location.startsWith(path + "/");
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Handle sidebar menu toggles
  const handleToggleSchool = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSchoolLinks(showSchoolLinks ? null : 'main');
    setShowDLILinks(false);
    setShowTrainingLinks(false);
    setShowAdminLinks(false);
    setShowManageLinks(false);
  };
  
  const handleToggleDLI = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDLILinks(!showDLILinks);
    setShowSchoolLinks(null);
    setShowTrainingLinks(false);
    setShowAdminLinks(false);
    setShowManageLinks(false);
  };
  
  const handleToggleTraining = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTrainingLinks(!showTrainingLinks);
    setShowSchoolLinks(null);
    setShowDLILinks(false);
    setShowAdminLinks(false);
    setShowManageLinks(false);
  };
  
  const handleToggleAdmin = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowAdminLinks(!showAdminLinks);
    setShowSchoolLinks(null);
    setShowDLILinks(false);
    setShowTrainingLinks(false);
    setShowManageLinks(false);
  };
  
  const handleToggleManage = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowManageLinks(!showManageLinks);
    setShowSchoolLinks(null);
    setShowDLILinks(false);
    setShowTrainingLinks(false);
    setShowAdminLinks(false);
  };
  
  const handleSelectSchool = (school: SchoolType) => {
    selectSchool(school);
    setShowSchoolLinks(school.code);
  };

  return (
    <>
      {/* Mobile menu button - visible on small screens */}
      <div className="fixed top-4 left-4 lg:hidden z-50">
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)} 
          className="bg-white p-2 rounded-md shadow-md text-[#0A2463] hover:bg-gray-100"
        >
          {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Header bar that's always visible */}
      <div className="fixed top-0 left-0 right-0 bg-white text-[#0A2463] h-16 flex items-center px-6 border-b shadow-sm z-30">
        {/* Logo on far left */}
        <div className="flex items-center mr-6">
          <img 
            src="/govcio-logo-transparent-fixed.png" 
            alt="GovCIO Logo" 
            className="h-10 object-contain"
          />
        </div>
        
        {/* Text in center */}
        <div className="flex-grow flex justify-center">
          <span className="font-bold text-xl tracking-wide">GOVCIO-SAMS ELT PROGRAM</span>
        </div>
        
        {/* User menu */}
        <div className="flex items-center space-x-4">
          {user && (
            <button 
              onClick={handleLogout} 
              className="text-red-500 flex items-center text-sm font-medium bg-white hover:bg-red-50 px-3 py-1.5 rounded border border-red-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Sign out</span>
            </button>
          )}
        </div>
      </div>

      {/* Sidebar - full size on desktop, offscreen on mobile until toggled */}
      <div 
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ease-in-out pt-16",
          collapsed ? "w-16" : "w-56",
          showMobileMenu ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full bg-[#0A2463] text-white flex flex-col shadow-xl">
          {/* Toggle collapse button */}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="absolute -right-3 top-20 bg-white p-1.5 rounded-full shadow-md text-[#0A2463] hover:bg-gray-100 hidden lg:block"
          >
            <PanelRight size={18} className={collapsed ? "rotate-180" : ""} />
          </button>
          
          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {/* Dashboard */}
              <li>
                <Link href="/" className={cn(
                  "flex items-center p-2 rounded-lg hover:bg-blue-800 group transition-all",
                  isActive("/") && "bg-blue-900 font-medium text-white",
                  !isActive("/") && "text-gray-100"
                )}>
                  <Home className={cn("w-5 h-5", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>Dashboard</span>}
                </Link>
              </li>
              
              {/* Schools - dropdown */}
              <li>
                <a href="#" onClick={handleToggleSchool} className={cn(
                  "flex items-center justify-between p-2 rounded-lg hover:bg-blue-800 group transition-all",
                  (isActive("/schools") || showSchoolLinks) && "bg-blue-900 font-medium text-white",
                  !isActive("/schools") && !showSchoolLinks && "text-gray-100"
                )}>
                  <div className="flex items-center">
                    <SchoolIcon className={cn("w-5 h-5", collapsed ? "mx-auto" : "mr-3")} />
                    {!collapsed && <span>Schools</span>}
                  </div>
                  {!collapsed && <ChevronDown className={`w-4 h-4 ${showSchoolLinks ? 'transform rotate-180' : ''}`} />}
                </a>
                
                {showSchoolLinks === 'main' && !collapsed && (
                  <ul className="mt-1 space-y-0.5 overflow-hidden bg-gradient-to-b from-blue-800/80 to-blue-900/80 rounded-lg py-1.5 mx-1.5 backdrop-blur-sm shadow-inner">
                    {schools.map(school => (
                      <li key={school.id}>
                        <button
                          onClick={() => handleSelectSchool(school)}
                          className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white flex items-center transition-all group"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all"></div>
                          {school.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                
                {showSchoolLinks && showSchoolLinks !== 'main' && !collapsed && (
                  <ul className="mt-1 space-y-0.5 overflow-hidden bg-gradient-to-b from-blue-800/80 to-blue-900/80 rounded-lg py-1.5 mx-1.5 backdrop-blur-sm shadow-inner">
                    <li className="px-3 py-1 text-xs font-medium border-b border-blue-700/50 mb-1">
                      {schools.find(s => s.code === showSchoolLinks)?.name} Documents
                    </li>
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/instructor-profiles`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <Users className="h-4 w-4 mr-2 text-blue-300 group-hover:text-blue-200" />
                        Instructor Profiles
                      </Link>
                    </li>
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/timetable`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <CalendarDays className="h-4 w-4 mr-2 text-blue-300 group-hover:text-blue-200" />
                        Timetable
                      </Link>
                    </li>
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/student-day-schedule`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <Clock className="h-4 w-4 mr-2 text-blue-300 group-hover:text-blue-200" />
                        Student Day Schedule
                      </Link>
                    </li>
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/yearly-schedule`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <Calendar className="h-4 w-4 mr-2 text-blue-300 group-hover:text-blue-200" />
                        Yearly Schedule
                      </Link>
                    </li>
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/sop`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <FileText className="h-4 w-4 mr-2 text-blue-300 group-hover:text-blue-200" />
                        SOP
                      </Link>
                    </li>
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/staff-evaluations`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <ClipboardCheck className="h-4 w-4 mr-2 text-green-300 group-hover:text-green-200" />
                        Staff Evaluations
                      </Link>
                    </li>
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/staff-attendance`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <UserCheck className="h-4 w-4 mr-2 text-green-300 group-hover:text-green-200" />
                        Staff Attendance
                      </Link>
                    </li>
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/book-inventory`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <BookOpen className="h-4 w-4 mr-2 text-amber-300 group-hover:text-amber-200" />
                        Book Inventory
                      </Link>
                    </li>
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/staff-leave-tracker`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <CalendarX className="h-4 w-4 mr-2 text-red-300 group-hover:text-red-200" />
                        Staff Leave Tracker
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              
              {/* Courses */}
              <li>
                <Link href="/courses" className={cn(
                  "flex items-center p-2 rounded-lg hover:bg-blue-800 group transition-all",
                  isActive("/courses") && "bg-blue-900 font-medium text-white",
                  !isActive("/courses") && "text-gray-100"
                )}>
                  <BookOpen className={cn("w-5 h-5", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>Courses</span>}
                </Link>
              </li>
              
              {/* DLI - dropdown */}
              <li>
                <a href="#" onClick={handleToggleDLI} className={cn(
                  "flex items-center justify-between p-2 rounded-lg hover:bg-blue-800 group transition-all",
                  (isActive("/dli") || showDLILinks) && "bg-blue-900 font-medium text-white",
                  !isActive("/dli") && !showDLILinks && "text-gray-100"
                )}>
                  <div className="flex items-center">
                    <BookText className={cn("w-5 h-5", collapsed ? "mx-auto" : "mr-3")} />
                    {!collapsed && <span>DLI</span>}
                  </div>
                  {!collapsed && <ChevronDown className={`w-4 h-4 ${showDLILinks ? 'transform rotate-180' : ''}`} />}
                </a>
                
                {showDLILinks && !collapsed && (
                  <ul className="mt-1 space-y-0.5 overflow-hidden bg-gradient-to-b from-blue-800/80 to-blue-900/80 rounded-lg py-1.5 mx-1.5 backdrop-blur-sm shadow-inner">
                    <li>
                      <Link href="/dli/book-order" onClick={() => setShowDLILinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <BookOpen className="h-4 w-4 mr-2 text-blue-300 group-hover:text-blue-200" />
                        DLI Book Inventory
                      </Link>
                    </li>
                    <li>
                      <Link href="/dli/alcpt-order" onClick={() => setShowDLILinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <ListChecks className="h-4 w-4 mr-2 text-green-300 group-hover:text-green-200" />
                        ALCPT Forms
                      </Link>
                    </li>
                    <li>
                      <Link href="/dli/answer-sheets" onClick={() => setShowDLILinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <FileText className="h-4 w-4 mr-2 text-purple-300 group-hover:text-purple-200" />
                        Answer Sheets
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              
              {/* Test Tracker */}
              <li>
                <Link href="/test-tracker" className={cn(
                  "flex items-center p-2 rounded-lg hover:bg-blue-800 group transition-all",
                  isActive("/test-tracker") && "bg-blue-900 font-medium text-white",
                  !isActive("/test-tracker") && "text-gray-100"
                )}>
                  <ListChecks className={cn("w-5 h-5", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>Test Tracker</span>}
                </Link>
              </li>
              
              {/* Reports */}
              <li>
                <Link href="/reports" className={cn(
                  "flex items-center p-2 rounded-lg hover:bg-blue-800 group transition-all",
                  isActive("/reports") && "bg-blue-900 font-medium text-white",
                  !isActive("/reports") && "text-gray-100"
                )}>
                  <BarChart2 className={cn("w-5 h-5", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>Reports</span>}
                </Link>
              </li>
              
              {/* Training & Development - dropdown */}
              <li>
                <a href="#" onClick={handleToggleTraining} className={cn(
                  "flex items-center justify-between p-2 rounded-lg hover:bg-blue-800 group transition-all",
                  (isActive("/training-development") || showTrainingLinks) && "bg-blue-900 font-medium text-white",
                  !isActive("/training-development") && !showTrainingLinks && "text-gray-100"
                )}>
                  <div className="flex items-center">
                    <Lightbulb className={cn("w-5 h-5", collapsed ? "mx-auto" : "mr-3")} />
                    {!collapsed && <span>Training</span>}
                  </div>
                  {!collapsed && <ChevronDown className={`w-4 h-4 ${showTrainingLinks ? 'transform rotate-180' : ''}`} />}
                </a>
                
                {showTrainingLinks && !collapsed && (
                  <ul className="mt-1 space-y-0.5 overflow-hidden bg-gradient-to-b from-indigo-800/80 to-indigo-900/80 rounded-lg py-1.5 mx-1.5 backdrop-blur-sm shadow-inner">
                    <li className="px-3 py-1 text-xs font-medium border-b border-indigo-700/50 mb-1">
                      Leadership Resources
                    </li>
                    <li>
                      <Link href="/training-development/leadership-skills" onClick={() => setShowTrainingLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-indigo-700/50 text-gray-100 hover:text-white transition-all group">
                        <BriefcaseBusiness className="h-4 w-4 mr-2 text-indigo-300 group-hover:text-indigo-200" />
                        Leadership Skills
                      </Link>
                    </li>
                    <li>
                      <Link href="/training-development/communication-techniques" onClick={() => setShowTrainingLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-indigo-700/50 text-gray-100 hover:text-white transition-all group">
                        <MessageSquare className="h-4 w-4 mr-2 text-indigo-300 group-hover:text-indigo-200" />
                        Communication
                      </Link>
                    </li>
                    <li>
                      <Link href="/training-development/conflict-resolution" onClick={() => setShowTrainingLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-indigo-700/50 text-gray-100 hover:text-white transition-all group">
                        <AlertTriangle className="h-4 w-4 mr-2 text-indigo-300 group-hover:text-indigo-200" />
                        Conflict Resolution
                      </Link>
                    </li>
                    <li>
                      <Link href="/training-development/decision-making" onClick={() => setShowTrainingLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-indigo-700/50 text-gray-100 hover:text-white transition-all group">
                        <BrainCircuit className="h-4 w-4 mr-2 text-indigo-300 group-hover:text-indigo-200" />
                        Decision Making
                      </Link>
                    </li>
                    <li>
                      <Link href="/training-development/team-building" onClick={() => setShowTrainingLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-indigo-700/50 text-gray-100 hover:text-white transition-all group">
                        <Users className="h-4 w-4 mr-2 text-indigo-300 group-hover:text-indigo-200" />
                        Team Building
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              
              {/* Action Log */}
              <li>
                <Link href="/action-log" className={cn(
                  "flex items-center p-2 rounded-lg hover:bg-blue-800 group transition-all",
                  isActive("/action-log") && "bg-blue-900 font-medium text-white",
                  !isActive("/action-log") && "text-gray-100"
                )}>
                  <ClipboardList className={cn("w-5 h-5", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>Action Log</span>}
                </Link>
              </li>
              
              {/* Recruitment */}
              <li>
                <Link href="/recruitment" className={cn(
                  "flex items-center p-2 rounded-lg hover:bg-blue-800 group transition-all",
                  isActive("/recruitment") && "bg-blue-900 font-medium text-white",
                  !isActive("/recruitment") && "text-gray-100"
                )}>
                  <Users className={cn("w-5 h-5", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>Recruitment</span>}
                </Link>
              </li>
              
              {/* Administration - dropdown */}
              <li>
                <a href="#" onClick={handleToggleAdmin} className={cn(
                  "flex items-center justify-between p-2 rounded-lg hover:bg-blue-800 group transition-all",
                  (isActive("/administration") || showAdminLinks) && "bg-blue-900 font-medium text-white",
                  !isActive("/administration") && !showAdminLinks && "text-gray-100"
                )}>
                  <div className="flex items-center">
                    <Settings className={cn("w-5 h-5", collapsed ? "mx-auto" : "mr-3")} />
                    {!collapsed && <span>Administration</span>}
                  </div>
                  {!collapsed && <ChevronDown className={`w-4 h-4 ${showAdminLinks ? 'transform rotate-180' : ''}`} />}
                </a>
                
                {showAdminLinks && !collapsed && (
                  <ul className="mt-1 space-y-0.5 overflow-hidden bg-gradient-to-b from-blue-800/80 to-blue-900/80 rounded-lg py-1.5 mx-1.5 backdrop-blur-sm shadow-inner">
                    <li className="px-3 py-1 text-xs font-medium border-b border-blue-700/50 mb-1">
                      Documentation
                    </li>
                    <li>
                      <Link href="/administration/instructor-performance-policy" onClick={() => setShowAdminLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <ClipboardCheck className="h-4 w-4 mr-2 text-blue-300 group-hover:text-blue-200" />
                        Instructor Performance Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/administration/evaluation-guideline" onClick={() => setShowAdminLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <CheckSquare className="h-4 w-4 mr-2 text-blue-300 group-hover:text-blue-200" />
                        Evaluation Guidelines
                      </Link>
                    </li>
                    <li>
                      <Link href="/administration/employee-handbook" onClick={() => setShowAdminLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <BookOpen className="h-4 w-4 mr-2 text-blue-300 group-hover:text-blue-200" />
                        Employee Handbook
                      </Link>
                    </li>
                    
                    <li>
                      <Link href="/administration/classroom-evaluation" onClick={() => setShowAdminLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <ClipboardCheck className="h-4 w-4 mr-2 text-blue-300 group-hover:text-blue-200" />
                        Classroom Evaluation Guide
                      </Link>
                    </li>


                  </ul>
                )}
              </li>
              
              {/* Manage - dropdown */}
              <li>
                <a href="#" onClick={handleToggleManage} className={cn(
                  "flex items-center justify-between p-2 rounded-lg hover:bg-blue-800 group transition-all",
                  (isActive("/management") || showManageLinks) && "bg-blue-900 font-medium text-white",
                  !isActive("/management") && !showManageLinks && "text-gray-100"
                )}>
                  <div className="flex items-center">
                    <Users className={cn("w-5 h-5", collapsed ? "mx-auto" : "mr-3")} />
                    {!collapsed && <span>Manage</span>}
                  </div>
                  {!collapsed && <ChevronDown className={`w-4 h-4 ${showManageLinks ? 'transform rotate-180' : ''}`} />}
                </a>
                
                {showManageLinks && !collapsed && (
                  <ul className="mt-1 space-y-0.5 overflow-hidden bg-gradient-to-b from-blue-800/80 to-blue-900/80 rounded-lg py-1.5 mx-1.5 backdrop-blur-sm shadow-inner">
                    <li>
                      <Link href="/management/schools" onClick={() => setShowManageLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <Building2 className="h-4 w-4 mr-2 text-purple-300 group-hover:text-purple-200" />
                        Manage Schools
                      </Link>
                    </li>
                    <li>
                      <Link href="/management/instructors" onClick={() => setShowManageLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <UserCheck className="h-4 w-4 mr-2 text-green-300 group-hover:text-green-200" />
                        Manage Instructors
                      </Link>
                    </li>
                    <li>
                      <Link href="/management/courses" onClick={() => setShowManageLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <BookMarked className="h-4 w-4 mr-2 text-amber-300 group-hover:text-amber-200" />
                        Manage Courses
                      </Link>
                    </li>
                    <li>
                      <Link href="/administration/manage-dashboard" onClick={() => setShowManageLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <LayoutDashboard className="h-4 w-4 mr-2 text-blue-300 group-hover:text-blue-200" />
                        Manage Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/administration/users" onClick={() => setShowManageLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <UserCog className="h-4 w-4 mr-2 text-blue-300 group-hover:text-blue-200" />
                        User Management
                      </Link>
                    </li>
                    <li>
                      <Link href="/events" onClick={() => setShowManageLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-700/50 text-gray-100 hover:text-white transition-all group">
                        <CalendarDays className="h-4 w-4 mr-2 text-blue-300 group-hover:text-blue-200" />
                        Event Calendar
                      </Link>
                    </li>

                  </ul>
                )}
              </li>
              
              {/* Instructor Recognition - standalone tab */}
              <li>
                <Link href="/administration/instructor-recognition" className={cn(
                  "flex items-center p-2 rounded-lg hover:bg-blue-800 group transition-all",
                  isActive("/administration/instructor-recognition") && "bg-blue-900 font-medium text-white",
                  !isActive("/administration/instructor-recognition") && "text-gray-100"
                )}>
                  <Award className={cn("w-5 h-5", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>Instructor Recognition</span>}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* User info/version at bottom */}
          <div className="p-4 border-t border-blue-800">
            {!collapsed && (
              <>
                {user && (
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-900 rounded-full p-2 mr-3">
                      <UserCheck className="h-5 w-5 text-blue-200" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user.username}</p>
                      <p className="text-xs text-blue-300">{user.role}</p>
                    </div>
                  </div>
                )}
                <div className="text-xs text-blue-400">
                  Version 1.2.0
                </div>
              </>
            )}
            {collapsed && (
              <div className="flex justify-center">
                <UserCheck className="h-6 w-6 text-blue-300" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay when mobile menu is open */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;