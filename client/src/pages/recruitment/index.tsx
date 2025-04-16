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
import { UserPlus } from 'lucide-react';
import CandidatesList from '@/components/recruitment/CandidatesList';
import CandidateFormNew from '@/components/recruitment/CandidateFormNew';
import InterviewQuestionsList from '@/components/recruitment/InterviewQuestionsList';
import EmptyState from '@/components/common/EmptyState';

export default function RecruitmentPage() {
  const { selectedSchool } = useSchoolContext();
  const [activeTab, setActiveTab] = useState<string>('candidates');
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    if (activeTab === 'candidates') {
      setActiveTab('details');
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage ELT instructor candidates and recruitment process
          </p>
        </div>
        <div className="flex gap-2">
          {!showCandidateForm && activeTab === 'candidates' && (
            <Button onClick={() => setShowCandidateForm(true)} className="gap-2">
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
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="candidates">All Candidates</TabsTrigger>
          <TabsTrigger 
            value="details" 
            disabled={!selectedCandidate}
          >
            Candidate Details
          </TabsTrigger>
          <TabsTrigger 
            value="questions" 
            disabled={!selectedCandidate}
          >
            Interview Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-4">
          {showCandidateForm ? (
            <CandidateFormNew 
              onSuccess={() => setShowCandidateForm(false)}
              onCancel={() => setShowCandidateForm(false)}
              schoolId={selectedSchool?.id}
            />
          ) : (
            <CandidatesList 
              onSelectCandidate={handleSelectCandidate} 
              schoolId={selectedSchool?.id}
            />
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedCandidate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Candidate: {selectedCandidate.name}
                </h2>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('candidates')}
                >
                  Back to List
                </Button>
              </div>
              {/* Candidate details will be shown here by the CandidateDetails component */}
            </div>
          ) : (
            <EmptyState
              title="No candidate selected"
              description="Please select a candidate from the list to view details"
              actionLabel="View Candidates"
              onAction={() => setActiveTab('candidates')}
            />
          )}
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          {selectedCandidate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Interview Questions for {selectedCandidate.name}
                </h2>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('candidates')}
                >
                  Back to List
                </Button>
              </div>
              <InterviewQuestionsList candidateId={selectedCandidate.id} />
            </div>
          ) : (
            <EmptyState
              title="No candidate selected"
              description="Please select a candidate from the list to manage interview questions"
              actionLabel="View Candidates"
              onAction={() => setActiveTab('candidates')}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}