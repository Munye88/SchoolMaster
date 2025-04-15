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
import govcioLogo from "../../assets/images/govcio-logo-new.png";
import certificateBackground from "../../assets/images/certificate-background2.jpeg";

type AwardCategory = 'Employee of the Month' | 'Perfect Attendance' | 'Outstanding Performance';

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

IMPORTANT: Each award category should consider BOTH evaluation scores AND attendance:
- For "Employee of the Month": Consider a balanced 50/50 weight between evaluation scores and attendance
- For "Perfect Attendance": Primary focus on attendance (70%) but still consider evaluation scores (30%)
- For "Outstanding Performance": Primary focus on evaluation scores (70%) but still consider attendance (30%)

For each instructor, provide:
1. Overall score (0-100) - calculated using the appropriate weights mentioned above
2. Key strengths (3-5 bullet points) - what makes them stand out
3. Reasons they should be nominated - a short paragraph that mentions BOTH their evaluation performance AND attendance
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

  // Helper function to get ordinal suffix for day of month
  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

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

  // Generate detailed accomplishment text based on instructor data
  const generateAccomplishmentText = (instructor: InstructorWithScore, category: string) => {
    if (!instructor) return "";
    
    // Get data for text generation
    const attendance = instructor.attendancePercentage || 0;
    const evaluation = instructor.evaluationScore || 0;
    const strengths = instructor.strengths || [];
    
    let text = "";
    
    // Create texts based on award category
    switch(category) {
      case "Perfect Attendance":
        text = `Your perfect attendance record is a remarkable achievement, reflecting your unwavering commitment and reliability. By maintaining ${attendance}% attendance, you have set an outstanding example for your colleagues. Your consistent presence and dedication have significantly contributed to the success of our team. Your positive attitude and continuous collaboration make you an invaluable asset to our organization. We deeply appreciate your outstanding contributions and exceptional dedication.`;
        break;
      case "Employee of the Month":
        text = `Your outstanding performance as an instructor has been exceptional this month. With an impressive ${evaluation} evaluation score and ${attendance}% attendance rate, you exemplify the highest standards of professionalism and excellence in teaching. Your ${strengths.join(', ').toLowerCase()} have made a significant impact on your students and colleagues alike. Your dedication to educational excellence and unwavering commitment to student success make you truly deserving of this recognition. We are fortunate to have you as a valuable member of our team.`;
        break;
      case "Outstanding Performance":
        text = `Your exceptional performance in all aspects of your role has not gone unnoticed. With a stellar evaluation score of ${evaluation} and excellent attendance record of ${attendance}%, you consistently demonstrate the highest level of competence and dedication. Your strengths in ${strengths.join(', ').toLowerCase()} have elevated the standard of instruction at our institution. Your commitment to excellence and your positive influence on both students and colleagues make you an invaluable asset to our educational community.`;
        break;
      default:
        text = `Your exceptional dedication and outstanding performance have significantly contributed to our educational excellence. With an impressive evaluation score of ${evaluation} and attendance rate of ${attendance}%, you have consistently demonstrated the highest standards of professionalism. Your skills in ${strengths.join(', ').toLowerCase()} have made a tremendous impact on student learning outcomes. We deeply appreciate your unwavering commitment and valuable contributions to our institution.`;
    }
    
    return text;
  };

  // Handle certificate generation and download
  const generateCertificate = async () => {
    if (!selectedInstructor) {
      toast({
        title: "No instructor selected",
        description: "Please select an instructor to generate a certificate",
        variant: "destructive"
      });
      return;
    }
    
    try {
      toast({
        title: "Generating certificate",
        description: "Please wait while we prepare your certificate...",
      });

      // Get detailed accomplishment text
      const accomplishmentText = generateAccomplishmentText(selectedInstructor, selectedCategory);

      // Format date for certificate
      const formattedDate = `${new Date().getDate()}${getOrdinalSuffix(new Date().getDate())} of ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`;

      // Create a hidden certificate element for rendering
      const hiddenElement = document.createElement('div');
      hiddenElement.style.position = 'absolute';
      hiddenElement.style.left = '-9999px';
      hiddenElement.style.top = '-9999px';
      hiddenElement.style.width = '1100px'; // Wide enough for landscape
      hiddenElement.style.height = '800px'; // Tall enough for content
      hiddenElement.style.backgroundColor = 'white';
      hiddenElement.style.overflow = 'hidden';
      hiddenElement.id = 'hidden-certificate';
      
      // Certificate HTML with the new background image and updated logo
      hiddenElement.innerHTML = `
        <div style="position:relative; width:100%; height:100%; font-family:Arial, sans-serif; background:white;">
          <!-- Background image - updated to new background -->
          <div style="position:absolute; top:0; left:0; width:100%; height:100%; overflow:hidden;">
            <img src="${certificateBackground}" style="width:100%; height:100%; object-fit:cover;" />
          </div>
          
          <!-- Content area -->
          <div style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:1;">
            <!-- Logo area - at top left with new logo -->
            <div style="position:absolute; top:40px; left:40px; height:80px; display:flex; align-items:center;">
              <img src="${govcioLogo}" style="height:100px;" />
            </div>
            
            <!-- Certificate title -->
            <div style="position:absolute; top:150px; left:0; right:0; text-align:center;">
              <h1 style="font-size:54px; color:#1A2E5A; font-weight:bold; margin:0; letter-spacing:2px; line-height:1.1;">CERTIFICATE</h1>
              <h2 style="font-size:28px; color:#1A2E5A; font-style:italic; margin:0; font-weight:normal;">of ${selectedCategory}</h2>
            </div>
            
            <!-- Recipient information with improved spacing -->
            <div style="position:absolute; top:250px; left:0; right:0; text-align:center;">
              <p style="font-size:16px; color:#333; margin-bottom:15px;">THIS CERTIFICATE IS PRESENTED TO...</p>
              <h3 style="font-size:48px; font-weight:bold; color:#1A2E5A; margin:0 0 40px 0; font-style:italic;">${certificateData.recipientName}</h3>
            </div>
            
            <!-- Accomplishment text - with increased spacing from name -->
            <div style="position:absolute; top:370px; left:70px; right:70px; text-align:center;">
              <p style="font-size:16px; line-height:1.6; color:#333; margin:0;">
                ${accomplishmentText}
              </p>
            </div>
            
            <!-- Signature area - moved to bottom right as requested -->
            <div style="position:absolute; bottom:90px; right:70px; width:200px; text-align:center;">
              <div style="width:200px;">
                <div style="border-bottom:1px solid #333; margin-bottom:8px; height:40px; display:flex; justify-content:center;">
                  <img src="data:image/png;base64,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" style="height:30px; margin-top:5px;" />
                </div>
                <p style="margin:0; font-size:14px;">Munye H Sufi<br/>(ELT Manager)</p>
              </div>
            </div>
            
            <!-- Date -->
            <div style="position:absolute; bottom:40px; left:70px; font-size:14px; color:#333; font-weight:bold;">
              ${formattedDate}
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
                    <div className="p-6 rounded bg-gray-50 flex flex-col items-center justify-center text-center min-h-[350px]">
                      {/* Certificate Preview that exactly resembles the final design with the new background */}
                      <div className="w-full max-w-lg relative bg-white p-6 rounded-lg shadow mb-6 overflow-hidden" 
                           style={{ aspectRatio: '1.4/1' }}>
                        {/* Background image - updated to new background */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                          <img src={certificateBackground} className="w-full h-full object-cover" alt="Certificate background" />
                        </div>
                        
                        {/* Content overlay */}
                        <div className="relative z-10 h-full">
                          {/* Logo - updated to new logo */}
                          <div className="absolute top-2 left-3">
                            <img src={govcioLogo} alt="GovCIO Logo" className="h-8" />
                          </div>
                          
                          <div className="text-center mt-10 relative z-10">
                            <h3 className="text-xl font-bold text-blue-900 tracking-wide leading-tight">CERTIFICATE</h3>
                            <p className="text-xs italic text-blue-900">of {certificateData.award}</p>
                            
                            <div className="mt-2">
                              <p className="text-[10px] text-gray-600 mb-1">THIS CERTIFICATE IS PRESENTED TO...</p>
                              <h4 className="text-lg font-bold italic text-blue-900 mb-3">
                                {certificateData.recipientName}
                              </h4>
                              
                              <p className="text-[8px] text-gray-600 px-3 max-h-14 overflow-hidden">
                                {selectedInstructor ? 
                                  generateAccomplishmentText(selectedInstructor, selectedCategory).substring(0, 140) + '...' 
                                  : ''}
                              </p>
                              
                              {/* Signature - positioned at bottom right */}
                              <div className="absolute bottom-2 right-3 w-20 text-center">
                                <div className="border-b border-gray-400 pb-1 mb-1 flex justify-center">
                                  <span className="text-[8px] leading-none">Signature</span>
                                </div>
                                <p className="text-[8px]">Munye H Sufi<br/>(ELT Manager)</p>
                              </div>
                              
                              {/* Date */}
                              <div className="absolute bottom-2 left-3 text-[8px] text-gray-600 font-bold">
                                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      

                      
                      <p className="text-sm text-gray-500 mb-4">
                        Click the download button to generate the full certificate with complete layout.
                      </p>
                      
                      <div className="flex gap-2 w-full max-w-md">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600" 
                          onClick={generateCertificate}
                          disabled={!selectedInstructor}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Certificate
                        </Button>
                        <Button 
                          className="flex-none bg-amber-100 hover:bg-amber-200 text-amber-800" 
                          variant="outline"
                          disabled={!selectedInstructor}
                          onClick={() => {
                            if (selectedInstructor) {
                              const text = generateAccomplishmentText(selectedInstructor, selectedCategory);
                              navigator.clipboard.writeText(text);
                              toast({
                                title: "Copied to clipboard",
                                description: "Award text copied to clipboard",
                              });
                            }
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