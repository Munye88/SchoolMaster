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
import { School, Instructor } from "@shared/schema";
import { format, subDays } from "date-fns";
import { Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import awardsPage from "../../assets/awards-page.png";
import govcioLogo from "../../assets/images/govcio-logo-new.png";
import certificateBackground from "../../assets/images/certificate-background2.jpeg";

// Type definitions
type AwardCategory = 'Employee of the Month' | 'Perfect Attendance' | 'Outstanding Performance';

interface InstructorWithScore extends Instructor {
  score?: number;
  attendancePercentage?: number;
  evaluationScore?: number;
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
  const [selectedCategory, setSelectedCategory] = useState<AwardCategory>("Employee of the Month");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("last30");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [topInstructors, setTopInstructors] = useState<InstructorWithScore[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorWithScore | null>(null);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  
  const { toast } = useToast();
  
  const { data: schools } = useQuery({
    queryKey: ["/api/schools"],
    enabled: true,
  });

  const { instructorQuery, evaluations, attendance } = useAnalysis();

  // Get schools
  const schoolOptions = schools?.map((school: School) => ({
    value: school.id.toString(),
    label: school.name,
  })) || [];
  
  const selectedSchoolDetails = schools?.find(
    (school: School) => school.id === parseInt(selectedSchool)
  );
  
  // Filter instructors by selected school
  const filteredInstructors = instructorQuery.data?.filter(
    (instructor: Instructor) => instructor.schoolId === parseInt(selectedSchool)
  ) || [];
  
  const analyzeInstructors = async () => {
    try {
      if (!selectedSchool) {
        toast({
          title: "Please select a school",
          description: "You must select a school to analyze instructors",
          variant: "destructive",
        });
        return;
      }
      
      setIsAnalyzing(true);
      
      // Get all instructors from selected school
      const schoolInstructors = instructorQuery.data?.filter(
        instructor => instructor.schoolId === selectedSchoolDetails?.id
      ) || [];
      
      if (schoolInstructors.length === 0) {
        toast({
          title: "No instructors found",
          description: "No instructors found for the selected school",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }
      
      // Process instructors with their evaluation and attendance data
      const simplifiedInstructors = schoolInstructors.map(instructor => {
        // Get evaluations for this instructor
        const instructorEvals = evaluations.data?.filter(e => e.instructorId === instructor.id) || [];
        const evalScore = instructorEvals.length > 0 
          ? instructorEvals.reduce((sum, e) => sum + e.score, 0) / instructorEvals.length 
          : 0;
          
        // Get attendance for this instructor
        const instructorAttendance = attendance.data?.filter(a => a.instructorId === instructor.id) || [];
        const attendancePercentage = instructorAttendance.length > 0
          ? instructorAttendance.filter(a => 
              a.status.toLowerCase() === 'present').length / instructorAttendance.length * 100
          : 0;
          
        return {
          ...instructor,
          evaluationScore: evalScore,
          attendancePercentage: attendancePercentage
        };
      });

      console.log("AI chat functionality has been removed. Using static recommendations instead.");
      
      // Instead of sending to AI, generate static recommendations based on the data
      // Sort instructors by the appropriate metrics based on selected category
      const sortedInstructors = [...simplifiedInstructors].sort((a, b) => {
        if (selectedCategory === "Employee of the Month") {
          // For Employee of Month, balance evaluation and attendance (50/50)
          const scoreA = ((a.evaluationScore || 0) * 0.5) + ((a.attendancePercentage || 0) * 0.005);
          const scoreB = ((b.evaluationScore || 0) * 0.5) + ((b.attendancePercentage || 0) * 0.005);
          return scoreB - scoreA;
        } else if (selectedCategory === "Perfect Attendance") {
          // For Perfect Attendance, prioritize attendance (70/30)
          const scoreA = ((a.evaluationScore || 0) * 0.3) + ((a.attendancePercentage || 0) * 0.007);
          const scoreB = ((b.evaluationScore || 0) * 0.3) + ((b.attendancePercentage || 0) * 0.007);
          return scoreB - scoreA;
        } else {
          // For Outstanding Performance, prioritize evaluation (70/30)
          const scoreA = ((a.evaluationScore || 0) * 0.7) + ((a.attendancePercentage || 0) * 0.003);
          const scoreB = ((b.evaluationScore || 0) * 0.7) + ((b.attendancePercentage || 0) * 0.003);
          return scoreB - scoreA;
        }
      });
      
      // Take top 3 instructors
      const topThree = sortedInstructors.slice(0, 3);
      
      // Generate recommendations
      const recommendations = topThree.map((instructor, index) => {
        const strengths = [
          `Strong evaluation score of ${instructor.evaluationScore?.toFixed(1)}`,
          `Excellent attendance rate of ${instructor.attendancePercentage?.toFixed(1)}%`,
          `Dedicated to professional development`,
          `Consistently demonstrates teaching excellence`
        ];
        
        return {
          ...instructor,
          score: 95 - (index * 5), // 95, 90, 85 for top 3
          strengths,
          nominationReasons: `${instructor.name} has demonstrated exceptional performance with an evaluation score of ${instructor.evaluationScore?.toFixed(1)} and attendance rate of ${instructor.attendancePercentage?.toFixed(1)}%. Their dedication and consistency make them an ideal candidate for the ${selectedCategory} award.`
        };
      });
      
      // Update state with recommendations
      setTopInstructors(recommendations);
      setIsAnalyzing(false);
      
      // If we have recommendations, select the first one
      if (recommendations.length > 0) {
        setSelectedInstructor(recommendations[0]);
        setCertificateData({
          instructor: recommendations[0],
          category: selectedCategory,
          date: format(new Date(), "MMMM d, yyyy"),
          school: selectedSchoolDetails as School
        });
      }

    } catch (error) {
      console.error("Error analyzing instructors:", error);
      toast({
        title: "Error analyzing instructors",
        description: "There was an error analyzing instructors. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  // Empty useEffect to maintain component structure
  useEffect(() => {
    // No longer need to process AI responses
  }, []);

  // Helper function to get ordinal suffix for day of month
  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  const handleSelectInstructor = (instructor: InstructorWithScore) => {
    setSelectedInstructor(instructor);
    
    if (!instructor) {
      toast({
        title: "No instructor selected",
        description: "Please select an instructor to generate a certificate",
        variant: "destructive",
      });
      return;
    }
    
    // Create certificate data
    setCertificateData({
      instructor,
      category: selectedCategory,
      date: format(new Date(), "MMMM d, yyyy"),
      school: selectedSchoolDetails as School
    });
  };
  
  const generateAccomplishmentText = (instructor: InstructorWithScore, category: string) => {
    switch(category) {
      case "Perfect Attendance":
        return `for maintaining ${instructor.attendancePercentage?.toFixed(0)}% attendance record and showing exceptional dedication`;
      case "Outstanding Performance":
        return `for achieving an outstanding evaluation score of ${instructor.evaluationScore?.toFixed(1)} and demonstrating exceptional teaching quality`;
      case "Employee of the Month":
      default:
        return `for demonstrating exceptional performance, professionalism, and dedication to excellence`;
    }
  };
  
  const downloadCertificate = async () => {
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
        backgroundColor: null,
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
      <div className="flex flex-col space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold">Instructor Recognition Programs</CardTitle>
                <CardDescription>Recognize and reward outstanding instructors</CardDescription>
              </div>
              <img src={awardsPage} alt="Awards" className="h-24 object-contain" />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recommendations" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="recommendations" className="flex items-center">
                  <Medal className="mr-2 h-4 w-4" />
                  Recommendations
                </TabsTrigger>
                <TabsTrigger value="generate" className="flex items-center">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Generate Certificate
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="recommendations">
                <Card>
                  <CardHeader>
                    <CardTitle>Recognition Analysis</CardTitle>
                    <CardDescription>
                      Find top candidates for staff recognition
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap -mx-2">
                      <div className="px-2 w-full md:w-1/3 mb-4">
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

                      <div className="px-2 w-full md:w-1/3 mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Award Category
                        </label>
                        <Select 
                          value={selectedCategory} 
                          onValueChange={(value) => setSelectedCategory(value as AwardCategory)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Employee of the Month">
                              Employee of the Month
                            </SelectItem>
                            <SelectItem value="Perfect Attendance">
                              Perfect Attendance
                            </SelectItem>
                            <SelectItem value="Outstanding Performance">
                              Outstanding Performance
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="px-2 w-full md:w-1/3 mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Time Period
                        </label>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="last30">Last 30 Days</SelectItem>
                            <SelectItem value="last90">Last 90 Days</SelectItem>
                            <SelectItem value="lastYear">Last Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button 
                        onClick={analyzeInstructors} 
                        disabled={isAnalyzing || !selectedSchool}
                        className="w-full"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Lightbulb className="mr-2 h-4 w-4" />
                            Find Top Candidates
                          </>
                        )}
                      </Button>
                    </div>

                    {topInstructors.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">
                          Top Candidates for {selectedCategory}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {topInstructors.map((instructor, index) => (
                            <Card 
                              key={instructor.id} 
                              className={`cursor-pointer hover:shadow-md transition-shadow ${
                                selectedInstructor?.id === instructor.id 
                                  ? 'ring-2 ring-primary' 
                                  : ''
                              }`}
                              onClick={() => handleSelectInstructor(instructor)}
                            >
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-lg">{instructor.name}</CardTitle>
                                  {index === 0 && (
                                    <Crown className="h-5 w-5 text-yellow-500" />
                                  )}
                                  {index === 1 && (
                                    <Star className="h-5 w-5 text-gray-400" />
                                  )}
                                  {index === 2 && (
                                    <Award className="h-5 w-5 text-amber-800" />
                                  )}
                                </div>
                                <CardDescription>Score: {instructor.score?.toFixed(1)}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="text-sm">
                                  <div className="flex justify-between mb-1">
                                    <span>Evaluation:</span>
                                    <span className="font-medium">{instructor.evaluationScore?.toFixed(1)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Attendance:</span>
                                    <span className="font-medium">{instructor.attendancePercentage?.toFixed(1)}%</span>
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
              </TabsContent>
              
              <TabsContent value="generate">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Certificate</CardTitle>
                    <CardDescription>
                      Generate and download recognition certificates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                      <div className="w-full md:w-1/3 space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Certificate Details</h3>
                          {selectedInstructor ? (
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
                                  {format(new Date(), "MMMM d, yyyy")}
                                </div>
                              </div>
                              
                              <Button 
                                className="w-full mt-4" 
                                onClick={downloadCertificate}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download Certificate
                              </Button>
                            </div>
                          ) : (
                            <div className="p-4 border border-dashed rounded-md text-center text-sm text-gray-500">
                              <UserCheck className="mx-auto h-8 w-8 mb-2 text-gray-400" />
                              <p>Select an instructor from the Recommendations tab to generate a certificate</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="w-full md:w-2/3">
                        {certificateData ? (
                          <div 
                            id="certificate" 
                            className="border rounded-lg overflow-hidden"
                            style={{
                              backgroundImage: `url(${certificateBackground})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
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
                                src={govcioLogo} 
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
                                {certificateData.school.name}
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
                                {certificateData.instructor.name}
                              </div>
                              
                              <div style={{ 
                                fontSize: '18px',
                                textAlign: 'center',
                                marginBottom: '10px',
                                fontWeight: 'bold',
                                color: '#444'
                              }}>
                                {certificateData.category}
                              </div>
                              
                              <div style={{ 
                                fontSize: '16px',
                                textAlign: 'center',
                                maxWidth: '80%',
                                marginBottom: '30px'
                              }}>
                                {generateAccomplishmentText(certificateData.instructor, certificateData.category)}
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
                                    {certificateData.date}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="border border-dashed rounded-lg h-full flex items-center justify-center p-8 text-center text-gray-500">
                            <div>
                              <Trophy className="mx-auto h-16 w-16 mb-4 text-gray-300" />
                              <h3 className="text-lg font-medium mb-2">Certificate Preview</h3>
                              <p className="max-w-md mx-auto">
                                Select an instructor from the Recommendations tab to preview and generate a certificate
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Recognition Program Settings</CardTitle>
                    <CardDescription>
                      Configure the recognition program parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Award Categories</h3>
                        <div className="space-y-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <div className="flex items-center">
                                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                                <CardTitle className="text-base">Employee of the Month</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-500 mb-2">
                                Overall balanced performance assessment based on both evaluation scores and attendance.
                              </p>
                              <div className="text-sm">
                                <div className="flex justify-between mb-1">
                                  <span>Evaluation Score Weight:</span>
                                  <span className="font-medium">50%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Attendance Weight:</span>
                                  <span className="font-medium">50%</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <div className="flex items-center">
                                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                                <CardTitle className="text-base">Perfect Attendance</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-500 mb-2">
                                Recognition for instructors with exceptional attendance records.
                              </p>
                              <div className="text-sm">
                                <div className="flex justify-between mb-1">
                                  <span>Attendance Weight:</span>
                                  <span className="font-medium">70%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Evaluation Score Weight:</span>
                                  <span className="font-medium">30%</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <div className="flex items-center">
                                <Star className="h-5 w-5 mr-2 text-amber-500" />
                                <CardTitle className="text-base">Outstanding Performance</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-500 mb-2">
                                Recognition for instructors with exceptional evaluation scores.
                              </p>
                              <div className="text-sm">
                                <div className="flex justify-between mb-1">
                                  <span>Evaluation Score Weight:</span>
                                  <span className="font-medium">70%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Attendance Weight:</span>
                                  <span className="font-medium">30%</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Certificate Design</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          The certificate includes the GovCIO logo, instructor name, award category, 
                          accomplishment details, and date of issuance.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function useAnalysis() {
  // Get all instructors
  const instructorQuery = useQuery({
    queryKey: ["/api/instructors"],
    enabled: true,
  });
  
  // Get all evaluations
  const evaluations = useQuery({
    queryKey: ["/api/evaluations"],
    enabled: true,
  });
  
  // Get all attendance
  const attendance = useQuery({
    queryKey: ["/api/staff-attendance"],
    enabled: true,
  });

  return {
    instructorQuery,
    evaluations,
    attendance
  };
}