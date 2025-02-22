import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from './db';
import { SafeUser } from '@/types';

export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const clerkUser = await currentUser();
    const { userId } = await auth(); // Await auth() for server-side check

    if (!userId || !clerkUser) {
      console.log('No authenticated user');
      return null;
    }

    const email = clerkUser.primaryEmailAddress?.emailAddress;
    if (!email) {
      console.log('No email found for Clerk user');
      return null;
    }

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
    return user;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}