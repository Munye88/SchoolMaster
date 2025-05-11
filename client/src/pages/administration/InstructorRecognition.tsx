import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAIChat } from "@/hooks/use-ai-chat";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { School, Instructor } from "@shared/schema";
import { Trophy, Award, User, Calendar, BarChart } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
// Logo is referenced directly from public folder
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface InstructorWithScore extends Instructor {
  score?: number;
  strengths?: string[];
  nominationReasons?: string;
  photoUrl?: string;
  position?: string;
  experience?: number;
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

  const schoolOptions = schools?.map((school: School) => ({
    value: school.id.toString(),
    label: school.name,
  })) || [];
  
  // Find selected school details
  const selectedSchoolDetails = schools?.find(
    (school: School) => school.id === parseInt(selectedSchool)
  );
  
  // Filter instructors by selected school
  const filteredInstructors = instructors?.filter(
    (instructor: Instructor) => instructor.schoolId === parseInt(selectedSchool)
  ) || [];

  // Define months for dropdown
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Define award categories for dropdown
  const categories = [
    "Employee of the Month", 
    "Perfect Attendance", 
    "Outstanding Performance", 
    "Leadership Excellence", 
    "Innovation Award"
  ];
  
  // Function to find top instructors using AI analysis
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
      
      // Collect data for AI analysis
      const schoolInstructors = instructors?.filter(
        instructor => instructor.schoolId === parseInt(selectedSchool)
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
      
      // Prepare instructor data for analysis
      const instructorData = schoolInstructors.map(instructor => {
        // Get evaluations for this instructor
        const instructorEvals = evaluations?.filter(e => e.instructorId === instructor.id) || [];
        const evalScores = instructorEvals.map(e => e.score);
        
        // Get attendance for this instructor
        const instructorAttendance = attendance?.filter(a => a.instructorId === instructor.id) || [];
        const attendanceRate = instructorAttendance.length > 0
          ? (instructorAttendance.filter(a => a.status.toLowerCase() === 'present').length / instructorAttendance.length) * 100
          : 0;
        
        return {
          id: instructor.id,
          name: instructor.name,
          nationality: instructor.nationality || 'Unknown',
          position: instructor.position || 'Instructor',
          evaluationScores: evalScores,
          attendanceRate: attendanceRate
        };
      });
      
      // Prepare prompt for AI
      const prompt = `Analyze these instructors for the "${selectedCategory}" award:
${JSON.stringify(instructorData)}

Select the top 3 candidates based on these criteria:
- For "Employee of the Month": Balance of evaluation scores and attendance.
- For "Perfect Attendance": Prioritize attendance rate, then evaluation scores.
- For "Outstanding Performance": Prioritize evaluation scores, then attendance.
- For "Leadership Excellence": Look for higher positions and good evaluations.
- For "Innovation Award": Consider nationality diversity and consistent evaluation improvement.

For each instructor, provide:
1. An overall score (90-100 range)
2. Key strengths (3-4 bullet points)
3. Brief nomination reasons
4. Relevant metrics (evaluation average, attendance percentage)

Format your response as a JSON array of objects with properties: id, score, strengths (array), and nominationReasons (string).`;
      
      // Call AI service for analysis
      const aiResponse = await askAI(prompt);
      
      if (!aiResponse) {
        toast({
          title: "Analysis failed",
          description: "Could not get AI recommendations. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      try {
        // Try to extract JSON from response
        const jsonStart = aiResponse.indexOf('[');
        const jsonEnd = aiResponse.lastIndexOf(']') + 1;
        const jsonStr = aiResponse.substring(jsonStart, jsonEnd);
        
        let recommendations = JSON.parse(jsonStr);
        
        // Map recommendations to instructor objects
        const analyzedInstructors = recommendations.map((rec: any) => {
          const instructor = schoolInstructors.find(i => i.id === rec.id);
          
          if (!instructor) return null;
          
          return {
            ...instructor,
            score: rec.score || 95,
            strengths: rec.strengths || [],
            nominationReasons: rec.nominationReasons || ""
          };
        }).filter(Boolean);
        
        // Update state with top instructors
        setTopInstructors(analyzedInstructors);
        setActiveTab("candidates");
        
        // Select first instructor by default
        if (analyzedInstructors.length > 0) {
          setSelectedInstructor(analyzedInstructors[0]);
          setCertificateData({
            instructor: analyzedInstructors[0],
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
        console.error("Error parsing AI response:", error);
        // Fallback to a simple algorithm if AI response can't be parsed
        const scoredInstructors = instructorData.map(data => {
          // Get original instructor object
          const instructor = schoolInstructors.find(i => i.id === data.id);
          
          if (!instructor) return null;
          
          // Calculate average evaluation score
          const avgEvalScore = data.evaluationScores.length > 0
            ? data.evaluationScores.reduce((sum, score) => sum + score, 0) / data.evaluationScores.length
            : 0;
          
          // Calculate score based on category
          let score = 0;
          switch(selectedCategory) {
            case "Perfect Attendance":
              score = (data.attendanceRate * 0.7) + (avgEvalScore * 0.3);
              break;
            case "Outstanding Performance":
              score = (avgEvalScore * 0.7) + (data.attendanceRate * 0.3);
              break;
            default:
              score = (avgEvalScore * 0.5) + (data.attendanceRate * 0.5);
          }
          
          // Normalize score to 90-100 range
          const normalizedScore = 90 + (score / 100) * 10;
          
          // Generate strengths
          const strengths = [];
          if (data.attendanceRate > 90) {
            strengths.push("Excellent attendance record");
          }
          if (avgEvalScore > 85) {
            strengths.push("Strong teaching evaluations");
          }
          if (instructor.experience > 5) {
            strengths.push("Significant teaching experience");
          }
          strengths.push("Contributes to positive learning environment");
          
          return {
            ...instructor,
            score: normalizedScore,
            strengths,
            nominationReasons: `${instructor.name} has demonstrated excellence with an evaluation average of ${avgEvalScore.toFixed(1)} and attendance rate of ${data.attendanceRate.toFixed(1)}%, making them an ideal candidate for the ${selectedCategory} award.`
          };
        }).filter(Boolean);
        
        // Sort by score
        scoredInstructors.sort((a, b) => b.score - a.score);
        
        // Take top 3
        const topThree = scoredInstructors.slice(0, 3);
        
        setTopInstructors(topThree);
        setActiveTab("candidates");
        
        if (topThree.length > 0) {
          setSelectedInstructor(topThree[0]);
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
      }
      
    } catch (error) {
      console.error("Error analyzing instructors:", error);
      toast({
        title: "Error analyzing instructors",
        description: "There was an error analyzing instructors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectCandidate = (instructor: InstructorWithScore) => {
    setSelectedInstructor(instructor);
    
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
      
      // Generate PDF
      setLoading(true);
      
      // Create canvas from certificate element
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
      
      // Calculate positions
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const width = pdfWidth;
      const height = pdfWidth / ratio;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, (pdfHeight - height) / 2, width, height);
      
      // Save PDF
      pdf.save(`${certificateData.instructor.name} - ${certificateData.category} Certificate.pdf`);
      
      setLoading(false);
      
      toast({
        title: "Certificate generated",
        description: "Certificate has been downloaded",
      });
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast({
        title: "Error generating certificate",
        description: "There was an error generating the certificate. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-amber-100 rounded-full p-4 mr-3">
          <Trophy className="h-8 w-8 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Instructor Recognition Program</h1>
          <p className="text-muted-foreground">
            Recognize outstanding instructors who demonstrate excellence in teaching
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="settings" className="flex items-center justify-center gap-2">
            <Award className="h-4 w-4" />
            <span>Award Settings</span>
          </TabsTrigger>
          <TabsTrigger value="candidates" className="flex items-center justify-center gap-2">
            <User className="h-4 w-4" />
            <span>Award Candidates</span>
          </TabsTrigger>
          <TabsTrigger value="certificate" className="flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Award Certificate</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Award Settings</CardTitle>
              <CardDescription>
                Configure the criteria for instructor recognition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">School</label>
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select school" />
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Award Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                disabled={loading || isProcessing || !selectedSchool}
              >
                {loading || isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Find Top Candidates"
                )}
              </Button>
              
              {(loading || isProcessing) && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Analyzing instructor data...</p>
                  <Progress value={65} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="candidates">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Instructors</CardTitle>
              <CardDescription>
                Based on evaluation scores, attendance, and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topInstructors.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No candidates analyzed yet</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Use the settings tab to select a school and analyze instructor performance
                  </p>
                  <Button onClick={() => setActiveTab("settings")}>
                    Go to Settings
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topInstructors.map((instructor, index) => (
                    <Card 
                      key={instructor.id} 
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        selectedInstructor?.id === instructor.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => selectCandidate(instructor)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-2">
                              <AvatarImage src={instructor.photoUrl || undefined} alt={instructor.name} />
                              <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{instructor.name}</CardTitle>
                              <CardDescription>{instructor.position || "Instructor"}</CardDescription>
                            </div>
                          </div>
                          {index === 0 && (
                            <Badge variant="default" className="bg-amber-500">
                              Top Pick
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Overall Score</span>
                            <span className="text-sm font-bold">{instructor.score?.toFixed(1)}%</span>
                          </div>
                          <Progress value={instructor.score} className="h-2" />
                        </div>
                        
                        <div className="space-y-1 mb-3">
                          <p className="text-sm font-medium">Key Strengths:</p>
                          <ul className="text-sm space-y-1 list-disc pl-4">
                            {instructor.strengths?.slice(0, 3).map((strength, i) => (
                              <li key={i} className="text-muted-foreground">{strength}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button variant="link" size="sm" className="px-0">
                              View nomination details
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Nomination Reasons</h4>
                              <p className="text-sm">{instructor.nominationReasons}</p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="certificate">
          <Card>
            <CardHeader>
              <CardTitle>Award Certificate</CardTitle>
              <CardDescription>
                Generate a certificate for the selected instructor
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedInstructor ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No instructor selected</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Select an instructor from the candidates tab to generate a certificate
                  </p>
                  <Button onClick={() => setActiveTab("candidates")}>
                    Select Candidate
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Instructor</p>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={selectedInstructor.photoUrl || undefined} alt={selectedInstructor.name} />
                            <AvatarFallback>{selectedInstructor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{selectedInstructor.name}</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Award Category</p>
                        <p>{selectedCategory}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">School</p>
                        <p>{selectedSchoolDetails?.name}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Date</p>
                        <p>{new Date().toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={generateCertificate}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Download Certificate"
                        )}
                      </Button>
                    </div>
                    
                    <div className="col-span-2 border rounded-lg overflow-hidden bg-white relative">
                      <div 
                        id="certificate" 
                        className="p-8 flex flex-col items-center justify-center min-h-[400px]"
                      >
                        {/* Logo */}
                        <img 
                          src="/logo.png" 
                          alt="GovCIO Logo" 
                          className="h-14 mb-4"
                        />
                        
                        {/* Certificate title */}
                        <h2 className="text-2xl font-bold text-center text-primary mb-1">
                          Certificate of Recognition
                        </h2>
                        
                        <p className="text-sm text-gray-500 mb-6 text-center">
                          {selectedSchoolDetails?.name}
                        </p>
                        
                        <p className="text-center mb-2">
                          This certificate is presented to
                        </p>
                        
                        <p className="text-3xl font-bold text-center text-primary mb-2 font-serif">
                          {selectedInstructor.name}
                        </p>
                        
                        <p className="text-xl font-semibold text-center mb-2">
                          {selectedCategory}
                        </p>
                        
                        <p className="text-center max-w-md mb-8">
                          For demonstrating exceptional performance, dedication to excellence, and outstanding contribution to the English Language Training Program.
                        </p>
                        
                        <div className="flex justify-between w-full max-w-md mt-8">
                          <div className="text-center">
                            <div className="border-t border-gray-300 pt-2 w-32">
                              <p className="font-medium">Program Manager</p>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="border-t border-gray-300 pt-2 w-32">
                              <p className="font-medium">Date</p>
                              <p className="text-sm">
                                {new Date().toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}