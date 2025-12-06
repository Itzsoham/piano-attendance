"use server";

import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export async function getStudentReport(studentId: string, month: number, year: number) {
  // Create dates in UTC or local? Simplest is to treat as local dates but store as ISO.
  // Actually, for "Month X", we just need the range.
  // Note: month is 1-indexed (1-12) from argument
  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);

  const [report, lessons, student] = await Promise.all([
    prisma.monthlyReport.findUnique({
      where: {
        studentId_month_year: {
          studentId,
          month,
          year,
        },
      },
    }),
    prisma.lesson.findMany({
      where: {
        studentId,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        attendance: true,
      },
      orderBy: {
        scheduledAt: "asc",
      },
    }),
    prisma.student.findUnique({
      where: { id: studentId },
    }),
  ]);

  return { report, lessons, student };
}

export async function upsertReport(
  studentId: string,
  month: number,
  year: number,
  data: { summary?: string; comments?: string; nextMonthPlan?: string },
) {
  return await prisma.monthlyReport.upsert({
    where: {
      studentId_month_year: {
        studentId,
        month,
        year,
      },
    },
    create: {
      studentId,
      month,
      year,
      ...data,
    },
    update: {
      ...data,
    },
  });
}
