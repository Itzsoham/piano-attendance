import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  InvalidCredentialsError,
  MissingCredentialsError,
  UserNotFoundError,
  DatabaseError,
} from "@/lib/auth-errors";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role: string;
  }
  interface JWT {
    id: string;
    role: string;
  }
}

interface Credentials {
  email: string;
  password: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate credentials exist
          if (!credentials?.email || !credentials?.password) {
            throw new MissingCredentialsError();
          }

          const { email, password } = credentials as Credentials;

          // Find user in database
          const user = await prisma.user.findUnique({ where: { email } });
          
          if (!user) {
            throw new UserNotFoundError();
          }

          if (!user.hashedPassword) {
            throw new InvalidCredentialsError("Account setup incomplete");
          }

          // Verify password
          const isValid = await bcrypt.compare(password, user.hashedPassword);
          
          if (!isValid) {
            throw new InvalidCredentialsError();
          }

          // Return minimal user object that will be saved in JWT
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          // Log error for debugging (consider using a proper logger in production)
          console.error("Authentication error:", error);

          // Re-throw custom errors
          if (
            error instanceof MissingCredentialsError ||
            error instanceof UserNotFoundError ||
            error instanceof InvalidCredentialsError
          ) {
            throw error;
          }

          // Wrap unexpected errors
          throw new DatabaseError("Authentication failed due to server error");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // When user signs in, user object exists — attach id & role
      if (user) {
        token.id = user.id;
        token.role = user.role;

      }
      return token;
    },
    async session({ session, token }) {
      // Expose id & role to client session with proper typing
      if (token.id && typeof token.id === "string") {
        session.user.id = token.id;
      }
      
      if (token.role && typeof token.role === "string") {
        session.user.role = token.role;
      }
      
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
