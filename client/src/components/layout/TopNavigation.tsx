import { useSchool } from "@/hooks/useSchool";
import { Menu, Bell, Settings, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const TopNavigation = () => {
  const { selectedSchool, currentSchool } = useSchool();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    
    // Toggle sidebar visibility
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('-translate-x-full');
    }
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Mobile Menu Toggle Button */}
        <button className="text-[#0A2463] lg:hidden" onClick={toggleMobileMenu}>
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Page Title */}
        <h1 className="text-xl font-bold text-[#0A2463] hidden lg:block">
          {selectedSchool ? `${currentSchool?.name} Dashboard` : 'Dashboard'}
        </h1>
        
        {/* Right Side Items */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Input 
              type="text" 
              placeholder="Search..." 
              className="bg-gray-100 py-2 px-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3E92CC] focus:border-transparent"
            />
            <Search className="h-5 w-5 absolute right-3 top-2.5 text-gray-400" />
          </div>
          
          {/* Notifications */}
          <button className="relative p-1 text-[#0A2463]">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>
          
          {/* Settings */}
          <button className="p-1 text-[#0A2463]">
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
