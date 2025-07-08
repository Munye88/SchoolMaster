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
  ClipboardCheck, CheckSquare, Eye, CalendarDays, CalendarX, Search
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
  const [showActivityLinks, setShowActivityLinks] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  
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
    setShowActivityLinks(false);
  };
  
  const handleToggleActivity = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowActivityLinks(!showActivityLinks);
    setShowManageLinks(false);
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
        <div className="flex items-center space-x-4 relative">
          {user && (
            <>
              <div 
                className="flex items-center bg-white hover:bg-blue-50 transition-colors rounded-lg px-3 py-1.5 cursor-pointer border border-blue-100"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="bg-blue-100 rounded-full p-1.5 mr-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div className="mr-1">
                  <p className="text-sm font-medium text-[#0A2463]">{user.username}</p>
                  <p className="text-xs text-blue-600">{user.role}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-blue-600 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-5 duration-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-[#0A2463]">{user.username}</p>
                  </div>
                  
                  <div className="py-1">
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2 text-red-500" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </>
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
        <div className="h-full bg-gradient-to-b from-[#0B1D51] to-[#102469] text-white flex flex-col shadow-xl">
          {/* Toggle collapse button */}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="absolute -right-3 top-20 bg-white p-1.5 rounded-full shadow-md text-[#0A2463] hover:bg-gray-100 hidden lg:block"
          >
            <PanelRight size={18} className={collapsed ? "rotate-180" : ""} />
          </button>
          
          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-2">
              {/* Dashboard */}
              <li>
                <Link href="/" className={cn(
                  "flex items-center p-2 rounded-lg hover:bg-[#1334A3]/70 group transition-all relative overflow-hidden",
                  isActive("/") && "bg-[#1334A3]/60 font-medium text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-1 before:bg-blue-400 before:rounded-r",
                  !isActive("/") && "text-white"
                )}>
                  <Home className={cn("w-5 h-5 text-blue-400", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>Dashboard</span>}
                </Link>
              </li>
              
              {/* Schools - dropdown */}
              <li>
                <a href="#" onClick={handleToggleSchool} className={cn(
                  "flex items-center justify-between p-2 rounded-lg hover:bg-[#1334A3]/70 group transition-all relative overflow-hidden",
                  (isActive("/schools") || showSchoolLinks) && "bg-[#1334A3]/60 font-medium text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-1 before:bg-blue-400 before:rounded-r",
                  !isActive("/schools") && !showSchoolLinks && "text-white"
                )}>
                  <div className="flex items-center">
                    <SchoolIcon className={cn("w-5 h-5 text-blue-400", collapsed ? "mx-auto" : "mr-3")} />
                    {!collapsed && <span>Schools</span>}
                  </div>
                  {!collapsed && <ChevronDown className={`w-4 h-4 text-blue-400 ${showSchoolLinks ? 'transform rotate-180' : ''}`} />}
                </a>
                
                {showSchoolLinks === 'main' && !collapsed && (
                  <ul className="mt-1 space-y-0.5 overflow-hidden bg-gradient-to-b from-blue-50/90 to-white/90 rounded-lg py-1.5 mx-1.5 backdrop-blur-sm shadow-inner border border-blue-100">
                    {schools.map(school => (
                      <li key={school.id}>
                        <button
                          onClick={() => handleSelectSchool(school)}
                          className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 flex items-center transition-all group"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-2 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all"></div>
                          {school.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                
                {showSchoolLinks && showSchoolLinks !== 'main' && !collapsed && (
                  <ul className="mt-1 space-y-0.5 overflow-hidden bg-gradient-to-b from-blue-50/90 to-white/90 rounded-lg py-1.5 mx-1.5 backdrop-blur-sm shadow-inner border border-blue-100">
                    <li className="px-3 py-1 text-xs font-medium border-b border-blue-200/70 mb-1 text-blue-800">
                      {schools.find(s => s.code === showSchoolLinks)?.name} Documents
                    </li>
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/instructor-profiles`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <Users className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Instructor Profiles
                      </Link>
                    </li>
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/timetable`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <CalendarDays className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Timetable
                      </Link>
                    </li>
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/student-day-schedule`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <Clock className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Student Day Schedule
                      </Link>
                    </li>
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/yearly-schedule`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <Calendar className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Yearly Schedule
                      </Link>
                    </li>
                    {/* SOP removed as requested */}
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/staff-attendance`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <UserCheck className="h-4 w-4 mr-2 text-green-600 group-hover:text-green-700" />
                        Staff Attendance
                      </Link>
                    </li>
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/staff-evaluations`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <ClipboardCheck className="h-4 w-4 mr-2 text-green-600 group-hover:text-green-700" />
                        Staff Evaluations
                      </Link>
                    </li>
                    {/* Book Inventory removed as requested */}
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/staff-leave-tracker`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <CalendarX className="h-4 w-4 mr-2 text-red-600 group-hover:text-red-700" />
                        Staff Leave Tracker
                      </Link>
                    </li>
                    <li>
                      <Link href={`/schools/${showSchoolLinks}/staff-counseling`} onClick={() => setShowSchoolLinks(null)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <MessageSquare className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Staff Counseling
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              
              {/* Courses */}
              <li>
                <Link href="/courses" className={cn(
                  "flex items-center p-2 rounded-lg hover:bg-[#1334A3]/70 group transition-all relative overflow-hidden",
                  isActive("/courses") && "bg-[#1334A3]/60 font-medium text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-1 before:bg-blue-400 before:rounded-r",
                  !isActive("/courses") && "text-white"
                )}>
                  <BookOpen className={cn("w-5 h-5 text-blue-400", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>Courses</span>}
                </Link>
              </li>
              
              {/* Inventory (formerly DLI) - dropdown */}
              <li>
                <a href="#" onClick={handleToggleDLI} className={cn(
                  "flex items-center justify-between p-2 rounded-lg hover:bg-[#1334A3]/70 group transition-all relative overflow-hidden",
                  (isActive("/dli") || showDLILinks) && "bg-[#1334A3]/60 font-medium text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-1 before:bg-blue-400 before:rounded-r",
                  !isActive("/dli") && !showDLILinks && "text-white"
                )}>
                  <div className="flex items-center">
                    <BookText className={cn("w-5 h-5 text-blue-400", collapsed ? "mx-auto" : "mr-3")} />
                    {!collapsed && <span>Inventory</span>}
                  </div>
                  {!collapsed && <ChevronDown className={`w-4 h-4 text-blue-400 ${showDLILinks ? 'transform rotate-180' : ''}`} />}
                </a>
                
                {showDLILinks && !collapsed && (
                  <ul className="mt-1 space-y-0.5 overflow-hidden bg-gradient-to-b from-blue-50/90 to-white/90 rounded-lg py-1.5 mx-1.5 backdrop-blur-sm shadow-inner border border-blue-100">
                    <li className="px-3 py-1 text-xs font-medium border-b border-blue-200/70 mb-1 text-blue-800">
                      Inventory Resources
                    </li>
                    <li>
                      <Link href="/dli/book-order" onClick={() => setShowDLILinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <BookOpen className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Book Inventory
                      </Link>
                    </li>
                    <li>
                      <Link href="/dli/alcpt-order" onClick={() => setShowDLILinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <ListChecks className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        ALCPT Forms
                      </Link>
                    </li>
                    <li>
                      <Link href="/dli/answer-sheets" onClick={() => setShowDLILinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <FileText className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Answer Sheets
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              
              {/* Test Tracker */}
              <li>
                <Link href="/test-tracker" className={cn(
                  "flex items-center p-2 rounded-lg hover:bg-[#1334A3]/70 group transition-all relative overflow-hidden",
                  isActive("/test-tracker") && "bg-[#1334A3]/60 font-medium text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-1 before:bg-blue-400 before:rounded-r",
                  !isActive("/test-tracker") && "text-white"
                )}>
                  <ListChecks className={cn("w-5 h-5 text-blue-400", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>Test Tracker</span>}
                </Link>
              </li>
              
              {/* Reports */}
              <li>
                <Link href="/reports" className={cn(
                  "flex items-center p-2 rounded-lg hover:bg-[#1334A3]/70 group transition-all relative overflow-hidden",
                  isActive("/reports") && "bg-[#1334A3]/60 font-medium text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-1 before:bg-blue-400 before:rounded-r",
                  !isActive("/reports") && "text-white"
                )}>
                  <BarChart2 className={cn("w-5 h-5 text-blue-400", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>Reports</span>}
                </Link>
              </li>
              
              {/* Divider */}
              {!collapsed && <li className="py-1 px-2">
                <div className="h-px bg-blue-900/30 w-full"></div>
              </li>}

              {/* Activity Log - dropdown */}
              <li>
                <a href="#" onClick={handleToggleActivity} className={cn(
                  "flex items-center justify-between p-2 rounded-lg hover:bg-[#1334A3]/70 group transition-all relative overflow-hidden",
                  (isActive("/activity") || isActive("/action-log") || isActive("/quarterly-checkins") || showActivityLinks) && "bg-[#1334A3]/60 font-medium text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-1 before:bg-blue-400 before:rounded-r",
                  !isActive("/activity") && !isActive("/action-log") && !isActive("/quarterly-checkins") && !showActivityLinks && "text-white"
                )}>
                  <div className="flex items-center">
                    <Activity className={cn("w-5 h-5 text-blue-400", collapsed ? "mx-auto" : "mr-3")} />
                    {!collapsed && <span>Activity Log</span>}
                  </div>
                  {!collapsed && <ChevronDown className={`w-4 h-4 text-blue-400 ${showActivityLinks ? 'transform rotate-180' : ''}`} />}
                </a>
                
                {showActivityLinks && !collapsed && (
                  <ul className="mt-1 space-y-0.5 overflow-hidden bg-gradient-to-b from-blue-50/90 to-white/90 rounded-lg py-1.5 mx-1.5 backdrop-blur-sm shadow-inner border border-blue-100">
                    <li className="px-3 py-1 text-xs font-medium border-b border-blue-200/70 mb-1 text-blue-800">
                      Activity Tracking
                    </li>
                    <li>
                      <Link href="/action-log" onClick={() => setShowActivityLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <ClipboardList className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Action Log
                      </Link>
                    </li>
                    <li>
                      <Link href="/quarterly-checkins" onClick={() => setShowActivityLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <CheckSquare className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Quarterly Check-ins
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              
              {/* Recruitment */}
              <li>
                <Link href="/recruitment" className={cn(
                  "flex items-center p-2 rounded-lg hover:bg-[#1334A3]/70 group transition-all relative overflow-hidden",
                  isActive("/recruitment") && "bg-[#1334A3]/60 font-medium text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-1 before:bg-blue-400 before:rounded-r",
                  !isActive("/recruitment") && "text-white"
                )}>
                  <Users className={cn("w-5 h-5 text-blue-400", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>Recruitment</span>}
                </Link>
              </li>
              
              {/* Divider */}
              {!collapsed && <li className="py-1 px-2">
                <div className="h-px bg-blue-900/30 w-full"></div>
              </li>}

              {/* Administration - dropdown */}
              <li>
                <a href="#" onClick={handleToggleAdmin} className={cn(
                  "flex items-center justify-between p-2 rounded-lg hover:bg-[#1334A3]/70 group transition-all relative overflow-hidden",
                  (isActive("/administration") || showAdminLinks) && "bg-[#1334A3]/60 font-medium text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-1 before:bg-blue-400 before:rounded-r",
                  !isActive("/administration") && !showAdminLinks && "text-white"
                )}>
                  <div className="flex items-center">
                    <Settings className={cn("w-5 h-5 text-blue-400", collapsed ? "mx-auto" : "mr-3")} />
                    {!collapsed && <span>Administration</span>}
                  </div>
                  {!collapsed && <ChevronDown className={`w-4 h-4 text-blue-400 ${showAdminLinks ? 'transform rotate-180' : ''}`} />}
                </a>
                
                {showAdminLinks && !collapsed && (
                  <ul className="mt-1 space-y-0.5 overflow-hidden bg-gradient-to-b from-blue-50/90 to-white/90 rounded-lg py-1.5 mx-1.5 backdrop-blur-sm shadow-inner border border-blue-100">
                    <li className="px-3 py-1 text-xs font-medium border-b border-blue-200/70 mb-1 text-blue-800">
                      Documentation
                    </li>
                    <li>
                      <Link href="/administration/instructor-performance-policy" onClick={() => setShowAdminLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <ClipboardCheck className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Instructor Performance Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/administration/evaluation-guideline" onClick={() => setShowAdminLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <CheckSquare className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Evaluation Guidelines
                      </Link>
                    </li>
                    <li>
                      <Link href="/administration/employee-handbook" onClick={() => setShowAdminLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <BookOpen className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Employee Handbook
                      </Link>
                    </li>
                    
                    <li>
                      <Link href="/administration/classroom-evaluation" onClick={() => setShowAdminLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <ClipboardCheck className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Classroom Evaluation Guide
                      </Link>
                    </li>
                    
                    <li className="px-3 py-1 text-xs font-medium border-b border-blue-200/70 mb-1 mt-2 text-blue-800">
                      System Management
                    </li>
                    <li>
                      <Link href="/admin/schedules" onClick={() => setShowAdminLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <CalendarDays className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Schedule Management
                      </Link>
                    </li>



                  </ul>
                )}
              </li>
              
              {/* Manage - dropdown */}
              <li>
                <a href="#" onClick={handleToggleManage} className={cn(
                  "flex items-center justify-between p-2 rounded-lg hover:bg-[#1334A3]/70 group transition-all relative overflow-hidden",
                  (isActive("/management") || showManageLinks) && "bg-[#1334A3]/60 font-medium text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-1 before:bg-blue-400 before:rounded-r",
                  !isActive("/management") && !showManageLinks && "text-white"
                )}>
                  <div className="flex items-center">
                    <Users className={cn("w-5 h-5 text-blue-400", collapsed ? "mx-auto" : "mr-3")} />
                    {!collapsed && <span>Manage</span>}
                  </div>
                  {!collapsed && <ChevronDown className={`w-4 h-4 text-blue-400 ${showManageLinks ? 'transform rotate-180' : ''}`} />}
                </a>
                
                {showManageLinks && !collapsed && (
                  <ul className="mt-1 space-y-0.5 overflow-hidden bg-gradient-to-b from-blue-50/90 to-white/90 rounded-lg py-1.5 mx-1.5 backdrop-blur-sm shadow-inner border border-blue-100">
                    <li className="px-3 py-1 text-xs font-medium border-b border-blue-200/70 mb-1 text-blue-800">
                      Management
                    </li>
                    <li>
                      <Link href="/management/schools" onClick={() => setShowManageLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <Building2 className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Manage Schools
                      </Link>
                    </li>
                    <li>
                      <Link href="/management/instructors" onClick={() => setShowManageLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <UserCheck className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Manage Instructors
                      </Link>
                    </li>
                    <li>
                      <Link href="/management/students" onClick={() => setShowManageLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <GraduationCap className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Manage Students
                      </Link>
                    </li>
                    <li>
                      <Link href="/management/courses" onClick={() => setShowManageLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <BookMarked className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Manage Courses
                      </Link>
                    </li>
                    <li>
                      <Link href="/administration/manage-dashboard" onClick={() => setShowManageLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <LayoutDashboard className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Manage Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/administration/users" onClick={() => setShowManageLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <UserCog className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        User Management
                      </Link>
                    </li>
                    <li>
                      <Link href="/events" onClick={() => setShowManageLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <CalendarDays className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Event Calendar
                      </Link>
                    </li>

                  </ul>
                )}
              </li>
              
              {/* Instructor Recognition - standalone tab */}
              <li>
                <Link href="/administration/instructor-recognition" className={cn(
                  "flex items-center p-2 rounded-lg hover:bg-[#1334A3]/70 group transition-all relative overflow-hidden",
                  isActive("/administration/instructor-recognition") && "bg-[#1334A3]/60 font-medium text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-1 before:bg-blue-400 before:rounded-r",
                  !isActive("/administration/instructor-recognition") && "text-white"
                )}>
                  <Award className={cn("w-5 h-5 text-blue-400", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>Instructor Recognition</span>}
                </Link>
              </li>
              
              {/* Divider */}
              {!collapsed && <li className="py-1 px-2">
                <div className="h-px bg-blue-900/30 w-full"></div>
              </li>}

              {/* Training & Development - dropdown */}
              <li>
                <a href="#" onClick={handleToggleTraining} className={cn(
                  "flex items-center justify-between p-2 rounded-lg hover:bg-[#1334A3]/70 group transition-all relative overflow-hidden",
                  (isActive("/training-development") || showTrainingLinks) && "bg-[#1334A3]/60 font-medium text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-1 before:bg-blue-400 before:rounded-r",
                  !isActive("/training-development") && !showTrainingLinks && "text-white"
                )}>
                  <div className="flex items-center">
                    <Lightbulb className={cn("w-5 h-5 text-blue-400", collapsed ? "mx-auto" : "mr-3")} />
                    {!collapsed && <span>Training</span>}
                  </div>
                  {!collapsed && <ChevronDown className={`w-4 h-4 text-blue-400 ${showTrainingLinks ? 'transform rotate-180' : ''}`} />}
                </a>
                
                {showTrainingLinks && !collapsed && (
                  <ul className="mt-1 space-y-0.5 overflow-hidden bg-gradient-to-b from-blue-50/90 to-white/90 rounded-lg py-1.5 mx-1.5 backdrop-blur-sm shadow-inner border border-blue-100">
                    <li className="px-3 py-1 text-xs font-medium border-b border-blue-200/70 mb-1 text-blue-800">
                      Leadership Resources
                    </li>
                    <li>
                      <Link href="/training-development/leadership-skills" onClick={() => setShowTrainingLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <BriefcaseBusiness className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Leadership Skills
                      </Link>
                    </li>
                    <li>
                      <Link href="/training-development/communication-techniques" onClick={() => setShowTrainingLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <MessageSquare className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Communication
                      </Link>
                    </li>
                    <li>
                      <Link href="/training-development/conflict-resolution" onClick={() => setShowTrainingLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <AlertTriangle className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Conflict Resolution
                      </Link>
                    </li>
                    <li>
                      <Link href="/training-development/decision-making" onClick={() => setShowTrainingLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <BrainCircuit className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Decision Making
                      </Link>
                    </li>
                    <li>
                      <Link href="/training-development/team-building" onClick={() => setShowTrainingLinks(false)}
                        className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-blue-200/80 text-blue-800 hover:text-blue-900 transition-all group">
                        <Users className="h-4 w-4 mr-2 text-blue-600 group-hover:text-blue-700" />
                        Team Building
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </div>
          
          {/* Version info at bottom */}
          <div className="p-4 border-t border-blue-800">
            <div className="text-xs text-blue-400 text-center">
              Version 1.2.0
            </div>
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