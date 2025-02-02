'use server'

import prisma from '../lib/db'
import { getCurrentUser } from '@/lib/auth'
import { PropertySchema } from '@/lib/schema'

export async function updateProperty(data: any) {
  try {
    // Get the current user (throws if not authenticated)
    const user = await getCurrentUser()
    if (!user) throw new Error('Authentication required')

    // Ensure the update payload includes an id
    if (!data.id) {
      throw new Error("Property id is required for update")
    }

    // Validate the data with your PropertySchema.
    // (Ensure your schema is set up to handle updates – it should include an 'id' field.)
    const validatedData = PropertySchema.parse(data)

    // Check that the property exists and belongs to the current user.
    const existingProperty = await prisma.property.findFirst({
      where: {
        id: validatedData.id,
        ownerId: user.id,
      },
    })
    if (!existingProperty) {
      throw new Error("Property not found or unauthorized")
    }

    // Remove the id from the data to update (if your schema returns it)
    const { id, ...updateData } = validatedData

    // Update the property.
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData,
    })

    return { success: true, property: updatedProperty }
  } catch (error) {
    console.error("Property update failed:", error)
    return {
      error: error instanceof Error ? error.message : "Failed to update property",
    }
  }
}


export async function deleteProperty(propertyId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  return prisma.property.delete({
    where: {
      id: propertyId,
      ownerId: user.id
    }
  });
}

export async function createProperty(data: any) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Authentication required')

    const validatedData = PropertySchema.parse(data)
    
    const property = await prisma.property.create({
      data: {
        ...validatedData,
        ownerId: user.id
      }
    })

    return { success: true, property }
  } catch (error) {
    console.error('Property creation failed:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to create property'
    }
  }
}