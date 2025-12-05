"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function updateUserProfile(data: { name: string; email: string }) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Check if email is already taken by another user
  if (data.email !== session.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      throw new Error("Email is already in use");
    }
  }

  const user = await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      name: data.name,
      email: data.email,
    },
  });

  revalidatePath("/profile");
  return user;
}

export async function updateUserPassword(data: { currentPassword: string; newPassword: string }) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Verify current password
  if (user.hashedPassword) {
    const isValid = await bcrypt.compare(data.currentPassword, user.hashedPassword);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      hashedPassword,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}
