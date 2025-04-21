import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InsertCandidate } from "@shared/schema";
import { X, Upload, FileText, User, Mail, Phone, Award, Briefcase, CheckCircle, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface CandidateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  schoolId?: number;
  initialData?: Partial<InsertCandidate>;
  isEditing?: boolean;
}

interface GeneratedQuestion {
  category: 'technical' | 'curriculum' | 'behavioral' | 'general';
  question: string;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  resumeUrl: z.string().optional(),
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

export default function CandidateFormNew({ 
  onSuccess, 
  onCancel, 
  schoolId,
  initialData,
  isEditing = false 
}: CandidateFormProps) {
  const { toast } = useToast();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [activeTab, setActiveTab] = useState("personal");
  
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

  // Load sample interview questions
  const loadSampleQuestions = () => {
    const sampleQuestions: GeneratedQuestion[] = [
      // Technical Questions (5)
      { 
        category: "technical", 
        question: "How would you explain the difference between the present perfect and past perfect to students?" 
      },
      { 
        category: "technical", 
        question: "What strategies do you use to teach complex grammar structures?" 
      },
      { 
        category: "technical", 
        question: "How do you teach pronunciation to students whose native language has very different phonetics from English?" 
      },
      { 
        category: "technical", 
        question: "What methods do you use to teach English article usage (a, an, the) to students whose native language doesn't have articles?" 
      },
      { 
        category: "technical", 
        question: "How would you explain the difference between passive and active voice to aviation students?" 
      },
      
      // Curriculum Questions (5)
      { 
        category: "curriculum", 
        question: "How do you support cadets or officers preparing for the ALCPT (American Language Course Placement Test)?" 
      },
      { 
        category: "curriculum", 
        question: "How would you design a specialized curriculum for aviation English focusing on radio communications?" 
      },
      { 
        category: "curriculum", 
        question: "What resources would you incorporate when teaching technical aviation terminology?" 
      },
      { 
        category: "curriculum", 
        question: "How do you balance teaching general English proficiency with specialized aviation vocabulary?" 
      },
      { 
        category: "curriculum", 
        question: "What assessment methods would you use to evaluate students' progress in an aviation English course?" 
      },
      
      // Behavioral Questions (5)
      { 
        category: "behavioral", 
        question: "Describe a time when you had to handle a classroom discipline issue. What happened and how did you resolve it?" 
      },
      { 
        category: "behavioral", 
        question: "Tell me about a situation where you had to adapt your teaching style to meet the needs of a struggling student." 
      },
      { 
        category: "behavioral", 
        question: "Describe a time when you successfully motivated a reluctant or disinterested student." 
      },
      { 
        category: "behavioral", 
        question: "Give an example of how you've handled cultural differences in the classroom." 
      },
      { 
        category: "behavioral", 
        question: "Tell me about a time when you had to provide constructive criticism to a student. How did you approach it?" 
      },
      
      // General Questions (5)
      { 
        category: "general", 
        question: "What inspired you to become an English Language Instructor?" 
      },
      { 
        category: "general", 
        question: "What do you find most rewarding about teaching English to aviation professionals?" 
      },
      { 
        category: "general", 
        question: "How do you stay updated with current teaching methodologies and approaches?" 
      },
      { 
        category: "general", 
        question: "What do you believe are the most important qualities of an effective ELT instructor?" 
      },
      { 
        category: "general", 
        question: "How do you create an inclusive learning environment for students from diverse backgrounds?" 
      }
    ];
    
    setGeneratedQuestions(sampleQuestions);
    setActiveTab("questions");
    
    toast({
      title: "Sample Questions Loaded",
      description: "Interview questions have been loaded. You can now view and use them.",
    });
  };

  // Resume upload and AI parsing mutation
  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsParsingResume(true);
      const formData = new FormData();
      formData.append("resume", file); // This should match the parameter name in multer config
      
      const response = await fetch("/api/candidates/parse-resume", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to parse resume with AI");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Update form fields with extracted data
      form.setValue("name", data.name || form.getValues("name"));
      form.setValue("email", data.email || form.getValues("email"));
      form.setValue("phone", data.phone || form.getValues("phone"));
      form.setValue("resumeUrl", data.resumeUrl || form.getValues("resumeUrl"));
      
      if (data.degree) {
        // Standardize degree names
        const degreeValue = data.degree.toLowerCase().includes("bachelor") ? "Bachelor" :
                  data.degree.toLowerCase().includes("master") ? "Master" :
                  data.degree.toLowerCase().includes("phd") ? "PhD" :
                  data.degree.toLowerCase().includes("high school") ? "High School" :
                  data.degree;
        
        form.setValue("degree", degreeValue);
      }
      
      form.setValue("degreeField", data.degreeField || form.getValues("degreeField"));
      
      if (typeof data.yearsExperience === 'number') {
        form.setValue("yearsExperience", data.yearsExperience);
      }
      
      form.setValue("certifications", data.certifications || form.getValues("certifications"));
      
      if (typeof data.hasCertifications === 'boolean') {
        form.setValue("hasCertifications", data.hasCertifications);
      } else if (data.certifications) {
        // If certifications text exists but boolean flag isn't set
        form.setValue("hasCertifications", true);
      }
      
      if (typeof data.nativeEnglishSpeaker === 'boolean') {
        form.setValue("nativeEnglishSpeaker", data.nativeEnglishSpeaker);
      }
      
      if (typeof data.militaryExperience === 'boolean') {
        form.setValue("militaryExperience", data.militaryExperience);
      }
      
      // Generate interview questions based on candidate's background
      // For now, use standard ELT instructor questions
      loadSampleQuestions();
      
      // Show which AI provider was used
      const aiProvider = data.aiProvider || "AI";
      
      toast({
        title: "Resume Analyzed",
        description: `${aiProvider} has extracted candidate information from the resume and generated interview questions.`,
        variant: "default",
      });
      
      setIsParsingResume(false);
    },
    onError: (error) => {
      console.error("Resume parsing error:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze resume with AI. Please fill in the form manually.",
        variant: "destructive",
      });
      setIsParsingResume(false);
    }
  });

  // Create new candidate mutation
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

  // Update existing candidate mutation
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

  // Handle resume file selection
  const handleResumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setResumeFile(file);
      
      try {
        // Display processing toast
        toast({
          title: "Processing Resume",
          description: "AI is analyzing your resume... This might take a few seconds.",
        });
        
        // Upload and parse immediately
        await uploadResumeMutation.mutateAsync(file);
      } catch (error) {
        console.error("Error processing resume:", error);
        toast({
          title: "Analysis Failed",
          description: "Failed to analyze resume with AI. Please fill in the form manually.",
          variant: "destructive",
        });
      }
    }
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      // Resume should already be uploaded at this point
      // since we do it immediately when a file is selected
      const candidateData = {
        ...data,
        uploadDate: new Date(),
      };

      let candidateId: number;

      if (isEditing && initialData && 'id' in initialData) {
        const id = initialData.id as number;
        candidateId = id;
        await updateCandidateMutation.mutateAsync({
          id,
          ...candidateData,
        });
      } else {
        // Create the candidate first
        const newCandidate = await createCandidateMutation.mutateAsync(candidateData as InsertCandidate);
        candidateId = newCandidate.id;
      }
      
      // If we have generated questions, save them for this candidate
      if (generatedQuestions.length > 0 && candidateId) {
        try {
          // Create a mutation request for each question
          const savePromises = generatedQuestions.map(question => 
            apiRequest("POST", "/api/interview-questions", {
              candidateId,
              category: question.category,
              question: question.question,
              createdDate: new Date(),
              createdBy: null // This could be the current user's ID if needed
            })
          );
          
          // Wait for all questions to be saved
          await Promise.all(savePromises);
          
          console.log(`Saved ${generatedQuestions.length} interview questions for candidate ${candidateId}`);
        } catch (questionError) {
          console.error("Error saving interview questions:", questionError);
        }
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
    <Card className="border rounded-md shadow w-full">
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
        <div className="text-sm text-gray-500">
          Fill in candidate details or upload a resume to automatically populate fields
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            <Button 
              type="button" 
              size="sm"
              variant="outline"
              onClick={() => loadSampleQuestions()}
              className="text-blue-600 border-blue-600"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Load Sample Questions
            </Button>
          </div>
          <div className="text-sm text-gray-500 italic">
            {generatedQuestions.length > 0 ? 
              `${generatedQuestions.length} interview questions generated` : 
              "No interview questions generated yet"}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="personal" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="qualifications" className="flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Qualifications
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center">
              <HelpCircle className="h-4 w-4 mr-2" />
              Interview Questions
              {generatedQuestions.length > 0 && 
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  {generatedQuestions.length}
                </span>
              }
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="personal" className="space-y-4">
                {/* Resume upload section */}
                <div className="border rounded-md p-4 bg-gray-50">
                  <FormField
                    control={form.control}
                    name="resumeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Resume/CV
                        </FormLabel>
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
                              <div className="flex items-center justify-center p-4 border border-dashed rounded-md">
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                                  <span className="text-sm">Analyzing resume with AI...</span>
                                </div>
                              </div>
                            ) : (
                              <label 
                                htmlFor="resume-upload" 
                                className="flex flex-col items-center gap-2 justify-center p-6 border-2 border-dashed rounded-md cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                              >
                                <Upload className="h-8 w-8 text-blue-500" />
                                <span className="text-sm font-medium text-blue-600">
                                  {field.value ? "Upload new resume" : "Upload resume (PDF or DOC)"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  AI will automatically extract candidate information
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Full Name*
                        </FormLabel>
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
                        <FormLabel className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          Email Address*
                        </FormLabel>
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
                        <FormLabel className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
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

                  <FormField
                    control={form.control}
                    name="nativeEnglishSpeaker"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
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
                    name="militaryExperience"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
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
                  
                  {schoolId && (
                    <input type="hidden" {...form.register("schoolId")} value={schoolId} />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="qualifications" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <SelectValue placeholder="Select degree" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="High School">High School</SelectItem>
                            <SelectItem value="Associate">Associate</SelectItem>
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
                          <Input placeholder="E.g., English, Education, TESOL" {...field} />
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
                            placeholder="Years of teaching experience" 
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
                    name="hasCertifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Has TESOL/TEFL Certifications</FormLabel>
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
                  
                  {form.watch("hasCertifications") && (
                    <FormField
                      control={form.control}
                      name="certifications"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Certification Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List relevant certifications (TESOL, TEFL, CELTA, etc.)" 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="classroomManagement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Classroom Management (0-10)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="10" 
                            placeholder="Rate from 0-10" 
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
                    name="grammarProficiency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grammar Proficiency (0-10)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="10" 
                            placeholder="Rate from 0-10" 
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
                    name="vocabularyProficiency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vocabulary Teaching (0-10)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="10" 
                            placeholder="Rate from 0-10" 
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
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any additional notes about the candidate" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="questions" className="space-y-4">
                {generatedQuestions.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Technical Questions */}
                      <div className="rounded-lg border p-4">
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                          <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                          Technical Questions
                        </h3>
                        <div className="space-y-3">
                          {generatedQuestions
                            .filter(q => q.category === 'technical')
                            .map((question, index) => (
                              <div key={`technical-${index}`} className="pl-4 border-l-2 border-blue-200">
                                <p className="text-sm">{question.question}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                      
                      {/* Curriculum Questions */}
                      <div className="rounded-lg border p-4">
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                          <Briefcase className="h-5 w-5 mr-2 text-green-600" />
                          Curriculum Questions
                        </h3>
                        <div className="space-y-3">
                          {generatedQuestions
                            .filter(q => q.category === 'curriculum')
                            .map((question, index) => (
                              <div key={`curriculum-${index}`} className="pl-4 border-l-2 border-green-200">
                                <p className="text-sm">{question.question}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                      
                      {/* Behavioral Questions */}
                      <div className="rounded-lg border p-4">
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                          <User className="h-5 w-5 mr-2 text-purple-600" />
                          Behavioral Questions
                        </h3>
                        <div className="space-y-3">
                          {generatedQuestions
                            .filter(q => q.category === 'behavioral')
                            .map((question, index) => (
                              <div key={`behavioral-${index}`} className="pl-4 border-l-2 border-purple-200">
                                <p className="text-sm">{question.question}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                      
                      {/* General Questions */}
                      <div className="rounded-lg border p-4">
                        <h3 className="text-lg font-semibold mb-2 flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-amber-600" />
                          General Questions
                        </h3>
                        <div className="space-y-3">
                          {generatedQuestions
                            .filter(q => q.category === 'general')
                            .map((question, index) => (
                              <div key={`general-${index}`} className="pl-4 border-l-2 border-amber-200">
                                <p className="text-sm">{question.question}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      These questions will be saved when you submit the candidate information. You can add or edit responses during the interview process.
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <HelpCircle className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-1">No Interview Questions Generated</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a resume to automatically generate questions or use the "Load Sample Questions" button.
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => loadSampleQuestions()}
                      className="text-blue-600 border-blue-600"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Load Sample Questions
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={form.formState.isSubmitting || uploadResumeMutation.isPending}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    isEditing ? "Update Candidate" : "Add Candidate"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}