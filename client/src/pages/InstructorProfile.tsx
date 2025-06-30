import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Instructor, Course, School } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import InstructorForm from "@/components/instructors/InstructorForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Calendar, Mail, Phone, Home, Award, FileText, Star, Settings } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchool } from "@/hooks/useSchool";
import { PrintButton } from "@/components/ui/print-button";
import CourseCard from "@/components/dashboard/CourseCard";
import { StandardInstructorAvatar } from "@/components/instructors/StandardInstructorAvatar";

const InstructorProfile = () => {
  const { id } = useParams();
  const { schools } = useSchool();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Fetch all instructors if no ID is provided, otherwise fetch the specific instructor
  const { data: instructorsData, isLoading: instructorsLoading } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors'],
    enabled: !id,
  });
  
  const { data: instructor, isLoading: instructorLoading } = useQuery<Instructor>({
    queryKey: ['/api/instructors', parseInt(id || '0')],
    enabled: !!id,
  });
  
  // Fetch courses for this instructor if ID is provided
  const { data: instructorCourses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/instructors', parseInt(id || '0'), 'courses'],
    enabled: !!id,
  });
  
  // Format date helper
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), "MMMM d, yyyy");
  };
  
  // Get school name
  const getSchoolName = (schoolId: number | undefined) => {
    if (!schoolId) return 'N/A';
    const school = schools.find(s => s.id === schoolId);
    return school?.name || 'Unknown School';
  };

  // If viewing the instructors list
  if (!id) {
    return (
      <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#0A2463]">Instructors</h1>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0A2463] hover:bg-[#071A4A]">Add Instructor</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Add New Instructor</DialogTitle>
              </DialogHeader>
              <InstructorForm onSuccess={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        
        {instructorsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-[200px] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instructorsData?.map(instructor => (
              <Card key={instructor.id} className="overflow-hidden">
                <CardHeader className="bg-[#0A2463] p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <StandardInstructorAvatar
                          imageUrl={instructor.imageUrl}
                          name={instructor.name}
                          size="md"
                          schoolColor={
                            instructor.schoolId === 349 ? '#0A2463' : // KFNA (blue)
                            instructor.schoolId === 350 ? '#2A7F46' : // NFS East (green)
                            '#4A5899' // NFS West (blue-purple)
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg leading-tight">{instructor.name}</h3>
                        <p className="text-gray-200 text-sm mt-1">{instructor.role || 'Instructor'}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Link href={`/instructors/${instructor.id}`}>
                        <Button variant="outline" size="sm" className="bg-transparent text-white border-white hover:bg-white hover:text-[#0A2463]">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Nationality:</span>
                      <span className="text-sm font-medium">{instructor.nationality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">School:</span>
                      <span className="text-sm font-medium">{getSchoolName(instructor.schoolId)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Joined:</span>
                      <span className="text-sm font-medium">{formatDate(instructor.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className="text-sm font-medium">{instructor.accompaniedStatus}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    );
  }
  
  // If viewing a specific instructor profile
  if (instructorLoading || !instructor) {
    return (
      <main className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <Skeleton className="h-12 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main id="instructorProfileContent" className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0A2463]">{instructor.name}</h1>
        <div className="flex space-x-2">
          <PrintButton contentId="instructorProfileContent" />
          <Link href="/instructors">
            <Button variant="outline" className="border-[#0A2463] text-[#0A2463]">
              Back to Instructors
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Instructor Profile Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className={instructor.schoolId === 349 ? 'bg-[#0A2463]' : // KFNA (blue)
                     instructor.schoolId === 350 ? 'bg-[#2A7F46]' : // NFS East (green) 
                     'bg-[#4A5899]' // NFS West (blue-purple)
                     }>
              <div className="p-6 flex items-center justify-start">
                <div className="mr-6 flex-shrink-0">
                  <StandardInstructorAvatar
                    imageUrl={instructor.imageUrl}
                    name={instructor.name}
                    size="xl"
                    schoolColor={
                      instructor.schoolId === 349 ? '#0A2463' : // KFNA (blue)
                      instructor.schoolId === 350 ? '#2A7F46' : // NFS East (green)
                      '#4A5899' // NFS West (blue-purple)
                    }
                  />
                </div>
                <div className="text-white flex-1">
                  <h2 className="text-2xl font-bold leading-tight">{instructor.name}</h2>
                  <p className="text-sm mt-2 opacity-90">{instructor.role || 'Instructor'}</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              
              <div className="w-full mt-6 space-y-4">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-[#3E92CC] mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Credentials</p>
                    <p className="font-medium">{instructor.credentials}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-[#3E92CC] mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{`${instructor.name.toLowerCase().replace(/\s+/g, '.')}@school.edu`}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-[#3E92CC] mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{instructor.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Home className="h-5 w-5 text-[#3E92CC] mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Compound</p>
                    <p className="font-medium">{instructor.compound}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-[#3E92CC] mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDate(instructor.startDate)}</p>
                  </div>
                </div>
              </div>
              
              <div className="w-full mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">School</h3>
                <div className="bg-gray-100 rounded-md p-3 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#0A2463] text-white flex items-center justify-center font-bold mr-3">
                    S
                  </div>
                  <div>
                    <p className="font-medium">{getSchoolName(instructor.schoolId)}</p>
                    <p className="text-xs text-gray-500">Staff ID: {instructor.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-[#0A2463]">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{instructor.accompaniedStatus}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nationality</p>
                  <p className="font-medium">{instructor.nationality}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Emergency Contact</p>
                  <p className="font-medium">+1 (555) 123-4567</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="courses">
            <TabsList className="mb-4">
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#0A2463]">Current Courses</CardTitle>
                  <CardDescription>Courses currently taught by {instructor.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {coursesLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : instructorCourses.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No active courses found for this instructor.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {instructorCourses.map(course => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="evaluations">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#0A2463]">Performance Evaluations</CardTitle>
                  <CardDescription>Quarterly evaluations and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quarter</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Evaluator</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Q1</TableCell>
                        <TableCell>2024</TableCell>
                        <TableCell className="flex items-center">
                          <span className="mr-1">4.5</span>
                          <div className="flex">
                            {[1, 2, 3, 4].map(i => (
                              <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            ))}
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 fill-opacity-50" />
                          </div>
                        </TableCell>
                        <TableCell>Admin User</TableCell>
                        <TableCell>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Completed</span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Q4</TableCell>
                        <TableCell>2023</TableCell>
                        <TableCell className="flex items-center">
                          <span className="mr-1">5.0</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>Admin User</TableCell>
                        <TableCell>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Completed</span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Q3</TableCell>
                        <TableCell>2023</TableCell>
                        <TableCell className="flex items-center">
                          <span className="mr-1">4.2</span>
                          <div className="flex">
                            {[1, 2, 3, 4].map(i => (
                              <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            ))}
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 fill-opacity-20" />
                          </div>
                        </TableCell>
                        <TableCell>Admin User</TableCell>
                        <TableCell>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Completed</span>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#0A2463]">Instructor Documents</CardTitle>
                  <CardDescription>Contracts, certifications, and other important documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <FileText className="h-6 w-6 text-[#3E92CC] mr-3" />
                      <div className="flex-1">
                        <p className="font-medium">Employment Contract</p>
                        <p className="text-sm text-gray-500">PDF • Uploaded on {formatDate(instructor.startDate)}</p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <FileText className="h-6 w-6 text-[#3E92CC] mr-3" />
                      <div className="flex-1">
                        <p className="font-medium">Teaching Certification</p>
                        <p className="text-sm text-gray-500">PDF • Uploaded on {formatDate(instructor.startDate)}</p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-50 rounded-md">
                      <FileText className="h-6 w-6 text-[#3E92CC] mr-3" />
                      <div className="flex-1">
                        <p className="font-medium">Visa Documentation</p>
                        <p className="text-sm text-gray-500">PDF • Uploaded on {formatDate(instructor.startDate)}</p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-[#0A2463]">Profile Settings</CardTitle>
                  <CardDescription>Manage instructor profile information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-[#0A2463] hover:bg-[#071A4A] mb-6">
                        <Settings className="mr-2 h-4 w-4" /> Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px]">
                      <DialogHeader>
                        <DialogTitle>Edit Instructor Profile</DialogTitle>
                      </DialogHeader>
                      <InstructorForm initialData={instructor} />
                    </DialogContent>
                  </Dialog>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">Account Status</p>
                        <p className="text-sm text-gray-500">Instructor account is active</p>
                      </div>
                      <div className="flex items-center">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs mr-2">Active</span>
                        <Button variant="outline" size="sm">Change</Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive email updates about courses and events</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">Privacy Settings</p>
                        <p className="text-sm text-gray-500">Manage what information is visible to others</p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
};

export default InstructorProfile;
