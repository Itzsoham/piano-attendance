"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createStudent, updateStudent } from "@/lib/actions/students";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal("")),
  phone: z.string().optional(),
  hourlyRate: z.string().min(1, { message: "Hourly rate is required." }),
  defaultMinutes: z.string().min(1, { message: "Default duration is required." }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

interface StudentFormProps {
  initialData?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    hourlyRateCents: number;
    defaultMinutes: number;
    notes: string | null;
  };
}

export function StudentForm({ initialData }: StudentFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      hourlyRate: initialData ? (initialData.hourlyRateCents / 100).toString() : "30",
      defaultMinutes: initialData?.defaultMinutes.toString() || "60",
      notes: initialData?.notes || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const hourlyRateCents = Math.round(parseFloat(data.hourlyRate) * 100);
      const defaultMinutes = parseInt(data.defaultMinutes);

      const studentData = {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        hourlyRateCents,
        defaultMinutes,
        notes: data.notes || null,
      };

      if (isEditing) {
        await updateStudent(initialData.id, studentData);
        toast.success("Student updated successfully!");
      } else {
        await createStudent(studentData);
        toast.success("Student created successfully!");
      }

      router.push("/students");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Student" : "Add New Student"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update student information and settings." : "Add a new student to your roster."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
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

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="student@example.com" {...field} />
                    </FormControl>
                    <FormDescription>Optional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="555-1234" {...field} />
                    </FormControl>
                    <FormDescription>Optional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="30.00" {...field} />
                    </FormControl>
                    <FormDescription>Rate per hour in dollars</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Lesson Duration</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="60" {...field} />
                    </FormControl>
                    <FormDescription>Duration in minutes</FormDescription>
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
                      placeholder="Any additional notes about this student..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={() => router.push("/students")}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Update Student" : "Create Student"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
