'use server'

import prisma from '../lib/db'
import { getCurrentUser } from '@/lib/auth'
import { PropertySchema } from '@/lib/schema'

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