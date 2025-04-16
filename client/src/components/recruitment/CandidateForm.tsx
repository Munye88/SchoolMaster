import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InsertCandidate } from "@shared/schema";
import { X, Upload } from "lucide-react";
import { useState, useEffect } from "react";

interface CandidateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  schoolId?: number;
  initialData?: Partial<InsertCandidate>;
  isEditing?: boolean;
}

interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  degree?: string;
  degreeField?: string;
  yearsExperience?: number;
  certifications?: string;
  hasCertifications?: boolean;
  nativeEnglishSpeaker?: boolean;
  militaryExperience?: boolean;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  resumeUrl: z.string().min(1, "Resume is required"),
  nativeEnglishSpeaker: z.boolean().optional(),
  degree: z.string().optional(),
  degreeField: z.string().optional(),
  yearsExperience: z.number().min(0).optional(),
  hasCertifications: z.boolean().optional(),
  certifications: z.string().optional(),
  classroomManagement: z.number().min(0).max(10).optional(),
  militaryExperience: z.boolean().optional(),
  grammarProficiency: z.number().min(0).max(10).optional(),
  vocabularyProficiency: z.number().min(0).max(10).optional(),
  notes: z.string().optional(),
  schoolId: z.number().optional(),
  status: z.enum(["new", "reviewed", "shortlisted", "interviewed", "hired", "rejected"]).default("new"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CandidateForm({ 
  onSuccess, 
  onCancel, 
  schoolId,
  initialData,
  isEditing = false 
}: CandidateFormProps) {
  const { toast } = useToast();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      resumeUrl: initialData?.resumeUrl || "",
      nativeEnglishSpeaker: initialData?.nativeEnglishSpeaker || false,
      degree: initialData?.degree || "",
      degreeField: initialData?.degreeField || "",
      yearsExperience: initialData?.yearsExperience || 0,
      hasCertifications: initialData?.hasCertifications || false,
      certifications: initialData?.certifications || "",
      classroomManagement: initialData?.classroomManagement || 0,
      militaryExperience: initialData?.militaryExperience || false,
      grammarProficiency: initialData?.grammarProficiency || 0,
      vocabularyProficiency: initialData?.vocabularyProficiency || 0,
      notes: initialData?.notes || "",
      schoolId: schoolId || initialData?.schoolId || undefined,
      status: initialData?.status || "new",
    },
  });

  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsParsingResume(true);
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/upload/resume", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload resume");
      }
      
      const data = await response.json();
      
      // If we have parsed data from the AI, autofill the form
      if (data.parsedData) {
        try {
          const parsedData = data.parsedData as ParsedResumeData;
          
          // Update form fields with parsed data
          form.setValue("name", parsedData.name || form.getValues("name"));
          form.setValue("email", parsedData.email || form.getValues("email"));
          form.setValue("phone", parsedData.phone || form.getValues("phone"));
          
          if (parsedData.degree) {
            const degreeValue = parsedData.degree.toLowerCase().includes("bachelor") ? "Bachelor" :
                        parsedData.degree.toLowerCase().includes("master") ? "Master" :
                        parsedData.degree.toLowerCase().includes("phd") ? "PhD" :
                        parsedData.degree.toLowerCase().includes("high school") ? "High School" :
                        form.getValues("degree");
            
            form.setValue("degree", degreeValue);
          }
          
          form.setValue("degreeField", parsedData.degreeField || form.getValues("degreeField"));
          
          if (parsedData.yearsExperience !== undefined) {
            form.setValue("yearsExperience", parsedData.yearsExperience);
          }
          
          form.setValue("certifications", parsedData.certifications || form.getValues("certifications"));
          
          if (parsedData.hasCertifications !== undefined) {
            form.setValue("hasCertifications", !!parsedData.certifications || form.getValues("hasCertifications"));
          }
          
          if (parsedData.nativeEnglishSpeaker !== undefined) {
            form.setValue("nativeEnglishSpeaker", parsedData.nativeEnglishSpeaker);
          }
          
          if (parsedData.militaryExperience !== undefined) {
            form.setValue("militaryExperience", parsedData.militaryExperience);
          }
          
          toast({
            title: "Resume Analyzed",
            description: "Resume has been parsed and form fields have been filled automatically.",
          });
        } catch (error) {
          console.error("Error parsing resume data:", error);
        }
      }
      
      setIsParsingResume(false);
      return data.url;
    }
  });

  const createCandidateMutation = useMutation({
    mutationFn: async (data: InsertCandidate) => {
      const response = await apiRequest("POST", "/api/candidates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      toast({
        title: "Success",
        description: "Candidate has been created successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create candidate",
        variant: "destructive",
      });
    }
  });

  const updateCandidateMutation = useMutation({
    mutationFn: async (data: Partial<InsertCandidate> & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest("PATCH", `/api/candidates/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      toast({
        title: "Success",
        description: "Candidate has been updated successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update candidate",
        variant: "destructive",
      });
    }
  });

  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setResumeFile(file);
      
      try {
        // Upload and parse immediately
        const resumeUrl = await uploadResumeMutation.mutateAsync(file);
        form.setValue("resumeUrl", resumeUrl);
      } catch (error) {
        console.error("Error uploading resume:", error);
        toast({
          title: "Error",
          description: "Failed to upload resume. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Resume should already be uploaded at this point
      // since we do it immediately when a file is selected
      const candidateData = {
        ...data,
        uploadDate: new Date(),
      };

      if (isEditing && initialData && 'id' in initialData) {
        const id = initialData.id as number;
        await updateCandidateMutation.mutateAsync({
          id,
          ...candidateData,
        });
      } else {
        await createCandidateMutation.mutateAsync(candidateData as InsertCandidate);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit candidate data. Please try again.",
        variant: "destructive",
      });
    }
  };

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
          {isEditing ? "Edit Candidate" : "Add New Candidate"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter candidate's full name" {...field} />
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
                    <FormLabel>Email Address*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Highest Degree</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select highest degree" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="High School">High School</SelectItem>
                        <SelectItem value="Bachelor">Bachelor's</SelectItem>
                        <SelectItem value="Master">Master's</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="degreeField"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field of Study</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., English, Education, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="yearsExperience"
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
                          <SelectValue placeholder="Select status" />
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nativeEnglishSpeaker"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Native English Speaker</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hasCertifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Has TEFL/TESOL Certifications</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="militaryExperience"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Military Experience</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="certifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certifications</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., TEFL, CELTA, etc." {...field} />
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
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add notes about the candidate..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="resumeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume/CV</FormLabel>
                    <div className="space-y-2">
                      {resumeFile ? (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Selected file:</span> 
                          {resumeFile.name}
                        </div>
                      ) : field.value ? (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Current resume:</span> 
                          <a 
                            href={field.value} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Resume
                          </a>
                        </div>
                      ) : null}
                      
                      <div className="mt-2">
                        {isParsingResume ? (
                          <div className="flex items-center justify-center p-2 border border-dashed rounded-md">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                              <span className="text-sm">Analyzing resume with AI...</span>
                            </div>
                          </div>
                        ) : (
                          <label 
                            htmlFor="resume-upload" 
                            className="flex items-center gap-2 justify-center p-2 border border-dashed rounded-md cursor-pointer hover:bg-gray-50"
                          >
                            <Upload className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {field.value ? "Upload new resume" : "Upload resume (PDF or DOC)"}
                            </span>
                            <input
                              id="resume-upload"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                              onChange={handleResumeChange}
                            />
                          </label>
                        )}
                      </div>
                      
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
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
                disabled={
                  createCandidateMutation.isPending || 
                  updateCandidateMutation.isPending || 
                  uploadResumeMutation.isPending
                }
              >
                {isEditing ? "Update" : "Add"} Candidate
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}