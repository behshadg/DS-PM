// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/api(.*)',
  '/_not-found',
  '/dashboard/spreadsheet(.*)',
  '/api/webhooks/(.*)'
]);

export default clerkMiddleware(async (auth, req) => {

  if (isPublicRoute(req)) {
    console.log('Allowing public access to:', req.nextUrl.pathname);
    return;
  }

 
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }


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