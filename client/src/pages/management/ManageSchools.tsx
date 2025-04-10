import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { School, insertSchoolSchema } from "@shared/schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
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
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Extended schema with validation
const schoolSchema = insertSchoolSchema.extend({
  name: z.string().min(2, "School name must be at least 2 characters"),
  code: z.string().min(2, "School code must be at least 2 characters").max(10, "School code must be at most 10 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

export default function ManageSchools() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Fetch schools
  const { data: schools, isLoading } = useQuery<School[]>({
    queryKey: ['/api/schools'],
  });

  // Create school mutation
  const createSchoolMutation = useMutation({
    mutationFn: async (schoolData: SchoolFormValues) => {
      const response = await apiRequest('POST', '/api/schools', schoolData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schools'] });
      setIsCreateDialogOpen(false);
      toast({ 
        title: "School created", 
        description: "The school has been created successfully."
      });
    },
    onError: (error) => {
      toast({ 
        title: "Error creating school", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Update school mutation
  const updateSchoolMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: SchoolFormValues }) => {
      const response = await apiRequest('PATCH', `/api/schools/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schools'] });
      setIsEditDialogOpen(false);
      setSelectedSchool(null);
      toast({ 
        title: "School updated", 
        description: "The school has been updated successfully."
      });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating school", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Delete school mutation
  const deleteSchoolMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/schools/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schools'] });
      toast({ 
        title: "School deleted", 
        description: "The school has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({ 
        title: "Error deleting school", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Create form
  const createForm = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: "",
      code: "",
      location: "",
    }
  });

  // Edit form
  const editForm = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: "",
      code: "",
      location: "",
    }
  });

  // Reset and set edit form values when a school is selected
  useEffect(() => {
    if (selectedSchool) {
      editForm.reset({
        name: selectedSchool.name,
        code: selectedSchool.code,
        location: selectedSchool.location,
      });
    }
  }, [selectedSchool, editForm]);

  // Handle create form submission
  const onCreateSubmit = (values: SchoolFormValues) => {
    createSchoolMutation.mutate(values);
  };

  // Handle edit form submission
  const onEditSubmit = (values: SchoolFormValues) => {
    if (selectedSchool) {
      updateSchoolMutation.mutate({ id: selectedSchool.id, data: values });
    }
  };

  // Handle school deletion
  const handleDeleteSchool = (id: number) => {
    if (confirm("Are you sure you want to delete this school? This action cannot be undone.")) {
      deleteSchoolMutation.mutate(id);
    }
  };

  // Handle edit button click
  const handleEditSchool = (school: School) => {
    setSelectedSchool(school);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Schools</h1>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0A2463] hover:bg-[#071A4A]">
              <Plus className="mr-2 h-4 w-4" />
              Add School
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New School</DialogTitle>
              <DialogDescription>
                Create a new school in the system.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter school name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. KNFA, NFS-E" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter school location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-[#0A2463] hover:bg-[#071A4A]"
                    disabled={createSchoolMutation.isPending}
                  >
                    {createSchoolMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create School"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#0A2463]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools?.map((school) => (
            <Card key={school.id}>
              <CardHeader>
                <CardTitle>{school.name}</CardTitle>
                <CardDescription>Code: {school.code}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Location:</span> {school.location}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleEditSchool(school)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteSchool(school.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit School</DialogTitle>
            <DialogDescription>
              Update school information.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter school name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. KNFA, NFS-E" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter school location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedSchool(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#0A2463] hover:bg-[#071A4A]"
                  disabled={updateSchoolMutation.isPending}
                >
                  {updateSchoolMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update School"
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