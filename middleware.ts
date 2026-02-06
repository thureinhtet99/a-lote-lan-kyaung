import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { APP_ROUTES } from "./config/appConfig";

const publicRoutes = ["/sign-in", "/sign-up", "/", "/job-listings"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionCookie = getSessionCookie(request);

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Redirect to sign-in if accessing protected route without session
  if (!isPublicRoute && !sessionCookie) {
    const signInUrl = new URL(APP_ROUTES.SIGN_IN, request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to home if accessing auth routes while logged in
  if (
    (pathname.startsWith(APP_ROUTES.SIGN_IN) ||
      pathname.startsWith(APP_ROUTES.SIGN_UP)) &&
    sessionCookie
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
