import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

const QuickLinks: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border-[1px] border-gray-100 p-6">
      <h2 className="text-[#0B1D51] text-3xl font-bold mb-8">Quick Links</h2>
      
      {/* Instructor Lookup Link */}
      <Link href="/instructor-lookup">
        <div className="flex items-center justify-between py-6 cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-xl bg-purple-50 flex items-center justify-center mr-5">
              <svg className="w-9 h-9 text-purple-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14.5C7.58172 14.5 4 17.5817 4 22H20C20 17.5817 16.4183 14.5 12 14.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[#0B1D51] text-3xl font-semibold">Instructor Lookup</span>
          </div>
          <ChevronRight className="h-6 w-6 text-gray-400" />
        </div>
      </Link>
      
      <div className="border-b border-gray-100"></div>
      
      {/* Course Management Link */}
      <Link href="/courses">
        <div className="flex items-center justify-between py-6 cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center mr-5">
              <svg className="w-9 h-9 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[#0B1D51] text-3xl font-semibold">Course Management</span>
          </div>
          <ChevronRight className="h-6 w-6 text-gray-400" />
        </div>
      </Link>
    </div>
  );
};

export default QuickLinks;