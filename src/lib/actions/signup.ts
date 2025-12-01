"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { Role } from "@/lib/generated/enums";

export async function signup(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const role = (formData.get("role") as string) || "TEACHER";

  // Basic validations
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email already in use");
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 10);

  // Create user
  await prisma.user.create({
    data: {
      email,
      name,
      role: role as Role,
      hashedPassword: hashed,
    },
  });

  // Redirect to login page with callback to dashboard
  redirect("/auth/login?callbackUrl=/dashboard");
}
