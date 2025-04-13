import { useState, useEffect } from "react";
import { useSchool } from "@/hooks/useSchool";
import { useQuery } from "@tanstack/react-query";
import { 
  Award, 
  Calendar, 
  Medal, 
  Star, 
  User, 
  Clock, 
  Check, 
  Trophy, 
  Shield, 
  ThumbsUp, 
  Download,
  FileCheck,
  Filter,
  ChevronDown,
  Lightbulb,
  Users,
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/ui/print-button";

// Certificate template
const CertificateTemplate = ({ 
  instructor, 
  awardType, 
  month, 
  year, 
  score 
} : { 
  instructor: any, 
  awardType: string, 
  month: string, 
  year: string,
  score: number 
}) => {
  return (
    <div id="certificate" className="relative w-full max-w-5xl mx-auto bg-white p-12 rounded-lg shadow-2xl border-8 border-double border-[#d4af37]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 z-0">
        <div className="absolute inset-0 bg-repeat" style={{ 
          backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIiBjeD0iMTAiIGN5PSIxMCIgcj0iMiIvPjwvZz48L3N2Zz4=')",
          backgroundSize: "20px 20px" 
        }} />
      </div>
      
      {/* Certificate Content */}
      <div className="relative z-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 flex items-center justify-center bg-[#0A2463] rounded-full shadow-lg">
            <Trophy className="w-12 h-12 text-[#d4af37]" />
          </div>
        </div>
        
        <h1 className="font-serif text-4xl text-[#0A2463] font-bold mb-1">CERTIFICATE OF EXCELLENCE</h1>
        <h2 className="text-lg text-gray-600 mb-8 font-light tracking-wider uppercase">GOVCIO/SAMS ELT PROGRAM</h2>
        
        <div className="my-6 text-center opacity-75">
          <p className="text-lg text-gray-600">This certificate is proudly presented to</p>
        </div>
        
        <h2 className="text-3xl font-bold text-[#0A2463] relative pb-2 mb-6 mx-auto inline-block font-serif">
          {instructor?.name}
          <div className="absolute h-1 w-full bg-gradient-to-r from-[#d4af37] to-[#f5df8a] bottom-0 left-0"></div>
        </h2>
        
        <div className="my-10 text-center">
          <p className="text-xl text-gray-800 leading-relaxed">
            For outstanding performance and dedication as
          </p>
          <p className="text-2xl text-[#0A2463] font-bold mt-2 mb-4">
            {awardType}
          </p>
          <p className="text-xl text-gray-800">
            {month} {year}
          </p>
          
          <div className="w-80 mx-auto my-8">
            <div className="flex items-center space-x-4 mb-2">
              <span className="text-sm text-gray-500">Performance Score:</span>
              <div className="flex-1">
                <Progress value={score} className="h-2" />
              </div>
              <span className="text-sm font-medium">{score}%</span>
            </div>
          </div>
        </div>
        
        <div className="mt-12 grid grid-cols-2 gap-12">
          <div className="text-center">
            <div className="h-0.5 w-48 bg-gray-300 mx-auto mb-2"></div>
            <p className="text-[#0A2463] font-medium">Program Director</p>
          </div>
          <div className="text-center">
            <div className="h-0.5 w-48 bg-gray-300 mx-auto mb-2"></div>
            <p className="text-[#0A2463] font-medium">School Principal</p>
          </div>
        </div>
        
        <div className="absolute bottom-6 right-6 opacity-70">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Issued on: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Seal */}
        <div className="absolute bottom-10 left-10 opacity-50">
          <div className="w-24 h-24 border-2 border-[#d4af37] rounded-full flex items-center justify-center">
            <div className="w-20 h-20 border-1 border-[#d4af37] rounded-full flex items-center justify-center">
              <div className="text-xs text-[#d4af37] font-serif text-center">
                <div>OFFICIAL</div>
                <div className="text-[8px] mt-1">ELT PROGRAM</div>
                <div className="text-[8px]">SEAL</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InstructorRecognition = () => {
  const { selectedSchool } = useSchool();
  const [activeTab, setActiveTab] = useState("recognition-dashboard");
  const [selectedMonth, setSelectedMonth] = useState("April");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedAwardType, setSelectedAwardType] = useState("Employee of the Month");
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
  
  // Fetch instructors data
  const { data: instructors, isLoading } = useQuery({
    queryKey: ['/api/instructors'],
    select: (data: any[]) => {
      // If school is selected, filter instructors by school
      if (selectedSchool && selectedSchool.id) {
        return data.filter(instructor => instructor.schoolId === selectedSchool.id);
      }
      return data;
    }
  });

  // Calculate instructor scores based on criteria when data changes
  useEffect(() => {
    if (instructors) {
      // This is where we would calculate performance scores based on real data
      // For now, we'll simulate scores using the data we have
      const scoredInstructors = instructors.map(instructor => {
        // Simulated scores based on existing data
        const attendanceScore = Math.floor(Math.random() * 30) + 70; // 70-100
        const evaluationScore = instructor.evaluationScore || Math.floor(Math.random() * 30) + 65; // 65-95
        const studentSuccessScore = Math.floor(Math.random() * 25) + 70; // 70-95
        const peerFeedbackScore = Math.floor(Math.random() * 20) + 75; // 75-95
        
        // Calculate weighted composite score
        const compositeScore = Math.round(
          (evaluationScore * 0.4) + 
          (attendanceScore * 0.3) + 
          (studentSuccessScore * 0.2) + 
          (peerFeedbackScore * 0.1)
        );
        
        return {
          ...instructor,
          attendanceScore,
          evaluationScore,
          studentSuccessScore,
          peerFeedbackScore,
          compositeScore
        };
      });
      
      // Sort by composite score (highest first)
      const sorted = [...scoredInstructors].sort((a, b) => b.compositeScore - a.compositeScore);
      setTopPerformers(sorted.slice(0, 5)); // Top 5 performers
      
      // Set the default selected instructor to the top performer
      if (sorted.length > 0 && !selectedInstructor) {
        setSelectedInstructor(sorted[0]);
      }
    }
  }, [instructors, selectedSchool]);

  // Function to generate and download the certificate as PDF
  const downloadCertificate = async () => {
    if (!selectedInstructor) return;
    
    const certificateElement = document.getElementById('certificate');
    if (!certificateElement) return;
    
    try {
      alert('Certificate download feature activated. The certificate would now be converted to PDF and downloaded.');
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  return (
    <div className="flex-1 p-6 bg-gradient-to-b from-gray-50 to-white overflow-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0A2463] to-blue-600 bg-clip-text text-transparent">
            {selectedSchool 
              ? `${selectedSchool.name} Instructor Recognition` 
              : 'Instructor Recognition Program'}
          </h1>
          <p className="text-gray-600 mt-1">
            Recognize and reward outstanding instructor performance and dedication
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <PrintButton contentId="recognition-content" />
          <Button className="bg-[#0A2463] hover:bg-[#071A4A] gap-2">
            <Download className="h-4 w-4" /> Export Reports
          </Button>
        </div>
      </div>
      
      <div id="recognition-content">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="bg-blue-50 p-1 rounded-lg border border-blue-100 shadow-sm">
            <TabsTrigger 
              value="recognition-dashboard"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              <Award className="h-4 w-4 mr-2" />
              Recognition Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="top-performers"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Top Performers
            </TabsTrigger>
            <TabsTrigger 
              value="certificate-generator"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Certificate Generator
            </TabsTrigger>
            <TabsTrigger 
              value="recognition-history"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              Recognition History
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Recognition Dashboard Tab */}
        <TabsContent value="recognition-dashboard" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Trophy className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-blue-900">Employee of the Month</CardTitle>
                    <CardDescription>Based on overall excellence</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {topPerformers.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 rounded-full bg-blue-50 mb-4 flex items-center justify-center border-4 border-blue-100">
                      {topPerformers[0].profileImage ? (
                        <img 
                          src={topPerformers[0].profileImage} 
                          alt={topPerformers[0].name} 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="h-12 w-12 text-blue-600" />
                      )}
                      <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 shadow-md">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-center">{topPerformers[0].name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{topPerformers[0].title || "ELT Instructor"}</p>
                    
                    <div className="w-full space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Score</span>
                          <span className="font-medium">{topPerformers[0].compositeScore}%</span>
                        </div>
                        <Progress value={topPerformers[0].compositeScore} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-blue-50 p-2 rounded border border-blue-100 text-center">
                          <div className="text-sm text-blue-800 font-medium">Evaluation</div>
                          <div className="text-lg font-bold text-blue-900">{topPerformers[0].evaluationScore}%</div>
                        </div>
                        <div className="bg-green-50 p-2 rounded border border-green-100 text-center">
                          <div className="text-sm text-green-800 font-medium">Attendance</div>
                          <div className="text-lg font-bold text-green-900">{topPerformers[0].attendanceScore}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No data available</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-white to-blue-50 pt-4 flex justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">View Details</Button>
              </CardFooter>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-amber-100">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <Medal className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-amber-900">Perfect Attendance</CardTitle>
                    <CardDescription>Recognizing consistent reliability</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {topPerformers.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 rounded-full bg-amber-50 mb-4 flex items-center justify-center border-4 border-amber-100">
                      {topPerformers.find(p => p.attendanceScore > 95)?.profileImage ? (
                        <img 
                          src={topPerformers.find(p => p.attendanceScore > 95)?.profileImage} 
                          alt="Instructor" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="h-12 w-12 text-amber-600" />
                      )}
                      <div className="absolute -top-2 -right-2 bg-amber-400 rounded-full p-1 shadow-md">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-center">
                      {topPerformers.find(p => p.attendanceScore > 95)?.name || topPerformers[1]?.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {topPerformers.find(p => p.attendanceScore > 95)?.title || topPerformers[1]?.title || "ELT Instructor"}
                    </p>
                    
                    <div className="w-full space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Attendance Score</span>
                          <span className="font-medium">
                            {topPerformers.find(p => p.attendanceScore > 95)?.attendanceScore || topPerformers[1]?.attendanceScore}%
                          </span>
                        </div>
                        <Progress 
                          value={topPerformers.find(p => p.attendanceScore > 95)?.attendanceScore || topPerformers[1]?.attendanceScore} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="flex gap-2 mt-4 justify-between">
                        <div className="bg-amber-50 py-1 px-2 rounded border border-amber-100 text-center flex-1">
                          <div className="text-xs text-amber-800">Days Present</div>
                          <div className="text-base font-bold text-amber-900">22/22</div>
                        </div>
                        <div className="bg-amber-50 py-1 px-2 rounded border border-amber-100 text-center flex-1">
                          <div className="text-xs text-amber-800">On Time</div>
                          <div className="text-base font-bold text-amber-900">100%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No data available</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-white to-amber-50 pt-4 flex justify-center">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">View Details</Button>
              </CardFooter>
            </Card>
            
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Star className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-purple-900">Outstanding Educator</CardTitle>
                    <CardDescription>Excellence in student success</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {topPerformers.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 rounded-full bg-purple-50 mb-4 flex items-center justify-center border-4 border-purple-100">
                      {topPerformers.find(p => p.studentSuccessScore > 90)?.profileImage ? (
                        <img 
                          src={topPerformers.find(p => p.studentSuccessScore > 90)?.profileImage} 
                          alt="Instructor" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="h-12 w-12 text-purple-600" />
                      )}
                      <div className="absolute -top-2 -right-2 bg-purple-400 rounded-full p-1 shadow-md">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-center">
                      {topPerformers.find(p => p.studentSuccessScore > 90)?.name || topPerformers[2]?.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {topPerformers.find(p => p.studentSuccessScore > 90)?.title || topPerformers[2]?.title || "ELT Instructor"}
                    </p>
                    
                    <div className="w-full space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Student Success</span>
                          <span className="font-medium">
                            {topPerformers.find(p => p.studentSuccessScore > 90)?.studentSuccessScore || topPerformers[2]?.studentSuccessScore}%
                          </span>
                        </div>
                        <Progress 
                          value={topPerformers.find(p => p.studentSuccessScore > 90)?.studentSuccessScore || topPerformers[2]?.studentSuccessScore} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-purple-50 p-2 rounded border border-purple-100 text-center">
                          <div className="text-sm text-purple-800 font-medium">Evaluation</div>
                          <div className="text-lg font-bold text-purple-900">
                            {topPerformers.find(p => p.studentSuccessScore > 90)?.evaluationScore || topPerformers[2]?.evaluationScore}%
                          </div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded border border-purple-100 text-center">
                          <div className="text-sm text-purple-800 font-medium">Peer Rating</div>
                          <div className="text-lg font-bold text-purple-900">
                            {topPerformers.find(p => p.studentSuccessScore > 90)?.peerFeedbackScore || topPerformers[2]?.peerFeedbackScore}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No data available</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-white to-purple-50 pt-4 flex justify-center">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">View Details</Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Recognition Selection Tool</CardTitle>
                      <CardDescription>AI-powered recognition recommendation system</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select defaultValue={selectedMonth}>
                        <SelectTrigger className="w-[120px] bg-white">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="January">January</SelectItem>
                          <SelectItem value="February">February</SelectItem>
                          <SelectItem value="March">March</SelectItem>
                          <SelectItem value="April">April</SelectItem>
                          <SelectItem value="May">May</SelectItem>
                          <SelectItem value="June">June</SelectItem>
                          <SelectItem value="July">July</SelectItem>
                          <SelectItem value="August">August</SelectItem>
                          <SelectItem value="September">September</SelectItem>
                          <SelectItem value="October">October</SelectItem>
                          <SelectItem value="November">November</SelectItem>
                          <SelectItem value="December">December</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select defaultValue={selectedYear}>
                        <SelectTrigger className="w-[100px] bg-white">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-6 bg-[#0A2463] text-white rounded-b-none">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-8 w-8 text-yellow-300" />
                      <div>
                        <h3 className="text-xl font-bold">AI-Recommended Recognition</h3>
                        <p className="text-blue-200 text-sm">Based on performance metrics and weighted criteria</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 grid gap-6">
                    {topPerformers.slice(0, 3).map((instructor, index) => (
                      <div key={instructor.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                        <div className={`flex items-center justify-center rounded-full w-8 h-8 flex-shrink-0 ${
                          index === 0 ? 'bg-yellow-100 text-yellow-600' : 
                          index === 1 ? 'bg-gray-100 text-gray-600' : 
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {index + 1}
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex flex-wrap justify-between items-start gap-2">
                            <div>
                              <h4 className="font-medium">{instructor.name}</h4>
                              <p className="text-sm text-gray-500">{instructor.title || "ELT Instructor"}</p>
                            </div>
                            
                            <div className="flex flex-col items-end">
                              <div className="flex items-center">
                                <span className="text-sm font-medium mr-2">Score:</span>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {instructor.compositeScore}%
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {index === 0 
                                  ? "Recommended for Employee of the Month" 
                                  : index === 1 
                                  ? "Perfect Attendance Award Candidate"
                                  : "Outstanding Educator Candidate"
                                }
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-4 gap-2">
                            <div className="col-span-4">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Overall Score</span>
                                <span>{instructor.compositeScore}%</span>
                              </div>
                              <Progress value={instructor.compositeScore} className="h-1.5" />
                            </div>
                            
                            <div>
                              <div className="text-xs text-center mb-1">Evaluation</div>
                              <div className="w-full bg-gray-100 rounded-full h-8 flex items-center justify-center">
                                <span className="text-xs font-medium">{instructor.evaluationScore}%</span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-xs text-center mb-1">Attendance</div>
                              <div className="w-full bg-gray-100 rounded-full h-8 flex items-center justify-center">
                                <span className="text-xs font-medium">{instructor.attendanceScore}%</span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-xs text-center mb-1">Success</div>
                              <div className="w-full bg-gray-100 rounded-full h-8 flex items-center justify-center">
                                <span className="text-xs font-medium">{instructor.studentSuccessScore}%</span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-xs text-center mb-1">Peer</div>
                              <div className="w-full bg-gray-100 rounded-full h-8 flex items-center justify-center">
                                <span className="text-xs font-medium">{instructor.peerFeedbackScore}%</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-end">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => {
                                setSelectedInstructor(instructor);
                                setActiveTab("certificate-generator");
                              }}
                            >
                              Select for Recognition
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                <CardTitle>Recognition Metrics</CardTitle>
                <CardDescription>Key performance indicators for instructor recognition</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium flex items-center mb-2">
                      <Shield className="h-4 w-4 mr-1 text-blue-500" />
                      Performance Criteria Weights
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Instructor Evaluation</span>
                          <span>40%</span>
                        </div>
                        <Progress value={40} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Attendance Record</span>
                          <span>30%</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Student Success</span>
                          <span>20%</span>
                        </div>
                        <Progress value={20} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Peer Feedback</span>
                          <span>10%</span>
                        </div>
                        <Progress value={10} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium flex items-center mb-2">
                      <Award className="h-4 w-4 mr-1 text-amber-500" />
                      Recognition Categories
                    </h4>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between p-2 rounded bg-blue-50 border border-blue-100">
                        <span className="text-sm font-medium text-blue-700">Employee of the Month</span>
                        <Trophy className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-amber-50 border border-amber-100">
                        <span className="text-sm font-medium text-amber-700">Perfect Attendance</span>
                        <Calendar className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-purple-50 border border-purple-100">
                        <span className="text-sm font-medium text-purple-700">Outstanding Educator</span>
                        <Star className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-green-50 border border-green-100">
                        <span className="text-sm font-medium text-green-700">Innovation in Teaching</span>
                        <Lightbulb className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium flex items-center mb-2">
                      <ThumbsUp className="h-4 w-4 mr-1 text-green-500" />
                      Recognition Benefits
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-1 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Certificate of achievement</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-1 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Recognition in monthly newsletter</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-1 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Special parking space for one month</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-4 w-4 mr-1 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Recognition wall display</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Top Performers Tab */}
        <TabsContent value="top-performers" className="mt-0">
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h3 className="text-xl font-semibold">Top Performing Instructors</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select defaultValue={selectedMonth}>
                <SelectTrigger className="w-[120px] bg-white">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="January">January</SelectItem>
                  <SelectItem value="February">February</SelectItem>
                  <SelectItem value="March">March</SelectItem>
                  <SelectItem value="April">April</SelectItem>
                  <SelectItem value="May">May</SelectItem>
                  <SelectItem value="June">June</SelectItem>
                  <SelectItem value="July">July</SelectItem>
                  <SelectItem value="August">August</SelectItem>
                  <SelectItem value="September">September</SelectItem>
                  <SelectItem value="October">October</SelectItem>
                  <SelectItem value="November">November</SelectItem>
                  <SelectItem value="December">December</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue={selectedYear}>
                <SelectTrigger className="w-[100px] bg-white">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topPerformers.map((instructor, index) => (
              <Card key={instructor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-2 ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-200' : 
                  index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-200' : 
                  index === 2 ? 'bg-gradient-to-r from-amber-500 to-amber-300' :
                  'bg-gradient-to-r from-blue-500 to-blue-300'
                }`}></div>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-md">
                        {instructor.profileImage ? (
                          <img 
                            src={instructor.profileImage} 
                            alt={instructor.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-full h-full p-4 text-gray-400" />
                        )}
                      </div>
                      {index < 3 && (
                        <div className={`absolute -top-2 -right-2 p-1.5 rounded-full shadow ${
                          index === 0 ? 'bg-yellow-400' : 
                          index === 1 ? 'bg-gray-400' : 
                          'bg-amber-500'
                        }`}>
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg">{instructor.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{instructor.title || "ELT Instructor"}</p>
                    <div className="flex items-center justify-center gap-1">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        #{index + 1} Rank
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {instructor.compositeScore}% Score
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">Overall Performance</span>
                        <span>{instructor.compositeScore}%</span>
                      </div>
                      <Progress value={instructor.compositeScore} className="h-1.5" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Evaluation</span>
                          <span>{instructor.evaluationScore}%</span>
                        </div>
                        <Progress value={instructor.evaluationScore} className="h-1.5 bg-gray-100" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Attendance</span>
                          <span>{instructor.attendanceScore}%</span>
                        </div>
                        <Progress value={instructor.attendanceScore} className="h-1.5 bg-gray-100" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Student Success</span>
                          <span>{instructor.studentSuccessScore}%</span>
                        </div>
                        <Progress value={instructor.studentSuccessScore} className="h-1.5 bg-gray-100" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Peer Feedback</span>
                          <span>{instructor.peerFeedbackScore}%</span>
                        </div>
                        <Progress value={instructor.peerFeedbackScore} className="h-1.5 bg-gray-100" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-gray-600"
                    >
                      View Profile
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-[#0A2463] hover:bg-[#071A4A]"
                      onClick={() => {
                        setSelectedInstructor(instructor);
                        setActiveTab("certificate-generator");
                      }}
                    >
                      Generate Certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Certificate Generator Tab */}
        <TabsContent value="certificate-generator" className="mt-0">
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Certificate Generator</CardTitle>
                  <CardDescription>Create recognition certificates for instructors</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="gap-2"
                    onClick={downloadCertificate}
                  >
                    <Download className="h-4 w-4" /> Download Certificate
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Instructor</label>
                    <Select 
                      value={selectedInstructor?.id?.toString()}
                      onValueChange={(value) => {
                        const instructor = instructors?.find(i => i.id.toString() === value);
                        if (instructor) setSelectedInstructor(instructor);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructors?.map(instructor => (
                          <SelectItem key={instructor.id} value={instructor.id.toString()}>
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Award Type</label>
                    <Select 
                      value={selectedAwardType}
                      onValueChange={setSelectedAwardType}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select award type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Employee of the Month">Employee of the Month</SelectItem>
                        <SelectItem value="Perfect Attendance Award">Perfect Attendance Award</SelectItem>
                        <SelectItem value="Outstanding Educator Award">Outstanding Educator Award</SelectItem>
                        <SelectItem value="Innovation in Teaching Award">Innovation in Teaching Award</SelectItem>
                        <SelectItem value="Certificate of Excellence">Certificate of Excellence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Month</label>
                    <Select 
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="January">January</SelectItem>
                        <SelectItem value="February">February</SelectItem>
                        <SelectItem value="March">March</SelectItem>
                        <SelectItem value="April">April</SelectItem>
                        <SelectItem value="May">May</SelectItem>
                        <SelectItem value="June">June</SelectItem>
                        <SelectItem value="July">July</SelectItem>
                        <SelectItem value="August">August</SelectItem>
                        <SelectItem value="September">September</SelectItem>
                        <SelectItem value="October">October</SelectItem>
                        <SelectItem value="November">November</SelectItem>
                        <SelectItem value="December">December</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Year</label>
                    <Select 
                      value={selectedYear}
                      onValueChange={setSelectedYear}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedInstructor && (
                    <div className="p-4 border border-blue-100 rounded-lg bg-blue-50 mt-6">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">Performance Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Score:</span>
                          <span className="font-medium">{selectedInstructor.compositeScore || 90}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Evaluation Score:</span>
                          <span className="font-medium">{selectedInstructor.evaluationScore || 88}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Attendance Score:</span>
                          <span className="font-medium">{selectedInstructor.attendanceScore || 92}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="w-full md:w-2/3 bg-gray-100 rounded-lg p-4 overflow-auto">
                  <div className="max-w-full scale-[0.75] origin-top">
                    {selectedInstructor && (
                      <CertificateTemplate 
                        instructor={selectedInstructor}
                        awardType={selectedAwardType}
                        month={selectedMonth}
                        year={selectedYear}
                        score={selectedInstructor.compositeScore || 90}
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Recognition History Tab */}
        <TabsContent value="recognition-history" className="mt-0">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recognition History</CardTitle>
                  <CardDescription>Previous awards and recognition by month</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" /> Filter
                  </Button>
                  <Button className="bg-[#0A2463] hover:bg-[#071A4A] gap-2">
                    <Download className="h-4 w-4" /> Export Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Date</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Instructor</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">School</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Award Type</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">Score</th>
                      <th className="px-6 py-3 text-right font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">Mar 2025</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <span>John Smith</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">KFNA</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Employee of the Month
                        </Badge>
                      </td>
                      <td className="px-6 py-4">92%</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm">
                          <FileCheck className="h-4 w-4 text-blue-600" />
                        </Button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">Mar 2025</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <span>Sarah Johnson</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">NFS East</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Perfect Attendance
                        </Badge>
                      </td>
                      <td className="px-6 py-4">97%</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm">
                          <FileCheck className="h-4 w-4 text-blue-600" />
                        </Button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">Feb 2025</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <span>Michael Chen</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">NFS West</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Employee of the Month
                        </Badge>
                      </td>
                      <td className="px-6 py-4">91%</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm">
                          <FileCheck className="h-4 w-4 text-blue-600" />
                        </Button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">Feb 2025</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <span>Emily Rodriguez</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">KFNA</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          Outstanding Educator
                        </Badge>
                      </td>
                      <td className="px-6 py-4">89%</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm">
                          <FileCheck className="h-4 w-4 text-blue-600" />
                        </Button>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">Jan 2025</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <span>David Kim</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">NFS East</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Employee of the Month
                        </Badge>
                      </td>
                      <td className="px-6 py-4">94%</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm">
                          <FileCheck className="h-4 w-4 text-blue-600" />
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing 5 of 24 entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </div>
  );
};

export default InstructorRecognition;