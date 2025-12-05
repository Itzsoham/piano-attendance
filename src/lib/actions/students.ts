"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type StudentWithStats = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  hourlyRateCents: number;
  defaultMinutes: number;
  notes: string | null;
  createdAt: Date;
  _count: {
    lessons: number;
    payments: number;
  };
  totalPayments: number;
};

export async function getStudents(): Promise<StudentWithStats[]> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const students = await prisma.student.findMany({
    where: {
      teacherId: session.user.id,
    },
    include: {
      _count: {
        select: {
          lessons: true,
          payments: true,
        },
      },
      payments: {
        select: {
          amountCents: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate total payments for each student
  return students.map((student) => ({
    id: student.id,
    name: student.name,
    email: student.email,
    phone: student.phone,
    hourlyRateCents: student.hourlyRateCents,
    defaultMinutes: student.defaultMinutes,
    notes: student.notes,
    createdAt: student.createdAt,
    _count: student._count,
    totalPayments: student.payments.reduce((sum, payment) => sum + payment.amountCents, 0),
  }));
}

export async function getStudentById(id: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const student = await prisma.student.findUnique({
    where: {
      id,
      teacherId: session.user.id,
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  return student;
}

export async function createStudent(data: {
  name: string;
  email: string | null;
  phone: string | null;
  hourlyRateCents: number;
  defaultMinutes: number;
  notes: string | null;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const student = await prisma.student.create({
    data: {
      ...data,
      teacherId: session.user.id,
    },
  });

  revalidatePath("/students");
  return student;
}

export async function updateStudent(
  id: string,
  data: {
    name: string;
    email: string | null;
    phone: string | null;
    hourlyRateCents: number;
    defaultMinutes: number;
    notes: string | null;
  },
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify the student belongs to the authenticated teacher
  const existingStudent = await prisma.student.findUnique({
    where: {
      id,
      teacherId: session.user.id,
    },
  });

  if (!existingStudent) {
    throw new Error("Student not found");
  }

  const student = await prisma.student.update({
    where: {
      id,
    },
    data,
  });

  revalidatePath("/students");
  revalidatePath(`/students/${id}/edit`);
  return student;
}
