'use server'
import prisma from '../lib/db'
import { getCurrentUser } from '@/lib/domainUser';
import { TenantSchema } from '@/lib/schema'

export async function createTenant(data: any) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  // Validate the input using your Zod schema.
  const validated = TenantSchema.parse(data)

  // If a propertyId is provided, check that the property exists and belongs to the user.
  if (validated.propertyId) {
    const property = await prisma.property.findFirst({
      where: {
        id: validated.propertyId,
        ownerId: user.id,
      },
    })
    if (!property) {
      throw new Error("Invalid propertyId: No such property exists or you don't own it.")
    }
  }

  return prisma.tenant.create({
    data: {
      ...validated,
      ownerId: user.id,
    }
  })
}
