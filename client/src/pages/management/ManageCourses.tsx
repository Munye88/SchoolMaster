import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsertCourse, Course, insertCourseSchema } from "@shared/schema";
import { getCourseStatus } from "@/utils/courseStatusHelpers";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Slider
} from "@/components/ui/slider";
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Book, 
  Calendar,
  Award
} from "lucide-react";
import { format } from "date-fns";

// Form validation schema
const courseSchema = insertCourseSchema.extend({
  schoolId: z.coerce.number().min(1, "Please select a school"),
  studentCount: z.coerce.number().min(0, "Student count must be positive"),
  progress: z.coerce.number().min(0).max(100, "Progress must be between 0 and 100"),
  startDate: z.string().min(1, "Start date is required"),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function ManageCourses() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Get courses data
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/courses"],
  });

  // Get schools data for the dropdown
  const { data: schools = [], isLoading: isLoadingSchools } = useQuery({
    queryKey: ["/api/schools"],
  });

  // Get instructors data for the dropdown
  const { data: instructors = [], isLoading: isLoadingInstructors } = useQuery({
    queryKey: ["/api/instructors"],
  });

  // Create form
  const createForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      status: "Active",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
      studentCount: 0,
      progress: 0,
      benchmark: "",
    },
  });

  // Edit form
  const editForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      status: "Active",
      startDate: "",
      endDate: "",
      studentCount: 0,
      progress: 0,
      benchmark: "",
    },
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (courseData: CourseFormValues) => {
      const res = await apiRequest("POST", "/api/courses", courseData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Success",
        description: "Course created successfully",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create course: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: CourseFormValues }) => {
      const res = await apiRequest("PATCH", `/api/courses/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update course: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedCourse(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete course: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onCreateSubmit = (values: CourseFormValues) => {
    // Before submitting, automatically calculate the status based on dates
    const startDate = new Date(values.startDate);
    const endDate = values.endDate ? new Date(values.endDate) : null;
    const today = new Date();
    
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(0, 0, 0, 0);
    
    // Automatically determine the status
    let calculatedStatus = "Planned";
    
    if (endDate && today > endDate) {
      calculatedStatus = "Completed";
    } else if (today >= startDate) {
      calculatedStatus = "Active"; // Using "Active" for database as UI shows "In Progress"
    } else {
      calculatedStatus = "Planned"; // UI will show "Starting Soon"
    }
    
    // Use the calculated status instead of the selected one
    const updatedValues = {
      ...values,
      status: calculatedStatus
    };
    
    createCourseMutation.mutate(updatedValues);
  };

  const onEditSubmit = (values: CourseFormValues) => {
    if (selectedCourse) {
      // Before submitting, automatically calculate the status based on dates
      const startDate = new Date(values.startDate);
      const endDate = values.endDate ? new Date(values.endDate) : null;
      const today = new Date();
      
      startDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(0, 0, 0, 0);
      
      // Automatically determine the status based on dates
      let calculatedStatus = "Planned";
      
      if (endDate && today > endDate) {
        calculatedStatus = "Completed";
      } else if (today >= startDate) {
        calculatedStatus = "Active"; // Using "Active" for database as UI shows "In Progress"
      } else {
        calculatedStatus = "Planned"; // UI will show "Starting Soon"
      }
      
      // Only change the status if it's not manually set to "Cancelled"
      const status = values.status === "Cancelled" 
        ? "Cancelled" 
        : calculatedStatus;
      
      // Use the calculated status
      const updatedValues = {
        ...values,
        status
      };
      
      updateCourseMutation.mutate({
        id: selectedCourse.id,
        data: updatedValues,
      });
    }
  };

  const handleDeleteCourse = () => {
    if (selectedCourse) {
      deleteCourseMutation.mutate(selectedCourse.id);
    }
  };

  // Handle edit course
  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    editForm.reset({
      name: course.name,
      schoolId: course.schoolId,
      status: course.status,
      startDate: course.startDate,
      endDate: course.endDate || "",
      studentCount: course.studentCount,
      progress: course.progress,
      benchmark: course.benchmark || "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete course
  const handleDeleteClick = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  // Get school name by ID
  const getSchoolName = (id: number) => {
    const school = schools.find((s) => s.id === id);
    return school ? school.name : "Unknown";
  };

  // Get instructor name by ID
  const getInstructorName = (id: number) => {
    const instructor = instructors.find((i) => i.id === id);
    return instructor ? instructor.name : "Unknown";
  };

  const isLoading = isLoadingCourses || isLoadingSchools || isLoadingInstructors;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Course Management</h1>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" />
          Add Course
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-muted rounded-lg p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No Courses</h3>
          <p className="text-muted-foreground mb-4">
            There are no courses in the system yet. Add your first course to get started.
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            Add Course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>{course.name}</CardTitle>
                  <Badge>{getCourseStatus(course)}</Badge>
                </div>
                <CardDescription>{getSchoolName(course.schoolId)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Start Date: {course.startDate}</span>
                  </div>
                  {course.endDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>End Date: {course.endDate}</span>
                    </div>
                  )}
                  {course.benchmark && (
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Benchmark: {course.benchmark}</span>
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t flex justify-end gap-2 bg-muted/50 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditCourse(course)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(course)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Course Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>
              Enter the details for the new course below
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="name"
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
                          <SelectItem value="Aviation">Aviation</SelectItem>
                          <SelectItem value="Refresher">Refresher</SelectItem>
                          <SelectItem value="MMSC">MMSC</SelectItem>
                          <SelectItem value="Cadets">Cadets</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Manual Status Override 
                        <span className="text-xs text-muted-foreground ml-1">
                          (Only needed for "Cancelled" courses)
                        </span>
                      </FormLabel>
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
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Planned">Planned</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Note: Status will be automatically calculated based on dates unless "Cancelled" is selected.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
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
                          {schools.map((school) => (
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
              </div>

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
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="studentCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Count</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="benchmark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benchmark (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 75 ALCPT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress: {field.value}%</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        defaultValue={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
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
                  disabled={createCourseMutation.isPending}
                >
                  {createCourseMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the course information below
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Aviation">Aviation</SelectItem>
                          <SelectItem value="Refresher">Refresher</SelectItem>
                          <SelectItem value="MMSC">MMSC</SelectItem>
                          <SelectItem value="Cadets">Cadets</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Manual Status Override 
                        <span className="text-xs text-muted-foreground ml-1">
                          (Only needed for "Cancelled" courses)
                        </span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Planned">Planned</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Note: Status will be automatically calculated based on dates unless "Cancelled" is selected.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormField
                  control={editForm.control}
                  name="schoolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a school" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {schools.map((school) => (
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
              </div>

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
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="studentCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Count</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="benchmark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benchmark (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 75 ALCPT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress: {field.value}%</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
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
                  disabled={updateCourseMutation.isPending}
                >
                  {updateCourseMutation.isPending ? "Saving..." : "Save Changes"}
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
              Are you sure you want to delete the course "{selectedCourse?.name}"? This action cannot be undone.
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
              onClick={handleDeleteCourse}
              variant="destructive"
              disabled={deleteCourseMutation.isPending}
            >
              {deleteCourseMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}