import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InsertInterviewQuestion } from "@shared/schema";
import { X } from "lucide-react";

interface InterviewQuestionFormProps {
  candidateId: number;
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: {
    id: number;
    question: string;
    category: 'general' | 'technical' | 'curriculum' | 'behavioral';
  };
  isEditing?: boolean;
}

const formSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters long"),
  category: z.enum(['general', 'technical', 'curriculum', 'behavioral'] as const),
});

type FormValues = z.infer<typeof formSchema>;

export default function InterviewQuestionForm({ 
  candidateId, 
  onSuccess, 
  onCancel, 
  initialData,
  isEditing = false 
}: InterviewQuestionFormProps) {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: initialData?.question || "",
      category: initialData?.category || "general",
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertInterviewQuestion) => {
      const response = await apiRequest("POST", "/api/interview-questions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interview-questions', candidateId] });
      toast({
        title: "Success",
        description: "Interview question has been created successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create interview question",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number, question: string, category: string }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest("PATCH", `/api/interview-questions/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interview-questions', candidateId] });
      toast({
        title: "Success",
        description: "Interview question has been updated successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update interview question",
        variant: "destructive",
      });
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const questionData = {
        ...data,
        candidateId,
        createdDate: new Date(),
      };
      
      if (isEditing && initialData?.id) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          ...data,
        });
      } else {
        await createMutation.mutateAsync(questionData as InsertInterviewQuestion);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const categoryOptions = [
    { value: "general", label: "General" },
    { value: "technical", label: "Technical Knowledge" },
    { value: "curriculum", label: "Curriculum Design" },
    { value: "behavioral", label: "Behavioral" },
  ];

  return (
    <Card className="border rounded-md shadow">
      <CardHeader className="pb-3 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2" 
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardTitle className="text-lg font-medium">
          {isEditing ? "Edit Interview Question" : "Add Interview Question"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the interview question..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEditing ? "Update" : "Add"} Question
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}