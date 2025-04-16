import React, { useState } from 'react';
import { Candidate, InterviewQuestion } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilePdf, FileText, Download, Mail, Phone, User, Calendar, BookOpen, Globe, Award, PenTool, Briefcase } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import InterviewQuestionForm from './InterviewQuestionForm';

interface CandidateDetailsProps {
  candidate: Candidate;
}

const formatDate = (dateString?: Date | string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const CandidateDetails: React.FC<CandidateDetailsProps> = ({ candidate }) => {
  const { toast } = useToast();
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  
  // Fetch interview questions for this candidate
  const { 
    data: questions, 
    isLoading: questionsLoading,
    refetch: refetchQuestions
  } = useQuery<InterviewQuestion[]>({
    queryKey: ['/api/candidates', candidate.id, 'interview-questions'],
    queryFn: async () => {
      const response = await fetch(`/api/candidates/${candidate.id}/interview-questions`);
      if (!response.ok) {
        throw new Error('Failed to fetch interview questions');
      }
      return response.json();
    },
  });

  const handleQuestionAdded = () => {
    setIsAddingQuestion(false);
    refetchQuestions();
    toast({
      title: 'Question Added',
      description: 'The interview question has been added successfully.'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-purple-100 text-purple-800';
      case 'shortlisted': return 'bg-amber-100 text-amber-800';
      case 'interviewed': return 'bg-cyan-100 text-cyan-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{candidate.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className={getStatusColor(candidate.status)}>
              {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
            </Badge>
            {candidate.englishLevel && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                English: {candidate.englishLevel}
              </Badge>
            )}
            {candidate.yearsOfExperience > 0 && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                {candidate.yearsOfExperience} Years Experience
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {candidate.resumeUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" download>
                <Download className="mr-2 h-4 w-4" />
                Download Resume
              </a>
            </Button>
          )}
        </div>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="aiAnalysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="questions">Interview Questions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-sm text-muted-foreground">{candidate.email}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Phone</div>
                    <div className="text-sm text-muted-foreground">{candidate.phone || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Nationality</div>
                    <div className="text-sm text-muted-foreground">{candidate.nationality || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Application Date</div>
                    <div className="text-sm text-muted-foreground">{formatDate(candidate.uploadDate)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Professional Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Education</div>
                    <div className="text-sm text-muted-foreground">{candidate.education || 'Not provided'}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Years of Experience</div>
                    <div className="text-sm text-muted-foreground">{candidate.yearsOfExperience || 0} years</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                  <PenTool className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">English Level</div>
                    <div className="text-sm text-muted-foreground">{candidate.englishLevel || 'Not specified'}</div>
                  </div>
                </div>
                
                {candidate.reviewDate && (
                  <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Last Reviewed</div>
                      <div className="text-sm text-muted-foreground">{formatDate(candidate.reviewDate)}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Notes and teaching experience */}
          <div className="grid grid-cols-1 gap-6">
            {candidate.teachingExperience && (
              <Card>
                <CardHeader>
                  <CardTitle>Teaching Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{candidate.teachingExperience}</p>
                </CardContent>
              </Card>
            )}
            
            {candidate.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{candidate.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="aiAnalysis" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Resume Analysis</CardTitle>
              <CardDescription>
                Automatic analysis of resume and qualification evaluation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {candidate.aiAnalysis ? (
                <div className="whitespace-pre-wrap">{candidate.aiAnalysis}</div>
              ) : (
                <div className="text-center p-6">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No AI Analysis Available</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    AI analysis will be available once the resume has been processed. This helps evaluate key skills and qualifications for the ELT instructor position.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Interview Questions</CardTitle>
                <CardDescription>
                  Prepare and review interview questions for this candidate
                </CardDescription>
              </div>
              {!isAddingQuestion && (
                <Button onClick={() => setIsAddingQuestion(true)}>
                  Add Question
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isAddingQuestion ? (
                <div className="mb-6">
                  <InterviewQuestionForm 
                    candidateId={candidate.id}
                    onSuccess={handleQuestionAdded}
                    onCancel={() => setIsAddingQuestion(false)}
                  />
                </div>
              ) : questions && questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <Badge variant="outline" className="mb-2">
                            {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
                          </Badge>
                          <p className="font-medium">{question.question}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6">
                  <FilePdf className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Interview Questions</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Add interview questions to help structure the interview process for this candidate.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateDetails;