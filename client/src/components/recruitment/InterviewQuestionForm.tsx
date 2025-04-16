import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InsertInterviewQuestion } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  question: z.string().min(5, "Question must be at least 5 characters"),
  category: z.enum(['general', 'technical', 'curriculum', 'behavioral'])
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
      const response = await apiRequest(
        "POST", 
        "/api/interview-questions", 
        data
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/candidates/${candidateId}/interview-questions`] });
      toast({
        title: "Question created",
        description: "The interview question has been saved successfully.",
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
    mutationFn: async (data: Partial<InsertInterviewQuestion> & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest(
        "PATCH", 
        `/api/interview-questions/${id}`, 
        updateData
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/candidates/${candidateId}/interview-questions`] });
      toast({
        title: "Question updated",
        description: "The interview question has been updated successfully.",
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
    if (isEditing && initialData) {
      updateMutation.mutate({
        id: initialData.id,
        ...data,
        candidateId
      });
    } else {
      createMutation.mutate({
        ...data,
        candidateId,
        createdDate: new Date(),
      });
    }
  };

  return (
    <div className="border border-gray-200 rounded-md p-4 bg-white shadow-sm relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-2 top-2" 
        onClick={onCancel}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <h3 className="text-lg font-medium mb-4">
        {isEditing ? "Edit Interview Question" : "Add Interview Question"}
      </h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
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
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="curriculum">Curriculum</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
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
                <FormLabel>Question</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter interview question..."
                    rows={3}
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
              {isEditing ? "Update" : "Save"} Question
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}