import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmptyState from "@/components/common/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InterviewQuestion } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import InterviewQuestionForm from "./InterviewQuestionForm";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InterviewQuestionsListProps {
  candidateId?: number;
}

export default function InterviewQuestionsList({ candidateId }: InterviewQuestionsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: questions = [], isLoading, error } = useQuery<InterviewQuestion[]>({
    queryKey: candidateId ? [`/api/candidates/${candidateId}/interview-questions`] : ['/api/interview-questions'],
    enabled: !!candidateId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/interview-questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/candidates/${candidateId}/interview-questions`] });
      toast({
        title: "Question deleted",
        description: "The interview question has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete interview question",
        variant: "destructive",
      });
    }
  });

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowForm(true);
  };

  const handleEditQuestion = (question: InterviewQuestion) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleDeleteQuestion = (id: number) => {
    setDeletingQuestionId(id);
  };

  const confirmDelete = () => {
    if (deletingQuestionId) {
      deleteMutation.mutate(deletingQuestionId);
      setDeletingQuestionId(null);
    }
  };

  const closeDeleteDialog = () => {
    setDeletingQuestionId(null);
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'technical':
        return 'bg-purple-100 text-purple-800';
      case 'curriculum':
        return 'bg-green-100 text-green-800';
      case 'behavioral':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!candidateId) {
    return (
      <EmptyState
        title="No candidate selected"
        description="Please select a candidate to manage their interview questions."
      />
    );
  }

  if (isLoading) {
    return <div className="p-4 text-center">Loading questions...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading questions: {error.message}</div>;
  }

  if (showForm) {
    return (
      <InterviewQuestionForm
        candidateId={candidateId}
        onSuccess={() => setShowForm(false)}
        onCancel={() => {
          setShowForm(false);
          setEditingQuestion(null);
        }}
        initialData={editingQuestion || undefined}
        isEditing={!!editingQuestion}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Interview Questions</h3>
        <Button onClick={handleAddQuestion} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </div>
      
      {questions.length === 0 ? (
        <EmptyState
          title="No questions yet"
          description="Add interview questions for this candidate to prepare for the interview process."
          actionLabel="Add Question"
          onAction={handleAddQuestion}
        />
      ) : (
        <div className="grid gap-4">
          {questions.map((question) => (
            <Card key={question.id} className="overflow-hidden">
              <CardHeader className="py-3 px-4 flex flex-row justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getCategoryColor(question.category)}>
                    {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
                  </Badge>
                  <CardTitle className="text-sm font-medium">
                    Question #{question.id}
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEditQuestion(question)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-600"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm">{question.question}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <AlertDialog open={!!deletingQuestionId} onOpenChange={(open) => !open && closeDeleteDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this interview question. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}