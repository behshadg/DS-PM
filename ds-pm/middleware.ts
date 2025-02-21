import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/dashboard',
  '/api(.*)',
  '/_not-found',
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    const { userId } = await auth();

    console.log('Request URL:', req.url);
    console.log('User ID:', userId);

    if (isPublicRoute(req)) {
      if (userId && req.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/dashboard', req.url)); // Direct to dashboard
      }
      return NextResponse.next();
    }

    if (!userId) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};