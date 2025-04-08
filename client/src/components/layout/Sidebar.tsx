import { useSchool } from "@/hooks/useSchool";
import { Link, useLocation } from "wouter";
import { 
  Home, School, Users, BookOpen, GraduationCap, ListChecks, 
  BarChart2, FileText, ChevronDown, ChevronUp
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [location] = useLocation();
  const { schools, selectedSchool, setSelectedSchool } = useSchool();
  const [schoolsExpanded, setSchoolsExpanded] = useState(true);
  
  const handleSchoolSelect = (schoolCode: string) => {
    setSelectedSchool(schoolCode);
  };
  
  const isActive = (path: string) => {
    return location === path;
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
              <Link href="/">
                <a className={cn(
                  "flex items-center px-4 py-3 text-white hover:bg-[#1A3473] rounded-r-md ml-2 transition-colors duration-200",
                  isActive("/") && "bg-[#1A3473]"
                )}>
                  <Home className="h-5 w-5 mr-3" />
                  Dashboard
                </a>
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
                <button
                  onClick={() => handleSchoolSelect(school.code)}
                  className={cn(
                    "flex items-center px-4 py-3 text-white hover:bg-[#1A3473] rounded-r-md ml-2 transition-colors duration-200 w-full text-left",
                    selectedSchool === school.code && "bg-[#1A3473]"
                  )}
                >
                  <School className="h-5 w-5 mr-3" />
                  {school.name}
                </button>
              </li>
            ))}
            
            {/* Features Section */}
            <li className="mt-6 mb-2 px-4">
              <h3 className="text-xs uppercase tracking-wider text-gray-300 font-semibold">Features</h3>
            </li>
            
            {/* Instructors */}
            <li className="mb-1">
              <Link href="/instructors">
                <a className={cn(
                  "flex items-center px-4 py-3 text-white hover:bg-[#1A3473] rounded-r-md ml-2 transition-colors duration-200",
                  isActive("/instructors") && "bg-[#1A3473]"
                )}>
                  <Users className="h-5 w-5 mr-3" />
                  Instructors
                </a>
              </Link>
            </li>
            
            {/* Courses */}
            <li className="mb-1">
              <Link href="/courses">
                <a className={cn(
                  "flex items-center px-4 py-3 text-white hover:bg-[#1A3473] rounded-r-md ml-2 transition-colors duration-200",
                  isActive("/courses") && "bg-[#1A3473]"
                )}>
                  <BookOpen className="h-5 w-5 mr-3" />
                  Courses
                </a>
              </Link>
            </li>
            
            {/* Students */}
            <li className="mb-1">
              <Link href="/students">
                <a className={cn(
                  "flex items-center px-4 py-3 text-white hover:bg-[#1A3473] rounded-r-md ml-2 transition-colors duration-200",
                  isActive("/students") && "bg-[#1A3473]"
                )}>
                  <GraduationCap className="h-5 w-5 mr-3" />
                  Students
                </a>
              </Link>
            </li>
            
            {/* Test Tracker */}
            <li className="mb-1">
              <Link href="/test-tracker">
                <a className={cn(
                  "flex items-center px-4 py-3 text-white hover:bg-[#1A3473] rounded-r-md ml-2 transition-colors duration-200",
                  isActive("/test-tracker") && "bg-[#1A3473]"
                )}>
                  <ListChecks className="h-5 w-5 mr-3" />
                  Test Tracker
                </a>
              </Link>
            </li>
            
            {/* Reports */}
            <li className="mb-1">
              <Link href="/reports">
                <a className={cn(
                  "flex items-center px-4 py-3 text-white hover:bg-[#1A3473] rounded-r-md ml-2 transition-colors duration-200",
                  isActive("/reports") && "bg-[#1A3473]"
                )}>
                  <BarChart2 className="h-5 w-5 mr-3" />
                  Reports
                </a>
              </Link>
            </li>
            
            {/* Documents */}
            <li className="mb-1">
              <Link href="/documents">
                <a className={cn(
                  "flex items-center px-4 py-3 text-white hover:bg-[#1A3473] rounded-r-md ml-2 transition-colors duration-200",
                  isActive("/documents") && "bg-[#1A3473]"
                )}>
                  <FileText className="h-5 w-5 mr-3" />
                  Documents
                </a>
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
