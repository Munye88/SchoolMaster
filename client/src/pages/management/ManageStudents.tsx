import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Student, insertStudentSchema } from "@shared/schema";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Pencil, Trash2, Filter, Search, X } from "lucide-react";

// Define course types with their colors
const COURSE_TYPES = [
  { id: 'aviation', name: 'Aviation', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'refresher', name: 'Refresher', color: 'bg-green-100 text-green-800 border-green-300' },
  { id: 'cadets', name: 'Cadets', color: 'bg-purple-100 text-purple-800 border-purple-300' },
];

// Form validation schema
const studentSchema = insertStudentSchema.extend({
  schoolId: z.coerce.number().min(1, "Please select a school"),
  numberOfStudents: z.coerce.number().min(1, "Number of students must be at least 1"),
  courseType: z.string().min(1, "Please select a course type"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export default function ManageStudents() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string | null>(null);
  const [selectedCourseType, setSelectedCourseType] = useState<string | null>(null);

  // Get students data
  const { data: students = [], isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Get schools data for the dropdown
  interface School {
    id: number;
    name: string;
    code: string;
    location: string | null;
  }
  
  const { data: schools = [], isLoading: isLoadingSchools } = useQuery<School[]>({
    queryKey: ["/api/schools"],
  });
  
  // Create form
  const createForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      numberOfStudents: undefined,
      schoolId: undefined,
      courseType: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // 90 days from now
    },
  });

  // Edit form
  const editForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      numberOfStudents: undefined,
      schoolId: undefined,
      courseType: "",
      startDate: "",
      endDate: "",
    },
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (studentData: StudentFormValues) => {
      const res = await apiRequest("POST", "/api/students", studentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      // Also invalidate dashboard statistics
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      
      toast({
        title: "Success",
        description: "Student group created successfully",
      });
      setIsCreateDialogOpen(false);
      createForm.reset({
        numberOfStudents: undefined,
        schoolId: undefined,
        courseType: "",
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create student group: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: StudentFormValues }) => {
      const res = await apiRequest("PATCH", `/api/students/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      // Also invalidate dashboard statistics
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      
      toast({
        title: "Success",
        description: "Student group updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedStudent(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update student group: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      // Also invalidate dashboard statistics
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      
      toast({
        title: "Success",
        description: "Student group deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete student group: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onCreateSubmit = (values: StudentFormValues) => {
    createStudentMutation.mutate(values);
  };

  const onEditSubmit = (values: StudentFormValues) => {
    if (selectedStudent) {
      updateStudentMutation.mutate({
        id: selectedStudent.id,
        data: values,
      });
    }
  };

  const handleDeleteStudent = () => {
    if (selectedStudent) {
      deleteStudentMutation.mutate(selectedStudent.id);
    }
  };

  // Handle edit student
  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    editForm.reset({
      numberOfStudents: student.numberOfStudents,
      schoolId: student.schoolId,
      courseType: student.courseType,
      startDate: student.startDate,
      endDate: student.endDate,
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete student
  const handleDeleteClick = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  // Get school name by ID
  const getSchoolName = (id: number) => {
    const school = schools.find((s: School) => s.id === id);
    return school ? school.name : "Unknown";
  };

  // Get course type badge color
  const getCourseTypeColor = (courseType: string) => {
    const course = COURSE_TYPES.find(c => c.id === courseType);
    return course ? course.color : 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Get course type name 
  const getCourseTypeName = (courseType: string) => {
    const course = COURSE_TYPES.find(c => c.id === courseType);
    return course ? course.name : courseType;
  };
  
  // Filter students based on selected filters
  const filteredStudents = useMemo(() => {
    return students.filter((student: Student) => {
      const matchesSchool = !selectedSchoolFilter || 
        selectedSchoolFilter === "all" || 
        student.schoolId.toString() === selectedSchoolFilter;
      
      const matchesCourseType = !selectedCourseType || 
        selectedCourseType === "all" || 
        student.courseType === selectedCourseType;
      
      return matchesSchool && matchesCourseType;
    });
  }, [students, selectedSchoolFilter, selectedCourseType]);
  
  // Reset all filters
  const clearFilters = () => {
    setSelectedSchoolFilter(null);
    setSelectedCourseType(null);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Student Management</h1>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" />
          Add Student Group
        </Button>
      </div>
      
      {/* Filter Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* School Filter */}
            <div>
              <FormLabel className="mb-2 block">School</FormLabel>
              <Select
                value={selectedSchoolFilter || "all"}
                onValueChange={(value) => setSelectedSchoolFilter(value === "all" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Schools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools.map((school: School) => (
                    <SelectItem key={school.id} value={school.id.toString()}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Course Type Filter */}
            <div>
              <FormLabel className="mb-2 block">Course Type</FormLabel>
              <Select
                value={selectedCourseType || "all"}
                onValueChange={(value) => setSelectedCourseType(value === "all" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Course Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Course Types</SelectItem>
                  {COURSE_TYPES.map((courseType) => (
                    <SelectItem key={courseType.id} value={courseType.id}>
                      {courseType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Clear Filters */}
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="mb-0.5"
                onClick={clearFilters}
                disabled={!selectedSchoolFilter && !selectedCourseType}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoadingStudents || isLoadingSchools ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-muted rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No Student Groups</h3>
          <p className="text-muted-foreground mb-4">
            There are no student groups in the system yet. Add your first group to get started.
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            Add Student Group
          </Button>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-muted rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No Matching Student Groups</h3>
          <p className="text-muted-foreground mb-4">
            No student groups match your current filter criteria. Try adjusting your filters.
          </p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-5 w-5" />
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead>Course Type</TableHead>
                <TableHead>Number of Students</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student: Student) => (
                <TableRow key={student.id}>
                  <TableCell>{getSchoolName(student.schoolId)}</TableCell>
                  <TableCell>
                    <Badge className={`font-normal ${getCourseTypeColor(student.courseType)}`}>
                      {getCourseTypeName(student.courseType)}
                    </Badge>
                  </TableCell>
                  <TableCell>{student.numberOfStudents}</TableCell>
                  <TableCell>{student.startDate}</TableCell>
                  <TableCell>{student.endDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStudent(student)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(student)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Student Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Student Group</DialogTitle>
            <DialogDescription>
              Enter the details for the new student group below
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="schoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a school" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {schools.map((school: School) => (
                          <SelectItem
                            key={school.id}
                            value={school.id.toString()}
                          >
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="courseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COURSE_TYPES.map((courseType) => (
                          <SelectItem
                            key={courseType.id}
                            value={courseType.id}
                          >
                            {courseType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="numberOfStudents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Students</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="Enter number of students" 
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value !== "" ? parseInt(e.target.value) : undefined;
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createStudentMutation.isPending}
                >
                  {createStudentMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Student Group</DialogTitle>
            <DialogDescription>
              Update the student group information below
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="schoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a school" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {schools.map((school: School) => (
                          <SelectItem
                            key={school.id}
                            value={school.id.toString()}
                          >
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="courseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COURSE_TYPES.map((courseType) => (
                          <SelectItem
                            key={courseType.id}
                            value={courseType.id}
                          >
                            {courseType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="numberOfStudents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Students</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="Enter number of students" 
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value !== "" ? parseInt(e.target.value) : undefined;
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateStudentMutation.isPending}
                >
                  {updateStudentMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student group? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteStudent}
              variant="destructive"
              disabled={deleteStudentMutation.isPending}
            >
              {deleteStudentMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}