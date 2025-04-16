import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { InterviewQuestion } from '@shared/schema';
import { FileQuestion, Loader2, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import InterviewQuestionForm from './InterviewQuestionForm';
import EmptyState from '@/components/common/EmptyState';

interface InterviewQuestionsListProps {
  schoolId?: number;
}

const InterviewQuestionsList: React.FC<InterviewQuestionsListProps> = ({ schoolId }) => {
  const { toast } = useToast();
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [editQuestion, setEditQuestion] = useState<InterviewQuestion | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<InterviewQuestion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all interview questions
  const { 
    data: questions, 
    isLoading: questionsLoading,
    error: questionsError
  } = useQuery<InterviewQuestion[]>({
    queryKey: ['/api/interview-questions'],
    queryFn: async () => {
      const res = await fetch('/api/interview-questions');
      if (!res.ok) throw new Error('Failed to fetch interview questions');
      return res.json();
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const handleQuestionCreated = () => {
    setAddingQuestion(false);
    queryClient.invalidateQueries({ queryKey: ['/api/interview-questions'] });
    toast({
      title: 'Question Added',
      description: 'The interview question has been successfully added.',
    });
  };

  const handleQuestionUpdated = () => {
    setEditQuestion(null);
    queryClient.invalidateQueries({ queryKey: ['/api/interview-questions'] });
    toast({
      title: 'Question Updated',
      description: 'The interview question has been successfully updated.',
    });
  };

  const handleDeleteQuestion = async () => {
    if (!confirmDelete) return;
    
    setIsDeleting(true);
    try {
      await apiRequest('DELETE', `/api/interview-questions/${confirmDelete.id}`);
      
      toast({
        title: 'Question Deleted',
        description: 'The interview question has been removed.',
      });
      
      // Refresh the questions list
      queryClient.invalidateQueries({ queryKey: ['/api/interview-questions'] });
      
      // Close the dialog
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete question. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (questionsLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (questionsError) {
    return (
      <div className="text-center p-8">
        <p className="text-destructive">Error loading interview questions. Please try again.</p>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'technical':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'curriculum':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'behavioral':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <>
      {addingQuestion ? (
        <Card>
          <CardHeader>
            <CardTitle>Add New Interview Question</CardTitle>
            <CardDescription>
              Create a new interview question for candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InterviewQuestionForm 
              candidateId={0} // This will be ignored if no candidate is specified
              onSuccess={handleQuestionCreated}
              onCancel={() => setAddingQuestion(false)}
            />
          </CardContent>
        </Card>
      ) : questions && questions.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Interview Questions</CardTitle>
              <CardDescription>
                Manage your ELT instructor interview questions library
              </CardDescription>
            </div>
            <Button onClick={() => setAddingQuestion(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <Badge variant="outline" className={`mb-2 ${getCategoryColor(question.category)}`}>
                        {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
                      </Badge>
                      <p className="font-medium">{question.question}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditQuestion(question)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setConfirmDelete(question)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState 
          title="No Interview Questions"
          description="Create interview questions to help structure your candidate interviews."
          icon={<FileQuestion size={50} />}
          actionLabel="Add Question"
          onAction={() => setAddingQuestion(true)}
        />
      )}

      {/* Edit Question Dialog */}
      {editQuestion && (
        <Dialog open={!!editQuestion} onOpenChange={() => setEditQuestion(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Interview Question</DialogTitle>
              <DialogDescription>
                Update this interview question
              </DialogDescription>
            </DialogHeader>
            <InterviewQuestionForm
              candidateId={editQuestion.candidateId}
              initialData={editQuestion}
              onSuccess={handleQuestionUpdated}
              onCancel={() => setEditQuestion(null)}
              isEditing={true}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this interview question? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteQuestion}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default InterviewQuestionsList;