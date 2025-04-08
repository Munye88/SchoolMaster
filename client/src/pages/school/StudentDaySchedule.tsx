import { useParams } from "wouter";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar, BookOpen, Users, GraduationCap, Bell } from "lucide-react";

const SchoolStudentDaySchedule = () => {
  const { schoolCode = "" } = useParams<{ schoolCode: string }>();
  const { schools } = useSchool();
  
  // Find the current school
  const currentSchool = schools.find(school => school.code === schoolCode);
  
  // Daily schedule data
  const dailySchedule = [
    { time: "06:30 - 06:45", activity: "Morning Assembly", location: "Main Parade Ground", description: "Roll call and morning briefing" },
    { time: "06:45 - 07:00", activity: "Transfer to Classrooms", location: "School Building", description: "Students move to first period classrooms" },
    { time: "07:00 - 07:45", activity: "First Period", location: "Assigned Classrooms", description: "ELT instruction as per curriculum" },
    { time: "07:45 - 08:00", activity: "Short Break", location: "Common Areas", description: "Movement to next class" },
    { time: "08:00 - 08:45", activity: "Second Period", location: "Assigned Classrooms", description: "ELT instruction as per curriculum" },
    { time: "08:45 - 09:00", activity: "Short Break", location: "Common Areas", description: "Movement to next class" },
    { time: "09:00 - 09:45", activity: "Third Period", location: "Assigned Classrooms", description: "ELT instruction as per curriculum" },
    { time: "09:45 - 10:00", activity: "Short Break", location: "Common Areas", description: "Movement to next class" },
    { time: "10:00 - 10:45", activity: "Fourth Period", location: "Assigned Classrooms", description: "ELT instruction as per curriculum" },
    { time: "10:45 - 11:00", activity: "Short Break", location: "Common Areas", description: "Movement to next class" },
    { time: "11:00 - 11:45", activity: "Fifth Period", location: "Assigned Classrooms", description: "ELT instruction as per curriculum" },
    { time: "11:45 - 12:00", activity: "Short Break", location: "Common Areas", description: "Movement to next class" },
    { time: "12:00 - 12:45", activity: "Sixth Period", location: "Assigned Classrooms", description: "ELT instruction as per curriculum" },
    { time: "12:45 - 13:45", activity: "Lunch & Prayer Break", location: "Cafeteria & Prayer Hall", description: "Meal and prayer time" },
    { time: "13:45 - 14:00", activity: "Transfer to Classrooms", location: "School Building", description: "Students move to afternoon classrooms" },
    { time: "14:00 - 14:45", activity: "Seventh Period", location: "Assigned Classrooms", description: "ELT instruction as per curriculum" },
    { time: "14:45 - 15:00", activity: "Short Break", location: "Common Areas", description: "Movement to next class" },
    { time: "15:00 - 15:45", activity: "Eighth Period", location: "Assigned Classrooms", description: "ELT instruction as per curriculum" },
    { time: "15:45 - 16:00", activity: "Closing Assembly", location: "Classroom Areas", description: "Daily wrap-up and announcements" },
    { time: "16:00 - 17:30", activity: "Self-Study / Tutoring (Optional)", location: "Study Hall & Library", description: "Additional support for students who need it" },
  ];

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{currentSchool?.name || schoolCode} - Student Day Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Detailed daily schedule for students in the ELT Program
          </p>
        </div>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <CardTitle>Daily Schedule</CardTitle>
            </div>
            <CardDescription>
              Standard daily schedule for regular instruction days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Time</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="hidden md:table-cell">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailySchedule.map((item, index) => (
                    <TableRow key={index} className={
                      item.activity.includes("Break") ? "bg-gray-50" :
                      item.activity.includes("Assembly") ? "bg-blue-50" :
                      item.activity.includes("Period") ? "" : "bg-gray-50"
                    }>
                      <TableCell className="font-medium">{item.time}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.activity.includes("Period") ? (
                            <BookOpen className="h-4 w-4 text-blue-600" />
                          ) : item.activity.includes("Assembly") ? (
                            <Users className="h-4 w-4 text-green-600" />
                          ) : item.activity.includes("Break") ? (
                            <Bell className="h-4 w-4 text-orange-600" />
                          ) : (
                            <GraduationCap className="h-4 w-4 text-purple-600" />
                          )}
                          {item.activity}
                        </div>
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell className="hidden md:table-cell">{item.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <CardTitle>Bell Schedule</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>The following bells will sound throughout the day:</p>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>First Bell</span>
                    <span className="text-muted-foreground">06:25</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Assembly Bell</span>
                    <span className="text-muted-foreground">06:30</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Period Start Bells</span>
                    <span className="text-muted-foreground">On the hour</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Period End Bells</span>
                    <span className="text-muted-foreground">45 minutes past the hour</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Lunch Bell</span>
                    <span className="text-muted-foreground">12:45</span>
                  </li>
                  <li className="flex justify-between">
                    <span>End of Day Bell</span>
                    <span className="text-muted-foreground">16:00</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <CardTitle>Important Notes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5">
                <li>Students must be in their assigned locations at the designated times</li>
                <li>Attendance is taken at morning assembly and each class period</li>
                <li>Prayer breaks are integrated into the lunch break</li>
                <li>Students should bring all required materials for the day</li>
                <li>The schedule may be adjusted during special events, exams, or evaluations</li>
                <li>Friday is a shortened day with dismissal at 12:00 after the sixth period</li>
                <li>Self-study period is optional but recommended for students needing additional support</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SchoolStudentDaySchedule;