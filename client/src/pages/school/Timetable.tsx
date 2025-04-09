import React, { useState } from "react";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Share2, Printer, Clock, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SchoolTimetable = () => {
  const { currentSchool } = useSchool();
  const [activeTab, setActiveTab] = useState("aviation");
  
  // Only show Aviation and Enlisted timetables for KNFA school
  const isKNFA = currentSchool?.code === "KNFA";
  
  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {currentSchool ? `${currentSchool.name} Timetable` : 'Timetable'}
          </h1>
          <p className="text-gray-500">View and manage course schedules</p>
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
      
      {isKNFA ? (
        <Tabs 
          defaultValue="aviation" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="flex justify-center mb-4">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="aviation" className="flex items-center gap-2">
                <Clock size={16} /> Aviation Officers
              </TabsTrigger>
              <TabsTrigger value="enlisted" className="flex items-center gap-2">
                <Users size={16} /> Enlisted
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="aviation" className="mt-4">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold">Naval Forces Schools</CardTitle>
                <div className="text-lg font-medium">English Language School</div>
                <div className="text-lg font-medium">King Abdul-Aziz Naval Base</div>
                <div className="text-base">Jubail, Saudi Arabia</div>
                <div className="mt-4 text-xl font-bold">AVIATION OFFICERS SCHEDULE</div>
                <div className="text-base">28 AUGUST 2024</div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-3">1st Period</td>
                        <td className="border border-gray-300 p-3 text-center">0730</td>
                        <td className="border border-gray-300 p-3 text-center">0815</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Break</td>
                        <td className="border border-gray-300 p-3 text-center">0815</td>
                        <td className="border border-gray-300 p-3 text-center">0820</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">2nd Period</td>
                        <td className="border border-gray-300 p-3 text-center">0820</td>
                        <td className="border border-gray-300 p-3 text-center">0905</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Long Break</td>
                        <td className="border border-gray-300 p-3 text-center">0905</td>
                        <td className="border border-gray-300 p-3 text-center">0925</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">3rd Period</td>
                        <td className="border border-gray-300 p-3 text-center">0925</td>
                        <td className="border border-gray-300 p-3 text-center">1010</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Break</td>
                        <td className="border border-gray-300 p-3 text-center">1010</td>
                        <td className="border border-gray-300 p-3 text-center">1015</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">4th Period</td>
                        <td className="border border-gray-300 p-3 text-center">1015</td>
                        <td className="border border-gray-300 p-3 text-center">1100</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Break</td>
                        <td className="border border-gray-300 p-3 text-center">1100</td>
                        <td className="border border-gray-300 p-3 text-center">1105</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">5th Period</td>
                        <td className="border border-gray-300 p-3 text-center">1105</td>
                        <td className="border border-gray-300 p-3 text-center">1145</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Prayer Break</td>
                        <td className="border border-gray-300 p-3 text-center">1145</td>
                        <td className="border border-gray-300 p-3 text-center">1205</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">6th Period</td>
                        <td className="border border-gray-300 p-3 text-center">1210</td>
                        <td className="border border-gray-300 p-3 text-center">1250</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 text-gray-700 italic">
                  *Period six is an additional period that will be used only when needed.
                </div>
                <div className="mt-8 flex justify-end">
                  <div className="text-right">
                    <div className="mb-1">____________________________________</div>
                    <div>Zeiad M. Alrajhi, CAPT</div>
                    <div>ELS Commander</div>
                    <div>Naval Forces Schools Jubail</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="enlisted" className="mt-4">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold">Naval Forces Schools</CardTitle>
                <div className="text-lg font-medium">English Language School</div>
                <div className="text-lg font-medium">King Abdul-Aziz Naval Base</div>
                <div className="text-base">Jubail, Saudi Arabia</div>
                <div className="mt-4 text-xl font-bold">ENLISTED SCHEDULE</div>
                <div className="text-base">28 AUGUST 2024</div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-3">1st Period</td>
                        <td className="border border-gray-300 p-3 text-center">0730</td>
                        <td className="border border-gray-300 p-3 text-center">0815</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Break</td>
                        <td className="border border-gray-300 p-3 text-center">0815</td>
                        <td className="border border-gray-300 p-3 text-center">0820</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">2nd Period</td>
                        <td className="border border-gray-300 p-3 text-center">0820</td>
                        <td className="border border-gray-300 p-3 text-center">0905</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Break</td>
                        <td className="border border-gray-300 p-3 text-center">0905</td>
                        <td className="border border-gray-300 p-3 text-center">0910</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">3rd Period</td>
                        <td className="border border-gray-300 p-3 text-center">0910</td>
                        <td className="border border-gray-300 p-3 text-center">0955</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Long Break</td>
                        <td className="border border-gray-300 p-3 text-center">0955</td>
                        <td className="border border-gray-300 p-3 text-center">1015</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">4th Period</td>
                        <td className="border border-gray-300 p-3 text-center">1015</td>
                        <td className="border border-gray-300 p-3 text-center">1100</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Break</td>
                        <td className="border border-gray-300 p-3 text-center">1100</td>
                        <td className="border border-gray-300 p-3 text-center">1105</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">5th Period</td>
                        <td className="border border-gray-300 p-3 text-center">1105</td>
                        <td className="border border-gray-300 p-3 text-center">1145</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Prayer Break</td>
                        <td className="border border-gray-300 p-3 text-center">1145</td>
                        <td className="border border-gray-300 p-3 text-center">1205</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">6th Period</td>
                        <td className="border border-gray-300 p-3 text-center">1205</td>
                        <td className="border border-gray-300 p-3 text-center">1250</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 text-gray-700 italic">
                  *Period six is an additional period that will be used only when needed.
                </div>
                <div className="mt-8 flex justify-end">
                  <div className="text-right">
                    <div className="mb-1">____________________________________</div>
                    <div>Zeiad M. Alrajhi, CAPT</div>
                    <div>ELS Commander</div>
                    <div>Naval Forces Schools Jubail</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Timetable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16">
              <h3 className="text-lg font-medium text-gray-500 mb-4">Timetable will be populated from PowerBI</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Connect your Excel sheets with timetable data to populate this section with course schedules.
              </p>
              <Button className="mt-4 bg-[#0A2463] hover:bg-[#071A4A]">Connect PowerBI</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SchoolTimetable;