import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Student, School } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, UserPlus, Filter, Download, ArrowUpDown } from "lucide-react";
import { useSchool } from "@/hooks/useSchool";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Students = () => {
  const { selectedSchool, currentSchool, schools } = useSchool();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // This would come from API in a real implementation
  const mockStudents: Student[] = [
    { id: 1, name: "Ahmed Al-Farsi", rank: "Lieutenant", schoolId: 1, enrollmentDate: new Date("2024-01-15") },
    { id: 2, name: "Mohammed Al-Qahtani", rank: "Captain", schoolId: 1, enrollmentDate: new Date("2024-02-05") },
    { id: 3, name: "Khalid Al-Otaibi", rank: "Major", schoolId: 2, enrollmentDate: new Date("2023-11-20") },
    { id: 4, name: "Abdullah Al-Shehri", rank: "Lieutenant", schoolId: 2, enrollmentDate: new Date("2024-03-10") },
    { id: 5, name: "Saud Al-Saud", rank: "Colonel", schoolId: 3, enrollmentDate: new Date("2023-10-01") },
    { id: 6, name: "Faisal Al-Shamari", rank: "Lieutenant", schoolId: 3, enrollmentDate: new Date("2024-01-22") },
    { id: 7, name: "Omar Al-Zahrani", rank: "Captain", schoolId: 1, enrollmentDate: new Date("2023-09-15") },
    { id: 8, name: "Talal Al-Ghamdi", rank: "Major", schoolId: 2, enrollmentDate: new Date("2024-02-18") },
    { id: 9, name: "Nasser Al-Dosari", rank: "Lieutenant Colonel", schoolId: 3, enrollmentDate: new Date("2023-08-30") },
    { id: 10, name: "Fahad Al-Harbi", rank: "Lieutenant", schoolId: 1, enrollmentDate: new Date("2024-03-05") }
  ];
  
  // Filter students
  const filteredStudents = mockStudents
    .filter(student => 
      (selectedSchool ? student.schoolId === currentSchool?.id : true) &&
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusFilter === "all" || student.rank === statusFilter)
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc" 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === "rank") {
        return sortOrder === "asc" 
          ? a.rank.localeCompare(b.rank) 
          : b.rank.localeCompare(a.rank);
      } else if (sortBy === "enrollmentDate") {
        return sortOrder === "asc" 
          ? new Date(a.enrollmentDate).getTime() - new Date(b.enrollmentDate).getTime()
          : new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime();
      }
      return 0;
    });
  
  // Get school name by ID
  const getSchoolName = (schoolId: number) => {
    const school = schools.find(s => s.id === schoolId);
    return school?.name || 'Unknown';
  };
  
  // Format date helper
  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM dd, yyyy");
  };
  
  // Toggle sort order
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };
  
  // Unique ranks for filter
  const uniqueRanks = Array.from(new Set(mockStudents.map(student => student.rank)));

  return (
    <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {selectedSchool && currentSchool 
              ? `${currentSchool.name} Students` 
              : 'All Students'}
          </h1>
          <p className="text-gray-500 mt-1">Manage and track student information</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search students..." 
              className="pl-9 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button className="bg-[#0A2463] hover:bg-[#071A4A]">
            <UserPlus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        </div>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by rank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranks</SelectItem>
                {uniqueRanks.map(rank => (
                  <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" /> More Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Recent Enrollments</DropdownMenuItem>
              <DropdownMenuItem>Active Students</DropdownMenuItem>
              <DropdownMenuItem>On Leave</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-semibold hover:bg-transparent"
                    onClick={() => toggleSort("name")}
                  >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-semibold hover:bg-transparent"
                    onClick={() => toggleSort("rank")}
                  >
                    Rank
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>School</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-semibold hover:bg-transparent"
                    onClick={() => toggleSort("enrollmentDate")}
                  >
                    Enrollment Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500">
                      {searchQuery || statusFilter !== "all"
                        ? "No students match your search criteria." 
                        : "No students available."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.rank}</TableCell>
                    <TableCell>{getSchoolName(student.schoolId)}</TableCell>
                    <TableCell>{formatDate(student.enrollmentDate)}</TableCell>
                    <TableCell>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
        <span>Showing {filteredStudents.length} of {mockStudents.length} students</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>
    </main>
  );
};

export default Students;
