import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsertStudent, Student, insertStudentSchema } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Pencil, Trash2, Filter, Search, X } from "lucide-react";
import { format } from "date-fns";

// Form validation schema
const studentSchema = insertStudentSchema.extend({
  schoolId: z.coerce.number().min(1, "Please select a school"),
  enrollmentDate: z.string().min(1, "Enrollment date is required"),
  courseType: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

// Define course types for filtering
const COURSE_TYPES = [
  { id: 'aviation', name: 'Aviation' },
  { id: 'refresher', name: 'Refresher' },
  { id: 'mmsc', name: 'MMSC' },
  { id: 'cadets', name: 'Cadets' },
];

export default function ManageStudents() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string | null>(null);
  const [selectedCourseType, setSelectedCourseType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Get students data
  const { data: students = [], isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Get schools data for the dropdown
  const { data: schools = [], isLoading: isLoadingSchools } = useQuery({
    queryKey: ["/api/schools"],
  });
  
  // Get courses data
  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
  });

  // Create form
  const createForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      schoolId: undefined,
      rank: "",
      enrollmentDate: format(new Date(), "yyyy-MM-dd"),
      courseType: "aviation",
    },
  });

  // Edit form
  const editForm = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      schoolId: undefined,
      rank: "",
      enrollmentDate: "",
      courseType: "",
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
      toast({
        title: "Success",
        description: "Student created successfully",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create student: ${error.message}`,
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
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedStudent(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update student: ${error.message}`,
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
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedStudent(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete student: ${error.message}`,
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
      name: student.name,
      schoolId: student.schoolId,
      rank: student.rank || "",
      enrollmentDate: student.enrollmentDate,
      courseType: getStudentCourseType(student),
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
    const school = schools.find((s: any) => s.id === id);
    return school ? school.name : "Unknown";
  };
  
  // Add courseType to student schema (extended field not in database)
  const getStudentCourseType = (student: any) => {
    // For now, assign course types based on patterns in student name or rank
    // This is a simplified implementation - in a real system, this would be stored in the database
    if (student.rank?.toLowerCase().includes('pilot') || student.name.toLowerCase().includes('pilot')) {
      return 'aviation';
    } else if (student.rank?.toLowerCase().includes('cadet') || student.name.toLowerCase().includes('cadet')) {
      return 'cadets';
    } else if (student.name.toLowerCase().includes('mmsc')) {
      return 'mmsc';
    } else {
      return 'refresher'; // Default course type
    }
  };

  // Filter students based on selected filters
  const filteredStudents = useMemo(() => {
    return students.filter((student: any) => {
      const matchesSearch = searchTerm === "" || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.rank && student.rank.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSchool = !selectedSchoolFilter || 
        student.schoolId.toString() === selectedSchoolFilter;
      
      const matchesCourseType = !selectedCourseType || 
        getStudentCourseType(student) === selectedCourseType;
      
      return matchesSearch && matchesSchool && matchesCourseType;
    });
  }, [students, searchTerm, selectedSchoolFilter, selectedCourseType]);
  
  // Reset all filters
  const clearFilters = () => {
    setSearchTerm("");
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
          Add Student
        </Button>
      </div>
      
      {/* Search and Filter Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or rank..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* School Filter */}
              <div>
                <Label className="mb-2 block">School</Label>
                <Select
                  value={selectedSchoolFilter || ""}
                  onValueChange={(value) => setSelectedSchoolFilter(value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Schools" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Schools</SelectItem>
                    {schools.map((school: any) => (
                      <SelectItem key={school.id} value={school.id.toString()}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Course Type Filter */}
              <div>
                <Label className="mb-2 block">Course Type</Label>
                <Select
                  value={selectedCourseType || ""}
                  onValueChange={(value) => setSelectedCourseType(value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Course Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Course Types</SelectItem>
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
                  variant="ghost" 
                  className="mb-0.5"
                  onClick={clearFilters}
                  disabled={!searchTerm && !selectedSchoolFilter && !selectedCourseType}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
          
          {/* Active Filters */}
          {(searchTerm || selectedSchoolFilter || selectedCourseType) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {selectedSchoolFilter && (
                <Badge variant="outline" className="flex items-center gap-1">
                  School: {getSchoolName(parseInt(selectedSchoolFilter))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => setSelectedSchoolFilter(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {selectedCourseType && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Course: {COURSE_TYPES.find(ct => ct.id === selectedCourseType)?.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => setSelectedCourseType(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isLoadingStudents || isLoadingSchools ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-muted rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No Students</h3>
          <p className="text-muted-foreground mb-4">
            There are no students in the system yet. Add your first student to get started.
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            Add Student
          </Button>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-muted rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No Matching Students</h3>
          <p className="text-muted-foreground mb-4">
            No students match your current filter criteria. Try adjusting your filters.
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
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead>Course Type</TableHead>
                <TableHead>Enrollment Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student: any) => (
                <TableRow key={student.id}>
                  <TableCell>{student.id}</TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{getSchoolName(student.schoolId)}</TableCell>
                  <TableCell>{student.rank || "N/A"}</TableCell>
                  <TableCell>
                    {COURSE_TYPES.find(ct => ct.id === getStudentCourseType(student))?.name || "Unknown"}
                  </TableCell>
                  <TableCell>{student.enrollmentDate}</TableCell>
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
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter the details for the new student below
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Student name" {...field} />
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
                        {schools.map((school: any) => (
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
                name="rank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rank</FormLabel>
                    <FormControl>
                      <Input placeholder="Rank (optional)" {...field} />
                    </FormControl>
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
                name="enrollmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enrollment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the student information below
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Student name" {...field} />
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
                        {schools.map((school: any) => (
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
                name="rank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rank</FormLabel>
                    <FormControl>
                      <Input placeholder="Rank (optional)" {...field} />
                    </FormControl>
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
                name="enrollmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enrollment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
              Are you sure you want to delete the student "{selectedStudent?.name}"? This action cannot be undone.
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