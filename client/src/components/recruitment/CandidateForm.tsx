import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { insertCandidateSchema, InsertCandidate } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';

interface CandidateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  schoolId?: number;
  initialData?: InsertCandidate;
  isEditing?: boolean;
}

// Extend the schema for form validation
const formSchema = insertCandidateSchema.extend({
  resume: z.instanceof(FileList).optional(),
}).omit({ resumeUrl: true, uploadDate: true, aiAnalysis: true, reviewDate: true });

type FormValues = z.infer<typeof formSchema>;

const CandidateForm: React.FC<CandidateFormProps> = ({
  onSuccess,
  onCancel,
  schoolId,
  initialData,
  isEditing = false,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      nationality: initialData?.nationality || '',
      yearsOfExperience: initialData?.yearsOfExperience || 0,
      education: initialData?.education || '',
      englishLevel: initialData?.englishLevel || '',
      teachingExperience: initialData?.teachingExperience || '',
      status: initialData?.status || 'new',
      schoolId: schoolId || initialData?.schoolId || null,
      notes: initialData?.notes || '',
      resume: undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Add all form fields to formData
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'resume') {
          if (value !== null && value !== undefined) {
            formData.append(key, value.toString());
          }
        }
      });
      
      // Add the resume file if it exists
      if (data.resume && data.resume.length > 0) {
        formData.append('resume', data.resume[0]);
      }
      
      if (isEditing && initialData?.id) {
        // Update existing candidate
        await apiRequest('PATCH', `/api/candidates/${initialData.id}`, formData, true);
        toast({
          title: 'Candidate Updated',
          description: 'The candidate has been successfully updated.',
        });
      } else {
        // Create new candidate
        await apiRequest('POST', '/api/candidates', formData, true);
        toast({
          title: 'Candidate Added',
          description: 'The candidate has been successfully added.',
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error submitting candidate:', error);
      toast({
        title: 'Error',
        description: 'Failed to save candidate. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFileName(files[0].name);
      form.setValue('resume', files as unknown as FileList);
    } else {
      setSelectedFileName(null);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="example@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 8901" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. American" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Professional Information</h3>
            
            <FormField
              control={form.control}
              name="yearsOfExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Bachelor's in English" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="englishLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>English Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select English Level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Native">Native</SelectItem>
                      <SelectItem value="Fluent">Fluent</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="interviewed">Interviewed</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        
        {/* Additional Information that spans full width */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="teachingExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teaching Experience</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe previous teaching experience"
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any additional information about the candidate"
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Resume Upload */}
          <div className="space-y-2">
            <FormLabel>Resume/CV</FormLabel>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center bg-muted/20">
              <label htmlFor="resume-upload" className="cursor-pointer text-center w-full">
                <div className="flex flex-col items-center space-y-2 py-4">
                  <UploadCloud className="h-10 w-10 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    {selectedFileName ? (
                      <span className="font-medium">{selectedFileName}</span>
                    ) : (
                      <span>
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX up to 10MB
                  </div>
                </div>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {form.formState.errors.resume && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.resume.message?.toString()}
              </p>
            )}
          </div>
        </div>
        
        {/* Form Actions */}
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
                {isEditing ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>{isEditing ? 'Update Candidate' : 'Add Candidate'}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CandidateForm;