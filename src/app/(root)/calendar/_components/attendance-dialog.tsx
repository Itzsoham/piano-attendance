"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { markAttendance } from "@/lib/actions/lessons";
import { AttendanceStatus } from "@/lib/generated/enums";

const AttendanceFormSchema = z.object({
  status: z.nativeEnum(AttendanceStatus),
  actualMin: z.string().min(1, { message: "Duration is required." }),
  reason: z.string().optional(),
  note: z.string().optional(),
});

type AttendanceFormValues = z.infer<typeof AttendanceFormSchema>;

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: {
    id: string;
    studentName: string;
    durationMin: number;
    attendance?: {
      status: AttendanceStatus;
      actualMin: number;
      reason: string | null;
      note: string | null;
    } | null;
  };
  onSuccess?: () => void;
}

export function AttendanceDialog({ open, onOpenChange, lesson, onSuccess }: AttendanceDialogProps) {
  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(AttendanceFormSchema),
    defaultValues: {
      status: lesson.attendance?.status || AttendanceStatus.PRESENT,
      actualMin: lesson.attendance?.actualMin.toString() || lesson.durationMin.toString(),
      reason: lesson.attendance?.reason || "",
      note: lesson.attendance?.note || "",
    },
  });

  const selectedStatus = form.watch("status");

  const onSubmit = async (data: AttendanceFormValues) => {
    try {
      await markAttendance(lesson.id, {
        status: data.status,
        actualMin: parseInt(data.actualMin),
        reason: data.reason,
        note: data.note,
      });

      toast.success("Attendance marked successfully!");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogDescription>Mark attendance for {lesson.studentName}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={AttendanceStatus.PRESENT}>✓ Present</SelectItem>
                      <SelectItem value={AttendanceStatus.ABSENT}>✗ Absent</SelectItem>
                      <SelectItem value={AttendanceStatus.MAKEUP}>↻ Makeup</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedStatus === AttendanceStatus.PRESENT && (
              <FormField
                control={form.control}
                name="actualMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder={lesson.durationMin.toString()} {...field} />
                    </FormControl>
                    <FormDescription>Scheduled: {lesson.durationMin} minutes</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedStatus === AttendanceStatus.ABSENT && (
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Absence</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sick, Family emergency" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes..." className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
