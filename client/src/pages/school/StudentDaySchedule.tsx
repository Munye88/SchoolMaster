import React from "react";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Printer } from "lucide-react";
import studentDayScheduleImage from "@assets/download.jpg";

const SchoolStudentDaySchedule = () => {
  const { currentSchool } = useSchool();
  
  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {currentSchool ? `${currentSchool.name} Student Day Schedule` : 'Student Day Schedule'}
          </h1>
          <p className="text-gray-500">View academic calendar and student schedule</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 size={16} /> Share
          </Button>
          <Button variant="outline" className="gap-2">
            <Printer size={16} /> Print
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="w-full overflow-hidden">
            <img 
              src={studentDayScheduleImage} 
              alt="Student Day Schedule" 
              className="w-full object-contain" 
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Important Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                <span className="font-medium">Student Days Begin</span>
                <span>October 3, 2024</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-md">
                <span className="font-medium">Founding Day</span>
                <span>February 23, 2025 (24/08/1446)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-md">
                <span className="font-medium">Ramadan Break</span>
                <span>March 20 - April 5, 2025</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-md">
                <span className="font-medium">Eid Al Adha</span>
                <span>May 29 - June 14, 2025</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-md">
                <span className="font-medium">Final Student Day</span>
                <span>May 1, 2025</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Calendar Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Return to Work Dates</h4>
                <div className="pl-3 space-y-2">
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded-md">
                    <span>After Ramadan</span>
                    <span>April 6, 2025 (08/10/1446)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded-md">
                    <span>After Eid Al Adha</span>
                    <span>June 15, 2025 (19/12/1446)</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Calendar Notes</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Student days are typically on Thursdays</li>
                  <li>Founding Day falls on Sunday, February 23, 2025</li>
                  <li>All dates follow both Georgian and Hijri calendars</li>
                  <li>Schedule is subject to change based on official announcements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      

    </div>
  );
};

export default SchoolStudentDaySchedule;