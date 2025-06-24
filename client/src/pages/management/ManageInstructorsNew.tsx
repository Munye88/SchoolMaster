import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Instructor, insertInstructorSchema, School } from "@shared/schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StandardInstructorAvatar } from "@/components/instructors/StandardInstructorAvatar";

// Create a form-specific validation schema that matches our form field names
const instructorFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  position: z.string().min(2, "Position must be at least 2 characters"), // Front-end name for 'role'
  nationality: z.string().min(2, "Nationality must be at least 2 characters"),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  credentials: z.string().min(2, "Credentials must be at least 2 characters"),
  schoolId: z.number().positive("Please select a school"),
  compound: z.string().min(2, "Compound must be at least 2 characters"),
  phone: z.string().min(6, "Phone must be at least 6 characters"),
  status: z.string().min(2, "Status must be at least 2 characters"), // Front-end name for 'accompaniedStatus'
  imageUrl: z.string().optional(),
});

// Define our form values type based on the form schema
type InstructorFormValues = z.infer<typeof instructorFormSchema>;

export default function ManageInstructors() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);

  // Fetch instructors with school filter dependency
  const { data: instructors = [], isLoading: isLoadingInstructors } = useQuery<Instructor[]>({
    queryKey: ['/api/instructors', selectedSchoolId],
  });

  // Fetch schools for the dropdown
  const { data: schools = [] } = useQuery<School[]>({
    queryKey: ['/api/schools'],
  });

  // Create instructor mutation
  const createInstructorMutation = useMutation({
    mutationFn: async (instructorData: any) => {
      console.log("📝 Making API request with data:", instructorData);
      
      try {
        const response = await apiRequest('POST', '/api/instructors', instructorData);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("📝 API error response:", errorText);
          throw new Error(`Server error: ${response.status} - ${errorText || response.statusText}`);
        }
        
        const data = await response.json();
        console.log("📝 API success response:", data);
        return data;
      } catch (error) {
        console.error("📝 API request failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("📝 Mutation successful, created instructor:", data);
      // Force invalidate all instructor queries to ensure updates are reflected everywhere
      queryClient.invalidateQueries({ queryKey: ['/api/instructors'] });
      
      // Invalidate all school-specific instructor queries too
      schools?.forEach(school => {
        queryClient.invalidateQueries({ queryKey: ['/api/instructors', school.code] });
      });
      
      setIsCreateDialogOpen(false);
      toast({
        title: "Instructor created",
        description: "The instructor has been created successfully."
      });
    },
    onError: (error) => {
      console.error("📝 Mutation error:", error);
      toast({
        title: "Error creating instructor",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });

  // Update instructor mutation
  const updateInstructorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      console.log("📝 Making API update request with data:", data);
      
      try {
        const response = await apiRequest('PATCH', `/api/instructors/${id}`, data);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("📝 API error response:", errorText);
          throw new Error(`Server error: ${response.status} - ${errorText || response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log("📝 API success response:", responseData);
        return responseData;
      } catch (error) {
        console.error("📝 API update request failed:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("📝 Update mutation successful:", data);
      // Force invalidate all instructor queries to ensure updates are reflected everywhere
      queryClient.invalidateQueries({ queryKey: ['/api/instructors'] });
      
      // Invalidate all school-specific instructor queries too
      schools?.forEach(school => {
        queryClient.invalidateQueries({ queryKey: ['/api/instructors', school.code] });
        queryClient.invalidateQueries({ queryKey: ['/api/schools', school.id, 'instructors'] });
      });
      
      // Force a refetch of the current data
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
      setIsEditDialogOpen(false);
      setSelectedInstructor(null);
      toast({
        title: "Instructor updated",
        description: "The instructor has been updated successfully and the page will refresh."
      });
    },
    onError: (error) => {
      console.error("📝 Update mutation error:", error);
      toast({
        title: "Error updating instructor",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });

  // Delete instructor mutation
  const deleteInstructorMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/instructors/${id}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText || response.statusText}`);
      }
      return id;
    },
    onSuccess: () => {
      // Force invalidate all instructor queries to ensure updates are reflected everywhere
      queryClient.invalidateQueries({ queryKey: ['/api/instructors'] });
      
      // Invalidate all school-specific instructor queries too
      schools?.forEach(school => {
        queryClient.invalidateQueries({ queryKey: ['/api/instructors', school.code] });
      });
      
      toast({
        title: "Instructor deleted",
        description: "The instructor has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting instructor",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create form
  const createForm = useForm<InstructorFormValues>({
    resolver: zodResolver(instructorFormSchema),
    defaultValues: {
      name: "",
      position: "ELT Instructor",
      nationality: "American", // Default to American
      startDate: format(new Date(), 'yyyy-MM-dd'),
      credentials: "",
      schoolId: 349, // Default to KNFA
      compound: "Al Reem", // Default to Al Reem
      phone: "",
      status: "Unaccompanied",
      imageUrl: "" // Explicitly set imageUrl
    }
  });

  // Edit form
  const editForm = useForm<InstructorFormValues>({
    resolver: zodResolver(instructorFormSchema),
    defaultValues: {
      name: "",
      position: "",
      nationality: "",
      startDate: "",
      credentials: "",
      schoolId: 0,
      compound: "",
      phone: "",
      status: "",
      imageUrl: "",
    }
  });

  // Reset and set edit form values when an instructor is selected
  useEffect(() => {
    if (selectedInstructor) {
      editForm.reset({
        name: selectedInstructor.name,
        position: selectedInstructor.role || "ELT Instructor", // Use role or default value
        nationality: selectedInstructor.nationality,
        startDate: format(new Date(selectedInstructor.startDate), 'yyyy-MM-dd'),
        credentials: selectedInstructor.credentials,
        schoolId: selectedInstructor.schoolId,
        compound: selectedInstructor.compound,
        phone: selectedInstructor.phone,
        status: selectedInstructor.accompaniedStatus, // Use accompaniedStatus
        imageUrl: selectedInstructor.imageUrl || "", // Include the imageUrl if available
      });
    }
  }, [selectedInstructor, editForm]);

  // Get school name from ID
  const getSchoolName = (schoolId: number) => {
    return schools?.find(school => school.id === schoolId)?.name || "Unknown School";
  };
  
  // Get color value for school
  const getSchoolColor = (schoolName: string) => {
    if (schoolName.includes("KFNA")) {
      return "#0A2463"; // Blue for KFNA
    } else if (schoolName.includes("NFS East")) {
      return "#2A7F46"; // Green for NFS East
    } else if (schoolName.includes("NFS West")) {
      return "#4A5899"; // Professional blue-purple for NFS West (was orange)
    }
    return "#0A2463"; // Default blue
  };

  // Handle create form submission
  const onCreateSubmit = (values: InstructorFormValues) => {
    console.log("Creating instructor with form values:", values);
    
    // We'll let the server handle the field mapping as it already does that
    // in the POST /api/instructors endpoint
    console.log("📝 Sending form values to API:", values);
    
    // Don't close dialog immediately - it will be closed on success in the mutation
    createInstructorMutation.mutate(values);
  };

  // Handle edit form submission
  const onEditSubmit = (values: InstructorFormValues) => {
    if (selectedInstructor) {
      console.log("Updating instructor with form values:", values);
      
      // Let the server handle field mapping like we're doing for create
      console.log("📝 Sending form values to API for update:", values);
      
      // Don't close dialog immediately - it will be closed on success in the mutation
      updateInstructorMutation.mutate({ 
        id: selectedInstructor.id, 
        data: values 
      });
    }
  };

  // Handle instructor deletion
  const handleDeleteInstructor = (id: number) => {
    if (confirm("Are you sure you want to delete this instructor? This action cannot be undone.")) {
      deleteInstructorMutation.mutate(id);
    }
  };

  // Handle edit button click
  const handleEditInstructor = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setIsEditDialogOpen(true);
  };

  // Filter instructors by selected school
  const filteredInstructors = selectedSchoolId 
    ? instructors?.filter(instructor => instructor.schoolId === selectedSchoolId)
    : instructors;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Instructors</h1>

        <div className="flex items-center gap-4">
          <div className="w-64">
            <Select 
              onValueChange={(value) => setSelectedSchoolId(value === "all" ? null : parseInt(value))}
              value={selectedSchoolId?.toString() || "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by school" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schools?.map((school) => (
                  <SelectItem key={school.id} value={school.id.toString()}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-[#0A2463] hover:bg-[#071A4A] shadow-md transition-all hover:shadow-lg">
                <Plus className="mr-2 h-5 w-5" />
                <span className="font-semibold">Add Instructor</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
                <DialogTitle className="text-xl">Add New Instructor</DialogTitle>
                <DialogDescription>
                  Create a new instructor in the system.
                </DialogDescription>
              </DialogHeader>

              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter instructor name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., ELT Instructor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select nationality" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="American">American</SelectItem>
                                <SelectItem value="British">British</SelectItem>
                                <SelectItem value="Canadian">Canadian</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="credentials"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Credentials</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., CELTA, DELTA, M.Ed." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="schoolId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))} 
                              defaultValue={field.value > 0 ? field.value.toString() : undefined}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select school" />
                              </SelectTrigger>
                              <SelectContent>
                                {schools?.map((school) => (
                                  <SelectItem key={school.id} value={school.id.toString()}>
                                    {school.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="compound"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compound</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select compound" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Al Reem">Al Reem</SelectItem>
                                <SelectItem value="Saken">Saken</SelectItem>
                                <SelectItem value="Sharbatly Village">Sharbatly Village</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Accompanied">Accompanied</SelectItem>
                                <SelectItem value="Unaccompanied">Unaccompanied</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Profile Image</FormLabel>
                          <div className="space-y-4">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  id="create-image-upload"
                                  type="file"
                                  accept="image/*"
                                  className="max-w-sm"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      console.log("File selected:", file.name, file.type, file.size);
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        const base64Image = event.target?.result as string;
                                        console.log("Base64 image generated:", 
                                          base64Image ? `${base64Image.substring(0, 50)}... (length: ${base64Image.length})` : "None");
                                        field.onChange(base64Image);
                                      };
                                      reader.onerror = (error) => {
                                        console.error("Error reading file:", error);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                {field.value && (
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => field.onChange("")}
                                  >
                                    Clear
                                  </Button>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                Upload a photo of the instructor (JPEG, PNG, or GIF up to 5MB)
                              </p>
                            </div>
                            
                            {field.value && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
                                <div className="flex justify-center">
                                  <StandardInstructorAvatar 
                                    imageUrl={field.value}
                                    name={createForm.getValues("name") || "New Instructor"}
                                    size="lg"
                                    schoolColor={getSchoolColor(getSchoolName(createForm.getValues("schoolId")))}
                                    key={`create-preview-${Date.now()}`} // Force re-render when field.value changes
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="hover:bg-gray-100 border-gray-300"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-[#0A2463] hover:bg-[#071A4A] shadow-md hover:shadow-lg font-semibold"
                      disabled={createInstructorMutation.isPending}
                    >
                      {createInstructorMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Instructor"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoadingInstructors ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#0A2463]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors?.map((instructor) => (
            <Card key={instructor.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <StandardInstructorAvatar
                  imageUrl={instructor.imageUrl}
                  name={instructor.name}
                  size="md"
                  schoolColor={getSchoolColor(getSchoolName(instructor.schoolId))}
                />
                <div>
                  <CardTitle>{instructor.name}</CardTitle>
                  <CardDescription>{instructor.role || "ELT Instructor"}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Nationality:</span> {instructor.nationality}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">School:</span> {getSchoolName(instructor.schoolId)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Start Date:</span> {format(new Date(instructor.startDate), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Credentials:</span> {instructor.credentials}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span> {instructor.accompaniedStatus}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEditInstructor(instructor)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteInstructor(instructor.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
            <DialogTitle className="text-xl">Edit Instructor</DialogTitle>
            <DialogDescription>
              Update instructor information.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter instructor name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., ELT Instructor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select nationality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="American">American</SelectItem>
                            <SelectItem value="British">British</SelectItem>
                            <SelectItem value="Canadian">Canadian</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="credentials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credentials</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., CELTA, DELTA, M.Ed." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="schoolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value.toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select school" />
                          </SelectTrigger>
                          <SelectContent>
                            {schools?.map((school) => (
                              <SelectItem key={school.id} value={school.id.toString()}>
                                {school.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="compound"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compound</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select compound" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Al Reem">Al Reem</SelectItem>
                            <SelectItem value="Saken">Saken</SelectItem>
                            <SelectItem value="Sharbatly Village">Sharbatly Village</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Accompanied">Accompanied</SelectItem>
                            <SelectItem value="Unaccompanied">Unaccompanied</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Profile Image</FormLabel>
                      <div className="space-y-4">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              id="edit-image-upload"
                              type="file"
                              accept="image/*"
                              className="max-w-sm"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  console.log("Edit form - File selected:", file.name, file.type, file.size);
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const base64Image = event.target?.result as string;
                                    console.log("Edit form - Base64 image generated:", 
                                      base64Image ? `${base64Image.substring(0, 50)}... (length: ${base64Image.length})` : "None");
                                    field.onChange(base64Image);
                                  };
                                  reader.onerror = (error) => {
                                    console.error("Error reading file:", error);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            {field.value && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => field.onChange("")}
                              >
                                Clear
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Upload a photo of the instructor (JPEG, PNG, or GIF up to 5MB)
                          </p>
                          {field.value && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500 mb-1">Preview:</p>
                              <div className="flex justify-center">
                                <StandardInstructorAvatar 
                                  imageUrl={field.value}
                                  name={editForm.getValues("name") || "Instructor"}
                                  size="lg"
                                  schoolColor={getSchoolColor(getSchoolName(editForm.getValues("schoolId")))}
                                  key={`edit-preview-${Date.now()}`} // Force re-render when field.value changes
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="hover:bg-gray-100 border-gray-300"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedInstructor(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-[#0A2463] hover:bg-[#071A4A] shadow-md hover:shadow-lg font-semibold"
                  disabled={updateInstructorMutation.isPending}
                >
                  {updateInstructorMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Instructor"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}