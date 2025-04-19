import React, { useState, useEffect } from "react";
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
  UserCheck
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

// Initial set of questions (to be replaced with your actual questions)
const defaultQuestions: CheckinQuestion[] = [
  // Will be populated with the questions provided by the user
  { id: 1, question: "How has your quarter been overall?", category: "General" },
  { id: 2, question: "What challenges have you faced?", category: "Challenges" },
  { id: 3, question: "What accomplishments are you proud of?", category: "Achievements" },
  { id: 4, question: "What areas would you like support in?", category: "Support" },
  { id: 5, question: "What are your goals for next quarter?", category: "Planning" },
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
  
  // Export session as PDF
  const exportSession = (session: CheckinSession) => {
    // For now just show a toast - implementation will come later
    toast({
      title: "Export Feature Coming Soon",
      description: "The ability to export check-ins as PDF will be available soon.",
    });
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
            </Tabs>
          </div>
        </div>
        
        <div className="space-y-6">
          <TabsContent value="view" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle>Recent Check-ins</CardTitle>
                  <div className="flex items-center gap-2">
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
                                exportSession(session);
                              }}
                              title="Export as PDF"
                            >
                              <Download className="h-4 w-4 text-gray-500" />
                            </Button>
                            {expandedSession === session.id ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        {expandedSession === session.id && (
                          <div className="p-4 border-t">
                            <div className="grid gap-4 mb-4">
                              {session.answers.map((answer) => {
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
                      <Button onClick={startNewSession} disabled={!selectedInstructorId}>
                        <Plus className="h-4 w-4 mr-2" />
                        Start Check-in
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Session questions */}
                    <div className="space-y-4">
                      {defaultQuestions.map((question) => {
                        const answer = currentSession.answers.find(a => a.questionId === question.id);
                        const answerText = answer ? answer.answer : "";
                        
                        return (
                          <div key={question.id} className="space-y-2">
                            <Label htmlFor={`question-${question.id}`}>
                              {question.question}
                              {question.category && (
                                <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                  {question.category}
                                </span>
                              )}
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
      </div>
    </div>
  );
};

export default QuarterlyCheckins;