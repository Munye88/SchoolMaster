import { useParams } from "wouter";
import { useSchool } from "@/hooks/useSchool";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, BookOpen, Award, GraduationCap, Flag } from "lucide-react";

const SchoolYearlySchedule = () => {
  const { schoolCode = "" } = useParams<{ schoolCode: string }>();
  const { schools } = useSchool();
  
  // Find the current school
  const currentSchool = schools.find(school => school.code === schoolCode);
  
  // Academic year events
  const academicYear = [
    {
      month: "January",
      events: [
        { date: "January 2-6", event: "Winter Break", type: "holiday" },
        { date: "January 9", event: "Classes Resume", type: "academic" },
        { date: "January 15", event: "New Student Orientation", type: "academic" },
        { date: "January 20", event: "First Month Assessment", type: "assessment" },
        { date: "January 30-31", event: "Teacher Development Workshop", type: "staff" },
      ]
    },
    {
      month: "February",
      events: [
        { date: "February 5", event: "Progress Reports Issued", type: "academic" },
        { date: "February 12-16", event: "Midterm Examinations", type: "assessment" },
        { date: "February 22", event: "National Day Celebration", type: "event" },
        { date: "February 28", event: "Parent-Teacher Conferences", type: "academic" },
      ]
    },
    {
      month: "March",
      events: [
        { date: "March 5-9", event: "Spring Break", type: "holiday" },
        { date: "March 12", event: "Classes Resume", type: "academic" },
        { date: "March 20", event: "ELT Symposium", type: "event" },
        { date: "March 26-30", event: "Benchmark Assessments", type: "assessment" },
      ]
    },
    {
      month: "April",
      events: [
        { date: "April 5", event: "Aviation English Showcase", type: "event" },
        { date: "April 15", event: "Progress Reports Issued", type: "academic" },
        { date: "April 20", event: "Military Terminology Competition", type: "event" },
        { date: "April 25-27", event: "Professional Development Days", type: "staff" },
      ]
    },
    {
      month: "May",
      events: [
        { date: "May 3-4", event: "Technical Writing Workshop", type: "event" },
        { date: "May 10-11", event: "External Program Review", type: "assessment" },
        { date: "May 15-25", event: "Final Examinations", type: "assessment" },
        { date: "May 30", event: "End of Spring Semester", type: "academic" },
      ]
    },
    {
      month: "June",
      events: [
        { date: "June 1-30", event: "Summer Break", type: "holiday" },
        { date: "June 15-20", event: "Faculty Planning Week", type: "staff" },
      ]
    },
    {
      month: "July",
      events: [
        { date: "July 1-31", event: "Summer Break", type: "holiday" },
        { date: "July 25-31", event: "New Instructor Orientation", type: "staff" },
      ]
    },
    {
      month: "August",
      events: [
        { date: "August 1", event: "Fall Semester Begins", type: "academic" },
        { date: "August 5", event: "New Student Orientation", type: "academic" },
        { date: "August 15", event: "Curriculum Overview Meeting", type: "staff" },
        { date: "August 25", event: "First Month Assessment", type: "assessment" },
      ]
    },
    {
      month: "September",
      events: [
        { date: "September 5", event: "Progress Reports Issued", type: "academic" },
        { date: "September 15", event: "National Aviation Day", type: "event" },
        { date: "September 20-22", event: "Midterm Examinations", type: "assessment" },
        { date: "September 30", event: "Parent-Teacher Conferences", type: "academic" },
      ]
    },
    {
      month: "October",
      events: [
        { date: "October 5-6", event: "Professional Development Days", type: "staff" },
        { date: "October 10", event: "Field Trip - Air Base Visit", type: "event" },
        { date: "October 15-19", event: "Fall Break", type: "holiday" },
        { date: "October 22", event: "Classes Resume", type: "academic" },
        { date: "October 30", event: "English Language Fair", type: "event" },
      ]
    },
    {
      month: "November",
      events: [
        { date: "November 5", event: "Progress Reports Issued", type: "academic" },
        { date: "November 10", event: "Guest Speaker Series", type: "event" },
        { date: "November 15-17", event: "Benchmark Assessments", type: "assessment" },
        { date: "November 25", event: "Curriculum Review Meeting", type: "staff" },
      ]
    },
    {
      month: "December",
      events: [
        { date: "December 1-5", event: "Final Projects Presentations", type: "assessment" },
        { date: "December 10-20", event: "Final Examinations", type: "assessment" },
        { date: "December 21", event: "End of Fall Semester", type: "academic" },
        { date: "December 22-31", event: "Winter Break", type: "holiday" },
      ]
    },
  ];
  
  // Function to determine badge color based on event type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'holiday':
        return 'bg-green-100 text-green-800';
      case 'assessment':
        return 'bg-red-100 text-red-800';
      case 'staff':
        return 'bg-purple-100 text-purple-800';
      case 'event':
        return 'bg-yellow-100 text-yellow-800';
      case 'academic':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'holiday':
        return <Flag className="h-4 w-4" />;
      case 'assessment':
        return <Award className="h-4 w-4" />;
      case 'staff':
        return <GraduationCap className="h-4 w-4" />;
      case 'event':
        return <Flag className="h-4 w-4" />;
      case 'academic':
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{currentSchool?.name || schoolCode} - Yearly Schedule</h1>
          <p className="text-muted-foreground mt-1">
            Complete academic year calendar with important dates and events
          </p>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            <CardTitle>Academic Year 2025</CardTitle>
          </div>
          <CardDescription>
            All scheduled events, holidays, and assessment periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {academicYear.map(month => (
              <Card key={month.month} className="border shadow-sm">
                <CardHeader className="pb-2 bg-gray-50">
                  <CardTitle className="text-lg">{month.month}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-3">
                    {month.events.map((event, index) => (
                      <li key={index} className="border-b pb-2 last:border-0 last:pb-0">
                        <div className="flex flex-col space-y-1">
                          <div className="font-medium text-sm">{event.date}</div>
                          <div className="flex items-center space-x-2">
                            {getEventIcon(event.type)}
                            <span>{event.event}</span>
                          </div>
                          <Badge variant="outline" className={`w-fit text-xs font-normal ${getBadgeColor(event.type)}`}>
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Key Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Academic Terms</h3>
                <ul className="space-y-1">
                  <li className="flex justify-between">
                    <span>Spring Semester</span>
                    <span className="text-muted-foreground">January 9 - May 30</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Fall Semester</span>
                    <span className="text-muted-foreground">August 1 - December 21</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Major Breaks</h3>
                <ul className="space-y-1">
                  <li className="flex justify-between">
                    <span>Winter Break</span>
                    <span className="text-muted-foreground">December 22 - January 8</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Spring Break</span>
                    <span className="text-muted-foreground">March 5 - March 11</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Summer Break</span>
                    <span className="text-muted-foreground">June 1 - July 31</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Fall Break</span>
                    <span className="text-muted-foreground">October 15 - October 21</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Assessment Periods</h3>
                <ul className="space-y-1">
                  <li className="flex justify-between">
                    <span>Spring Midterms</span>
                    <span className="text-muted-foreground">February 12-16</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Spring Finals</span>
                    <span className="text-muted-foreground">May 15-25</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Fall Midterms</span>
                    <span className="text-muted-foreground">September 20-22</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Fall Finals</span>
                    <span className="text-muted-foreground">December 10-20</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5">
              <li>This schedule is subject to change with advance notice</li>
              <li>Religious and national holidays may affect the schedule</li>
              <li>All staff are required to attend Professional Development days</li>
              <li>Parent-Teacher conferences are scheduled twice per semester</li>
              <li>Assessment periods are mandatory for all students</li>
              <li>Make-up exams can be arranged within one week of the original exam date with proper documentation</li>
              <li>Field trips require signed permission forms at least 2 weeks in advance</li>
              <li>All events outside normal class hours are indicated in the schedule</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchoolYearlySchedule;