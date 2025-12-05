"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  addDays,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Clock, CheckCircle2, XCircle, RotateCcw, GripVertical } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AttendanceStatus } from "@/lib/generated/enums";
import { updateLesson } from "@/lib/actions/lessons";
import { toast } from "sonner";

interface Lesson {
  id: string;
  scheduledAt: Date;
  durationMin: number;
  student: {
    id: string;
    name: string;
  };
  attendance: {
    id: string;
    status: AttendanceStatus;
    actualMin: number;
    reason: string | null;
    note: string | null;
  } | null;
}

interface CalendarViewProps {
  lessons: Lesson[];
  onAddLesson: (date: Date) => void;
  onLessonClick: (lesson: Lesson) => void;
  onRefresh: () => void;
}

function DraggableLessonCard({ lesson, onClick }: { lesson: Lesson; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lesson.id,
    data: lesson,
  });

  const getAttendanceIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case AttendanceStatus.ABSENT:
        return <XCircle className="h-3 w-3 text-red-600" />;
      case AttendanceStatus.MAKEUP:
        return <RotateCcw className="h-3 w-3 text-blue-600" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "w-full text-left transition-all",
        "cursor-grab active:cursor-grabbing",
        isDragging && "scale-105 opacity-50",
      )}
    >
      <div
        className={cn(
          "rounded border p-1.5 text-xs transition-colors select-none",
          lesson.attendance ? "bg-muted hover:bg-muted/80" : "bg-primary/10 border-primary/20 hover:bg-primary/20",
          isDragging && "ring-primary ring-2",
        )}
      >
        <div className="flex items-center gap-1">
          <GripVertical className="text-muted-foreground h-3 w-3 flex-shrink-0" />
          {lesson.attendance && getAttendanceIcon(lesson.attendance.status)}
          <Clock className="h-3 w-3" />
          <span className="font-medium">{format(new Date(lesson.scheduledAt), "HH:mm")}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="w-full text-left hover:underline"
        >
          <div className="mt-0.5 truncate font-medium">{lesson.student.name}</div>
          <div className="text-muted-foreground">{lesson.durationMin} min</div>
        </button>
      </div>
    </div>
  );
}

function DroppableDay({
  day,
  dayLessons,
  isToday,
  onAddLesson,
  onLessonClick,
}: {
  day: Date;
  dayLessons: Lesson[];
  isToday: boolean;
  onAddLesson: () => void;
  onLessonClick: (lesson: Lesson) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: format(day, "yyyy-MM-dd"),
    data: { date: day },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[120px] space-y-1 rounded-lg border p-2 transition-colors",
        isToday && "border-primary bg-accent/30",
        isOver && "bg-accent/70 border-primary",
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-medium", isToday && "text-primary font-bold")}>{format(day, "d")}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onAddLesson}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Lessons for this day */}
      <div className="space-y-1">
        {dayLessons.map((lesson) => (
          <DraggableLessonCard key={lesson.id} lesson={lesson} onClick={() => onLessonClick(lesson)} />
        ))}
      </div>
    </div>
  );
}

export function CalendarView({ lessons, onAddLesson, onLessonClick, onRefresh }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday)
  const firstDayOfWeek = monthStart.getDay();

  // Create empty cells for days before the month starts
  const emptyCells = Array(firstDayOfWeek).fill(null);

  const getLessonsForDay = (date: Date) => {
    return lessons.filter((lesson) => isSameDay(new Date(lesson.scheduledAt), date));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const lesson = event.active.data.current as Lesson;
    setActiveLesson(lesson);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLesson(null);

    if (!over) return;

    const lesson = active.data.current as Lesson;
    const targetDate = over.data.current?.date as Date;

    if (!targetDate) return;

    // Check if the date actually changed
    if (isSameDay(new Date(lesson.scheduledAt), targetDate)) return;

    try {
      // Keep the same time, just change the date
      const oldDate = new Date(lesson.scheduledAt);
      const newDate = new Date(targetDate);
      newDate.setHours(oldDate.getHours(), oldDate.getMinutes(), 0, 0);

      await updateLesson(lesson.id, {
        scheduledAt: newDate,
        durationMin: lesson.durationMin,
      });

      toast.success("Lesson rescheduled successfully!");
      onRefresh();
    } catch (error) {
      toast.error("Failed to reschedule lesson");
      console.error(error);
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        {/* Calendar Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">{format(currentMonth, "MMMM yyyy")}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-muted-foreground p-2 text-center text-sm font-medium">
                  {day}
                </div>
              ))}

              {/* Empty cells before month starts */}
              {emptyCells.map((_, index) => (
                <div key={`empty-${index}`} className="min-h-[120px] p-2" />
              ))}

              {/* Calendar days */}
              {daysInMonth.map((day) => {
                const dayLessons = getLessonsForDay(day);
                const isToday = isSameDay(day, new Date());

                return (
                  <DroppableDay
                    key={day.toISOString()}
                    day={day}
                    dayLessons={dayLessons}
                    isToday={isToday}
                    onAddLesson={() => onAddLesson(day)}
                    onLessonClick={onLessonClick}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <GripVertical className="text-muted-foreground h-4 w-4" />
                <span>Drag to reschedule</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Present</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span>Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-blue-600" />
                <span>Makeup</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="border-primary/20 bg-primary/10 h-4 w-4 rounded border" />
                <span>Scheduled (No attendance)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeLesson && (
            <div className="bg-primary/10 border-primary/20 w-32 rounded border p-1.5 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="font-medium">{format(new Date(activeLesson.scheduledAt), "HH:mm")}</span>
              </div>
              <div className="mt-0.5 truncate font-medium">{activeLesson.student.name}</div>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
