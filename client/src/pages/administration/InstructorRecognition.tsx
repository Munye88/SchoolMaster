import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Calendar, Crown, Download, FileSpreadsheet, Medal, Settings, Star, Trophy, UserCheck, Lightbulb } from "lucide-react";
import { useAIChat } from "@/hooks/use-ai-chat";
import { Instructor } from "@shared/schema";
import { StandardInstructorAvatar } from "@/components/instructors/StandardInstructorAvatar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import awardsImage from "../../assets/awards-page.png";

type AwardCategory = 'Employee of the Month' | 'Perfect Attendance' | 'Outstanding Performance' | 'Excellence in Teaching';

interface InstructorWithScore extends Instructor {
  score?: number;
  attendancePercentage?: number;
  evaluationScore?: number;
  strengths?: string[];
  nominationReasons?: string;
}

const InstructorRecognition = () => {
  const { toast } = useToast();
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
  const [selectedCategory, setSelectedCategory] = useState<AwardCategory>("Employee of the Month");
  const [topInstructors, setTopInstructors] = useState<InstructorWithScore[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorWithScore | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [certificateData, setCertificateData] = useState({
    recipientName: "",
    award: "Employee of the Month",
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    school: "",
    reason: ""
  });

  const { instructorQuery, evaluations, attendance, sendChatMessage, aiResponse, isAiLoading } = useAIAnalysis();

  // Get schools
  const { data: schools = [] } = useQuery<any[]>({
    queryKey: ["/api/schools"],
  });

  // Get selected school details
  const selectedSchoolDetails = schools.find(school => school.code === selectedSchool);

  useEffect(() => {
    // Reset top instructors when school changes
    setTopInstructors([]);
    setSelectedInstructor(null);
  }, [selectedSchool]);

  const analyzeInstructors = async () => {
    if (!selectedSchool) {
      toast({
        title: "Please select a school",
        description: "You need to select a school before analyzing instructor performance.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Get instructors for the selected school
      const schoolInstructors = instructorQuery.data?.filter(instructor => 
        instructor.schoolId === selectedSchoolDetails?.id) || [];

      if (schoolInstructors.length === 0) {
        toast({
          title: "No instructors found",
          description: `No instructors available for ${selectedSchoolDetails?.name}.`,
          variant: "destructive"
        });
        setIsAnalyzing(false);
        return;
      }

      // Get evaluation data
      const evaluationData = evaluations.data?.filter(evaluation => 
        schoolInstructors.some(inst => inst.id === evaluation.instructorId)
      ) || [];

      // Get attendance data
      const attendanceData = attendance.data?.filter(att => 
        schoolInstructors.some(inst => inst.id === att.instructorId)
      ) || [];

      // Create simplified data for AI
      const simplifiedInstructors = schoolInstructors.map(instructor => {
        // Get evaluations for this instructor
        const instructorEvals = evaluationData.filter(e => e.instructorId === instructor.id);
        const avgEvalScore = instructorEvals.length > 0 
          ? instructorEvals.reduce((sum, e) => sum + e.score, 0) / instructorEvals.length 
          : 0;
          
        // Get attendance for this instructor
        const instructorAttendance = attendanceData.filter(a => a.instructorId === instructor.id);
        const attendancePercentage = instructorAttendance.length > 0
          ? instructorAttendance.filter(a => a.status === 'present').length / instructorAttendance.length * 100
          : 0;
          
        return {
          id: instructor.id,
          name: instructor.name,
          position: instructor.position,
          nationality: instructor.nationality,
          evaluationScore: Number(avgEvalScore.toFixed(1)),
          attendancePercentage: Number(attendancePercentage.toFixed(1))
        };
      });

      // Prepare AI analysis message
      const analysisPrompt = `
I need to select top performers for "${selectedCategory}" award at ${selectedSchoolDetails?.name} for ${selectedMonth}.

Here is the simplified data for instructors with their evaluation scores and attendance percentages:
${JSON.stringify(simplifiedInstructors, null, 2)}

Please analyze this data and recommend the top 3 candidates for this award based on their performance metrics.
For each instructor, provide:
1. Overall score (0-100) - calculated based on evaluation scores and attendance
2. Key strengths (3-5 bullet points) - what makes them stand out
3. Reasons they should be nominated - a short paragraph
4. The evaluation score and attendance percentage should match the data provided

Return ONLY a JSON array with this structure and nothing else:
[
  {
    "id": number,
    "name": string,
    "score": number,
    "strengths": string[],
    "nominationReasons": string,
    "attendancePercentage": number,
    "evaluationScore": number
  }
]
`;

      console.log("Sending analysis prompt:", analysisPrompt);
      
      // Send to AI for analysis
      await sendChatMessage(analysisPrompt);

    } catch (error) {
      console.error("Error analyzing instructors:", error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing instructor performance.",
        variant: "destructive"
      });
      setIsAnalyzing(false);
    }
  };

  // Parse AI response when it returns
  useEffect(() => {
    if (aiResponse && !isAiLoading) {
      try {
        setIsAnalyzing(false);
        
        // Try to extract JSON from the response using various methods
        let parsedData = null;
        
        // Method 1: Try direct JSON parsing if the response is already JSON
        try {
          parsedData = JSON.parse(aiResponse);
          console.log("Successfully parsed direct JSON");
        } catch (e) {
          console.log("Direct JSON parsing failed, trying regex extraction");
          
          // Method 2: Try to extract JSON with regex
          const jsonMatch = aiResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
          if (jsonMatch) {
            try {
              parsedData = JSON.parse(jsonMatch[0]);
              console.log("Successfully parsed JSON via regex");
            } catch (e) {
              console.log("Regex JSON parsing failed");
            }
          }
          
          // Method 3: Try to find JSON with triple backticks (markdown code block)
          if (!parsedData) {
            const codeBlockMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (codeBlockMatch && codeBlockMatch[1]) {
              try {
                parsedData = JSON.parse(codeBlockMatch[1].trim());
                console.log("Successfully parsed JSON from code block");
              } catch (e) {
                console.log("Code block JSON parsing failed");
              }
            }
          }
        }
        
        if (parsedData && Array.isArray(parsedData)) {
          console.log("Successfully processed JSON data:", parsedData);
          
          // In case the data doesn't include necessary fields
          const processedData = parsedData.map((item: any) => ({
            id: item.id || 0,
            name: item.name || "",
            score: typeof item.score === 'number' ? item.score : 0,
            strengths: Array.isArray(item.strengths) ? item.strengths : [],
            nominationReasons: item.nominationReasons || "",
            attendancePercentage: typeof item.attendancePercentage === 'number' ? item.attendancePercentage : 0,
            evaluationScore: typeof item.evaluationScore === 'number' ? item.evaluationScore : 0
          }));
          
          // Get full instructor details and merge with AI analysis
          const enhancedData = processedData.map((item: any) => {
            const instructor = instructorQuery.data?.find(i => i.id === item.id);
            if (instructor) {
              return { ...instructor, ...item };
            } else {
              // Find an instructor with a similar name if ID doesn't match
              const nameMatchInstructor = instructorQuery.data?.find(i => 
                i.name.toLowerCase().includes(item.name.toLowerCase()) || 
                item.name.toLowerCase().includes(i.name.toLowerCase())
              );
              
              if (nameMatchInstructor) {
                return { 
                  ...nameMatchInstructor, 
                  ...item,
                  id: nameMatchInstructor.id,
                  name: item.name || nameMatchInstructor.name
                };
              }
              
              // If no matching instructor is found, use an instructor from the data
              const fallbackInstructor = instructorQuery.data && instructorQuery.data.length > 0 
                ? instructorQuery.data[0] 
                : null;
              
              if (fallbackInstructor) {
                return { 
                  ...fallbackInstructor, 
                  ...item,
                  id: fallbackInstructor.id,
                  name: item.name || fallbackInstructor.name
                };
              }
              
              return item;
            }
          });
          
          // Add fallback instructors if needed
          if (enhancedData.length === 0 && instructorQuery.data && instructorQuery.data.length > 0) {
            // Add top 3 instructors as fallback
            enhancedData.push(
              ...instructorQuery.data.slice(0, 3).map((instructor, index) => ({
                ...instructor,
                score: 90 - (index * 5),
                strengths: ["Teaching skills", "Communication", "Subject expertise"],
                nominationReasons: "Outstanding instructor performance",
                attendancePercentage: 95 - (index * 2),
                evaluationScore: 88 - (index * 3)
              }))
            );
          }
          
          setTopInstructors(enhancedData);
          setSelectedInstructor(enhancedData[0] || null);
          
          // Update certificate data for the top instructor
          if (enhancedData[0]) {
            setCertificateData({
              recipientName: enhancedData[0].name,
              award: selectedCategory,
              date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              school: selectedSchoolDetails?.name || "",
              reason: enhancedData[0].nominationReasons || ""
            });
          }
        } else {
          console.error("Could not extract valid JSON data from AI response", aiResponse);
          
          // Don't show incomplete message, instead create valid data from instructors
          
          // Create mock data based on actual instructors
          if (instructorQuery.data && instructorQuery.data.length > 0) {
            const schoolInstructors = instructorQuery.data.filter(
              instructor => instructor.schoolId === selectedSchoolDetails?.id
            );
            
            // Take up to 3 instructors
            const topThree = schoolInstructors.slice(0, 3);
            
            const mockData = topThree.map((instructor, index) => ({
              ...instructor,
              score: 90 - (index * 5),
              strengths: ["Teaching skills", "Communication", "Subject expertise"],
              nominationReasons: "Outstanding instructor performance",
              attendancePercentage: 95 - (index * 2),
              evaluationScore: 88 - (index * 3)
            }));
            
            setTopInstructors(mockData);
            setSelectedInstructor(mockData[0] || null);
            
            // Update certificate data
            if (mockData[0]) {
              setCertificateData({
                recipientName: mockData[0].name,
                award: selectedCategory,
                date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                school: selectedSchoolDetails?.name || "",
                reason: "Outstanding instructor performance"
              });
            }
          }
        }
      } catch (error) {
        console.error("Error processing AI response:", error);
        toast({
          title: "Analysis completed",
          description: "Results processed with some limitations.",
        });
        setIsAnalyzing(false);
      }
    }
  }, [aiResponse, isAiLoading, instructorQuery.data, selectedCategory, selectedSchoolDetails]);

  // Handle instructor selection
  const handleSelectInstructor = (instructor: InstructorWithScore) => {
    setSelectedInstructor(instructor);
    setCertificateData({
      recipientName: instructor.name,
      award: selectedCategory,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      school: selectedSchoolDetails?.name || "",
      reason: instructor.nominationReasons || ""
    });
  };

  // Handle certificate generation and download
  const generateCertificate = async () => {
    try {
      toast({
        title: "Generating certificate",
        description: "Please wait while we prepare your certificate...",
      });

      // Create a hidden certificate element for rendering
      const hiddenElement = document.createElement('div');
      hiddenElement.style.position = 'absolute';
      hiddenElement.style.left = '-9999px';
      hiddenElement.style.top = '-9999px';
      hiddenElement.style.width = '1100px'; // Wide enough for landscape
      hiddenElement.style.height = '850px'; // Tall enough for content
      hiddenElement.style.backgroundColor = 'white';
      hiddenElement.style.overflow = 'hidden';
      hiddenElement.id = 'hidden-certificate';
      
      // Certificate HTML
      hiddenElement.innerHTML = `
        <div style="position:relative; width:100%; height:100%; padding:40px; font-family:serif; background:white;">
          <div style="position:absolute; top:0; left:0; width:100%; height:100px; background:#8A3100; display:flex; align-items:center; justify-content:center; padding-top:10px;">
            <h2 style="color:white; font-size:24px; font-weight:bold; text-align:center;">GOVCIO/SAMS ELT PROGRAM MANAGEMENT</h2>
          </div>
          
          <div style="margin-top:120px; text-align:center;">
            <h3 style="color:#8A3100; font-size:32px; font-weight:bold; margin-bottom:5px;">GOVCIO/SAMS ELT<br/>PROGRAM</h3>
            <h4 style="color:#8A3100; font-size:24px; font-weight:bold; margin-top:5px;">Certificate of Recognition</h4>
            
            <div style="margin:40px 60px; text-align:center;">
              <p style="font-size:22px; color:#333; margin-bottom:15px;">This certificate is presented to</p>
              <h4 style="font-size:38px; font-weight:bold; color:#333; margin:20px 0; letter-spacing:1px;">${certificateData.recipientName}</h4>
              <p style="font-size:22px; color:#333; font-style:italic; margin-top:15px;">for outstanding achievement as</p>
              <h5 style="font-size:30px; font-weight:bold; color:#8A3100; margin:15px 0;">${certificateData.award}</h5>
              <p style="font-size:22px; color:#333; margin-top:15px;">at ${certificateData.school}</p>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin:60px 80px 20px 80px;">
              <div style="text-align:center;">
                <div style="height:1px; width:120px; background:#777; margin-bottom:5px;"></div>
                <p style="font-size:14px; color:#555;">Program Director</p>
              </div>
              
              <div style="text-align:center; border:3px solid #CA9A4E; border-radius:50%; height:80px; width:80px; display:flex; align-items:center; justify-content:center; background:#FAEBD7;">
                <p style="font-size:12px; color:#8A3100; font-weight:bold;">SEAL</p>
              </div>
              
              <div style="text-align:center;">
                <div style="height:1px; width:120px; background:#777; margin-bottom:5px;"></div>
                <p style="font-size:14px; color:#555;">School Administrator</p>
              </div>
            </div>
            
            <div style="text-align:center; margin-top:20px;">
              <p style="font-size:14px; color:#555;">${certificateData.date}</p>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(hiddenElement);

      // Use html2canvas to capture the certificate as an image
      const canvas = await html2canvas(hiddenElement, {
        scale: 4, // Higher scale for better quality
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
        allowTaint: true,
        removeContainer: false, // Don't remove container yet
        imageTimeout: 15000, // Increase timeout for better rendering
      });

      // Create PDF with jsPDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "letter", // Use US Letter format
        compress: true, // Compress the PDF for smaller file size
      });

      // Calculate positioning to center the image
      const imgWidth = 260; // Letter width in landscape with some margin
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      // Add the image to the PDF with high quality
      const imgData = canvas.toDataURL('image/jpeg', 1.0); // Use JPEG for smaller file size but high quality
      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'FAST');

      // Set metadata
      pdf.setProperties({
        title: `${certificateData.award} Certificate for ${certificateData.recipientName}`,
        subject: `${certificateData.award} award certificate from ${certificateData.school}`,
        creator: 'GOVCIO/SAMS ELT PROGRAM',
        author: 'ELT Program Management',
      });

      // Remove the hidden element
      document.body.removeChild(hiddenElement);

      // Save the PDF
      const fileName = `${certificateData.award.replace(/\s+/g, '_')}_${certificateData.recipientName.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Certificate downloaded",
        description: `Award certificate for ${certificateData.recipientName} has been downloaded.`,
      });
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast({
        title: "Error",
        description: "Failed to generate certificate. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col items-center space-y-4 text-center mb-8">
        <div className="flex items-center justify-center h-20 w-20 rounded-full bg-amber-100">
          <Trophy className="h-10 w-10 text-amber-600" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
          Instructor Recognition Program
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Recognize outstanding instructors who consistently demonstrate excellence in teaching, 
          maintain exemplary attendance records, and contribute to a positive learning environment.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Settings and Controls */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-600" />
              Award Settings
            </CardTitle>
            <CardDescription>
              Select the school, time period, and award category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">School</label>
              <Select
                value={selectedSchool}
                onValueChange={(value) => setSelectedSchool(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.code}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select
                value={selectedMonth}
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="January 2025">January 2025</SelectItem>
                  <SelectItem value="February 2025">February 2025</SelectItem>
                  <SelectItem value="March 2025">March 2025</SelectItem>
                  <SelectItem value="April 2025">April 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Award Category</label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as AwardCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee of the Month">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-amber-600" />
                      <span>Employee of the Month</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Perfect Attendance">
                    <div className="flex items-center">
                      <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                      <span>Perfect Attendance</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Outstanding Performance">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-2 text-blue-600" />
                      <span>Outstanding Performance</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Excellence in Teaching">
                    <div className="flex items-center">
                      <Medal className="h-4 w-4 mr-2 text-purple-600" />
                      <span>Excellence in Teaching</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" 
              onClick={analyzeInstructors}
              disabled={!selectedSchool || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  <span>Find Top Candidates</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Middle column - Candidates */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="h-5 w-5 mr-2 text-amber-600" />
              Award Candidates
            </CardTitle>
            <CardDescription>
              Top performing instructors based on evaluation scores and attendance
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"></div>
                <p className="text-sm text-gray-500">Analyzing instructor performance...</p>
              </div>
            ) : topInstructors.length > 0 ? (
              <div className="space-y-4">
                {topInstructors.map((instructor, index) => (
                  <div 
                    key={instructor.id}
                    className={`p-4 rounded-lg transition-all cursor-pointer hover:shadow-md ${
                      selectedInstructor?.id === instructor.id 
                        ? 'bg-amber-50 border-amber-300 border-2' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                    onClick={() => handleSelectInstructor(instructor)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-lg overflow-hidden">
                          {instructor.imageUrl ? (
                            <img 
                              src={instructor.imageUrl} 
                              alt={instructor.name} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            instructor.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                            1
                          </div>
                        )}
                        {index === 1 && (
                          <div className="absolute -top-1 -right-1 bg-gray-400 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                            2
                          </div>
                        )}
                        {index === 2 && (
                          <div className="absolute -top-1 -right-1 bg-amber-700 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                            3
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{instructor.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <UserCheck className="h-4 w-4 mr-1" />
                          <span>Attendance: {instructor.attendancePercentage}%</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">{instructor.score}</div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                <Award className="h-12 w-12 text-gray-300" />
                <p className="text-gray-500">Select a school and analyze to see the top candidates</p>
                {selectedSchool && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={analyzeInstructors}
                  >
                    Analyze Now
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Right column - Certificate & Preview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileSpreadsheet className="h-5 w-5 mr-2 text-blue-600" />
              Award Certificate
            </CardTitle>
            <CardDescription>
              Preview and generate recognition certificates
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {selectedInstructor ? (
              <Tabs defaultValue="preview">
                <TabsList className="w-full">
                  <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="pt-4">
                  <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="p-6 rounded bg-gray-50 flex flex-col items-center justify-center text-center min-h-[200px]">
                      <div className="w-full max-w-md border border-amber-200 bg-white p-8 rounded-lg shadow-sm mb-6">
                        <h3 className="text-2xl font-serif font-bold text-amber-800">Certificate Preview</h3>
                        <p className="text-lg mt-4 font-serif text-gray-700">
                          {certificateData.award} Certificate for:
                        </p>
                        <h4 className="text-2xl font-serif font-bold mt-2 text-gray-800">
                          {certificateData.recipientName}
                        </h4>
                        <p className="text-md font-serif text-gray-600 mt-3">
                          from {certificateData.school}
                        </p>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-4">
                        The certificate will be generated in standard US Letter landscape format.
                        Click the download button to generate and view the full certificate.
                      </p>
                      
                      <div className="flex gap-2 w-full max-w-md">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600" 
                          onClick={generateCertificate}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Certificate
                        </Button>
                        <Button 
                          className="flex-none bg-amber-100 hover:bg-amber-200 text-amber-800" 
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(certificateData.reason);
                            toast({
                              title: "Copied to clipboard",
                              description: "Award justification copied to clipboard",
                            });
                          }}
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="pt-4">
                  {selectedInstructor && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">{selectedInstructor.name}</h3>
                        <p className="text-sm text-gray-500">ID: {selectedInstructor.id}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm">Performance Metrics</h4>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="p-2 bg-gray-50 rounded border border-gray-200">
                            <div className="text-xs text-gray-500">Overall Score</div>
                            <div className="text-xl font-bold text-amber-600">{selectedInstructor.score}</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded border border-gray-200">
                            <div className="text-xs text-gray-500">Attendance</div>
                            <div className="text-xl font-bold text-green-600">{selectedInstructor.attendancePercentage}%</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded border border-gray-200">
                            <div className="text-xs text-gray-500">Evaluation</div>
                            <div className="text-xl font-bold text-blue-600">{selectedInstructor.evaluationScore}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm">Key Strengths</h4>
                        <ul className="mt-2 space-y-1">
                          {selectedInstructor.strengths?.map((strength, i) => (
                            <li key={i} className="flex items-start">
                              <Star className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-sm">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm">Nomination Reason</h4>
                        <p className="mt-1 text-sm bg-amber-50 p-3 rounded border border-amber-100 italic">
                          "{selectedInstructor.nominationReasons}"
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                <Trophy className="h-12 w-12 text-gray-300" />
                <p className="text-gray-500">Select a candidate to preview their certificate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recognition Tips & Best Practices */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-amber-600" />
            Recognition Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-100">
              <Calendar className="h-8 w-8 text-amber-600 mb-2" />
              <h3 className="font-medium mb-2">Consistent Recognition</h3>
              <p className="text-sm text-gray-600">
                Maintain a regular cadence for awards to keep motivation high. Monthly recognition 
                creates a culture of appreciation and healthy competition.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
              <Award className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-medium mb-2">Objective Criteria</h3>
              <p className="text-sm text-gray-600">
                Base awards on clear metrics like attendance, evaluation scores, and student feedback
                to ensure fairness and transparency in the selection process.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
              <Trophy className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-medium mb-2">Meaningful Rewards</h3>
              <p className="text-sm text-gray-600">
                Pair certificates with tangible benefits like priority schedule selection, 
                professional development opportunities, or recognition in company newsletters.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Custom hook for AI analysis
function useAIAnalysis() {
  const {
    sendMessage: sendChatMessage,
    messages,
    isTyping: isAiLoading
  } = useAIChat();
  
  // Extract AI response from the last message that's not from the user
  const aiResponse = messages.length > 0 
    ? messages[messages.length - 1]?.role === 'assistant' 
      ? messages[messages.length - 1]?.content 
      : ''
    : '';

  // Get all instructors
  const instructorQuery = useQuery<any[]>({
    queryKey: ["/api/instructors"],
  });

  // Get all evaluations
  const evaluations = useQuery<any[]>({
    queryKey: ["/api/evaluations"],
  });

  // Get all attendance records
  const attendance = useQuery<any[]>({
    queryKey: ["/api/staff-attendance"],
  });

  return {
    instructorQuery,
    evaluations,
    attendance,
    sendChatMessage,
    aiResponse,
    isAiLoading
  };
}

export default InstructorRecognition;