// app/api/properties/my/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from '@/lib/domainUser';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return only id and title for selection purposes.
  const properties = await prisma.property.findMany({
    where: { ownerId: user.id },
    select: { id: true, title: true },
  });

  return NextResponse.json(properties);
}
