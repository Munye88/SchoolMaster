import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { insertInterviewQuestionSchema } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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

// Extend the schema for form validation
const formSchema = insertInterviewQuestionSchema.pick({
  question: true,
  category: true,
}).extend({
  candidateId: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

const InterviewQuestionForm: React.FC<InterviewQuestionFormProps> = ({
  candidateId,
  onSuccess,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: initialData?.question || '',
      category: initialData?.category || 'general',
      candidateId,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing && initialData) {
        // Update existing question
        await apiRequest('PATCH', `/api/interview-questions/${initialData.id}`, data);
        toast({
          title: 'Question Updated',
          description: 'The interview question has been successfully updated.',
        });
      } else {
        // Create new question
        await apiRequest('POST', '/api/interview-questions', data);
        toast({
          title: 'Question Added',
          description: 'The interview question has been successfully added.',
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        title: 'Error',
        description: 'Failed to save interview question. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <SelectValue placeholder="Select category" />
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
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>{isEditing ? 'Update Question' : 'Add Question'}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InterviewQuestionForm;