import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  Users,
  CalendarDays,
  Clock,
  Save,
  Plus,
  MessageSquare,
  ListChecks,
  ChevronDown,
  ChevronUp,
  Download,
  FileQuestion,
  Ban,
  Search,
  UserCheck,
  Printer,
  Edit,
  FilePlus
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
import { useQuery } from "@tanstack/react-query";
import { Instructor } from "@shared/schema";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

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
  instructorId: number;
  instructorName: string;
  date: string;
  quarter: string;
  year: number;
  notes: string;
  status: "draft" | "completed";
  answers: CheckinAnswer[];
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

// Sample initial data - will be replaced with actual data from API
const initialSessions: CheckinSession[] = [];

const QuarterlyCheckins = () => {
  const { selectedSchool } = useSchool();
  
  // State
  const [activeTab, setActiveTab] = useState("view");
  const [sessions, setSessions] = useState<CheckinSession[]>(initialSessions);
  const [filterTerm, setFilterTerm] = useState("");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentQuarter, setCurrentQuarter] = useState(`Q${Math.ceil((new Date().getMonth() + 1) / 3)}`);
  const [selectedInstructorId, setSelectedInstructorId] = useState<number | null>(null);
  const [currentSession, setCurrentSession] = useState<CheckinSession | null>(null);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  
  // Fetch instructors data
  const { data: instructors = [] } = useQuery<Instructor[]>({
    queryKey: selectedSchool 
      ? ['/api/schools', selectedSchool.id, 'instructors'] 
      : ['/api/instructors'],
    enabled: !selectedSchool || !!selectedSchool.id,
  });
  
  // Senior ELT instructors (those with role containing "Senior")
  const seniorInstructors = instructors.filter(
    instructor => instructor.role && instructor.role.includes("Senior")
  );
  
  // Filter sessions by search term and year/quarter if needed
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.instructorName.toLowerCase().includes(filterTerm.toLowerCase()) ||
      session.notes.toLowerCase().includes(filterTerm.toLowerCase());
    
    return matchesSearch;
  });
  
  // Start a new check-in session
  const startNewSession = () => {
    if (!selectedInstructorId) {
      toast({
        title: "Error",
        description: "Please select an instructor to start a check-in",
        variant: "destructive",
      });
      return;
    }
    
    const instructor = instructors.find(i => i.id === selectedInstructorId);
    if (!instructor) return;
    
    const newSession: CheckinSession = {
      id: Date.now(), // Temporary ID until saved to backend
      instructorId: instructor.id,
      instructorName: instructor.name,
      date: format(new Date(), "yyyy-MM-dd"),
      quarter: currentQuarter,
      year: currentYear,
      notes: "",
      status: "draft",
      answers: defaultQuestions.map(q => ({ questionId: q.id, answer: "" })),
    };
    
    // Add to sessions and set as current
    setSessions([...sessions, newSession]);
    setCurrentSession(newSession);
    setActiveTab("edit");
  };
  
  // Save the current session
  const saveSession = (status: "draft" | "completed" = "draft") => {
    if (!currentSession) return;
    
    // Update status
    const updatedSession = { ...currentSession, status };
    
    // Update in sessions list
    const updatedSessions = sessions.map(session => 
      session.id === updatedSession.id ? updatedSession : session
    );
    
    setSessions(updatedSessions);
    setCurrentSession(updatedSession);
    
    // Show success message
    toast({
      title: status === "completed" ? "Check-in Completed" : "Draft Saved",
      description: status === "completed" 
        ? "The check-in has been marked as completed." 
        : "Your changes have been saved as a draft.",
    });
    
    // If completed, go back to view
    if (status === "completed") {
      setActiveTab("view");
      setCurrentSession(null);
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
  
  return (
    <div className="flex-1 overflow-y-auto py-6 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quarterly Check-ins</h1>
            <p className="text-gray-600 mt-1">
              Document and track quarterly check-in meetings with Senior ELT Instructors
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="view">View Check-ins</TabsTrigger>
                <TabsTrigger value="edit">New Check-in</TabsTrigger>
              </TabsList>
              
              <div className="space-y-6 mt-6">
                <TabsContent value="view" className="mt-0">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>Recent Check-ins</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveTab("edit")}
                            className="mr-2"
                          >
                            <FilePlus className="h-4 w-4 mr-2" />
                            New Check-in
                          </Button>
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                              type="search"
                              placeholder="Search check-ins..." 
                              className="pl-9 w-full sm:w-64"
                              value={filterTerm}
                              onChange={(e) => setFilterTerm(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <CardDescription>
                        View and manage your quarterly check-in sessions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {filteredSessions.length === 0 ? (
                        <div className="text-center py-10 px-6">
                          <FileQuestion className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No check-ins found</h3>
                          <p className="text-gray-500 mb-4">
                            {filterTerm 
                              ? "No check-ins match your search criteria." 
                              : "You haven't created any check-in sessions yet."}
                          </p>
                          <Button onClick={() => setActiveTab("edit")}>
                            <Plus className="h-4 w-4 mr-2" />
                            Start a New Check-in
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredSessions.map((session) => (
                            <div key={session.id} className="border rounded-lg overflow-hidden">
                              <div 
                                className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 ${
                                  session.status === "completed" ? "bg-green-50 hover:bg-green-50/80" : "bg-amber-50 hover:bg-amber-50/80"
                                }`}
                                onClick={() => toggleSessionExpanded(session.id)}
                              >
                                <div className="flex items-center gap-3">
                                  {session.status === "completed" ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <Clock className="h-5 w-5 text-amber-500" />
                                  )}
                                  <div>
                                    <h4 className="font-medium text-gray-900">{session.instructorName}</h4>
                                    <div className="flex items-center text-sm text-gray-500 gap-4">
                                      <span className="flex items-center">
                                        <CalendarDays className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                        {formatDate(session.date)}
                                      </span>
                                      <span>{session.quarter} {session.year}</span>
                                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                                        session.status === "completed" 
                                          ? "bg-green-100 text-green-700" 
                                          : "bg-amber-100 text-amber-700"
                                      }`}>
                                        {session.status === "completed" ? "Completed" : "Draft"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      printSession(session);
                                    }}
                                    title="Print Report"
                                  >
                                    <Printer className="h-4 w-4 text-gray-500" />
                                  </Button>
                                  
                                  {session.status === "draft" && (
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentSession(session);
                                        setActiveTab("edit");
                                      }}
                                      title="Edit Check-in"
                                    >
                                      <Edit className="h-4 w-4 text-gray-500" />
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
                                <div className="p-4 border-t">
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
                                        <div key={category.name} className="space-y-3">
                                          <div className="flex items-center space-x-2 mb-2">
                                            <h3 className="font-semibold text-blue-900">🔹 {category.name}</h3>
                                            <Separator className="flex-grow" />
                                          </div>
                                          
                                          {categoryAnswers.map((answer) => {
                                            const question = defaultQuestions.find(q => q.id === answer.questionId);
                                            if (!question) return null;
                                            
                                            return (
                                              <div key={answer.questionId} className="space-y-1">
                                                <h5 className="font-medium text-gray-900">{question.question}</h5>
                                                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                                                  {answer.answer || <span className="text-gray-400 italic">No answer provided</span>}
                                                </p>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  
                                  {session.notes && (
                                    <div className="mt-4 pt-4 border-t">
                                      <h5 className="font-medium text-gray-900 mb-2">Additional Notes</h5>
                                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                                        {session.notes}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {session.status === "draft" && (
                                    <div className="mt-4 flex justify-end">
                                      <Button 
                                        variant="outline" 
                                        className="mr-2"
                                        onClick={() => {
                                          setCurrentSession(session);
                                          setActiveTab("edit");
                                        }}
                                      >
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
                </TabsContent>
                
                <TabsContent value="edit" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {currentSession ? `Editing Check-in: ${currentSession.instructorName}` : "New Quarterly Check-in"}
                      </CardTitle>
                      <CardDescription>
                        {currentSession 
                          ? `${currentSession.quarter} ${currentSession.year} check-in for ${currentSession.instructorName}`
                          : "Create a new quarterly check-in for a Senior ELT Instructor"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!currentSession ? (
                        <div className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="instructor">Instructor</Label>
                              <Select
                                value={selectedInstructorId?.toString() || ""}
                                onValueChange={(value) => setSelectedInstructorId(parseInt(value))}
                              >
                                <SelectTrigger id="instructor">
                                  <SelectValue placeholder="Select an instructor" />
                                </SelectTrigger>
                                <SelectContent>
                                  {seniorInstructors.length === 0 ? (
                                    <SelectItem value="no-instructors" disabled>
                                      No senior instructors found
                                    </SelectItem>
                                  ) : (
                                    seniorInstructors.map((instructor) => (
                                      <SelectItem key={instructor.id} value={instructor.id.toString()}>
                                        {instructor.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="quarter">Quarter</Label>
                                <Select
                                  value={currentQuarter}
                                  onValueChange={setCurrentQuarter}
                                >
                                  <SelectTrigger id="quarter">
                                    <SelectValue placeholder="Select quarter" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Q1">Q1</SelectItem>
                                    <SelectItem value="Q2">Q2</SelectItem>
                                    <SelectItem value="Q3">Q3</SelectItem>
                                    <SelectItem value="Q4">Q4</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="year">Year</Label>
                                <Select
                                  value={currentYear.toString()}
                                  onValueChange={(value) => setCurrentYear(parseInt(value))}
                                >
                                  <SelectTrigger id="year">
                                    <SelectValue placeholder="Select year" />
                                  </SelectTrigger>
                                  <SelectContent>
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
                          </div>
                          
                          <div className="pt-2">
                            <Button 
                              onClick={startNewSession} 
                              disabled={selectedInstructorId === null}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Start Check-in
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Session questions grouped by category */}
                          <div className="space-y-8">
                            {getQuestionsGroupedByCategory().map((category) => (
                              <div key={category.name} className="space-y-4">
                                <div className="flex items-center space-x-2">
                                  <h3 className="text-lg font-semibold text-blue-900">🔹 {category.name}</h3>
                                  <Separator className="flex-grow" />
                                </div>
                                
                                {category.questions.map((question) => {
                                  const answer = currentSession.answers.find(a => a.questionId === question.id);
                                  const answerText = answer ? answer.answer : "";
                                  
                                  return (
                                    <div key={question.id} className="space-y-2">
                                      <Label htmlFor={`question-${question.id}`}>
                                        {question.question}
                                      </Label>
                                      <Textarea
                                        id={`question-${question.id}`}
                                        value={answerText}
                                        onChange={(e) => updateAnswer(question.id, e.target.value)}
                                        placeholder="Enter response..."
                                        className="min-h-[100px]"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                          
                          {/* Additional notes */}
                          <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes</Label>
                            <Textarea
                              id="notes"
                              value={currentSession.notes}
                              onChange={(e) => setCurrentSession({...currentSession, notes: e.target.value})}
                              placeholder="Enter any additional notes or follow-up items..."
                              className="min-h-[150px]"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                    
                    {currentSession && (
                      <CardFooter className="flex justify-between border-t px-6 py-4">
                        <div className="flex items-center">
                          <Button 
                            variant="ghost" 
                            onClick={() => {
                              setActiveTab("view");
                              setCurrentSession(null);
                            }}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => saveSession("draft")}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Draft
                          </Button>
                          <Button 
                            onClick={() => saveSession("completed")}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete Check-in
                          </Button>
                        </div>
                      </CardFooter>
                    )}
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuarterlyCheckins;