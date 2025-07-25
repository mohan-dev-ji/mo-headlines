import { clerkMiddleware, createRouteMatcher, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher(['/create(.*)', '/admin(.*)']);

export default clerkMiddleware(async (auth, request) => {
  // Check if the route is protected
  if (isProtectedRoute(request)) {
    const session = await auth();
    
    console.log('Protected route accessed:', request.url);
    console.log('Session userId:', session?.userId);
    console.log('Admin userId:', process.env.NEXT_PUBLIC_ADMIN_USER_ID);
    
    // If user is not logged in or not the admin user, redirect to home
    if (!session?.userId || session.userId !== process.env.NEXT_PUBLIC_ADMIN_USER_ID) {
      console.log('Access denied - redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    console.log('Access granted');
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};