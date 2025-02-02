import { NextResponse } from 'next/server'
import prisma from '@/app/lib/db'
import { getCurrentUser } from '@/app/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const properties = await prisma.property.findMany({
    where: { ownerId: user.id },
    include: { tenants: true }
  })
  return NextResponse.json(properties)
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const property = await prisma.property.create({
    data: {
      ...body,
      ownerId: user.id,
      images: body.images || []
    }
  })
  
  return NextResponse.json(property)
}