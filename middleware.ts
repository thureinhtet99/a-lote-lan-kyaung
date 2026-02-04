import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/sign-in",
  "/sign-up",
  "/",
  "/job-listings",
  "/api/auth",
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Edge-safe check: only rely on presence of the session cookie.
  // Full validation happens in route handlers / server components.
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;
  const hasSession = Boolean(sessionToken);

  // Redirect to sign-in if accessing protected route without session
  if (!isPublicRoute && !hasSession) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to home if accessing auth routes while logged in
  if (
    (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) &&
    hasSession
  ) {
    return NextResponse.redirect(new URL("/", request.url));
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
