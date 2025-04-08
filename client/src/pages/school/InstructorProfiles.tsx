import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSchool } from "@/hooks/useSchool";
import { Instructor } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Share2, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SchoolInstructorProfiles = () => {
  const { currentSchool } = useSchool();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedView, setSelectedView] = React.useState("all");
  const [selectedTab, setSelectedTab] = React.useState("grid");
  
  // Fetch instructors
  const { data: instructors = [], isLoading } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
  });
  
  const schoolInstructors = instructors.filter(instructor => 
    instructor.schoolId === currentSchool?.id
  );
  
  // Filter instructors based on search
  const filteredInstructors = schoolInstructors.filter(instructor => 
    instructor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2463]">
            {currentSchool ? `${currentSchool.name} Instructor Profiles` : 'Instructor Profiles'}
          </h1>
          <p className="text-gray-500">View and manage instructor profiles</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Export
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 size={16} /> Share
          </Button>
          <Button className="bg-[#0A2463] hover:bg-[#071A4A] gap-2">
            <FileText size={16} /> View Report
          </Button>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search instructors..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={selectedView} onValueChange={setSelectedView}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Instructors</SelectItem>
            <SelectItem value="american">American</SelectItem>
            <SelectItem value="british">British</SelectItem>
            <SelectItem value="canadian">Canadian</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" className="gap-2">
          <Filter size={16} /> More Filters
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Instructors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{schoolInstructors.length}</div>
            <p className="text-xs text-gray-500 mt-2">
              {currentSchool?.name || 'School'} has {schoolInstructors.length} instructors
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Nationality Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <div className="text-xl font-bold text-blue-600">
                  {schoolInstructors.filter(i => i.nationality === "American").length}
                </div>
                <div className="text-xs text-gray-500">American</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">
                  {schoolInstructors.filter(i => i.nationality === "British").length}
                </div>
                <div className="text-xs text-gray-500">British</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">
                  {schoolInstructors.filter(i => i.nationality === "Canadian").length}
                </div>
                <div className="text-xs text-gray-500">Canadian</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Accompanied Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <div className="text-xl font-bold text-green-600">
                  {schoolInstructors.filter(i => i.accompaniedStatus === "Yes").length}
                </div>
                <div className="text-xs text-gray-500">Accompanied</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-600">
                  {schoolInstructors.filter(i => i.accompaniedStatus === "No").length}
                </div>
                <div className="text-xs text-gray-500">Unaccompanied</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs and Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="grid" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstructors.map((instructor) => (
              <Card key={instructor.id} className="overflow-hidden">
                <div className="h-32 bg-[#0A2463] flex items-center justify-center">
                  <img 
                    src={instructor.imageUrl || "https://via.placeholder.com/150?text=Instructor"} 
                    alt={instructor.name}
                    className="h-24 w-24 rounded-full border-4 border-white object-cover"
                  />
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-bold text-lg mb-1">{instructor.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{instructor.nationality} • {instructor.role || 'Instructor'}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                    <div>
                      <p className="text-gray-500">Compound</p>
                      <p className="font-medium">{instructor.compound}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium">{instructor.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="font-medium">{new Date(instructor.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Accompanied</p>
                      <p className="font-medium">{instructor.accompaniedStatus}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="w-full">View Profile</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>Compound</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Accompanied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstructors.map((instructor) => (
                    <TableRow key={instructor.id}>
                      <TableCell className="font-medium">{instructor.name}</TableCell>
                      <TableCell>{instructor.nationality}</TableCell>
                      <TableCell>{instructor.compound}</TableCell>
                      <TableCell>{new Date(instructor.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{instructor.accompaniedStatus}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchoolInstructorProfiles;