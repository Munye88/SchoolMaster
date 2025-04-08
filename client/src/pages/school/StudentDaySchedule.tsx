import React from "react";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Printer } from "lucide-react";

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
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">Naval Forces Schools</CardTitle>
          <div className="text-center text-xl font-bold">English Language School</div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-3 bg-gray-50 text-center font-semibold">Days</th>
                  <th className="border border-gray-300 p-3 bg-gray-50 text-center font-semibold">Georgian Date</th>
                  <th className="border border-gray-300 p-3 bg-gray-50 text-center font-semibold">Hijri Date</th>
                  <th className="border border-gray-300 p-3 bg-gray-50 text-center font-semibold">Student Day</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3 text-center">Thursday</td>
                  <td className="border border-gray-300 p-3 text-center">October 3, 2024</td>
                  <td className="border border-gray-300 p-3 text-center">30/03/1446</td>
                  <td className="border border-gray-300 p-3 text-center bg-blue-100" rowSpan={6}>Student Days</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 text-center">Thursday</td>
                  <td className="border border-gray-300 p-3 text-center">October 31, 2024</td>
                  <td className="border border-gray-300 p-3 text-center">28/04/1446</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 text-center">Thursday</td>
                  <td className="border border-gray-300 p-3 text-center">November 28, 2024</td>
                  <td className="border border-gray-300 p-3 text-center">26/05/1446</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 text-center">Thursday</td>
                  <td className="border border-gray-300 p-3 text-center">December 26, 2024</td>
                  <td className="border border-gray-300 p-3 text-center">25/06/1446</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 text-center">Thursday</td>
                  <td className="border border-gray-300 p-3 text-center">January 30, 2025</td>
                  <td className="border border-gray-300 p-3 text-center">30/07/1446</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 text-center">Sunday</td>
                  <td className="border border-gray-300 p-3 text-center">February 23, 2025</td>
                  <td className="border border-gray-300 p-3 text-center">24/08/1446</td>
                  <td className="border border-gray-300 p-3 text-center bg-green-200">Founding Day</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 text-center">Thursday</td>
                  <td className="border border-gray-300 p-3 text-center">May 1, 2025</td>
                  <td className="border border-gray-300 p-3 text-center">03/11/1446</td>
                  <td className="border border-gray-300 p-3 text-center">Student Day</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 text-center bg-gray-200" colSpan={4}>
                    <div className="text-center font-bold py-2">RAMADAN BREAK</div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 text-center" colSpan={2}>March 20, 2025 - April 5, 2025</td>
                  <td className="border border-gray-300 p-3 text-center" colSpan={2}>20/09/1446 - 07/10/1446</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 text-center font-medium">Return to work:</td>
                  <td className="border border-gray-300 p-3 text-center">April 6, 2025</td>
                  <td className="border border-gray-300 p-3 text-center" colSpan={2}>08/10/1446</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 text-center font-medium">Eid Al Adha:</td>
                  <td className="border border-gray-300 p-3 text-center">May 29, 2025- June 14, 2025</td>
                  <td className="border border-gray-300 p-3 text-center" colSpan={2}>02/12/1446 - 18/12/1446</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 text-center font-medium">Return to work:</td>
                  <td className="border border-gray-300 p-3 text-center">June 15, 2025</td>
                  <td className="border border-gray-300 p-3 text-center" colSpan={2}>19/12/1446</td>
                </tr>
              </tbody>
            </table>
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
      
      <Card>
        <CardHeader>
          <CardTitle>Original Schedule Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="max-w-4xl w-full overflow-hidden rounded-lg shadow-md">
              <img 
                src="/student-day-schedule.jpg" 
                alt="Student Day Schedule" 
                className="w-full object-contain" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolStudentDaySchedule;