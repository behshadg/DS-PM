'use server'

import prisma from "../lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PropertyUpdateSchema } from "@/lib/schema";
import type { Property } from "@prisma/client"; // Add explicit type import

export async function updateProperty(data: unknown) { // Use unknown instead of any
  try {
    const user = await getCurrentUser();
    const validatedData = PropertyUpdateSchema.parse(data);
    
    // More explicit type casting
    const existingProperty = await prisma.property.findUnique({
      where: {
        id: validatedData.id,
        ownerId: user.id,
      },
    });

    if (!existingProperty) {
      throw new Error("Property not found or unauthorized");
    }

    const { id, ...updateData } = validatedData;
    
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    return { success: true, property: updatedProperty satisfies Property };
  } catch (error) {
    console.error("Property update failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update property",
    };
  }
}

export async function deleteProperty(propertyId: string) {
  try {
    const user = await getCurrentUser();
    
    // Verify ownership before deletion
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId, ownerId: user.id },
    });

    if (!existingProperty) {
      throw new Error("Property not found or unauthorized");
    }

    const deletedProperty = await prisma.property.delete({
      where: { id: propertyId },
    });

    return { success: true, property: deletedProperty satisfies Property };
  } catch (error) {
    console.error("Property deletion failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete property",
    };
  }
}