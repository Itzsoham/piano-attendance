"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarView } from "./_components/calendar-view";
import { LessonDialog } from "./_components/lesson-dialog";
import { AttendanceDialog } from "./_components/attendance-dialog";
import { AttendanceStatus } from "@/lib/generated/enums";

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

interface Student {
  id: string;
  name: string;
}

export default function CalendarPageClient() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      // Fetch lessons and students from API routes
      const [lessonsResponse, studentsResponse] = await Promise.all([
        fetch(`/api/lessons?year=${year}&month=${month}`),
        fetch("/api/students"),
      ]);

      if (!lessonsResponse.ok || !studentsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const lessonsData = await lessonsResponse.json();
      const studentsData = await studentsResponse.json();

      setLessons(lessonsData);
      setStudents(studentsData.map((s: any) => ({ id: s.id, name: s.name })));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const handleAddLesson = (date: Date) => {
    setSelectedDate(date);
    setSelectedLesson(null);
    setLessonDialogOpen(true);
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setAttendanceDialogOpen(true);
  };

  const handleSuccess = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Manage lessons and track attendance</p>
        </div>
        <Button onClick={() => handleAddLesson(new Date())}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lesson
        </Button>
      </div>

      <CalendarView
        lessons={lessons}
        onAddLesson={handleAddLesson}
        onLessonClick={handleLessonClick}
        onRefresh={fetchData}
      />

      <LessonDialog
        open={lessonDialogOpen}
        onOpenChange={setLessonDialogOpen}
        students={students}
        initialData={
          selectedDate
            ? {
                id: "",
                studentId: "",
                scheduledAt: selectedDate,
                durationMin: 60,
              }
            : undefined
        }
        onSuccess={handleSuccess}
      />

      {selectedLesson && (
        <AttendanceDialog
          open={attendanceDialogOpen}
          onOpenChange={setAttendanceDialogOpen}
          lesson={{
            id: selectedLesson.id,
            studentName: selectedLesson.student.name,
            durationMin: selectedLesson.durationMin,
            attendance: selectedLesson.attendance,
          }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
