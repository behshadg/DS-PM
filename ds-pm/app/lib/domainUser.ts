import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from './db';
import { SafeUser } from '@/types';

export async function getCurrentUser(): Promise<SafeUser | null> {
  const maxRetries = 3;
  const delayMs = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const authResult = await auth();
      const userId = authResult.userId;
      console.log('Auth userId:', userId);

      if (!userId) {
        console.log('No authenticated user ID from auth()');
        return null;
      }

      const clerkUser = await currentUser();
      console.log('Clerk user:', clerkUser ? clerkUser.id : 'null');

      if (!clerkUser || !clerkUser.primaryEmailAddress?.emailAddress) {
        console.log('No Clerk user or email found');
        return null;
      }

      const email = clerkUser.primaryEmailAddress.emailAddress;
      let user = await prisma.user.findFirst({
        where: { email },
        include: {
          properties: { include: { tenants: true, documents: true } },
          tenants: { include: { property: true } },
        },
      });

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
          include: {
            properties: { include: { tenants: true, documents: true } },
          tenants: { include: { property: true } },
          },
        });
      }
      console.log('Prisma user:', user);
      return user;
    } catch (error) {
      console.error(`getCurrentUser attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        console.error('Max retries reached, returning null');
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  return null;
}