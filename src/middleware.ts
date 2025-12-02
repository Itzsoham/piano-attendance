import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Route configuration for authentication and authorization
 */

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/register", "/auth/error"];

// Routes that require authentication but no specific role
// const PROTECTED_ROUTES = ["/dashboard", "/profile", "/settings"];

// Role-based route access control
const ROLE_BASED_ROUTES = {
  ADMIN: ["/admin", "/admin/users", "/admin/settings", "/admin/reports"],
  TEACHER: ["/teacher", "/teacher/classes", "/teacher/attendance", "/teacher/students", "/students"],
  STUDENT: ["/student", "/student/attendance", "/student/schedule"],
} as const;

// type UserRole   = keyof typeof ROLE_BASED_ROUTES;

/**
 * Check if a path matches any route in the given array
 */
function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => {
    // Exact match
    if (pathname === route) return true;
    // Prefix match for nested routes (e.g., /admin matches /admin/users)
    if (pathname.startsWith(`${route}/`)) return true;
    return false;
  });
}

/**
 * Check if user has permission to access a route based on their role
 */
function hasRoleAccess(pathname: string, userRole: string): boolean {
  // Check if the route requires a specific role
  for (const [role, routes] of Object.entries(ROLE_BASED_ROUTES)) {
    if (matchesRoute(pathname, routes)) {
      return role === userRole;
    }
  }
  // If no specific role is required, allow access
  return true;
}

/**
 * Middleware function to protect routes
 */
export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const session = req.auth;

  // Allow public routes
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const isAuthenticated = !!session?.user;

  // Redirect to login if not authenticated and trying to access protected routes
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from index to dashboard
  if (pathname === "/") {
    const dashboardUrl = new URL("/dashboard", nextUrl.origin);
    return NextResponse.redirect(dashboardUrl);
  }

  // Check role-based access
  const userRole = session.user.role;

  if (!hasRoleAccess(pathname, userRole)) {
    // Redirect to unauthorized page or dashboard
    const unauthorizedUrl = new URL("/unauthorized", nextUrl.origin);
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Allow access
  return NextResponse.next();
});

/**
 * Matcher configuration to specify which routes the middleware should run on
 * This prevents middleware from running on static files and API routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (public assets)
     * - /api/auth/* (NextAuth API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

/**
 * Use Node.js runtime instead of Edge Runtime
 * This is required because Prisma (used in auth) needs Node.js built-in modules
 */
export const runtime = "nodejs";
