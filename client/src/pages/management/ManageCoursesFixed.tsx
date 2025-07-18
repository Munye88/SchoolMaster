import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Course, insertCourseSchema } from "@shared/schema";
import { calculateCourseProgress } from "@/utils/courseStatusHelpers";

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
  Calendar,
  Award
} from "lucide-react";
import { format } from "date-fns";

// Form validation schema
// Modify the schema to make instructorId optional
const courseSchema = insertCourseSchema
  .omit({ instructorId: true }) // Remove instructorId from validation
  .extend({
    schoolId: z.coerce.number().min(1, "Please select a school"),
    status: z.string().min(1, "Status is required"),
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
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Get schools data for the dropdown
  const { data: schools = [], isLoading: isLoadingSchools } = useQuery<any[]>({
    queryKey: ["/api/schools"],
  });

  // Get instructors data for the dropdown
  const { data: instructors = [], isLoading: isLoadingInstructors } = useQuery<any[]>({
    queryKey: ["/api/instructors"],
  });

  // Create form
  const createForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      status: "Starting Soon",
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
      status: "Starting Soon",
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
      console.log("Creating course with data:", courseData);
      
      try {
        const res = await apiRequest("POST", "/api/courses", courseData);
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Server error response:", errorData);
          throw new Error(errorData.message || "Server error");
        }
        return await res.json();
      } catch (err) {
        console.error("Course creation error:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log("Course created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Success",
        description: "Course created successfully",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: any) => {
      console.error("Failed to create course:", error);
      toast({
        title: "Error",
        description: error?.message || "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: CourseFormValues }) => {
      console.log("Updating course ID:", id, "with data:", data);
      
      try {
        const res = await apiRequest("PATCH", `/api/courses/${id}`, data);
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Server error response:", errorData);
          throw new Error(errorData.message || "Server error");
        }
        return await res.json();
      } catch (err) {
        console.error("Course update error:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log("Course updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
    },
    onError: (error: any) => {
      console.error("Failed to update course:", error);
      toast({
        title: "Error",
        description: error?.message || "An unknown error occurred",
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
    createCourseMutation.mutate(values);
  };

  const onEditSubmit = (values: CourseFormValues) => {
    if (selectedCourse) {
      updateCourseMutation.mutate({
        id: selectedCourse.id,
        data: values,
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
  const getSchoolName = (id: number): string => {
    const school = schools.find((s: any) => s.id === id);
    return school ? school.name : "Unknown";
  };

  // Get instructor name by ID
  const getInstructorName = (id: number): string => {
    const instructor = instructors.find((i: any) => i.id === id);
    return instructor ? instructor.name : "Unknown";
  };

  const isLoading = isLoadingCourses || isLoadingSchools || isLoadingInstructors;

  // Get available course types
  const courseTypes = ["Aviation", "Refresher", "Cadets"];
  
  // Get available statuses
  const statusOptions = ["Starting Soon", "In Progress", "Completed"];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Course Management</h1>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 rounded-none"
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
        <div className="bg-muted rounded-none p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No Courses</h3>
          <p className="text-muted-foreground mb-4">
            There are no courses in the system yet. Add your first course to get started.
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2 rounded-none"
          >
            <PlusCircle className="h-5 w-5" />
            Add Course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course: any) => (
            <Card key={course.id} className="overflow-hidden border-2 hover:shadow-lg transition-shadow rounded-none">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold text-gray-900 leading-tight">{course.name}</CardTitle>
                  <Badge className="flex-shrink-0">{course.status}</Badge>
                </div>
                <CardDescription className="text-base text-gray-600 mt-2">{getSchoolName(course.schoolId)}</CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-800 font-medium">Start Date: {course.startDate}</span>
                  </div>
                  {course.endDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-800 font-medium">End Date: {course.endDate}</span>
                    </div>
                  )}
                  {course.benchmark && (
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-800 font-medium">Benchmark: {course.benchmark}</span>
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-800 font-medium">Progress</span>
                      <span className="text-gray-900 font-bold">{calculateCourseProgress(course)}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-none">
                      <div
                        className="h-full bg-blue-600 rounded-none"
                        style={{ width: `${calculateCourseProgress(course)}%` }}
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
                  className="rounded-none"
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(course)}
                  className="text-destructive hover:text-destructive rounded-none"
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
        <DialogContent className="sm:max-w-[600px] rounded-none">
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
                          <SelectTrigger className="rounded-none">
                            <SelectValue placeholder="Select course type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-none">
                          {courseTypes.map((courseType) => (
                            <SelectItem
                              key={courseType}
                              value={courseType}
                            >
                              {courseType}
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-none">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-none">
                          {statusOptions.map((status) => (
                            <SelectItem
                              key={status}
                              value={status}
                            >
                              {status}
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
                  name="schoolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-none">
                            <SelectValue placeholder="Select a school" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-none">
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


              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input className="rounded-none" type="date" {...field} />
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
                        <Input className="rounded-none" type="date" {...field} value={field.value || ""} />
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
                        <Input className="rounded-none" 
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
                        <Input className="rounded-none" placeholder="e.g., 75 ALCPT" {...field} value={field.value || ""} />
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
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="rounded-none"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCourseMutation.isPending}
                  className="rounded-none"
                >
                  {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-none">
          <DialogHeader>
            <DialogTitle className="text-center">Edit Course</DialogTitle>
            <DialogDescription className="text-center">
              Update the course details below
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
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-none">
                            <SelectValue placeholder="Select course type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-none">
                          {courseTypes.map((courseType) => (
                            <SelectItem
                              key={courseType}
                              value={courseType}
                            >
                              {courseType}
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-none">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-none">
                          {statusOptions.map((status) => (
                            <SelectItem
                              key={status}
                              value={status}
                            >
                              {status}
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
                  name="schoolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-none">
                            <SelectValue placeholder="Select a school" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-none">
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


              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input className="rounded-none" type="date" {...field} value={field.value || ""} />
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
                        <Input className="rounded-none" type="date" {...field} value={field.value || ""} />
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
                        <Input className="rounded-none" 
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
                        <Input className="rounded-none" placeholder="e.g., 75 ALCPT" {...field} value={field.value || ""} />
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
                  className="rounded-none"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateCourseMutation.isPending}
                  className="rounded-none"
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
        <DialogContent className="sm:max-w-[425px] rounded-none">
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
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteCourse}
              variant="destructive"
              disabled={deleteCourseMutation.isPending}
              className="rounded-none"
            >
              {deleteCourseMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}