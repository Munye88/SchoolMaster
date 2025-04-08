import { useParams } from "wouter";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Calendar } from "lucide-react";

const SchoolTimetable = () => {
  const { schoolCode = "" } = useParams<{ schoolCode: string }>();
  const { schools } = useSchool();
  
  // Find the current school
  const currentSchool = schools.find(school => school.code === schoolCode);
  
  // Sample timetable data for each day
  const timeSlots = [
    { time: "07:00 - 07:45", label: "Period 1" },
    { time: "08:00 - 08:45", label: "Period 2" },
    { time: "09:00 - 09:45", label: "Period 3" },
    { time: "10:00 - 10:45", label: "Period 4" },
    { time: "11:00 - 11:45", label: "Period 5" },
    { time: "12:00 - 12:45", label: "Period 6" },
    { time: "13:00 - 13:45", label: "Lunch Break" },
    { time: "14:00 - 14:45", label: "Period 7" },
    { time: "15:00 - 15:45", label: "Period 8" },
  ];
  
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  
  // This will hold our timetable data - in a real app this would come from an API
  const classData: Record<string, Record<string, string>> = {
    "Period 1": {
      "Sunday": "Aviation English",
      "Monday": "Technical Writing",
      "Tuesday": "Military Terminology",
      "Wednesday": "Aviation English",
      "Thursday": "Communication Skills"
    },
    "Period 2": {
      "Sunday": "Military Terminology",
      "Monday": "Communication Skills",
      "Tuesday": "Aviation English",
      "Wednesday": "Technical Writing",
      "Thursday": "Military Terminology"
    },
    "Period 3": {
      "Sunday": "Technical Writing",
      "Monday": "Aviation English",
      "Tuesday": "Communication Skills",
      "Wednesday": "Military Terminology", 
      "Thursday": "Technical Writing"
    },
    "Period 4": {
      "Sunday": "Communication Skills",
      "Monday": "Military Terminology",
      "Tuesday": "Technical Writing",
      "Wednesday": "Communication Skills",
      "Thursday": "Aviation English"
    },
    "Period 5": {
      "Sunday": "Aviation English",
      "Monday": "Technical Writing",
      "Tuesday": "Military Terminology",
      "Wednesday": "Aviation English",
      "Thursday": "Communication Skills"
    },
    "Period 6": {
      "Sunday": "Military Terminology",
      "Monday": "Communication Skills",
      "Tuesday": "Aviation English",
      "Wednesday": "Technical Writing",
      "Thursday": "Military Terminology"
    },
    "Lunch Break": {
      "Sunday": "Break",
      "Monday": "Break",
      "Tuesday": "Break",
      "Wednesday": "Break",
      "Thursday": "Break"
    },
    "Period 7": {
      "Sunday": "Technical Writing",
      "Monday": "Aviation English",
      "Tuesday": "Communication Skills",
      "Wednesday": "Military Terminology", 
      "Thursday": "Technical Writing"
    },
    "Period 8": {
      "Sunday": "Communication Skills",
      "Monday": "Military Terminology",
      "Tuesday": "Technical Writing",
      "Wednesday": "Communication Skills",
      "Thursday": "Aviation English"
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{currentSchool?.name || schoolCode} - Class Timetable</h1>
          <p className="text-muted-foreground mt-1">
            Weekly class schedule for ELT Program
          </p>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <CardTitle>Weekly Timetable</CardTitle>
          </div>
          <CardDescription>
            All scheduled classes for the current academic period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Time</TableHead>
                  {daysOfWeek.map(day => (
                    <TableHead key={day}>{day}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeSlots.map(slot => (
                  <TableRow key={slot.label}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{slot.time}</span>
                        <span className="text-xs text-muted-foreground">{slot.label}</span>
                      </div>
                    </TableCell>
                    {daysOfWeek.map(day => (
                      <TableCell 
                        key={day}
                        className={classData[slot.label][day] === "Break" ? "bg-gray-50" : ""}
                      >
                        {classData[slot.label][day] === "Break" ? (
                          <div className="text-center text-muted-foreground">Lunch Break</div>
                        ) : (
                          <div>
                            <p>{classData[slot.label][day]}</p>
                            <p className="text-xs text-muted-foreground">Room {Math.floor(Math.random() * 20) + 101}</p>
                          </div>
                        )}
                      </TableCell>
                    ))}
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
              <Clock className="h-5 w-5 text-blue-600" />
              <CardTitle>Class Times</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {timeSlots.map(slot => (
                <li key={slot.label} className="flex justify-between">
                  <span className="font-medium">{slot.label}</span>
                  <span className="text-muted-foreground">{slot.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5">
              <li>Classes start promptly at the designated times</li>
              <li>Morning assembly is held daily at 06:45</li>
              <li>Instructors should arrive 15 minutes before class</li>
              <li>Schedule may change during special events or evaluations</li>
              <li>Prayer breaks as per standard times</li>
              <li>Any changes to this schedule will be communicated via email</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolTimetable;