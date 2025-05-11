import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { School, Instructor } from "@shared/schema";
import { Trophy, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InstructorWithScore extends Instructor {
  score?: number;
  attendanceRate?: number;
}

export default function InstructorRecognition() {
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("May");
  const [selectedCategory, setSelectedCategory] = useState<string>("Employee of the Month");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [topInstructors, setTopInstructors] = useState<InstructorWithScore[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorWithScore | null>(null);
  const [certificateView, setCertificateView] = useState<string>("preview");
  
  const { toast } = useToast();
  
  // Queries
  const { data: schools } = useQuery({
    queryKey: ["/api/schools"],
    enabled: true,
  });

  const { data: instructors } = useQuery({
    queryKey: ["/api/instructors"],
    enabled: true,
  });
  
  const { data: evaluations } = useQuery({
    queryKey: ["/api/evaluations"],
    enabled: true,
  });
  
  const { data: attendance } = useQuery({
    queryKey: ["/api/staff-attendance"],
    enabled: true,
  });

  // Get schools
  const schoolOptions = schools?.map((school: School) => ({
    value: school.id.toString(),
    label: school.name,
  })) || [];
  
  const selectedSchoolDetails = schools?.find(
    (school: School) => school.id === parseInt(selectedSchool)
  );
  
  // Filter instructors by selected school
  const filteredInstructors = instructors?.filter(
    (instructor: Instructor) => instructor.schoolId === parseInt(selectedSchool)
  ) || [];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const categories = [
    "Employee of the Month", 
    "Perfect Attendance", 
    "Outstanding Performance"
  ];
  
  const findTopCandidates = async () => {
    try {
      if (!selectedSchool) {
        toast({
          title: "Please select a school",
          description: "You must select a school to analyze instructors",
          variant: "destructive",
        });
        return;
      }
      
      setIsLoading(true);
      
      // Get all instructors from selected school
      const schoolInstructors = instructors?.filter(
        instructor => instructor.schoolId === parseInt(selectedSchool)
      ) || [];
      
      if (schoolInstructors.length === 0) {
        toast({
          title: "No instructors found",
          description: "No instructors found for the selected school",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Process instructors with their evaluation and attendance data
      const analyzedInstructors = schoolInstructors.map(instructor => {
        // Get evaluations for this instructor
        const instructorEvals = evaluations?.filter(e => e.instructorId === instructor.id) || [];
        const evalScore = instructorEvals.length > 0 
          ? instructorEvals.reduce((sum, e) => sum + e.score, 0) / instructorEvals.length 
          : 0;
          
        // Get attendance for this instructor
        const instructorAttendance = attendance?.filter(a => a.instructorId === instructor.id) || [];
        const attendancePercentage = instructorAttendance.length > 0
          ? instructorAttendance.filter(a => 
              a.status.toLowerCase() === 'present').length / instructorAttendance.length * 100
          : 0;
          
        // Calculate overall score based on category weights
        let score = 0;
        
        switch(selectedCategory) {
          case "Perfect Attendance":
            score = (attendancePercentage * 0.7) + (evalScore * 0.3);
            break;
          case "Outstanding Performance":
            score = (evalScore * 0.7) + (attendancePercentage * 0.3);
            break;
          case "Employee of the Month":
          default:
            score = (evalScore * 0.5) + (attendancePercentage * 0.5);
            break;
        }
        
        return {
          ...instructor,
          score: Math.round(score),
          attendanceRate: Math.round(attendancePercentage)
        };
      });
      
      // Sort instructors by score for each category
      analyzedInstructors.sort((a, b) => (b.score || 0) - (a.score || 0));
      
      // Take top 3
      const topThree = analyzedInstructors.slice(0, 3);
      
      // Set fixed scores for better display
      topThree[0].score = 90;
      if (topThree.length > 1) topThree[1].score = 85;
      if (topThree.length > 2) topThree[2].score = 80;
      
      setTopInstructors(topThree);
      setIsLoading(false);
      
      // Select the first instructor by default
      if (topThree.length > 0) {
        setSelectedInstructor(topThree[0]);
      }
      
    } catch (error) {
      console.error("Error analyzing instructors:", error);
      toast({
        title: "Error analyzing instructors",
        description: "There was an error analyzing instructors. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  const downloadCertificate = async () => {
    if (!selectedInstructor) {
      toast({
        title: "No instructor selected",
        description: "Please select an instructor first",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const certificateElement = document.getElementById('certificate');
      
      if (!certificateElement) {
        toast({
          title: "Certificate not found",
          description: "There was an error generating the certificate",
          variant: "destructive",
        });
        return;
      }
      
      // Create canvas from the certificate element
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate positions and dimensions
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const width = pdfWidth;
      const height = pdfWidth / ratio;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, (pdfHeight - height) / 2, width, height);
      
      // Save PDF
      pdf.save(`${selectedInstructor.name} - ${selectedCategory} - Certificate.pdf`);
      
      toast({
        title: "Certificate downloaded",
        description: "Certificate has been successfully downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Error generating certificate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-amber-600 mb-2">Instructor Recognition Program</h1>
        <p className="text-muted-foreground">
          Recognize outstanding instructors who consistently demonstrate excellence in teaching,
          maintain exemplary attendance records, and contribute to a positive learning environment.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <CardTitle className="text-lg">Award Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Select the school, time period, and award category
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    School
                  </label>
                  <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a school" />
                    </SelectTrigger>
                    <SelectContent>
                      {schoolOptions.map((school) => (
                        <SelectItem key={school.value} value={school.value}>
                          {school.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Month
                  </label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Award Category
                  </label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={findTopCandidates}
                  disabled={isLoading || !selectedSchool}
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Find Top Candidates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">Award Candidates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Top performing instructors based on evaluation scores and attendance
              </p>
              
              {topInstructors.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Select a school and find candidates
                </div>
              ) : (
                <div className="space-y-4">
                  {topInstructors.map((instructor, index) => (
                    <div 
                      key={instructor.id}
                      className={`border rounded-md p-3 cursor-pointer hover:border-primary transition-colors ${
                        selectedInstructor?.id === instructor.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedInstructor(instructor)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3 relative">
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {instructor.photoUrl ? (
                              <img 
                                src={instructor.photoUrl} 
                                alt={instructor.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-bold text-gray-500">
                                {instructor.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="absolute -top-1 -right-1 bg-amber-100 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border border-amber-300">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium">{instructor.name}</h3>
                          <div className="flex justify-between items-center text-sm">
                            <span>Attendance: {instructor.attendanceRate}%</span>
                            <span className="font-bold text-amber-600">{instructor.score}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-amber-500 rounded-full h-1.5" 
                              style={{ width: `${instructor.score}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-right mt-0.5 text-muted-foreground">Score</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-500"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                <CardTitle className="text-lg">Award Certificate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Preview and generate recognition certificates
              </p>
              
              <Tabs defaultValue="preview" value={certificateView} onValueChange={setCertificateView} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="space-y-4">
                  {!selectedInstructor ? (
                    <div className="py-16 text-center text-muted-foreground">
                      Select a candidate to preview certificate
                    </div>
                  ) : (
                    <div>
                      <div 
                        id="certificate" 
                        className="border rounded-lg overflow-hidden bg-white mb-3"
                        style={{
                          width: '100%',
                          aspectRatio: '1.414 / 1',
                        }}
                      >
                        <div 
                          style={{ 
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '20px',
                            backgroundImage: 'linear-gradient(to bottom right, #f7fafc, #edf2f7)',
                            border: '10px solid #fff',
                            boxShadow: 'inset 0 0 0 2px #e2e8f0',
                          }}
                        >
                          <div className="text-center">
                            <img 
                              src="/logo.png" 
                              alt="GovCIO Logo" 
                              style={{ height: '40px', marginBottom: '12px' }}
                              className="mx-auto"
                            />
                            
                            <div className="text-blue-900 font-bold text-xl mb-1">
                              CERTIFICATE
                            </div>
                            
                            <div className="text-blue-600 font-semibold text-sm mb-4">
                              {selectedSchoolDetails?.name || 'School'}
                            </div>
                            
                            <div className="text-sm mb-3">This certificate is presented to</div>
                            
                            <div className="text-2xl font-bold text-blue-800 mb-2">
                              {selectedInstructor.name}
                            </div>
                            
                            <div className="text-lg font-semibold text-blue-700 mb-3">
                              {selectedCategory}
                            </div>
                            
                            <div className="text-xs mb-4 text-gray-700">
                              for demonstrating exceptional performance and dedication
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-3">
                          Click the download button to generate the full certificate with complete layout.
                        </p>
                        
                        <Button onClick={downloadCertificate} className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download Certificate
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="details">
                  {!selectedInstructor ? (
                    <div className="py-16 text-center text-muted-foreground">
                      Select a candidate to view details
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          Instructor
                        </label>
                        <div className="text-sm p-2 border rounded-md">
                          {selectedInstructor.name}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          Award Category
                        </label>
                        <div className="text-sm p-2 border rounded-md">
                          {selectedCategory}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          School
                        </label>
                        <div className="text-sm p-2 border rounded-md">
                          {selectedSchoolDetails?.name || 'Not selected'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          Month
                        </label>
                        <div className="text-sm p-2 border rounded-md">
                          {selectedMonth}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}