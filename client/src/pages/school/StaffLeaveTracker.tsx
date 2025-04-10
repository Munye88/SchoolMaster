import { useParams } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from '@/components/ui/calendar';
import { useState, useEffect } from 'react';
import { PlusCircle, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { useSchool } from '@/hooks/useSchool';
import { format } from 'date-fns';

export default function StaffLeaveTracker() {
  const params = useParams();
  const { schoolCode } = params;
  const { setSelectedSchool, schools } = useSchool();
  
  // Set the selected school based on the schoolCode from the URL
  useEffect(() => {
    if (schoolCode) {
      setSelectedSchool(schoolCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolCode]);
  
  // Find the current school from all schools
  const currentSchool = schools.find(school => school.code === schoolCode);
  
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MMMM'));
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Sample leave data
  const leaveData = [
    { id: 1, instructor: "John Doe", startDate: "2024-04-05", endDate: "2024-04-10", type: "Annual Leave", status: "Approved" },
    { id: 2, instructor: "Michael Wilson", startDate: "2024-04-12", endDate: "2024-04-15", type: "Sick Leave", status: "Approved" },
    { id: 3, instructor: "Robert Johnson", startDate: "2024-04-20", endDate: "2024-04-25", type: "Annual Leave", status: "Pending" },
    { id: 4, instructor: "William Brown", startDate: "2024-05-01", endDate: "2024-05-03", type: "Emergency Leave", status: "Approved" },
    { id: 5, instructor: "James Smith", startDate: "2024-05-10", endDate: "2024-05-15", type: "Annual Leave", status: "Pending" },
  ];
  
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{currentSchool?.name} - Staff Leave Tracker</h1>
        <div className="flex items-center space-x-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>{date ? format(date, 'PPP') : 'Pick a date'}</span>
            </Button>
            
            {showCalendar && (
              <div className="absolute right-0 z-10">
                <Card>
                  <CardContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        setDate(newDate);
                        setShowCalendar(false);
                      }}
                      initialFocus
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          
          <Button className="bg-[#0A2463]">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Leave Request
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Staff Leave Records</CardTitle>
          <CardDescription>
            Overview of all staff leave requests and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instructor</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveData.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">{leave.instructor}</TableCell>
                  <TableCell>{leave.startDate}</TableCell>
                  <TableCell>{leave.endDate}</TableCell>
                  <TableCell>{leave.type}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      leave.status === 'Approved' 
                        ? 'bg-green-100 text-green-800' 
                        : leave.status === 'Pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {leave.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}