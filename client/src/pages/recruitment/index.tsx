import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { useSchoolContext } from '@/context/SchoolContext';
import { Loader2, Plus, UserPlus, FileQuestion } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Candidate } from '@shared/schema';
import CandidatesList from '@/components/recruitment/CandidatesList';
import CandidateForm from '@/components/recruitment/CandidateForm';
import InterviewQuestionsList from '@/components/recruitment/InterviewQuestionsList';
import EmptyState from '@/components/common/EmptyState';

export default function RecruitmentPage() {
  const { toast } = useToast();
  const { selectedSchool } = useSchoolContext();
  const [addingCandidate, setAddingCandidate] = useState(false);
  const [activeTab, setActiveTab] = useState('candidates');

  // Fetch candidates for the selected school
  const { 
    data: candidates, 
    isLoading: candidatesLoading,
    error: candidatesError
  } = useQuery<Candidate[]>({
    queryKey: ['/api/schools', selectedSchool?.id, 'candidates'],
    queryFn: async () => {
      if (!selectedSchool) return [];
      const res = await fetch(`/api/schools/${selectedSchool.id}/candidates`);
      if (!res.ok) throw new Error('Failed to fetch candidates');
      return res.json();
    },
    enabled: !!selectedSchool,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const handleCandidateCreated = () => {
    setAddingCandidate(false);
    queryClient.invalidateQueries({ queryKey: ['/api/schools', selectedSchool?.id, 'candidates'] });
    toast({
      title: 'Candidate Added',
      description: 'The candidate has been successfully added.',
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // If there's an error, show it
  useEffect(() => {
    if (candidatesError) {
      toast({
        title: 'Error',
        description: 'Failed to load candidates. Please try again.',
        variant: 'destructive',
      });
    }
  }, [candidatesError, toast]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruitment</h1>
          <p className="text-muted-foreground mt-2">
            Manage recruitment for {selectedSchool?.name || 'All Schools'}
          </p>
        </div>
        {!addingCandidate && activeTab === 'candidates' && (
          <Button onClick={() => setAddingCandidate(true)} className="flex items-center gap-2">
            <UserPlus size={16} />
            <span>Add Candidate</span>
          </Button>
        )}
      </div>

      {addingCandidate ? (
        <Card>
          <CardHeader>
            <CardTitle>Add New Candidate</CardTitle>
            <CardDescription>
              Enter the candidate's information below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CandidateForm 
              onCancel={() => setAddingCandidate(false)} 
              onSuccess={handleCandidateCreated}
              schoolId={selectedSchool?.id}
            />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="candidates" onValueChange={handleTabChange}>
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="questions">Interview Questions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="candidates" className="mt-4">
            {candidatesLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : candidates && candidates.length > 0 ? (
              <CandidatesList candidates={candidates} schoolId={selectedSchool?.id} />
            ) : (
              <EmptyState 
                title="No Candidates"
                description="There are no candidates for this school yet."
                icon={<UserPlus size={50} />}
                actionLabel="Add Candidate"
                onAction={() => setAddingCandidate(true)}
              />
            )}
          </TabsContent>
          
          <TabsContent value="questions" className="mt-4">
            <InterviewQuestionsList schoolId={selectedSchool?.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}