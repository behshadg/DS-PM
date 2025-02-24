// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/api(.*)',
  '/_not-found',
  '/dashboard/spreadsheet(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // 1. Handle public routes first
  if (isPublicRoute(req)) {
    console.log('Allowing public access to:', req.nextUrl.pathname);
    return;
  }

  // 2. Handle protected routes
  const { userId, redirectToSignIn } = await auth();
  
  // Redirect unauthenticated users
  if (!userId) {
    return redirectToSignIn();
  }

  // 3. Redirect authenticated users from auth pages
  if (userId && req.nextUrl.pathname.startsWith('/login')) {
    console.log('Redirecting authenticated user to dashboard');
    return Response.redirect(new URL('/dashboard', req.url));
  }
}, { debug: process.env.NODE_ENV === 'development' });

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/',
    '/(api|trpc)(.*)'
  ]
};