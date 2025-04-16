import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InterviewQuestion } from "@shared/schema";
import { Plus, Edit, Trash2, FileQuestion } from "lucide-react";
import InterviewQuestionForm from "./InterviewQuestionForm";
import EmptyState from "@/components/common/EmptyState";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InterviewQuestionsListProps {
  candidateId?: number;
}

export default function InterviewQuestionsList({ candidateId }: InterviewQuestionsListProps) {
  const { toast } = useToast();
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null);
  const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Fetch interview questions for the candidate
  const { data: questions = [], isLoading } = useQuery<InterviewQuestion[]>({
    queryKey: ['/api/interview-questions', candidateId],
    queryFn: async () => {
      if (!candidateId) return [];
      const response = await fetch(`/api/interview-questions?candidateId=${candidateId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch interview questions');
      }
      return response.json();
    },
    enabled: !!candidateId
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      const response = await apiRequest("DELETE", `/api/interview-questions/${questionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interview-questions', candidateId] });
      toast({
        title: "Success",
        description: "Interview question has been deleted",
      });
      setDeleteQuestionId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete interview question",
        variant: "destructive",
      });
    }
  });

  const handleEditQuestion = (question: InterviewQuestion) => {
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = (questionId: number) => {
    setDeleteQuestionId(questionId);
  };

  const confirmDeleteQuestion = () => {
    if (deleteQuestionId) {
      deleteQuestionMutation.mutate(deleteQuestionId);
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || question.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "general":
        return "bg-blue-100 text-blue-800";
      case "technical":
        return "bg-purple-100 text-purple-800";
      case "curriculum":
        return "bg-green-100 text-green-800";
      case "behavioral":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const categoryLabels = {
    general: "General",
    technical: "Technical",
    curriculum: "Curriculum",
    behavioral: "Behavioral"
  };

  if (!candidateId) {
    return (
      <EmptyState
        title="No candidate selected"
        description="Please select a candidate first to manage interview questions"
        icon={FileQuestion}
      />
    );
  }

  return (
    <div className="space-y-4">
      {showQuestionForm ? (
        <InterviewQuestionForm
          candidateId={candidateId}
          onSuccess={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
          }}
          onCancel={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
          }}
          initialData={editingQuestion || undefined}
          isEditing={!!editingQuestion}
        />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Interview Questions</CardTitle>
              <Button
                onClick={() => setShowQuestionForm(true)}
                size="sm"
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="curriculum">Curriculum</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center p-6">
                <div className="animate-pulse text-gray-400">Loading questions...</div>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <EmptyState
                title="No interview questions found"
                description={
                  searchTerm || categoryFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Add questions for the interview process"
                }
                actionLabel="Add Question"
                onAction={() => setShowQuestionForm(true)}
                icon={FileQuestion}
              />
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((question) => (
                  <div 
                    key={question.id} 
                    className="p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getCategoryColor(question.category)}>
                            {categoryLabels[question.category as keyof typeof categoryLabels]}
                          </Badge>
                          {question.createdDate && (
                            <span className="text-xs text-gray-500">
                              Added {new Date(question.createdDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-800">{question.question}</p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteQuestionId} onOpenChange={(open) => !open && setDeleteQuestionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the interview question.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteQuestion}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}