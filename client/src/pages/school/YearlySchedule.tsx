import React from "react";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2, CalendarDays, FileSpreadsheet } from "lucide-react";

const SchoolYearlySchedule = () => {
  const { currentSchool } = useSchool();
  
  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {currentSchool ? `${currentSchool.name} Yearly Schedule` : 'Yearly Schedule'}
          </h1>
          <p className="text-gray-500">View annual academic calendar and events</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 size={16} /> Share
          </Button>
          <Button className="bg-[#0A2463] hover:bg-[#071A4A] gap-2">
            <FileSpreadsheet size={16} /> PowerBI Dashboard
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-2xl font-bold">Naval Forces Schools</CardTitle>
          <p className="text-lg font-medium">Academic Year 2024-2025</p>
          <p className="text-base text-gray-500">English Language Training Program</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#0A2463] text-white">
                  <th className="border border-gray-300 p-3">Quarter</th>
                  <th className="border border-gray-300 p-3">Dates</th>
                  <th className="border border-gray-300 p-3">Events</th>
                  <th className="border border-gray-300 p-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {/* Fall Quarter 2024 */}
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 p-3 font-bold" rowSpan={5}>
                    Fall Quarter<br />(August - November 2024)
                  </td>
                  <td className="border border-gray-300 p-3">August 15, 2024</td>
                  <td className="border border-gray-300 p-3">Academic Staff Return</td>
                  <td className="border border-gray-300 p-3">Pre-term preparation</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 p-3">August 28, 2024</td>
                  <td className="border border-gray-300 p-3">First Day of Classes</td>
                  <td className="border border-gray-300 p-3">New student orientation</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 p-3">September 23, 2024</td>
                  <td className="border border-gray-300 p-3">National Day Holiday</td>
                  <td className="border border-gray-300 p-3">No classes</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 p-3">October 3, 2024</td>
                  <td className="border border-gray-300 p-3">Student Day</td>
                  <td className="border border-gray-300 p-3">Special activities</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 p-3">October 31, 2024</td>
                  <td className="border border-gray-300 p-3">Student Day</td>
                  <td className="border border-gray-300 p-3">End of quarter assessment</td>
                </tr>
                
                {/* Winter Quarter 2024-2025 */}
                <tr className="bg-purple-50">
                  <td className="border border-gray-300 p-3 font-bold" rowSpan={4}>
                    Winter Quarter<br />(November 2024 - February 2025)
                  </td>
                  <td className="border border-gray-300 p-3">November 28, 2024</td>
                  <td className="border border-gray-300 p-3">Student Day</td>
                  <td className="border border-gray-300 p-3">Mid-year progress review</td>
                </tr>
                <tr className="bg-purple-50">
                  <td className="border border-gray-300 p-3">December 26, 2024</td>
                  <td className="border border-gray-300 p-3">Student Day</td>
                  <td className="border border-gray-300 p-3">Winter quarter assessment</td>
                </tr>
                <tr className="bg-purple-50">
                  <td className="border border-gray-300 p-3">January 30, 2025</td>
                  <td className="border border-gray-300 p-3">Student Day</td>
                  <td className="border border-gray-300 p-3">Advanced language practice</td>
                </tr>
                <tr className="bg-purple-50">
                  <td className="border border-gray-300 p-3">February 23, 2025</td>
                  <td className="border border-gray-300 p-3">Founding Day</td>
                  <td className="border border-gray-300 p-3">National holiday, no classes</td>
                </tr>
                
                {/* Spring Quarter 2025 */}
                <tr className="bg-green-50">
                  <td className="border border-gray-300 p-3 font-bold" rowSpan={4}>
                    Spring Quarter<br />(March - June 2025)
                  </td>
                  <td className="border border-gray-300 p-3">March 20 - April 5, 2025</td>
                  <td className="border border-gray-300 p-3">Ramadan Break</td>
                  <td className="border border-gray-300 p-3">No classes</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border border-gray-300 p-3">April 6, 2025</td>
                  <td className="border border-gray-300 p-3">Classes Resume</td>
                  <td className="border border-gray-300 p-3">Return to work after Ramadan</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border border-gray-300 p-3">May 1, 2025</td>
                  <td className="border border-gray-300 p-3">Student Day</td>
                  <td className="border border-gray-300 p-3">Final student day</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border border-gray-300 p-3">May 29 - June 14, 2025</td>
                  <td className="border border-gray-300 p-3">Eid Al Adha Break</td>
                  <td className="border border-gray-300 p-3">No classes</td>
                </tr>
                
                {/* Summer Quarter 2025 */}
                <tr className="bg-amber-50">
                  <td className="border border-gray-300 p-3 font-bold" rowSpan={2}>
                    Summer Quarter<br />(June - August 2025)
                  </td>
                  <td className="border border-gray-300 p-3">June 15, 2025</td>
                  <td className="border border-gray-300 p-3">Summer Term Begins</td>
                  <td className="border border-gray-300 p-3">Return to work after Eid Al Adha</td>
                </tr>
                <tr className="bg-amber-50">
                  <td className="border border-gray-300 p-3">August 15, 2025</td>
                  <td className="border border-gray-300 p-3">End of Academic Year</td>
                  <td className="border border-gray-300 p-3">Completion of 2024-2025 year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" /> Key Academic Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Academic Year Start:</span>
                <span>August 28, 2024</span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">First Student Day:</span>
                <span>October 3, 2024</span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Founding Day:</span>
                <span>February 23, 2025</span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Ramadan Break:</span>
                <span>March 20 - April 5, 2025</span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Final Student Day:</span>
                <span>May 1, 2025</span>
              </li>
              <li className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Eid Al Adha Break:</span>
                <span>May 29 - June 14, 2025</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="font-medium">Academic Year End:</span>
                <span>August 15, 2025</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Calendar Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Student Days</h4>
                <ul className="list-disc ml-5 text-gray-700 space-y-1">
                  <li>Student days are scheduled for: Oct 3, Oct 31, Nov 28, Dec 26, Jan 30, and May 1</li>
                  <li>Each student day features specialized activities and assessments</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Holidays & Breaks</h4>
                <ul className="list-disc ml-5 text-gray-700 space-y-1">
                  <li>National Day: September 23, 2024</li>
                  <li>Founding Day: February 23, 2025</li>
                  <li>Ramadan Break: March 20 - April 5, 2025</li>
                  <li>Eid Al Adha Break: May 29 - June 14, 2025</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Important Notes</h4>
                <ul className="list-disc ml-5 text-gray-700 space-y-1">
                  <li>All dates correspond to both Georgian and Hijri calendars</li>
                  <li>Academic staff return 2 weeks prior to class start</li>
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

export default SchoolYearlySchedule;