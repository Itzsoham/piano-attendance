"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@/lib/generated/enums";

export async function getLessonsForMonth(year: number, month: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get start and end of month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const lessons = await prisma.lesson.findMany({
    where: {
      teacherId: session.user.id,
      scheduledAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      attendance: true,
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });

  return lessons;
}

export async function createLesson(data: { studentId: string; scheduledAt: Date; durationMin: number }) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify the student belongs to the teacher
  const student = await prisma.student.findUnique({
    where: {
      id: data.studentId,
      teacherId: session.user.id,
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const lesson = await prisma.lesson.create({
    data: {
      studentId: data.studentId,
      teacherId: session.user.id,
      scheduledAt: data.scheduledAt,
      durationMin: data.durationMin,
    },
    include: {
      student: true,
    },
  });

  revalidatePath("/calendar");
  return lesson;
}

export async function updateLesson(
  lessonId: string,
  data: {
    scheduledAt: Date;
    durationMin: number;
  },
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify the lesson belongs to the teacher
  const existingLesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
      teacherId: session.user.id,
    },
  });

  if (!existingLesson) {
    throw new Error("Lesson not found");
  }

  const lesson = await prisma.lesson.update({
    where: {
      id: lessonId,
    },
    data: {
      scheduledAt: data.scheduledAt,
      durationMin: data.durationMin,
    },
    include: {
      student: true,
    },
  });

  revalidatePath("/calendar");
  return lesson;
}

export async function deleteLesson(lessonId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify the lesson belongs to the teacher
  const existingLesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
      teacherId: session.user.id,
    },
  });

  if (!existingLesson) {
    throw new Error("Lesson not found");
  }

  await prisma.lesson.delete({
    where: {
      id: lessonId,
    },
  });

  revalidatePath("/calendar");
  return { success: true };
}

export async function markAttendance(
  lessonId: string,
  data: {
    status: AttendanceStatus;
    actualMin: number;
    reason?: string;
    note?: string;
  },
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify the lesson belongs to the teacher
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
      teacherId: session.user.id,
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Create or update attendance
  const attendance = await prisma.attendance.upsert({
    where: {
      lessonId: lessonId,
    },
    create: {
      lessonId: lessonId,
      date: lesson.scheduledAt,
      status: data.status,
      actualMin: data.actualMin,
      reason: data.reason || null,
      note: data.note || null,
    },
    update: {
      status: data.status,
      actualMin: data.actualMin,
      reason: data.reason || null,
      note: data.note || null,
    },
  });

  revalidatePath("/calendar");
  return attendance;
}
