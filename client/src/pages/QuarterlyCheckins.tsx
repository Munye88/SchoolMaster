import React, { useState, useRef } from "react";
import {
  CheckCircle,
  CalendarDays,
  Calendar,
  Clock,
  Save,
  Plus,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Ban,
  Search,
  Printer,
  Edit,
  FilePlus,
  History,
  School,
  User,
  ListTodo,
  BookText,
  Layout,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useSchool } from "@/hooks/useSchool";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Define the structure for quarterly check-in data
interface CheckinQuestion {
  id: number;
  question: string;
  category: string;
}

interface CheckinAnswer {
  questionId: number;
  answer: string;
}

interface CheckinSession {
  id: number;
  instructorName: string;
  date: string;
  quarter: string;
  year: number;
  notes: string;
  status: "draft" | "completed";
  answers: CheckinAnswer[];
  school?: string;
}

// Quarterly check-in questions organized by section
const defaultQuestions: CheckinQuestion[] = [
  // Section 2: Performance & Leadership
  { id: 1, question: "How do you feel about your performance this quarter as a Senior ELT?", category: "Performance & Leadership" },
  { id: 2, question: "What tasks, initiatives, or contributions are you most proud of this quarter?", category: "Performance & Leadership" },
  { id: 3, question: "Have you encountered any recurring challenges with your instructors or within the team?", category: "Performance & Leadership" },
  { id: 4, question: "If yes, how have you addressed them?", category: "Performance & Leadership" },
  { id: 5, question: "How are you supporting the instructors under your supervision in achieving their goals?", category: "Performance & Leadership" },
  
  // Section 3: Program Improvement
  { id: 6, question: "What suggestions do you have to improve the English Language Training program (instructional, administrative, or operational)?", category: "Program Improvement" },
  { id: 7, question: "Are there any SOPs, policies, or procedures that you believe should be revised or updated? Why?", category: "Program Improvement" },
  { id: 8, question: "What feedback have you received from instructors or students that should be considered?", category: "Program Improvement" },
  
  // Section 4: Professional Development
  { id: 9, question: "What professional development topics would you like to explore or receive training in?", category: "Professional Development" },
  { id: 10, question: "Have you supported or mentored any instructor in their professional growth this quarter?", category: "Professional Development" },
  { id: 11, question: "If yes, how?", category: "Professional Development" },
  
  // Section 5: Support & Feedback
  { id: 12, question: "What support do you need from me to perform more effectively in your role?", category: "Support & Feedback" },
];

// Available instructor names for selection
const availableInstructors = [
  "Mohamoud Abdulle",
  "Michael Migliore", 
  "Rafiq Abdul-Alim",
  "Glenn Stevens",
  "Mohamed Abdurahman"
];

const QuarterlyCheckins = () => {
  const { selectedSchool: userSelectedSchool } = useSchool();
  const queryClient = useQueryClient();
  
  // State
  const [activeTab, setActiveTab] = useState("new");
  const [filterTerm, setFilterTerm] = useState("");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentQuarter, setCurrentQuarter] = useState(`Q${Math.ceil((new Date().getMonth() + 1) / 3)}`);
  const [instructorName, setInstructorName] = useState("");
  const [checkinSchool, setCheckinSchool] = useState<string>("");
  const [checkinDate, setCheckinDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  
  // Load existing quarterly check-ins from API
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["quarterly-checkins"],
    queryFn: async () => {
      const response = await fetch("/api/quarterly-checkins");
      if (!response.ok) {
        throw new Error("Failed to fetch quarterly check-ins");
      }
      return response.json();
    },
  });

  // Create new quarterly check-in
  const createCheckinMutation = useMutation({
    mutationFn: async (checkinData: any) => {
      const response = await fetch("/api/quarterly-checkins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkinData),
      });
      if (!response.ok) {
        throw new Error("Failed to create quarterly check-in");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quarterly-checkins"] });
      toast({
        title: "Success",
        description: "Quarterly check-in created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create quarterly check-in",
        variant: "destructive",
      });
    },
  });

  // Update existing quarterly check-in
  const updateCheckinMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/quarterly-checkins/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update quarterly check-in");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quarterly-checkins"] });
      toast({
        title: "Success",
        description: "Quarterly check-in updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update quarterly check-in",
        variant: "destructive",
      });
    },
  });
  const [currentSession, setCurrentSession] = useState<CheckinSession | null>(null);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  
  // Fetch schools data
  const { data: schools = [] } = useQuery({
    queryKey: ['/api/schools'],
  });
  
  // Filter sessions by search term and year/quarter if needed
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.instructorName.toLowerCase().includes(filterTerm.toLowerCase()) ||
      session.notes.toLowerCase().includes(filterTerm.toLowerCase());
    
    return matchesSearch;
  });
  
  // Start a new check-in session
  const startNewSession = () => {
    if (!instructorName.trim()) {
      toast({
        title: "Error",
        description: "Please select an instructor to start a check-in",
        variant: "destructive",
      });
      return;
    }

    if (!checkinSchool) {
      toast({
        title: "Error",
        description: "Please select a school for the check-in",
        variant: "destructive",
      });
      return;
    }
    
    const newSession: CheckinSession = {
      id: Date.now(), // Temporary ID until saved to backend
      instructorName: instructorName.trim(),
      date: checkinDate,
      quarter: currentQuarter,
      year: currentYear,
      notes: "",
      school: checkinSchool,
      status: "draft",
      answers: defaultQuestions.map(q => ({ questionId: q.id, answer: "" })),
    };
    
    // Set as current session for editing
    setCurrentSession(newSession);
    setActiveTab("edit");
  };
  
  // Save the current session
  const saveSession = async (status: "draft" | "completed" = "draft") => {
    if (!currentSession) return;
    
    // Find the school ID based on the selected school
    const selectedSchoolData = schools.find(school => school.name === currentSession.school);
    const schoolId = selectedSchoolData?.id || 349; // Default to KFNA if not found
    
    // Prepare the data for API
    const checkinData = {
      instructorName: currentSession.instructorName,
      schoolId: schoolId,
      date: currentSession.date,
      quarter: currentSession.quarter,
      year: currentSession.year,
      notes: currentSession.notes,
      status: status,
    };
    
    const answers = currentSession.answers.map(answer => ({
      questionId: answer.questionId,
      answer: answer.answer,
    }));
    
    try {
      // Check if this is a new session (temporary ID) or existing session
      const isNewSession = currentSession.id > 1000000; // Temporary IDs are large numbers
      
      if (isNewSession) {
        // Create new check-in
        await createCheckinMutation.mutateAsync({
          checkinData,
          answers,
        });
      } else {
        // Update existing check-in
        await updateCheckinMutation.mutateAsync({
          id: currentSession.id,
          data: { checkinData, answers },
        });
      }
      
      // If completed, go back to view
      if (status === "completed") {
        setActiveTab("view");
        setCurrentSession(null);
      }
      
    } catch (error) {
      console.error("Error saving check-in:", error);
      // The error is already handled in the mutation onError callback
    }
  };
  
  // Update answer for a question
  const updateAnswer = (questionId: number, answer: string) => {
    if (!currentSession) return;
    
    const updatedAnswers = currentSession.answers.map(a => 
      a.questionId === questionId ? { ...a, answer } : a
    );
    
    setCurrentSession({ ...currentSession, answers: updatedAnswers });
  };
  
  // Toggle expanded view for a session
  const toggleSessionExpanded = (sessionId: number) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
    } else {
      setExpandedSession(sessionId);
    }
  };
  
  // Reference for printable div
  const printableRef = useRef<HTMLDivElement>(null);

  // Function to get questions grouped by category
  const getQuestionsGroupedByCategory = () => {
    const categories: { name: string; questions: CheckinQuestion[] }[] = [];
    
    defaultQuestions.forEach(question => {
      const existingCategory = categories.find(c => c.name === question.category);
      
      if (existingCategory) {
        existingCategory.questions.push(question);
      } else {
        categories.push({
          name: question.category,
          questions: [question]
        });
      }
    });
    
    return categories;
  };
  
  // Print session
  const printSession = (session: CheckinSession) => {
    if (!printableRef.current) return;
    
    // Store the current content
    const originalContent = document.body.innerHTML;
    
    // Create print-specific styles
    const printStyles = `
      <style>
        @media print {
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          h1 { font-size: 20px; margin-bottom: 10px; color: #0A2463; }
          h2 { font-size: 16px; margin-top: 20px; margin-bottom: 10px; color: #0A2463; }
          h3 { font-size: 14px; margin-top: 15px; margin-bottom: 5px; }
          .question { font-weight: bold; margin-top: 10px; }
          .answer { margin-left: 20px; margin-bottom: 15px; min-height: 20px; }
          .no-answer { font-style: italic; color: #777; }
          .header { display: flex; justify-content: space-between; }
          .section { margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; }
          .notes { margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; }
          .info-row { display: flex; margin-bottom: 5px; }
          .info-label { font-weight: bold; width: 180px; }
          .info-value { flex: 1; }
          .print-container { padding: 20px; }
        }
      </style>
    `;
    
    // Create print content
    const printContent = `
      ${printStyles}
      <div class="print-container">
        <h1>QUARTERLY CHECK-IN REPORT</h1>
        
        <div class="info-row">
          <div class="info-label">Senior ELT:</div>
          <div class="info-value">${session.instructorName}</div>
        </div>
        <div class="info-row">
          <div class="info-label">School:</div>
          <div class="info-value">${session.school || 'Not specified'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Date:</div>
          <div class="info-value">${formatDate(session.date)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Quarter/Year:</div>
          <div class="info-value">${session.quarter} ${session.year}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Status:</div>
          <div class="info-value">${session.status === "completed" ? "Completed" : "Draft"}</div>
        </div>
        
        ${getQuestionsGroupedByCategory().map(category => `
          <div class="section">
            <h2>🔹 ${category.name}</h2>
            ${category.questions.map(question => {
              const answer = session.answers.find(a => a.questionId === question.id);
              const answerText = answer?.answer || '';
              
              return `
                <div class="question">${question.question}</div>
                <div class="answer">
                  ${answerText ? answerText : '<span class="no-answer">No answer provided</span>'}
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
        
        ${session.notes ? `
          <div class="notes">
            <h2>Additional Notes</h2>
            <div>${session.notes}</div>
          </div>
        ` : ''}
      </div>
    `;
    
    // Set print content and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Print after a slight delay to ensure content is rendered
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } else {
      // Fallback if popup is blocked
      // Use current window to print
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      
      toast({
        title: "Print Preview Generated",
        description: "If no print dialog appeared, please check your popup blocker settings.",
      });
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy");
  };

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Performance & Leadership":
        return <User className="h-5 w-5 text-blue-600" />;
      case "Program Improvement":
        return <Layout className="h-5 w-5 text-violet-600" />;
      case "Professional Development":
        return <BookText className="h-5 w-5 text-emerald-600" />;
      case "Support & Feedback":
        return <ListTodo className="h-5 w-5 text-amber-600" />;
      default:
        return <ListTodo className="h-5 w-5 text-gray-600" />;
    }
  };
  
  return (
    <div className="flex-1 overflow-y-auto py-6 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quarterly Check-ins</h1>
            <p className="text-gray-600 mt-1">
              Document and track quarterly check-in meetings with Senior ELT Instructors
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setActiveTab("new");
                setCurrentSession(null);
              }}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Check-in
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab("view")}
              className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left side - Form/Edit Panel */}
          <div className="lg:col-span-5 space-y-6">
            {activeTab === "new" && (
              <Card className="shadow-md border-blue-100 rounded-none">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b pb-4">
                  <div className="flex items-center mb-1">
                    <Calendar className="h-5 w-5 text-blue-700 mr-2" />
                    <CardTitle className="text-blue-800">New Quarterly Check-in</CardTitle>
                  </div>
                  <CardDescription>
                    Create a new quarterly check-in for a Senior ELT Instructor
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <Label htmlFor="instructorName" className="text-sm font-medium">
                        Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Select
                          value={instructorName}
                          onValueChange={setInstructorName}
                        >
                          <SelectTrigger id="instructorName" className="pl-9 rounded-none">
                            <SelectValue placeholder="Select instructor name" />
                          </SelectTrigger>
                          <SelectContent className="rounded-none">
                            <SelectItem value="Mohamoud Abdulle">Mohamoud Abdulle</SelectItem>
                            <SelectItem value="Michael Migliore">Michael Migliore</SelectItem>
                            <SelectItem value="Rafiq Abdul-Alim">Rafiq Abdul-Alim</SelectItem>
                            <SelectItem value="Glenn Stevens">Glenn Stevens</SelectItem>
                            <SelectItem value="Mohamed Abdurahman">Mohamed Abdurahman</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="school" className="text-sm font-medium">
                        School
                      </Label>
                      <div className="relative">
                        <School className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Select
                          value={checkinSchool}
                          onValueChange={setCheckinSchool}
                        >
                          <SelectTrigger id="school" className="pl-9 rounded-none">
                            <SelectValue placeholder="Select school" />
                          </SelectTrigger>
                          <SelectContent className="rounded-none">
                            <SelectItem value="KFNA">KFNA</SelectItem>
                            <SelectItem value="NFS East">NFS East</SelectItem>
                            <SelectItem value="NFS West">NFS West</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="date" className="text-sm font-medium">
                          Check-in Date
                        </Label>
                        <div className="relative">
                          <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input
                            id="date"
                            type="date"
                            value={checkinDate}
                            onChange={(e) => setCheckinDate(e.target.value)}
                            className="pl-9 rounded-none"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="quarter" className="text-sm font-medium">
                          Quarter
                        </Label>
                        <Select
                          value={currentQuarter}
                          onValueChange={setCurrentQuarter}
                        >
                          <SelectTrigger id="quarter" className="rounded-none">
                            <SelectValue placeholder="Select quarter" />
                          </SelectTrigger>
                          <SelectContent className="rounded-none">
                            <SelectItem value="Q1">Q1</SelectItem>
                            <SelectItem value="Q2">Q2</SelectItem>
                            <SelectItem value="Q3">Q3</SelectItem>
                            <SelectItem value="Q4">Q4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="year" className="text-sm font-medium">
                        Year
                      </Label>
                      <Select
                        value={currentYear.toString()}
                        onValueChange={(value) => setCurrentYear(parseInt(value))}
                      >
                        <SelectTrigger id="year" className="rounded-none">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          {[...Array(5)].map((_, i) => {
                            const year = new Date().getFullYear() - 2 + i;
                            return (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-gray-50/50 mx-6 px-0 py-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setActiveTab("view");
                      setInstructorName("");
                      setCheckinSchool("");
                    }}
                    className="border-gray-300 rounded-none"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={startNewSession}
                    disabled={!instructorName.trim() || !checkinSchool}
                    className="bg-blue-600 hover:bg-blue-700 rounded-none"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start Check-in
                  </Button>
                </CardFooter>
              </Card>
            )}

            {currentSession && activeTab === "edit" && (
              <Card className="shadow-md border-amber-100">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100/50 border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center mb-1">
                      <Edit className="h-5 w-5 text-amber-700 mr-2" />
                      <CardTitle className="text-amber-800">
                        Editing Check-in: {currentSession.instructorName}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-amber-100/50 text-amber-800 border-amber-200">
                      {currentSession.quarter} {currentSession.year}
                    </Badge>
                  </div>
                  <CardDescription>
                    {currentSession.school && `School: ${currentSession.school} • `}
                    {formatDate(currentSession.date)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[calc(100vh-300px)] overflow-y-auto p-6 divide-y divide-gray-100">
                    {getQuestionsGroupedByCategory().map((category, index) => (
                      <div key={category.name} className={`space-y-4 ${index > 0 ? 'pt-6' : ''}`}>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category.name)}
                          <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                        </div>
                        
                        {category.questions.map((question) => {
                          const answer = currentSession.answers.find(a => a.questionId === question.id);
                          const answerText = answer ? answer.answer : "";
                          
                          return (
                            <div key={question.id} className="space-y-2">
                              <Label 
                                htmlFor={`question-${question.id}`}
                                className="text-sm font-medium text-gray-700"
                              >
                                {question.question}
                              </Label>
                              <Textarea
                                id={`question-${question.id}`}
                                value={answerText}
                                onChange={(e) => updateAnswer(question.id, e.target.value)}
                                placeholder="Enter response..."
                                className="min-h-[100px] border-gray-300 focus:border-blue-400"
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    
                    {/* Additional notes */}
                    <div className="space-y-2 pt-6">
                      <Label 
                        htmlFor="notes" 
                        className="text-sm font-medium text-gray-700"
                      >
                        Additional Notes
                      </Label>
                      <Textarea
                        id="notes"
                        value={currentSession.notes}
                        onChange={(e) => setCurrentSession({...currentSession, notes: e.target.value})}
                        placeholder="Enter any additional notes or follow-up items..."
                        className="min-h-[120px] border-gray-300 focus:border-blue-400"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-gray-50/50 px-6 py-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setActiveTab("view");
                      setCurrentSession(null);
                    }}
                    className="border-gray-300"
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => saveSession("draft")}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button 
                      onClick={() => saveSession("completed")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Right side - View panel */}
          <div className="lg:col-span-7">
            <Card className="shadow-md">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100/30 border-b pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center">
                    <History className="h-5 w-5 text-indigo-700 mr-2" />
                    <CardTitle className="text-indigo-800">Check-ins History</CardTitle>
                  </div>
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search check-ins..." 
                      className="pl-9 w-full md:w-64"
                      value={filterTerm}
                      onChange={(e) => setFilterTerm(e.target.value)}
                    />
                  </div>
                </div>
                <CardDescription>
                  View and manage your quarterly check-in sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <div className="bg-indigo-50 mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
                      <FileQuestion className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No check-ins found</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      {filterTerm 
                        ? "No check-ins match your search criteria." 
                        : "You haven't created any check-in sessions yet."}
                    </p>
                    <Button 
                      onClick={() => setActiveTab("new")}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Start a New Check-in
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-[calc(100vh-250px)] overflow-y-auto">
                    {filteredSessions.map((session) => (
                      <div key={session.id} className="border-l-4 border-r-0 hover:border-r-4 transition-all duration-200 border-l-transparent hover:border-l-blue-500 border-r-transparent hover:border-r-blue-500">
                        <div 
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                          onClick={() => toggleSessionExpanded(session.id)}
                        >
                          <div className="flex items-center gap-3">
                            {session.status === "completed" ? (
                              <div className="bg-green-100 p-2 rounded-full">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </div>
                            ) : (
                              <div className="bg-amber-100 p-2 rounded-full">
                                <Clock className="h-5 w-5 text-amber-600" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">{session.instructorName}</h4>
                                <Badge className={session.status === "completed" 
                                  ? "bg-green-100 text-green-700 border-green-200" 
                                  : "bg-amber-100 text-amber-700 border-amber-200"}>
                                  {session.status === "completed" ? "Completed" : "Draft"}
                                </Badge>
                              </div>
                              <div className="flex items-center text-sm text-gray-500 gap-3 mt-1">
                                <span className="flex items-center">
                                  <CalendarDays className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                  {formatDate(session.date)}
                                </span>
                                <span>{session.quarter} {session.year}</span>
                                {session.school && (
                                  <span className="flex items-center">
                                    <School className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                    {session.school}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                printSession(session);
                              }}
                              title="Print Report"
                              className="text-gray-500 hover:text-blue-600"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            
                            {session.status === "draft" && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentSession(session);
                                  setActiveTab("edit");
                                }}
                                title="Edit Check-in"
                                className="text-gray-500 hover:text-amber-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {expandedSession === session.id ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        {expandedSession === session.id && (
                          <div className="p-4 bg-gray-50/80 border-t">
                            <div ref={printableRef} className="space-y-6">
                              {getQuestionsGroupedByCategory().map((category) => {
                                // Get answers for this category
                                const categoryAnswers = session.answers.filter(answer => {
                                  const question = defaultQuestions.find(q => q.id === answer.questionId);
                                  return question && question.category === category.name;
                                });
                                
                                // Skip categories with no answers
                                if (categoryAnswers.length === 0) return null;
                                
                                return (
                                  <div key={category.name} className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                                    <div className="flex items-center space-x-2 mb-3">
                                      {getCategoryIcon(category.name)}
                                      <h3 className="font-semibold text-gray-800">{category.name}</h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      {categoryAnswers.map((answer) => {
                                        const question = defaultQuestions.find(q => q.id === answer.questionId);
                                        if (!question) return null;
                                        
                                        return (
                                          <div key={answer.questionId} className="space-y-1">
                                            <h5 className="text-sm font-medium text-gray-700">{question.question}</h5>
                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-md text-sm">
                                              {answer.answer || <span className="text-gray-400 italic">No answer provided</span>}
                                            </p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {session.notes && (
                              <div className="mt-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
                                <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                                  <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                                  Additional Notes
                                </h5>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-wrap text-sm">
                                  {session.notes}
                                </p>
                              </div>
                            )}
                            
                            {session.status === "draft" && (
                              <div className="mt-4 flex justify-end">
                                <Button 
                                  variant="outline" 
                                  className="mr-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                                  onClick={() => {
                                    setCurrentSession(session);
                                    setActiveTab("edit");
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Continue Editing
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuarterlyCheckins;