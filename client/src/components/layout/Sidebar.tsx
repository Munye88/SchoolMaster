import { useSchool } from "@/hooks/useSchool";
import { Link, useLocation } from "wouter";
import { 
  Home, School, Users, BookOpen, GraduationCap, ListChecks, 
  BarChart2, FileText, ChevronDown, ChevronUp, Settings, 
  Calendar, BookIcon, Clock, CalendarDays, ClipboardList, UserSquare,
  Clipboard, CheckSquare
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [location] = useLocation();
  const { schools, selectedSchool, setSelectedSchool } = useSchool();
  const [schoolsExpanded, setSchoolsExpanded] = useState(true);
  const [adminExpanded, setAdminExpanded] = useState(false);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);
  
  const handleSchoolSelect = (schoolCode: string) => {
    setSelectedSchool(schoolCode);
    
    // Toggle expansion of school documents
    if (expandedSchool === schoolCode) {
      setExpandedSchool(null);
    } else {
      setExpandedSchool(schoolCode);
    }
  };
  
  const isActive = (path: string) => {
    return location === path || location.startsWith(path + "/");
  };

  return (
    <aside className="w-64 bg-[#0A2463] text-white h-full flex-shrink-0 fixed lg:relative z-20 transition-all duration-300" id="sidebar">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-[#1A3473]">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0A2463] font-bold">
              SMS
            </div>
            <span className="ml-3 font-bold text-xl">School Manager</span>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <ul>
            {/* Dashboard Link */}
            <li className="mb-1">
              <Link href="/" className={cn(
                "flex items-center px-4 py-3 text-white hover:bg-[#1A3473] rounded-r-md ml-2 transition-colors duration-200",
                isActive("/") && "bg-[#1A3473]"
              )}>
                <Home className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
            </li>
            
            {/* Schools Section */}
            <li className="mt-6 mb-2 px-4">
              <button 
                onClick={() => setSchoolsExpanded(!schoolsExpanded)}
                className="flex items-center justify-between w-full text-xs uppercase tracking-wider text-gray-300 font-semibold"
              >
                <span>Schools</span>
                {schoolsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </li>
            
            {schoolsExpanded && schools.map(school => (
              <li className="mb-1" key={school.id}>
                <div>
                  <button
                    onClick={() => handleSchoolSelect(school.code)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 text-white hover:bg-[#1A3473] rounded-r-md ml-2 transition-colors duration-200 w-full text-left",
                      (selectedSchool === school.code || expandedSchool === school.code) && "bg-[#1A3473]"
                    )}
                  >
                    <div className="flex items-center">
                      <School className="h-5 w-5 mr-3" />
                      <span>{school.name}</span>
                    </div>
                    {expandedSchool === school.code ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {/* School specific documents */}
                  {expandedSchool === school.code && (
                    <ul className="pl-10 py-1">
                      <li className="mb-1">
                        <Link href={`/schools/${school.code}/instructor-profiles`} className={cn(
                          "flex items-center py-2 text-sm text-white hover:text-blue-200 transition-colors duration-200",
                          isActive(`/schools/${school.code}/instructor-profiles`) && "text-blue-200"
                        )}>
                          <UserSquare className="h-4 w-4 mr-2" />
                          Instructor Profiles
                        </Link>
                      </li>
                      <li className="mb-1">
                        <Link href={`/schools/${school.code}/timetable`} className={cn(
                          "flex items-center py-2 text-sm text-white hover:text-blue-200 transition-colors duration-200",
                          isActive(`/schools/${school.code}/timetable`) && "text-blue-200"
                        )}>
                          <Clock className="h-4 w-4 mr-2" />
                          Timetable
                        </Link>
                      </li>
                      
                      {/* KNFA specific - Student Day Schedule */}
                      {school.code === "KNFA" && (
                        <li className="mb-1">
                          <Link href="/schools/KNFA/student-day-schedule" className={cn(
                            "flex items-center py-2 text-sm text-white hover:text-blue-200 transition-colors duration-200",
                            isActive("/schools/KNFA/student-day-schedule") && "text-blue-200"
                          )}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Student Day Schedule
                          </Link>
                        </li>
                      )}
                      
                      <li className="mb-1">
                        <Link href={`/schools/${school.code}/yearly-schedule`} className={cn(
                          "flex items-center py-2 text-sm text-white hover:text-blue-200 transition-colors duration-200",
                          isActive(`/schools/${school.code}/yearly-schedule`) && "text-blue-200"
                        )}>
                          <CalendarDays className="h-4 w-4 mr-2" />
                          Yearly Schedule
                        </Link>
                      </li>
                      <li className="mb-1">
                        <Link href={`/schools/${school.code}/sop`} className={cn(
                          "flex items-center py-2 text-sm text-white hover:text-blue-200 transition-colors duration-200",
                          isActive(`/schools/${school.code}/sop`) && "text-blue-200"
                        )}>
                          <ClipboardList className="h-4 w-4 mr-2" />
                          Standard Operating Procedure
                        </Link>
                      </li>
                      <li className="mb-1">
                        <Link href={`/schools/${school.code}/staff-evaluations`} className={cn(
                          "flex items-center py-2 text-sm text-white hover:text-blue-200 transition-colors duration-200",
                          isActive(`/schools/${school.code}/staff-evaluations`) && "text-blue-200"
                        )}>
                          <Clipboard className="h-4 w-4 mr-2" />
                          Staff Evaluations
                        </Link>
                      </li>
                      <li className="mb-1">
                        <Link href={`/schools/${school.code}/staff-attendance`} className={cn(
                          "flex items-center py-2 text-sm text-white hover:text-blue-200 transition-colors duration-200",
                          isActive(`/schools/${school.code}/staff-attendance`) && "text-blue-200"
                        )}>
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Staff Attendance
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
              </li>
            ))}
            
            {/* Categories Section */}
            <li className="mt-6 mb-2 px-4">
              <h3 className="text-xs uppercase tracking-wider text-gray-300 font-semibold">Categories</h3>
            </li>
            
            {/* Administration Section */}
            <li className="mb-1">
              <button 
                onClick={() => setAdminExpanded(!adminExpanded)}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-3 text-white hover:bg-[#1A3473] rounded-r-md ml-2 transition-colors duration-200",
                  (isActive("/administration") || adminExpanded) && "bg-[#1A3473]"
                )}
              >
                <div className="flex items-center">
                  <Settings className="h-5 w-5 mr-3" />
                  <span>Administration</span>
                </div>
                {adminExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {adminExpanded && (
                <ul className="pl-10 py-1">
                  <li className="mb-1">
                    <Link href="/administration/company-policy" className={cn(
                      "flex items-center py-2 text-sm text-white hover:text-blue-200 transition-colors duration-200",
                      isActive("/administration/company-policy") && "text-blue-200"
                    )}>
                      Company Policy
                    </Link>
                  </li>
                  <li className="mb-1">
                    <Link href="/administration/evaluation-guideline" className={cn(
                      "flex items-center py-2 text-sm text-white hover:text-blue-200 transition-colors duration-200",
                      isActive("/administration/evaluation-guideline") && "text-blue-200"
                    )}>
                      Instructor Evaluation Guideline
                    </Link>
                  </li>
                  <li className="mb-1">
                    <Link href="/administration/employee-handbook" className={cn(
                      "flex items-center py-2 text-sm text-white hover:text-blue-200 transition-colors duration-200",
                      isActive("/administration/employee-handbook") && "text-blue-200"
                    )}>
                      Employee Handbook
                    </Link>
                  </li>
                  <li className="mb-1">
                    <Link href="/administration/performance-policy" className={cn(
                      "flex items-center py-2 text-sm text-white hover:text-blue-200 transition-colors duration-200",
                      isActive("/administration/performance-policy") && "text-blue-200"
                    )}>
                      Performance Evaluation Policy
                    </Link>
                  </li>
                  <li className="mb-1">
                    <Link href="/administration/classroom-evaluation" className={cn(
                      "flex items-center py-2 text-sm text-white hover:text-blue-200 transition-colors duration-200",
                      isActive("/administration/classroom-evaluation") && "text-blue-200"
                    )}>
                      Training Guide Classroom Evaluation
                    </Link>
                  </li>
                </ul>
              )}
            </li>
            
            {/* Courses */}
            <li className="mb-1">
              <Link href="/courses" className={cn(
                "flex items-center px-4 py-3 text-white hover:bg-[#1A3473] rounded-r-md ml-2 transition-colors duration-200",
                isActive("/courses") && "bg-[#1A3473]"
              )}>
                <BookOpen className="h-5 w-5 mr-3" />
                Courses
              </Link>
            </li>
            
            {/* Test Tracker */}
            <li className="mb-1">
              <Link href="/test-tracker" className={cn(
                "flex items-center px-4 py-3 text-white hover:bg-[#1A3473] rounded-r-md ml-2 transition-colors duration-200",
                isActive("/test-tracker") && "bg-[#1A3473]"
              )}>
                <ListChecks className="h-5 w-5 mr-3" />
                Test Tracker
              </Link>
            </li>
            
            {/* Reports */}
            <li className="mb-1">
              <Link href="/reports" className={cn(
                "flex items-center px-4 py-3 text-white hover:bg-[#1A3473] rounded-r-md ml-2 transition-colors duration-200",
                isActive("/reports") && "bg-[#1A3473]"
              )}>
                <BarChart2 className="h-5 w-5 mr-3" />
                Reports
              </Link>
            </li>
            
            {/* Students */}
            <li className="mb-1">
              <Link href="/students" className={cn(
                "flex items-center px-4 py-3 text-white hover:bg-[#1A3473] rounded-r-md ml-2 transition-colors duration-200",
                isActive("/students") && "bg-[#1A3473]"
              )}>
                <GraduationCap className="h-5 w-5 mr-3" />
                Students
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* User Profile Section */}
        <div className="p-4 border-t border-[#1A3473]">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[#3E92CC] text-white flex items-center justify-center font-bold">
              AD
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-gray-300">admin@schoolsystem.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
