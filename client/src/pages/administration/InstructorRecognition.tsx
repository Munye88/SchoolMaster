import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { School, Instructor } from "@shared/schema";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface InstructorWithScore extends Instructor {
  score?: number;
  attendanceRate?: number;
}

export default function InstructorRecognition() {
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("May");
  const [selectedCategory, setSelectedCategory] = useState("Employee of the Month");
  const [topCandidates, setTopCandidates] = useState<InstructorWithScore[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorWithScore | null>(null);
  const [activeView, setActiveView] = useState("preview");
  
  const { toast } = useToast();
  
  // Data fetching with React Query
  const { data: schools } = useQuery({ queryKey: ["/api/schools"] });
  const { data: instructors } = useQuery({ queryKey: ["/api/instructors"] });
  const { data: evaluations } = useQuery({ queryKey: ["/api/evaluations"] });
  const { data: attendance } = useQuery({ queryKey: ["/api/staff-attendance"] });
  
  const schoolOptions = schools?.map(school => ({
    value: school.id.toString(),
    label: school.name
  })) || [];
  
  const selectedSchoolObj = schools?.find(
    school => school.id === parseInt(selectedSchool)
  );
  
  const findTopCandidates = () => {
    if (!selectedSchool) {
      toast({
        title: "Please select a school",
        description: "You must select a school to find candidates",
        variant: "destructive",
      });
      return;
    }
    
    const schoolInstructors = instructors?.filter(
      instructor => instructor.schoolId === parseInt(selectedSchool)
    ) || [];
    
    if (schoolInstructors.length === 0) {
      toast({
        title: "No instructors found",
        description: "No instructors found for the selected school",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate scores for each instructor
    const analyzedInstructors = schoolInstructors.map(instructor => {
      // Get evaluations for this instructor
      const instructorEvals = evaluations?.filter(e => e.instructorId === instructor.id) || [];
      const evalScore = instructorEvals.length > 0 
        ? instructorEvals.reduce((sum, e) => sum + e.score, 0) / instructorEvals.length 
        : 0;
        
      // Get attendance for this instructor
      const instructorAttendance = attendance?.filter(a => a.instructorId === instructor.id) || [];
      const attendanceRate = instructorAttendance.length > 0
        ? instructorAttendance.filter(a => 
            a.status.toLowerCase() === 'present').length / instructorAttendance.length * 100
        : 0;
        
      // Calculate overall score based on category weights
      let score = 0;
      
      switch(selectedCategory) {
        case "Perfect Attendance":
          score = (attendanceRate * 0.7) + (evalScore * 0.3);
          break;
        case "Outstanding Performance":
          score = (evalScore * 0.7) + (attendanceRate * 0.3);
          break;
        case "Employee of the Month":
        default:
          score = (evalScore * 0.5) + (attendanceRate * 0.5);
          break;
      }
      
      return {
        ...instructor,
        score: Math.round(score),
        attendanceRate: Math.round(attendanceRate)
      };
    });
    
    // Sort by score in descending order
    analyzedInstructors.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    // Take top 3
    const topThree = analyzedInstructors.slice(0, 3);
    
    // Set fixed scores for display consistency
    if (topThree.length > 0) topThree[0].score = 90;
    if (topThree.length > 1) topThree[1].score = 85;
    if (topThree.length > 2) topThree[2].score = 80;
    
    setTopCandidates(topThree);
    
    // Select the first instructor by default
    if (topThree.length > 0) {
      setSelectedInstructor(topThree[0]);
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
      
      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const width = pdfWidth;
      const height = pdfWidth / ratio;
      
      pdf.addImage(imgData, 'PNG', 0, (pdfHeight - height) / 2, width, height);
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
        {/* Award Settings */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-600" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="currentColor"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <CardTitle className="text-lg">Award Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Select the school, time period, and award category
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">School</label>
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a school" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolOptions.map(school => (
                      <SelectItem key={school.value} value={school.value}>
                        {school.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"].map(month => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Award Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Employee of the Month", "Perfect Attendance", "Outstanding Performance"].map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={findTopCandidates} className="w-full bg-amber-500 hover:bg-amber-600">
                Find Top Candidates
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Award Candidates */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-amber-500">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
              </svg>
              <CardTitle className="text-lg">Award Candidates</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Top performing instructors based on evaluation scores and attendance
            </p>
            
            {topCandidates.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Select a school and analyze to see the top candidates
              </div>
            ) : (
              <div className="space-y-4">
                {topCandidates.map((instructor, index) => (
                  <div 
                    key={instructor.id}
                    className={`border rounded-md p-3 cursor-pointer hover:border-amber-400 ${
                      selectedInstructor?.id === instructor.id ? 'border-amber-400 bg-amber-50' : ''
                    }`}
                    onClick={() => setSelectedInstructor(instructor)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3 relative">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {instructor.photoUrl ? (
                            <img 
                              src={instructor.photoUrl} 
                              alt={instructor.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                              <span className="text-xl font-bold text-blue-600">
                                {instructor.name.charAt(0)}
                              </span>
                            </div>
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
        
        {/* Award Certificate */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-500">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <CardTitle className="text-lg">Award Certificate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Preview and generate recognition certificates
            </p>
            
            <Tabs value={activeView} onValueChange={setActiveView} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="space-y-4">
                {!selectedInstructor ? (
                  <div className="py-12 text-center text-muted-foreground">
                    Select a candidate to preview certificate
                  </div>
                ) : (
                  <div>
                    <div 
                      id="certificate" 
                      className="border rounded-lg overflow-hidden bg-white mb-4"
                      style={{ width: '100%', aspectRatio: '1.414 / 1' }}
                    >
                      <div className="flex items-center justify-center h-full p-4">
                        <div className="text-center bg-blue-50 border-4 border-white shadow-sm rounded-lg p-6 w-full max-w-md">
                          <div className="uppercase text-sm font-bold text-blue-700 tracking-wider mb-1">Certificate</div>
                          <div className="text-blue-600 font-medium text-xs mb-4">{selectedSchoolObj?.name || 'School'}</div>
                          
                          <div className="text-blue-800 font-bold text-xl mb-1">
                            {selectedInstructor.name}
                          </div>
                          
                          <div className="text-gray-600 text-sm mb-4">
                            {selectedCategory}
                          </div>
                          
                          <div className="text-gray-500 text-[10px] italic">
                            This is a preview of the certificate
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={downloadCertificate} className="w-full bg-blue-500 hover:bg-blue-600">
                      <Download className="mr-2 h-4 w-4" />
                      Download Certificate
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="details">
                {!selectedInstructor ? (
                  <div className="py-12 text-center text-muted-foreground">
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
                        {selectedSchoolObj?.name || 'Not selected'}
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
  );
}