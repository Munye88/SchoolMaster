import React from 'react';
import { Bell, AlertCircle } from 'lucide-react';

const StaticNotifications: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border-[1px] border-gray-100 p-6">
      <h2 className="text-[#0B1D51] text-3xl font-bold mb-8">Notifications</h2>
      
      {/* Active Alerts Header */}
      <div className="flex justify-between items-center bg-[#F8FAFC] p-4 rounded-xl mb-4">
        <div className="flex items-center">
          <span className="text-[#0B1D51] text-2xl font-bold">3</span>
          <span className="text-[#0B1D51] text-xl font-bold ml-3">ACTIVE ALERTS</span>
        </div>
        <Bell className="h-6 w-6 text-[#0B1D51]" />
      </div>

      {/* Aviation notification */}
      <div className="bg-[#F8FAFC] p-4 rounded-xl mb-4">
        <span className="text-[#0B1D51] text-xl font-semibold">Aviation has 27 students enrolled</span>
        <div className="flex justify-end mt-2">
          <div className="bg-[#E3E9F7] px-4 py-1 rounded-full text-[#0B1D51] font-medium">
            Students
          </div>
        </div>
      </div>

      {/* High Enrollment 1 */}
      <div className="bg-[#F8FAFC] p-4 rounded-xl mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400 rounded-full w-6 h-6 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-white" />
          </div>
          <span className="text-[#0B1D51] text-xl font-semibold">High Enrollment</span>
        </div>
        <p className="text-[#0B1D51] text-xl mt-3">Cadets have 253 students enrolled</p>
        <div className="flex justify-between mt-2">
          <div className="bg-[#E3E9F7] px-4 py-1 rounded-full text-[#0B1D51] font-medium">
            Today
          </div>
        </div>
      </div>

      {/* High Enrollment 2 */}
      <div className="bg-[#F8FAFC] p-4 rounded-xl mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400 rounded-full w-6 h-6 flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-white" />
          </div>
          <span className="text-[#0B1D51] text-xl font-semibold">High Enrollment</span>
        </div>
        <p className="text-[#0B1D51] text-xl mt-3">Refresher has 93 students enrolled</p>
        <div className="flex justify-between mt-2">
          <div className="bg-[#E3E9F7] px-4 py-1 rounded-full text-[#0B1D51] font-medium">
            Today
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticNotifications;