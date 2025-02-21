import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-up(.*)',
  '/api(.*)',
  '/_not-found',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  console.log('Request URL:', req.url);
  console.log('User ID:', userId);

  if (isPublicRoute(req)) {
    // Redirect signed-in users from /login to home
    if (userId && req.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  if (!userId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};