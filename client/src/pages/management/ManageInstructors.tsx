import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Instructor, insertInstructorSchema, School } from "@shared/schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StandardInstructorAvatar } from "@/components/instructors/StandardInstructorAvatar";
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
import { Loader2, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Create a form-specific validation schema that matches our form field names
const instructorFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nationality: z.string().min(1, "Nationality is required"),
  credentials: z.string().min(1, "Credentials are required"),
  startDate: z.string().min(1, "Start date is required"),
  compound: z.string().min(1, "Compound is required"),
  schoolId: z.coerce.number().min(1, "School is required"),
  phone: z.string(),
  accompaniedStatus: z.string().min(1, "Accompanied status is required"),
  role: z.string().min(1, "Role is required"),
  imageUrl: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  passportNumber: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  salary: z.string().optional(),
  department: z.string().optional(),
  employmentStatus: z.string().optional(),
});

type InstructorFormData = z.infer<typeof instructorFormSchema>;

export default function ManageInstructors() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

  const { data: schools } = useQuery<School[]>({
    queryKey: ['/api/schools']
  });

  const { data: instructors, isLoading } = useQuery<Instructor[]>({
    queryKey: selectedSchoolId ? ['/api/instructors', selectedSchoolId] : ['/api/instructors']
  });

  // Filter instructors by selected school
  const filteredInstructors = instructors?.filter(instructor => 
    selectedSchoolId ? instructor.schoolId === selectedSchoolId : true
  );

  // Create form
  const createForm = useForm<InstructorFormData>({
    resolver: zodResolver(instructorFormSchema),
    defaultValues: {
      name: "",
      nationality: "",
      credentials: "",
      startDate: "",
      compound: "",
      schoolId: selectedSchoolId || 0,
      phone: "",
      accompaniedStatus: "",
      role: "",
      imageUrl: "",
      email: "",
      passportNumber: "",
      emergencyContact: "",
      emergencyPhone: "",
      salary: "",
      department: "",
      employmentStatus: "",
    },
  });

  // Edit form
  const editForm = useForm<InstructorFormData>({
    resolver: zodResolver(instructorFormSchema),
    defaultValues: {
      name: "",
      nationality: "",
      credentials: "",
      startDate: "",
      compound: "",
      schoolId: 0,
      phone: "",
      accompaniedStatus: "",
      role: "",
      imageUrl: "",
      email: "",
      passportNumber: "",
      emergencyContact: "",
      emergencyPhone: "",
      salary: "",
      department: "",
      employmentStatus: "",
    },
  });

  // Set default school in create form when selectedSchoolId changes
  useEffect(() => {
    if (selectedSchoolId) {
      createForm.setValue("schoolId", selectedSchoolId);
    }
  }, [selectedSchoolId, createForm]);

  // Populate edit form when instructor is selected
  useEffect(() => {
    if (selectedInstructor) {
      editForm.reset({
        name: selectedInstructor.name,
        nationality: selectedInstructor.nationality,
        credentials: selectedInstructor.credentials,
        startDate: selectedInstructor.startDate,
        compound: selectedInstructor.compound,
        schoolId: selectedInstructor.schoolId,
        phone: selectedInstructor.phone || "",
        accompaniedStatus: selectedInstructor.accompaniedStatus,
        role: selectedInstructor.role,
        imageUrl: selectedInstructor.imageUrl || "",
        email: selectedInstructor.email || "",
        passportNumber: selectedInstructor.passportNumber || "",
        emergencyContact: selectedInstructor.emergencyContact || "",
        emergencyPhone: selectedInstructor.emergencyPhone || "",
        salary: selectedInstructor.salary || "",
        department: selectedInstructor.department || "",
        employmentStatus: selectedInstructor.employmentStatus || "",
      });
    }
  }, [selectedInstructor, editForm]);

  const createInstructorMutation = useMutation({
    mutationFn: async (data: InstructorFormData) => {
      return apiRequest("POST", "/api/instructors", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/instructors'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Success",
        description: "Instructor created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create instructor",
        variant: "destructive",
      });
    },
  });

  const updateInstructorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InstructorFormData }) => {
      return apiRequest("PUT", `/api/instructors/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/instructors'] });
      setIsEditDialogOpen(false);
      setSelectedInstructor(null);
      toast({
        title: "Success",
        description: "Instructor updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to update instructor",
        variant: "destructive",
      });
    },
  });

  const deleteInstructorMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/instructors/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/instructors'] });
      toast({
        title: "Success",
        description: "Instructor deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete instructor",
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (data: InstructorFormData) => {
    createInstructorMutation.mutate(data);
  };

  const onEditSubmit = (data: InstructorFormData) => {
    if (selectedInstructor) {
      updateInstructorMutation.mutate({ id: selectedInstructor.id, data });
    }
  };

  const handleViewProfile = (instructorId: number) => {
    navigate(`/instructor/profile/${instructorId}`);
  };

  const handleEditInstructor = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setIsEditDialogOpen(true);
  };

  const handleDeleteInstructor = (instructorId: number) => {
    if (window.confirm("Are you sure you want to delete this instructor?")) {
      deleteInstructorMutation.mutate(instructorId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Instructors</h1>

        <div className="flex items-center gap-4">
          <div className="w-64">
            <Select 
              onValueChange={(value) => setSelectedSchoolId(value ? parseInt(value) : null)}
              value={selectedSchoolId?.toString() || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by school" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Schools</SelectItem>
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
                Add Instructor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Instructor</DialogTitle>
                <DialogDescription>
                  Create a new instructor profile with all necessary details.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email address" {...field} />
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
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select nationality" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="American">American</SelectItem>
                                <SelectItem value="British">British</SelectItem>
                                <SelectItem value="Canadian">Canadian</SelectItem>
                                <SelectItem value="Australian">Australian</SelectItem>
                                <SelectItem value="New Zealand">New Zealand</SelectItem>
                              </SelectContent>
                            </Select>
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
                            <Input placeholder="Enter credentials" {...field} />
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
                      name="compound"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compound</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter compound" {...field} />
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
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
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
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="accompaniedStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accompanied Status</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
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
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter role" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter image URL" {...field} />
                          </FormControl>
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
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        createForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-[#0A2463] hover:bg-[#071A4A]"
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

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInstructors?.map((instructor) => (
            <Card key={instructor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex flex-col items-center space-y-2">
                  <StandardInstructorAvatar instructor={instructor} size="lg" />
                  <div className="text-center">
                    <CardTitle className="text-lg">{instructor.name}</CardTitle>
                    <CardDescription>{instructor.role}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="text-sm text-gray-600">
                  <p><strong>School:</strong> {schools?.find(s => s.id === instructor.schoolId)?.name}</p>
                  <p><strong>Nationality:</strong> {instructor.nationality}</p>
                  <p><strong>Start Date:</strong> {format(new Date(instructor.startDate), 'MMM dd, yyyy')}</p>
                  <p><strong>Status:</strong> {instructor.accompaniedStatus}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewProfile(instructor.id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditInstructor(instructor)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteInstructor(instructor.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Instructor</DialogTitle>
            <DialogDescription>
              Update instructor profile information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select nationality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="American">American</SelectItem>
                            <SelectItem value="British">British</SelectItem>
                            <SelectItem value="Canadian">Canadian</SelectItem>
                            <SelectItem value="Australian">Australian</SelectItem>
                            <SelectItem value="New Zealand">New Zealand</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Input placeholder="Enter credentials" {...field} />
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
                  name="compound"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compound</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter compound" {...field} />
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
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="accompaniedStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accompanied Status</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter role" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter image URL" {...field} />
                      </FormControl>
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
                  className="bg-[#0A2463] hover:bg-[#071A4A]"
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