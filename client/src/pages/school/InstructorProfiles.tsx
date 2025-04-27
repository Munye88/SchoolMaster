import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSchool } from "@/hooks/useSchool";
import { Instructor } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Share2, Search, Filter, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InstructorProfileCard } from "@/components/instructors/InstructorProfileCard";
import { StandardInstructorAvatar } from "@/components/instructors/StandardInstructorAvatar";
import { useState } from "react";
import { useLocation } from "wouter";

// Individual Instructor Profile Page
const InstructorProfile = ({ instructor, schoolName, onBack }: { 
  instructor: Instructor; 
  schoolName: string;
  onBack: () => void;
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="gap-2"
        >
          <ChevronRight className="h-4 w-4 rotate-180" /> Back to Instructors
        </Button>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0A2463] mb-6 text-center">
          Instructor Profile
        </h1>
        
        <InstructorProfileCard 
          instructor={instructor} 
          schoolName={schoolName}
        />
      </div>
    </div>
  )
};

const SchoolInstructorProfiles = () => {
  const [location] = useLocation();
  const schoolCode = location.split("/")[2]; // Get the school code from the URL
  const { schools } = useSchool();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState("all");
  const [selectedTab, setSelectedTab] = useState("grid");
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  
  // Get color class based on school
  const getSchoolColorClass = (schoolName: string) => {
    if (schoolName.includes("KFNA")) {
      return "bg-[#0A2463]"; // Blue for KFNA
    } else if (schoolName.includes("NFS East")) {
      return "bg-[#2A7F46]"; // Green for NFS East
    } else if (schoolName.includes("NFS West")) {
      return "bg-[#4A5899]"; // Professional blue-purple for NFS West (was orange)
    }
    return "bg-[#0A2463]"; // Default blue
  };
  
  // Get color value for school
  const getSchoolColor = (schoolName: string) => {
    if (schoolName.includes("KFNA")) {
      return "#0A2463"; // Blue for KFNA
    } else if (schoolName.includes("NFS East")) {
      return "#2A7F46"; // Green for NFS East
    } else if (schoolName.includes("NFS West")) {
      return "#4A5899"; // Professional blue-purple for NFS West (was orange)
    }
    return "#0A2463"; // Default blue
  };
  
  // Find the current school from the school code
  const currentSchool = schools.find(school => school.code === schoolCode);
  
  // Fetch all instructors with a dependency on the school code to ensure refetching when school changes
  const { data: allInstructors = [], isLoading: isLoadingAllInstructors } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors', schoolCode],
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  });
  
  // Filter instructors for the current school
  const schoolInstructors = allInstructors.filter(instructor => 
    instructor.schoolId === currentSchool?.id
  );
  
  console.log("Current school:", currentSchool);
  console.log("All instructors:", allInstructors.length);
  console.log("School instructors:", schoolInstructors.length);
  
  // Filter instructors based on search and nationality
  const filteredInstructors = schoolInstructors.filter(instructor => {
    // Apply nationality filter
    if (selectedView !== "all" && instructor.nationality.toLowerCase() !== selectedView.toLowerCase()) {
      return false;
    }
    
    // Apply search filter
    return instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.credentials.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.compound.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Handle clicking on instructor to view their profile
  const handleViewInstructor = (instructor: Instructor) => {
    console.log("Selected instructor:", instructor);
    setSelectedInstructor(instructor);
  };
  
  if (isLoadingAllInstructors || !currentSchool) {
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
  
  // If an instructor is selected, show their individual profile
  if (selectedInstructor) {
    return (
      <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
        <InstructorProfile
          instructor={selectedInstructor}
          schoolName={currentSchool?.name || ""}
          onBack={() => setSelectedInstructor(null)}
        />
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
          <p className="text-gray-500">View and manage instructor profiles for {currentSchool?.name}</p>
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
            <SelectItem value="all">All Nationalities</SelectItem>
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
                  {schoolInstructors.filter(i => i.accompaniedStatus === "Accompanied").length}
                </div>
                <div className="text-xs text-gray-500">Accompanied</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-600">
                  {schoolInstructors.filter(i => i.accompaniedStatus === "Unaccompanied").length}
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
            {filteredInstructors.length === 0 ? (
              <div className="col-span-3 text-center p-12">
                <h3 className="text-lg font-medium text-gray-500">No instructors found</h3>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              filteredInstructors.map((instructor) => (
                <Card key={instructor.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 shadow-md">
                  {/* Header with school color and instructor avatar - matches the example */}
                  <div className={`${getSchoolColorClass(currentSchool?.name || '')} p-4 flex items-center`}>
                    <div className="mr-4">
                      <StandardInstructorAvatar
                        imageUrl={instructor.imageUrl}
                        name={instructor.name}
                        size="md"
                        schoolColor={getSchoolColor(currentSchool?.name || '')}
                      />
                    </div>
                    <div className="text-white">
                      <h3 className="font-bold text-xl">{instructor.name}</h3>
                      <p className="text-sm">{instructor.role || 'ELT Instructor'}</p>
                    </div>
                  </div>
                  
                  <CardContent className="pt-4 pb-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={
                        instructor.nationality === "American" ? "bg-blue-100 text-blue-800" :
                        instructor.nationality === "British" ? "bg-red-100 text-red-800" :
                        "bg-green-100 text-green-800"
                      }>
                        {instructor.nationality}
                      </Badge>
                      <Badge variant="outline" className={instructor.accompaniedStatus === "Accompanied" 
                          ? "bg-green-100 text-green-800 border-green-300" 
                          : "bg-gray-100 text-gray-800 border-gray-300"}>
                        {instructor.accompaniedStatus}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2 text-sm mt-4">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-500 font-medium">Credentials:</p>
                        <p className="text-right">{instructor.credentials}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-gray-500 font-medium">School:</p>
                        <p className="text-right">{currentSchool?.name}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-gray-500 font-medium">Compound:</p>
                        <p className="text-right">{instructor.compound}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-gray-500 font-medium">Phone:</p>
                        <p className="text-right">{instructor.phone}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-gray-500 font-medium">Start Date:</p>
                        <p className="text-right">{new Date(instructor.startDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        size="sm" 
                        className={`w-full ${getSchoolColorClass(currentSchool?.name || '')} hover:opacity-90`}
                        onClick={() => handleViewInstructor(instructor)}
                      >
                        View Full Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              {filteredInstructors.length === 0 ? (
                <div className="text-center p-12">
                  <h3 className="text-lg font-medium text-gray-500">No instructors found</h3>
                  <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead>Credentials</TableHead>
                      <TableHead>Compound</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstructors.map((instructor) => (
                      <TableRow key={instructor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <StandardInstructorAvatar
                              imageUrl={instructor.imageUrl}
                              name={instructor.name}
                              size="sm"
                              schoolColor={getSchoolColor(currentSchool?.name || '')}
                            />
                            <span className="font-medium">{instructor.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            instructor.nationality === "American" ? "bg-blue-100 text-blue-800" :
                            instructor.nationality === "British" ? "bg-red-100 text-red-800" :
                            "bg-green-100 text-green-800"
                          }>
                            {instructor.nationality}
                          </Badge>
                        </TableCell>
                        <TableCell>{instructor.credentials}</TableCell>
                        <TableCell>{instructor.compound}</TableCell>
                        <TableCell>{new Date(instructor.startDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</TableCell>
                        <TableCell>
                          <Badge variant={instructor.accompaniedStatus === "Accompanied" ? "default" : "outline"}>
                            {instructor.accompaniedStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{instructor.phone}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`text-${currentSchool?.name.includes("NFS East") ? "green" : 
                                                currentSchool?.name.includes("NFS West") ? "purple" : 
                                                "blue"}-600`}
                            onClick={() => handleViewInstructor(instructor)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchoolInstructorProfiles;