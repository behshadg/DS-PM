import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth(); // Await auth() for Clerk v5+

  console.log('Middleware - Request URL:', req.url);
  console.log('Middleware - User ID:', userId);

  // Allow all routes to proceed; redirect /login if authenticated
  if (userId && req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Redirect unauthenticated users to /login except for public routes
  if (!userId && !req.nextUrl.pathname.startsWith('/login') && !req.nextUrl.pathname.startsWith('/signup')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // Match all except static files and _next
    '/',
    '/(api|trpc)(.*)',
  ],
};