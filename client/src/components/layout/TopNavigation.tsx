import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, Users, BookOpen, Calendar, BarChart2, Settings, 
  ChevronDown, Menu, X, Bell, User, LogOut, Search,
  GraduationCap, FileText, Activity, Wrench, Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSchool } from "@/hooks/useSchool";
import { cn } from "@/lib/utils";

export default function TopNavigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { user, logoutMutation } = useAuth();
  const { selectedSchool, setSelectedSchool, schools } = useSchool();

  const isActive = (path: string) => location === path || location.startsWith(path);

  const navigationItems = [
    { 
      label: "Dashboard", 
      path: "/", 
      icon: Home,
      exact: true
    },
    {
      label: "Schools",
      icon: Building,
      dropdown: [
        { label: "KFNA", path: "/schools/KFNA" },
        { label: "NFS East", path: "/schools/NFS_EAST" },
        { label: "NFS West", path: "/schools/NFS_WEST" },
      ]
    },
    {
      label: "Management",
      icon: Users,
      dropdown: [
        { label: "Schools", path: "/management/schools" },
        { label: "Instructors", path: "/management/instructors" },
        { label: "Students", path: "/management/students" },
        { label: "Courses", path: "/management/courses" },
      ]
    },
    {
      label: "DLI Inventory",
      icon: BookOpen,
      dropdown: [
        { label: "Book Order", path: "/dli/book-order" },
        { label: "ALCPT Order", path: "/dli/alcpt-order" },
        { label: "Answer Sheets", path: "/dli/answer-sheets" },
      ]
    },
    {
      label: "Administration",
      icon: Settings,
      dropdown: [
        { label: "Instructor Performance Policy", path: "/administration/instructor-performance-policy" },
        { label: "Evaluation Guidelines", path: "/administration/evaluation-guideline" },
        { label: "Employee Handbook", path: "/administration/employee-handbook" },
        { label: "Document Manager", path: "/administration/document-manager" },
        { label: "Schedule Management", path: "/admin/schedules" },
      ]
    },
    { 
      label: "Test Tracker", 
      path: "/test-tracker", 
      icon: GraduationCap 
    },
    { 
      label: "Reports", 
      path: "/reports", 
      icon: BarChart2 
    },
    {
      label: "Activity",
      icon: Activity,
      dropdown: [
        { label: "Action Log", path: "/action-log" },
        { label: "Quarterly Check-ins", path: "/quarterly-checkins" },
      ]
    },
  ];

  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-[#2563EB] shadow-lg sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 bg-[#2a4178]">
        <div className="flex justify-between items-center h-16 text-[13px] bg-[#132d6a]">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-400 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-bold hidden md:block text-[13px]">
                GOVCIO-SAMS ELT
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <div key={item.label} className="relative">
                {item.dropdown ? (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      className={cn(
                        "text-white hover:bg-blue-700 px-3 py-2 flex items-center space-x-1",
                        item.dropdown.some(dropItem => isActive(dropItem.path)) && "bg-blue-700"
                      )}
                      onClick={() => handleDropdownToggle(item.label)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    
                    {activeDropdown === item.label && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-40 bg-white shadow-lg border border-gray-200 py-1 z-50 rounded-none">
                        {item.dropdown.map((dropItem) => (
                          <Link
                            key={dropItem.path}
                            href={dropItem.path}
                            className={cn(
                              "block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 text-center",
                              isActive(dropItem.path) && "bg-blue-50 text-blue-700"
                            )}
                            onClick={() => setActiveDropdown(null)}
                          >
                            {dropItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={item.path}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "text-white hover:bg-blue-700 px-3 py-2 flex items-center space-x-1",
                        (item.exact ? location === item.path : isActive(item.path)) && "bg-blue-700"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-2">
            {/* School Selector */}
            {selectedSchool && (
              <div className="hidden md:block text-white text-sm px-3 py-1 bg-blue-700">
                {selectedSchool.name}
              </div>
            )}

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                className="text-white hover:bg-blue-700 flex items-center space-x-2"
                onClick={() => handleDropdownToggle('user')}
              >
                <User className="h-4 w-4" />
                <span className="hidden md:block">{user?.username}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
              
              {activeDropdown === 'user' && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 text-sm text-gray-700 border-b text-center">
                    Signed in as <strong>{user?.username}</strong>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              className="lg:hidden text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden border-t border-blue-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <div key={item.label}>
                  {item.dropdown ? (
                    <div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-blue-700 px-3 py-2"
                        onClick={() => handleDropdownToggle(`mobile-${item.label}`)}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.label}
                        <ChevronDown className="h-3 w-3 ml-auto" />
                      </Button>
                      
                      {activeDropdown === `mobile-${item.label}` && (
                        <div className="ml-4 space-y-1">
                          {item.dropdown.map((dropItem) => (
                            <Link
                              key={dropItem.path}
                              href={dropItem.path}
                              className={cn(
                                "block px-3 py-3 text-sm text-white hover:bg-blue-700 text-center",
                                isActive(dropItem.path) && "bg-blue-700"
                              )}
                              onClick={() => {
                                setIsOpen(false);
                                setActiveDropdown(null);
                              }}
                            >
                              {dropItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link href={item.path}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-white hover:bg-blue-700 px-3 py-2",
                          (item.exact ? location === item.path : isActive(item.path)) && "bg-blue-700"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Overlay for dropdowns */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40 ml-[1px] mr-[1px] mt-[3px] mb-[3px] pt-[3px] pb-[3px] pl-[3px] pr-[3px]"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </nav>
  );
}