import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { useSchoolContext } from '@/context/SchoolContext';
import { Separator } from '@/components/ui/separator';
import { Candidate } from '@shared/schema';
import { 
  UserPlus, 
  Search, 
  UserCog, 
  Award, 
  FileQuestion, 
  Filter, 
  Stars, 
  Brain, 
  ListFilter, 
  Users 
} from 'lucide-react';
import CandidatesList from '@/components/recruitment/CandidatesList';
import CandidateFormNew from '@/components/recruitment/CandidateFormNew';
import InterviewQuestionsList from '@/components/recruitment/InterviewQuestionsList';
import EmptyState from '@/components/common/EmptyState';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecruitmentPage() {
  const { selectedSchool } = useSchoolContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isRankingCandidates, setIsRankingCandidates] = useState(false);

  // Fetch candidates
  const { data: candidates = [], isLoading: isLoadingCandidates } = useQuery({
    queryKey: ['/api/candidates', selectedSchool?.id],
    queryFn: async () => {
      const url = selectedSchool?.id 
        ? `/api/schools/${selectedSchool.id}/candidates` 
        : '/api/candidates';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch candidates');
      return res.json();
    }
  });

  // Fetch ranked candidates
  const { 
    data: rankedCandidates = { rankedCandidates: [], rationale: '' }, 
    isLoading: isLoadingRanking,
    refetch: refetchRanking
  } = useQuery({
    queryKey: ['/api/candidates/rank-candidates'],
    queryFn: async () => {
      const res = await fetch('/api/candidates/rank-candidates');
      if (!res.ok) throw new Error('Failed to fetch ranked candidates');
      return res.json();
    },
    enabled: !isRankingCandidates
  });

  // Mutation for AI ranking
  const rankCandidatesMutation = useMutation({
    mutationFn: async () => {
      setIsRankingCandidates(true);
      const response = await apiRequest('GET', '/api/candidates/rank-candidates');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Candidates Ranked Successfully',
        description: 'The AI has analyzed and ranked the candidates based on their qualifications.',
        variant: 'default',
      });
      refetchRanking();
      setIsRankingCandidates(false);
    },
    onError: (error) => {
      toast({
        title: 'Ranking Failed',
        description: error instanceof Error ? error.message : 'Failed to rank candidates',
        variant: 'destructive',
      });
      setIsRankingCandidates(false);
    }
  });

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setActiveTab('details');
  };

  // Calculate recruitment metrics
  const totalCandidates = candidates.length;
  const newCandidates = candidates.filter(c => c.status === 'new').length;
  const reviewedCandidates = candidates.filter(c => c.status === 'reviewed').length;
  const shortlistedCandidates = candidates.filter(c => c.status === 'shortlisted').length;
  const interviewedCandidates = candidates.filter(c => c.status === 'interviewed').length;
  const hiredCandidates = candidates.filter(c => c.status === 'hired').length;
  const rejectedCandidates = candidates.filter(c => c.status === 'rejected').length;

  const getCandidateStatusPercentage = (status: string) => {
    if (totalCandidates === 0) return 0;
    return (candidates.filter(c => c.status === status).length / totalCandidates) * 100;
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">ELT Recruitment Hub</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered recruitment management for ELT instructor candidates
          </p>
        </div>
        <div className="flex gap-2">
          {!showCandidateForm && activeTab !== 'new-candidate' && (
            <Button 
              onClick={() => setActiveTab('new-candidate')} 
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Candidate
            </Button>
          )}
        </div>
      </div>

      <Separator className="my-6" />

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="dashboard" className="gap-1">
            <Award className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="candidates" className="gap-1">
            <Users className="h-4 w-4" />
            Candidates
          </TabsTrigger>
          <TabsTrigger value="new-candidate" className="gap-1">
            <UserPlus className="h-4 w-4" />
            New Candidate
          </TabsTrigger>
          <TabsTrigger 
            value="details" 
            disabled={!selectedCandidate}
            className="gap-1"
          >
            <UserCog className="h-4 w-4" />
            Candidate Details
          </TabsTrigger>
          <TabsTrigger 
            value="questions" 
            disabled={!selectedCandidate}
            className="gap-1"
          >
            <FileQuestion className="h-4 w-4" />
            Interview Questions
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Candidates</CardTitle>
                <CardDescription>Overall recruitment pool</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{totalCandidates}</div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">New Candidates</CardTitle>
                <CardDescription>Pending initial review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{newCandidates}</div>
                  <UserPlus className="h-8 w-8 text-muted-foreground" />
                </div>
                <Progress value={getCandidateStatusPercentage('new')} className="h-2 mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Shortlisted</CardTitle>
                <CardDescription>Approved for interview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{shortlistedCandidates}</div>
                  <ListFilter className="h-8 w-8 text-muted-foreground" />
                </div>
                <Progress value={getCandidateStatusPercentage('shortlisted')} className="h-2 mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Hired Instructors</CardTitle>
                <CardDescription>Successfully placed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{hiredCandidates}</div>
                  <Award className="h-8 w-8 text-muted-foreground" />
                </div>
                <Progress value={getCandidateStatusPercentage('hired')} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      AI-Ranked Top Candidates
                    </div>
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => rankCandidatesMutation.mutate()}
                    disabled={isRankingCandidates || isLoadingRanking}
                    className="gap-1"
                  >
                    <Stars className="h-4 w-4" />
                    {isRankingCandidates ? 'Analyzing...' : 'Re-analyze'}
                  </Button>
                </div>
                <CardDescription>
                  Our AI has analyzed and ranked candidates based on qualifications and fit
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRanking || isRankingCandidates ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {rankedCandidates.rankedCandidates.length > 0 ? (
                      <div className="space-y-2">
                        {rankedCandidates.rankedCandidates.slice(0, 5).map((candidate, index) => (
                          <div 
                            key={candidate.id} 
                            className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer"
                            onClick={() => handleSelectCandidate(candidate)}
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{candidate.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {candidate.degree}{candidate.degreeField ? ` in ${candidate.degreeField}` : ''} • 
                                {candidate.yearsExperience} years experience
                              </p>
                            </div>
                            <Badge>{candidate.status}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="No ranked candidates"
                        description="Click the 'Re-analyze' button to rank candidates."
                        icon="user"
                      />
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground border-t pt-4">
                <div className="max-h-32 overflow-y-auto w-full">
                  {rankedCandidates.rationale || "Click 'Re-analyze' to get AI insights on candidates."}
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recruitment Pipeline</CardTitle>
                <CardDescription>Candidate progress by status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>New</span>
                    <span className="font-medium">{newCandidates}</span>
                  </div>
                  <Progress value={getCandidateStatusPercentage('new')} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Reviewed</span>
                    <span className="font-medium">{reviewedCandidates}</span>
                  </div>
                  <Progress value={getCandidateStatusPercentage('reviewed')} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Shortlisted</span>
                    <span className="font-medium">{shortlistedCandidates}</span>
                  </div>
                  <Progress value={getCandidateStatusPercentage('shortlisted')} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Interviewed</span>
                    <span className="font-medium">{interviewedCandidates}</span>
                  </div>
                  <Progress value={getCandidateStatusPercentage('interviewed')} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Hired</span>
                    <span className="font-medium">{hiredCandidates}</span>
                  </div>
                  <Progress value={getCandidateStatusPercentage('hired')} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Rejected</span>
                    <span className="font-medium">{rejectedCandidates}</span>
                  </div>
                  <Progress value={getCandidateStatusPercentage('rejected')} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Candidates Tab */}
        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Candidate Pool</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => rankCandidatesMutation.mutate()}
                    disabled={isRankingCandidates || isLoadingRanking}
                    className="gap-1"
                  >
                    <Stars className="h-4 w-4" />
                    AI Rank Candidates
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => setActiveTab('new-candidate')}
                    className="gap-1"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add New
                  </Button>
                </div>
              </div>
              <CardDescription>
                {selectedSchool
                  ? `Viewing candidates for ${selectedSchool.name}`
                  : 'Viewing all candidates across schools'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CandidatesList 
                onSelectCandidate={handleSelectCandidate} 
                schoolId={selectedSchool?.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Candidate Tab */}
        <TabsContent value="new-candidate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Candidate</CardTitle>
              <CardDescription>
                Upload a resume to automatically extract candidate information or fill in details manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CandidateFormNew 
                onSuccess={() => {
                  setActiveTab('candidates');
                  queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/candidates/rank-candidates'] });
                  toast({
                    title: 'Candidate Added',
                    description: 'The new candidate has been successfully added to the database.',
                  });
                }}
                onCancel={() => setActiveTab('candidates')}
                schoolId={selectedSchool?.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Candidate Details Tab */}
        <TabsContent value="details" className="space-y-4">
          {selectedCandidate ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Edit Candidate: {selectedCandidate.name}
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('candidates')}
                  >
                    Back to List
                  </Button>
                </div>
                <CardDescription>
                  Update candidate information and review status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CandidateFormNew
                  onSuccess={() => {
                    setActiveTab('candidates');
                    setSelectedCandidate(null);
                    queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
                    queryClient.invalidateQueries({ queryKey: ['/api/candidates/rank-candidates'] });
                    toast({
                      title: 'Candidate Updated',
                      description: 'The candidate information has been successfully updated.',
                    });
                  }}
                  onCancel={() => setActiveTab('candidates')}
                  initialData={selectedCandidate}
                  isEditing
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  title="No candidate selected"
                  description="Please select a candidate from the list to view details."
                  icon="user"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Interview Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          {selectedCandidate ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Interview Questions for {selectedCandidate.name}
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('candidates')}
                  >
                    Back to List
                  </Button>
                </div>
                <CardDescription>
                  Manage interview questions and candidate responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InterviewQuestionsList candidateId={selectedCandidate.id} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  title="No candidate selected"
                  description="Please select a candidate from the list to view interview questions."
                  icon="user"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}