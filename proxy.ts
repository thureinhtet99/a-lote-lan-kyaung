import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Session, User } from "./lib/auth/auth";
import { APP_ROUTES } from "./constants/app-config";
import { safeGetSession } from "./lib/auth/auth-helpers";

const publicRoutes = [
  APP_ROUTES.SIGN_IN,
  APP_ROUTES.SIGN_UP,
  APP_ROUTES.HOME,
  APP_ROUTES.JOB_LISTINGS.HOME,
] as const;
const employerRoutes = ["/employer"];
const adminRoutes = ["/admin"];

const matchesRoute = (pathname: string, route: string) => {
  if (route === "/") return pathname === "/";
  return pathname === route || pathname.startsWith(`${route}/`);
};

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for auth API routes to prevent infinite loops
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) =>
    matchesRoute(pathname, route),
  );
  const isEmployerRoute = employerRoutes.some((route) =>
    matchesRoute(pathname, route),
  );
  const isAdminRoute = adminRoutes.some((route) =>
    matchesRoute(pathname, route),
  );

  // Get session
  const sessionResponse = await safeGetSession();
  if (!sessionResponse) return null;

  const session = sessionResponse?.session as Session | null;
  const user = sessionResponse?.user as User | null;

  // Redirect to sign-in if accessing protected route without session
  if (!isPublicRoute && !session) {
    const signInUrl = new URL(APP_ROUTES.SIGN_IN, request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to home if accessing auth routes while logged in
  if (
    (pathname.startsWith(APP_ROUTES.SIGN_IN) ||
      pathname.startsWith(APP_ROUTES.SIGN_UP)) &&
    session
  ) {
    // Redirect admin users to admin dashboard
    if (user?.role === "admin")
      return NextResponse.redirect(new URL(APP_ROUTES.ADMIN.HOME, request.url));

    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect admin users away from job board to admin dashboard
  if (session && user?.role === "admin" && pathname === "/") {
    return NextResponse.redirect(new URL(APP_ROUTES.ADMIN.HOME, request.url));
  }

  // Redirect employer away from public organizations
  if (
    session &&
    user?.role === "employer" &&
    pathname.startsWith(APP_ROUTES.ORGANIZATIONS.HOME)
  ) {
    return NextResponse.redirect(new URL(APP_ROUTES.HOME, request.url));
  }

  // Check for banned users
  if (user?.banned) {
    const banExpires = user.banExpires;
    const isBanExpired = banExpires && new Date(banExpires) < new Date();

    if (!isBanExpired && !pathname.startsWith("/banned")) {
      return NextResponse.redirect(new URL("/banned", request.url));
    }
  }

  // Check employer route access
  if (isEmployerRoute && session) {
    const userRole = user?.role;
    if (userRole !== "employer" && userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Check admin route access
  if (isAdminRoute && session) {
    const userRole = user?.role;
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
