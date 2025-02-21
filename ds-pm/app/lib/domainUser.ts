import { currentUser } from '@clerk/nextjs/server';
import prisma from './db';
import { SafeUser } from '@/types';

export async function getCurrentUser(): Promise<SafeUser | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (!email) return null;

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
}