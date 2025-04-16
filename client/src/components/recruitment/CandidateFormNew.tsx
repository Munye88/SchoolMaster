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
  generatedQuestions?: GeneratedQuestion[];
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

  // Load sample interview questions for testing
  const loadSampleQuestions = () => {
    const sampleQuestions: GeneratedQuestion[] = [
      // Technical Questions (10)
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
      { 
        category: "technical", 
        question: "What techniques do you use to help students master English prepositions?" 
      },
      { 
        category: "technical", 
        question: "How do you teach modal verbs (can, could, should, would, etc.) and their various uses?" 
      },
      { 
        category: "technical", 
        question: "What approach do you take when teaching conditionals (if clauses)?" 
      },
      { 
        category: "technical", 
        question: "How do you explain and teach the difference between countable and uncountable nouns?" 
      },
      { 
        category: "technical", 
        question: "What methods do you use to help students understand and use phrasal verbs correctly?" 
      },

      // Curriculum Questions (10)
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
      { 
        category: "curriculum", 
        question: "How would you incorporate authentic aviation materials (manuals, checklists, etc.) into your teaching?" 
      },
      { 
        category: "curriculum", 
        question: "How would you structure a curriculum to prepare students for ICAO English language proficiency requirements?" 
      },
      { 
        category: "curriculum", 
        question: "What approaches would you take to teach listening comprehension specifically for air traffic control communications?" 
      },
      { 
        category: "curriculum", 
        question: "How would you design lesson plans that incorporate both language skills and aviation safety concepts?" 
      },
      { 
        category: "curriculum", 
        question: "What strategies would you implement to help students achieve standardized test goals while maintaining engagement?" 
      },

      // Behavioral Questions (10)
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
      { 
        category: "behavioral", 
        question: "Describe a situation where you had to work with a difficult colleague. How did you handle it?" 
      },
      { 
        category: "behavioral", 
        question: "Tell me about a time when you had to adjust your lesson plan on the spot. What happened and what did you do?" 
      },
      { 
        category: "behavioral", 
        question: "Describe a challenging group of students you've taught and how you managed their dynamics." 
      },
      { 
        category: "behavioral", 
        question: "Tell me about a time when you received feedback about your teaching that required you to make changes." 
      },
      { 
        category: "behavioral", 
        question: "Describe a situation where you had to balance multiple responsibilities or deadlines. How did you manage your time?" 
      },

      // General Questions (10)
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
      },
      { 
        category: "general", 
        question: "What interests you about teaching in a military aviation context specifically?" 
      },
      { 
        category: "general", 
        question: "How do you handle the challenges of teaching technical English to non-native speakers?" 
      },
      { 
        category: "general", 
        question: "What strategies do you use to keep students engaged during long instructional periods?" 
      },
      { 
        category: "general", 
        question: "How would you describe your teaching philosophy in relation to language acquisition?" 
      },
      { 
        category: "general", 
        question: "What experience or skills do you have that would be particularly valuable in this ELT program?" 
      }
    ];
    
    setGeneratedQuestions(sampleQuestions);
    setActiveTab("questions");
    
    toast({
      title: "Sample Questions Loaded",
      description: "Interview questions have been loaded. You can now view and use them.",
    });
  };

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
          
          // Store generated interview questions if available
          if (parsedData.generatedQuestions && parsedData.generatedQuestions.length > 0) {
            setGeneratedQuestions(parsedData.generatedQuestions);
            setActiveTab("questions");
            
            toast({
              title: "Resume Analyzed",
              description: "Resume has been parsed and form fields have been filled automatically. Interview questions were also generated.",
            });
          } else {
            // If no questions were generated by the API, use our comprehensive fallback questions
            // The same set of questions we use in loadSampleQuestions()
            const fallbackQuestions: GeneratedQuestion[] = [
              // Technical Questions (selection of 5)
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
              
              // Curriculum Questions (selection of 5)
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
              
              // Behavioral Questions (selection of 5)
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
              
              // General Questions (selection of 5)
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
            
            // Use the fallback questions
            setGeneratedQuestions(fallbackQuestions);
            setActiveTab("questions");
            
            toast({
              title: "Resume Analyzed",
              description: "Resume has been parsed and form fields have been filled automatically. Standard interview questions have been provided.",
            });
          }
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
                </div>
                
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
              </TabsContent>
              
              <TabsContent value="qualifications" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="degree"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Award className="h-4 w-4 mr-2" />
                          Highest Degree
                        </FormLabel>
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
                        <FormLabel className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          Years of Experience
                        </FormLabel>
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
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <FormLabel>Has TEFL/TESOL</FormLabel>
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
              </TabsContent>
              
              <TabsContent value="questions" className="space-y-4">
                {generatedQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-md">
                    <HelpCircle className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">No Interview Questions Yet</h3>
                    <p className="text-sm text-gray-500 mb-4 text-center">
                      Upload a resume to automatically generate custom interview questions
                      or click the "Load Sample Questions" button.
                    </p>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => loadSampleQuestions()}
                    >
                      Load Sample Questions
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-md font-medium">Generated Interview Questions</h3>
                    </div>
                    
                    {/* Group questions by category */}
                    <div className="space-y-6">
                      {/* Technical Questions */}
                      {generatedQuestions.filter(q => q.category === 'technical').length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-md">
                          <h4 className="text-sm font-medium mb-3 text-blue-700 flex items-center">
                            <span className="bg-blue-700 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 text-xs">
                              {generatedQuestions.filter(q => q.category === 'technical').length}
                            </span>
                            Technical Questions
                          </h4>
                          <div className="space-y-2">
                            {generatedQuestions
                              .filter(q => q.category === 'technical')
                              .map((q, idx) => (
                                <div key={`tech-${idx}`} className="p-3 bg-white rounded border border-blue-200">
                                  <p className="text-sm">{q.question}</p>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      )}
                      
                      {/* Curriculum Questions */}
                      {generatedQuestions.filter(q => q.category === 'curriculum').length > 0 && (
                        <div className="bg-emerald-50 p-4 rounded-md">
                          <h4 className="text-sm font-medium mb-3 text-emerald-700 flex items-center">
                            <span className="bg-emerald-700 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 text-xs">
                              {generatedQuestions.filter(q => q.category === 'curriculum').length}
                            </span>
                            Curriculum Questions
                          </h4>
                          <div className="space-y-2">
                            {generatedQuestions
                              .filter(q => q.category === 'curriculum')
                              .map((q, idx) => (
                                <div key={`curr-${idx}`} className="p-3 bg-white rounded border border-emerald-200">
                                  <p className="text-sm">{q.question}</p>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      )}
                      
                      {/* Behavioral Questions */}
                      {generatedQuestions.filter(q => q.category === 'behavioral').length > 0 && (
                        <div className="bg-amber-50 p-4 rounded-md">
                          <h4 className="text-sm font-medium mb-3 text-amber-700 flex items-center">
                            <span className="bg-amber-700 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 text-xs">
                              {generatedQuestions.filter(q => q.category === 'behavioral').length}
                            </span>
                            Behavioral Questions
                          </h4>
                          <div className="space-y-2">
                            {generatedQuestions
                              .filter(q => q.category === 'behavioral')
                              .map((q, idx) => (
                                <div key={`behave-${idx}`} className="p-3 bg-white rounded border border-amber-200">
                                  <p className="text-sm">{q.question}</p>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      )}
                      
                      {/* General Questions */}
                      {generatedQuestions.filter(q => q.category === 'general').length > 0 && (
                        <div className="bg-indigo-50 p-4 rounded-md">
                          <h4 className="text-sm font-medium mb-3 text-indigo-700 flex items-center">
                            <span className="bg-indigo-700 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2 text-xs">
                              {generatedQuestions.filter(q => q.category === 'general').length}
                            </span>
                            General Questions
                          </h4>
                          <div className="space-y-2">
                            {generatedQuestions
                              .filter(q => q.category === 'general')
                              .map((q, idx) => (
                                <div key={`gen-${idx}`} className="p-3 bg-white rounded border border-indigo-200">
                                  <p className="text-sm">{q.question}</p>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      These questions will be saved with the candidate record for use during interviews.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
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
        </Tabs>
      </CardContent>
    </Card>
  );
}