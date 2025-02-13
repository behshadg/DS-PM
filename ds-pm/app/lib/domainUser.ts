// app/lib/domainUser.ts
import { currentUser } from '@clerk/nextjs/server';
import prisma from './db';

export async function getCurrentUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  
  // Use Clerk's primary email address for lookup
  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (!email) return null;
  
  let user = await prisma.user.findFirst({
    where: { email },
    include: { properties: true, tenants: true },
  });
  
  // If no user exists, create one
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name:
          clerkUser.firstName || clerkUser.lastName
            ? `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim()
            : null,
      },
      include: { properties: true, tenants: true },
    });
  }
  return user;
}
