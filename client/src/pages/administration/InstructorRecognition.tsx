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
import { Trophy, Search, Award, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { useAIChat } from "@/hooks/use-ai-chat";

interface InstructorWithScore extends Instructor {
  score?: number;
  strengths?: string[];
  nominationReasons?: string;
}

interface CertificateData {
  instructor: InstructorWithScore;
  category: string;
  date: string;
  school: School;
}

export default function InstructorRecognition() {
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Employee of the Month");
  const [activeTab, setActiveTab] = useState<string>("settings");
  const [topInstructors, setTopInstructors] = useState<InstructorWithScore[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorWithScore | null>(null);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const { toast } = useToast();
  
  const { askAI, isProcessing } = useAIChat();
  
  // Get schools
  const { data: schools } = useQuery({
    queryKey: ["/api/schools"],
    enabled: true,
  });

  // Get instructors
  const { data: instructors } = useQuery({
    queryKey: ["/api/instructors"],
    enabled: true,
  });
  
  // Get evaluations
  const { data: evaluations } = useQuery({
    queryKey: ["/api/evaluations"],
    enabled: true,
  });
  
  // Get attendance
  const { data: attendance } = useQuery({
    queryKey: ["/api/staff-attendance"],
    enabled: true,
  });

  // Get schools
  const schoolOptions = schools?.map((school) => ({
    value: school.id.toString(),
    label: school.name,
  })) || [];
  
  const selectedSchoolDetails = schools?.find(
    (school) => school.id === parseInt(selectedSchool)
  );
  
  // Filter instructors by selected school
  const filteredInstructors = instructors?.filter(
    (instructor) => instructor.schoolId === parseInt(selectedSchool)
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
      
      setLoading(true);
      
      // Get all instructors from selected school
      const schoolInstructors = instructors?.filter(
        (instructor) => instructor.schoolId === parseInt(selectedSchool)
      ) || [];
      
      if (schoolInstructors.length === 0) {
        toast({
          title: "No instructors found",
          description: "No instructors found for the selected school",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Process instructors directly without AI (to avoid rate limits)
      const analyzedInstructors = schoolInstructors.map((instructor) => {
        // Get evaluations for this instructor
        const instructorEvals = evaluations?.filter(e => e.instructorId === instructor.id) || [];
        const evalScore = instructorEvals.length > 0 
          ? instructorEvals.reduce((sum, e) => sum + e.score, 0) / instructorEvals.length 
          : 0;
          
        // Get attendance for this instructor
        const instructorAttendance = attendance?.filter(a => a.instructorId === instructor.id) || [];
        const attendancePercentage = instructorAttendance.length > 0
          ? instructorAttendance.filter(a => a.status.toLowerCase() === 'present').length / instructorAttendance.length * 100
          : 0;
          
        // Calculate overall score based on category weights
        let score = 0;
        
        switch(selectedCategory) {
          case "Perfect Attendance":
            score = Math.round((attendancePercentage * 0.7) + (evalScore * 0.3));
            break;
          case "Outstanding Performance":
            score = Math.round((evalScore * 0.7) + (attendancePercentage * 0.3));
            break;
          case "Employee of the Month":
          default:
            score = Math.round((evalScore * 0.5) + (attendancePercentage * 0.5));
            break;
        }
        
        // Generate strengths based on data
        const strengths = [];
        
        if (attendancePercentage > 90) {
          strengths.push(`Excellent attendance rate of ${attendancePercentage.toFixed(1)}%`);
        } else if (attendancePercentage > 80) {
          strengths.push(`Good attendance rate of ${attendancePercentage.toFixed(1)}%`);
        } else {
          strengths.push(`Attendance rate of ${attendancePercentage.toFixed(1)}%`);
        }
        
        if (evalScore > 90) {
          strengths.push(`Outstanding evaluation score of ${evalScore.toFixed(1)}`);
        } else if (evalScore > 80) {
          strengths.push(`Strong evaluation score of ${evalScore.toFixed(1)}`);
        } else {
          strengths.push(`Evaluation score of ${evalScore.toFixed(1)}`);
        }
        
        if (selectedCategory === "Perfect Attendance" && attendancePercentage > 90) {
          strengths.push("Consistently demonstrates excellent attendance");
        } else if (selectedCategory === "Outstanding Performance" && evalScore > 85) {
          strengths.push("Consistently demonstrates teaching excellence");
        } else {
          strengths.push("Dedicated to professional development");
        }
        
        strengths.push("Contributes positively to school culture");
        
        // Generate nomination reasons
        let nominationReasons = "";
        
        switch(selectedCategory) {
          case "Perfect Attendance":
            nominationReasons = `${instructor.name} has demonstrated exceptional dedication with an attendance rate of ${attendancePercentage.toFixed(1)}% and evaluation score of ${evalScore.toFixed(1)}. This consistent reliability makes them an ideal recipient for the Perfect Attendance award.`;
            break;
          case "Outstanding Performance":
            nominationReasons = `${instructor.name} has achieved remarkable teaching results with an evaluation score of ${evalScore.toFixed(1)} and attendance rate of ${attendancePercentage.toFixed(1)}%. Their commitment to excellence makes them a strong candidate for the Outstanding Performance award.`;
            break;
          case "Employee of the Month":
          default:
            nominationReasons = `${instructor.name} has demonstrated consistent excellence with an evaluation score of ${evalScore.toFixed(1)} and attendance rate of ${attendancePercentage.toFixed(1)}%. Their balanced performance and dedication make them a strong candidate for the Employee of the Month award.`;
            break;
        }
        
        return {
          ...instructor,
          score,
          strengths,
          nominationReasons
        };
      });
      
      // Sort instructors by score
      analyzedInstructors.sort((a, b) => (b.score || 0) - (a.score || 0));
      
      // Take top 3
      const topThree = analyzedInstructors.slice(0, 3);
      
      setTopInstructors(topThree);
      setLoading(false);
      setActiveTab("candidates");
      
      // Select the first instructor by default if available
      if (topThree.length > 0) {
        setSelectedInstructor(topThree[0]);
        
        // Create certificate data
        setCertificateData({
          instructor: topThree[0],
          category: selectedCategory,
          date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          school: selectedSchoolDetails
        });
      }
      
    } catch (error) {
      console.error("Error analyzing instructors:", error);
      toast({
        title: "Error analyzing instructors",
        description: "There was an error analyzing instructors. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const selectCandidate = (instructor: InstructorWithScore) => {
    setSelectedInstructor(instructor);
    
    // Create certificate data
    setCertificateData({
      instructor,
      category: selectedCategory,
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      school: selectedSchoolDetails
    });
    
    // Switch to certificate tab
    setActiveTab("certificate");
  };
  
  const generateCertificate = async () => {
    if (!certificateData) {
      toast({
        title: "No certificate data",
        description: "Please select an instructor and award category first",
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
      pdf.save(`${certificateData.instructor.name} - ${certificateData.category} - Certificate.pdf`);
      
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
        <h1 className="text-3xl font-bold text-primary mb-2">Instructor Recognition Program</h1>
        <p className="text-muted-foreground">
          Recognize outstanding instructors who consistently demonstrate excellence in teaching,
          maintain exemplary attendance records, and contribute to a positive learning environment.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className={`cursor-pointer hover:shadow-md transition-shadow ${
          activeTab === "settings" ? "ring-2 ring-primary" : ""}
        `} onClick={() => setActiveTab("settings")}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Award Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Select the school, time period, and award category
            </p>
          </CardContent>
        </Card>
        
        <Card className={`cursor-pointer hover:shadow-md transition-shadow ${
          activeTab === "candidates" ? "ring-2 ring-primary" : ""}
        `} onClick={() => setActiveTab("candidates")}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Award Candidates</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Top performing instructors based on evaluation scores and attendance
            </p>
          </CardContent>
        </Card>
        
        <Card className={`cursor-pointer hover:shadow-md transition-shadow ${
          activeTab === "certificate" ? "ring-2 ring-primary" : ""}
        `} onClick={() => setActiveTab("certificate")}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Award Certificate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Preview and generate recognition certificates
            </p>
          </CardContent>
        </Card>
      </div>
      
      {activeTab === "settings" && (
        <Card>
          <CardHeader>
            <CardTitle>Award Settings</CardTitle>
          </CardHeader>
          <CardContent>
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
                disabled={loading || !selectedSchool}
              >
                {loading ? (
                  <>
                    <span>Analyzing</span>
                    <span className="ml-2">
                      <span className="inline-block w-2 h-2 bg-white rounded-full animate-bounce mr-1" style={{ animationDelay: '0ms' }}></span>
                      <span className="inline-block w-2 h-2 bg-white rounded-full animate-bounce mr-1" style={{ animationDelay: '150ms' }}></span>
                      <span className="inline-block w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                  </>
                ) : (
                  "Find Top Candidates"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {activeTab === "candidates" && (
        <Card>
          <CardHeader>
            <CardTitle>Award Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            {topInstructors.length === 0 ? (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="mb-2 text-lg font-medium">No candidates analyzed yet</p>
                <p className="text-sm text-muted-foreground mb-4">Select a school and analyze to see the top candidates</p>
                <Button onClick={() => setActiveTab("settings")}>Go to Settings</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Select a candidate to view and generate a certificate
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topInstructors.map((instructor, index) => (
                    <Card 
                      key={instructor.id} 
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        selectedInstructor?.id === instructor.id 
                          ? 'ring-2 ring-primary' 
                          : ''
                      }`}
                      onClick={() => selectCandidate(instructor)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{instructor.name}</CardTitle>
                          {index === 0 && (
                            <Trophy className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm mb-3">
                          <p className="font-semibold mb-1">Rank: #{index + 1}</p>
                          <p className="text-muted-foreground">{instructor.nationality || "N/A"}</p>
                        </div>
                        
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span>Overall Score:</span>
                            <span className="font-medium">{instructor.score?.toFixed(1)}</span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1 mb-2">
                            <div 
                              className="bg-primary rounded-full h-2" 
                              style={{ width: `${instructor.score}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <h4 className="text-sm font-semibold mb-1">Key Strengths:</h4>
                          <ul className="text-xs list-disc pl-4 space-y-1">
                            {instructor.strengths?.slice(0, 2).map((strength, i) => (
                              <li key={i}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {activeTab === "certificate" && (
        <Card>
          <CardHeader>
            <CardTitle>Award Certificate</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedInstructor ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="mb-2 text-lg font-medium">No instructor selected</p>
                <p className="text-sm text-muted-foreground mb-4">Select a candidate to preview their certificate</p>
                <Button onClick={() => setActiveTab("candidates")}>View Candidates</Button>
              </div>
            ) : (
              <div>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Certificate Details</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Instructor
                          </label>
                          <div className="text-sm p-2 border rounded-md">
                            {selectedInstructor.name}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Award Category
                          </label>
                          <div className="text-sm p-2 border rounded-md">
                            {selectedCategory}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            School
                          </label>
                          <div className="text-sm p-2 border rounded-md">
                            {selectedSchoolDetails?.name}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Date
                          </label>
                          <div className="text-sm p-2 border rounded-md">
                            {new Date().toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Nomination Basis</h3>
                      <div className="text-sm border rounded-md p-3 bg-gray-50">
                        {selectedInstructor.nominationReasons || 
                          `${selectedInstructor.name} has demonstrated consistent excellence in teaching and professional conduct, making them an ideal recipient for the ${selectedCategory} award.`
                        }
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full mt-4" 
                      onClick={generateCertificate}
                    >
                      Download Certificate
                    </Button>
                  </div>
                  
                  <div className="w-full md:w-2/3">
                    <div 
                      id="certificate" 
                      className="border rounded-lg overflow-hidden bg-white"
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1.414 / 1', // A4 landscape
                        padding: '40px'
                      }}
                    >
                      <div 
                        style={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          width: '100%', 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '40px'
                        }}
                      >
                        {/* Logo */}
                        <img 
                          src="/logo.png" 
                          alt="GovCIO Logo" 
                          style={{
                            height: '60px',
                            marginBottom: '20px'
                          }}
                        />
                        
                        {/* Header */}
                        <div style={{ 
                          fontSize: '28px', 
                          fontWeight: 'bold',
                          textAlign: 'center',
                          marginBottom: '10px',
                          color: '#152C5B'
                        }}>
                          CERTIFICATE OF RECOGNITION
                        </div>
                        
                        <div style={{ 
                          fontSize: '14px',
                          textAlign: 'center',
                          marginBottom: '30px',
                          color: '#666'
                        }}>
                          {selectedSchoolDetails?.name}
                        </div>
                        
                        {/* Body */}
                        <div style={{ 
                          fontSize: '16px',
                          textAlign: 'center',
                          marginBottom: '15px',
                          maxWidth: '80%'
                        }}>
                          This certificate is presented to
                        </div>
                        
                        <div style={{ 
                          fontSize: '32px',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          marginBottom: '15px',
                          fontFamily: 'cursive',
                          color: '#152C5B'
                        }}>
                          {selectedInstructor.name}
                        </div>
                        
                        <div style={{ 
                          fontSize: '18px',
                          textAlign: 'center',
                          marginBottom: '10px',
                          fontWeight: 'bold',
                          color: '#444'
                        }}>
                          {selectedCategory}
                        </div>
                        
                        <div style={{ 
                          fontSize: '16px',
                          textAlign: 'center',
                          maxWidth: '80%',
                          marginBottom: '30px'
                        }}>
                          for demonstrating exceptional performance and dedication to excellence
                        </div>
                        
                        {/* Date and Signature */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '80%',
                          marginTop: '30px'
                        }}>
                          <div style={{
                            flex: 1,
                            textAlign: 'center',
                            borderTop: '1px solid #999',
                            paddingTop: '10px',
                            marginRight: '40px'
                          }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                              Program Manager
                            </div>
                          </div>
                          
                          <div style={{
                            flex: 1,
                            textAlign: 'center',
                            borderTop: '1px solid #999',
                            paddingTop: '10px'
                          }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                              Date
                            </div>
                            <div style={{ fontSize: '14px', marginTop: '5px' }}>
                              {new Date().toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}