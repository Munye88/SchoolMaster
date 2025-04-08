import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertInstructorSchema } from "@shared/schema";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSchool } from "@/hooks/useSchool";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Extend the schema with additional validation
const instructorFormSchema = insertInstructorSchema.extend({
  startDate: z.string().min(1, "Start date is required"),
});

// Derive type from schema
type InstructorFormValues = z.infer<typeof instructorFormSchema>;

interface InstructorFormProps {
  onSuccess?: () => void;
  initialData?: Partial<InstructorFormValues>;
}

const InstructorForm = ({ onSuccess, initialData }: InstructorFormProps) => {
  const { toast } = useToast();
  const { schools } = useSchool();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with schema
  const form = useForm<InstructorFormValues>({
    resolver: zodResolver(instructorFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      nationality: initialData?.nationality || "",
      credentials: initialData?.credentials || "",
      startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
      compound: initialData?.compound || "",
      schoolId: initialData?.schoolId || 0,
      phone: initialData?.phone || "",
      accompaniedStatus: initialData?.accompaniedStatus || "Unaccompanied",
      role: initialData?.role || "Instructor",
      imageUrl: initialData?.imageUrl || "",
    },
  });

  // Create instructor mutation
  const createInstructor = useMutation({
    mutationFn: async (data: InstructorFormValues) => {
      // Convert form data to the expected format
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate),
        schoolId: Number(data.schoolId),
      };
      
      const response = await apiRequest("POST", "/api/instructors", formattedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/instructors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/schools'] });
      
      toast({
        title: "Instructor created",
        description: "New instructor has been added successfully.",
      });
      
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create instructor: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  // Form submission handler
  const onSubmit = (data: InstructorFormValues) => {
    setIsSubmitting(true);
    createInstructor.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nationality</FormLabel>
                <FormControl>
                  <Input placeholder="American" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="credentials"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credentials</FormLabel>
                <FormControl>
                  <Input placeholder="MA in TESOL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
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
            control={form.control}
            name="compound"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compound</FormLabel>
                <FormControl>
                  <Input placeholder="Al Reem" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="schoolId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={field.value ? field.value.toString() : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a school" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id.toString()}>
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
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+966550241234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="accompaniedStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accompanied Status</FormLabel>
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
                    <SelectItem value="Accompanied">Accompanied</SelectItem>
                    <SelectItem value="Unaccompanied">Unaccompanied</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input placeholder="English Language Instructor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" className="bg-[#0A2463] hover:bg-[#071A4A]" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Instructor"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InstructorForm;
