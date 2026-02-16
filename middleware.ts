import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Session, User } from "./lib/auth/auth";
import { APP_ROUTES } from "./config/app-config";

const publicRoutes = ["/sign-in", "/sign-up", "/", "/job-listings"];
const employerRoutes = ["/employer"];
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for auth API routes to prevent infinite loops
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isEmployerRoute = employerRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Get session
  const sessionResponse = await fetch(
    new URL("/api/auth/get-session", request.url),
    {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    },
  );

  const sessionData = sessionResponse.ok ? await sessionResponse.json() : null;

  const session = sessionData?.session as Session | null;
  const user = sessionData?.user as User | null;

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
