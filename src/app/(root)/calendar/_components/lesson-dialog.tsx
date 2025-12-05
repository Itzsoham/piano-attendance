"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { createLesson, updateLesson } from "@/lib/actions/lessons";

const LessonFormSchema = z.object({
  studentId: z.string().min(1, { message: "Please select a student." }),
  date: z.date({ message: "Please select a date." }),
  time: z.string().min(1, { message: "Please enter a time." }),
  durationMin: z.string().min(1, { message: "Duration is required." }),
});

type LessonFormValues = z.infer<typeof LessonFormSchema>;

interface LessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Array<{ id: string; name: string }>;
  initialData?: {
    id: string;
    studentId: string;
    scheduledAt: Date;
    durationMin: number;
  };
  onSuccess?: () => void;
}

export function LessonDialog({ open, onOpenChange, students, initialData, onSuccess }: LessonDialogProps) {
  const isEditing = !!initialData?.id;

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(LessonFormSchema),
    defaultValues: {
      studentId: initialData?.studentId || "",
      date: initialData?.scheduledAt || new Date(),
      time: initialData?.scheduledAt ? format(initialData.scheduledAt, "HH:mm") : "10:00",
      durationMin: initialData?.durationMin.toString() || "60",
    },
  });

  const onSubmit = async (data: LessonFormValues) => {
    try {
      // Combine date and time
      const [hours, minutes] = data.time.split(":");
      const scheduledAt = new Date(data.date);
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const durationMin = parseInt(data.durationMin);

      if (isEditing) {
        await updateLesson(initialData.id, {
          scheduledAt,
          durationMin,
        });
        toast.success("Lesson updated successfully!");
      } else {
        await createLesson({
          studentId: data.studentId,
          scheduledAt,
          durationMin,
        });
        toast.success("Lesson created successfully!");
      }

      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Lesson" : "Schedule New Lesson"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the lesson details below." : "Add a new lesson to your calendar."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select
                    key={`student-select-${students.length}`}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.length === 0 ? (
                        <div className="text-muted-foreground p-2 text-sm">No students found. Add students first.</div>
                      ) : (
                        students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" placeholder="60" {...field} />
                  </FormControl>
                  <FormDescription>Lesson duration in minutes</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">
                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
