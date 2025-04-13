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
import { Award, Calendar, Crown, FileSpreadsheet, Medal, Settings, Star, Trophy, UserCheck, Lightbulb } from "lucide-react";
import { useAIChat } from "@/hooks/use-ai-chat";
import { Instructor } from "@shared/schema";
import { StandardInstructorAvatar } from "@/components/instructors/StandardInstructorAvatar";
import certificateImage from "../../assets/certificate-template.png";
import awardsImage from "@assets/Screenshot 2025-04-13 at 22.04.56.png";

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

      // Prepare AI analysis message
      const analysisPrompt = `
        I need to select top performers for "${selectedCategory}" award at ${selectedSchoolDetails?.name} for ${selectedMonth}.
        Here are the instructors: ${JSON.stringify(schoolInstructors.map(i => ({ id: i.id, name: i.name })))}
        
        Here are their evaluations: ${JSON.stringify(evaluationData)}
        
        Here are their attendance records: ${JSON.stringify(attendanceData)}
        
        Please analyze and recommend the top 3 candidates for this award based on their performance metrics.
        For each instructor, provide:
        1. Overall score (0-100)
        2. Key strengths (3-5 bullet points)
        3. Reasons they should be nominated
        4. Attendance percentage
        5. Average evaluation score

        Return the data as a JSON array with the structure:
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

      // Send to AI for analysis
      await sendChatMessage(analysisPrompt);

    } catch (error) {
      console.error("Error analyzing instructors:", error);
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing instructor performance.",
        variant: "destructive"
      });
    }
  };

  // Parse AI response when it returns
  useEffect(() => {
    if (aiResponse && !isAiLoading) {
      try {
        // Try to extract JSON from the response
        const jsonMatch = aiResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
        
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0]);
          
          // Get full instructor details and merge with AI analysis
          const enhancedData = parsedData.map((item: any) => {
            const instructor = instructorQuery.data?.find(i => i.id === item.id);
            return { ...instructor, ...item };
          });
          
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
          console.error("Could not extract JSON from AI response");
          toast({
            title: "Analysis error",
            description: "Could not process AI response. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error parsing AI response:", error);
        toast({
          title: "Analysis error",
          description: "Failed to parse AI analysis. Please try again.",
          variant: "destructive"
        });
      }
      
      setIsAnalyzing(false);
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

  // Handle certificate generation
  const generateCertificate = () => {
    toast({
      title: "Certificate prepared",
      description: `Award certificate created for ${certificateData.recipientName}.`,
    });
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
                    <div 
                      className="relative p-6 bg-contain bg-center bg-no-repeat min-h-[300px] flex flex-col justify-center items-center text-center"
                      style={{ backgroundImage: `url(${awardsImage})` }}
                    >
                      <h3 className="text-lg font-serif font-bold text-amber-800 mt-12">Certificate of Recognition</h3>
                      <h4 className="text-xl font-serif font-bold mt-4 text-gray-800">
                        {certificateData.recipientName}
                      </h4>
                      <p className="mt-2 font-serif italic text-gray-600">is hereby recognized as</p>
                      <p className="text-xl font-serif font-bold mt-2 text-amber-800">
                        {certificateData.award}
                      </p>
                      <p className="mt-2 font-serif text-sm text-gray-600">
                        {certificateData.school}
                      </p>
                      <p className="mt-4 font-serif text-sm text-gray-600">
                        {certificateData.date}
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600" 
                      onClick={generateCertificate}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Generate Certificate
                    </Button>
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