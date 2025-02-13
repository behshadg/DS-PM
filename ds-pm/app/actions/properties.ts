'use server'

import prisma from "../lib/db";
import { getCurrentUser } from "@/lib/domainUser";
import { PropertySchema, PropertyUpdateSchema } from "@/lib/propertySchemas";
import type { Property } from "@prisma/client";

export async function createProperty(data: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    
    // Parse the data using our schema.
    const validatedData = PropertySchema.parse(data);
    // Destructure to remove documents from the property create data.
    const { documents, ...propertyData } = validatedData;

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        ownerId: user.id,
        price: Number(propertyData.price),
        bedrooms: Number(propertyData.bedrooms),
        bathrooms: Number(propertyData.bathrooms),
      }
    });

    // Now, if any document URLs were provided, create PropertyDocument records.
    if (documents && documents.length > 0) {
      for (const docUrl of documents) {
        await prisma.propertyDocument.create({
          data: {
            propertyId: property.id,
            url: docUrl,
            name: "Document", // Optionally, extract a file name if available.
            type: "document", // You can adjust this based on file extension.
          }
        });
      }
    }
    
    return { 
      success: true, 
      property: JSON.parse(JSON.stringify(property)) as Property 
    };
  } catch (error) {
    console.error("Property creation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create property",
    };
  }
}

export async function updateProperty(data: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    
    const validatedData = PropertyUpdateSchema.parse(data);

    const existingProperty = await prisma.property.findUnique({
      where: { id: validatedData.id, ownerId: user.id }
    });

    if (!existingProperty) throw new Error("Property not found or unauthorized");

    const updatedProperty = await prisma.property.update({
      where: { id: validatedData.id },
      data: {
        ...validatedData,
        price: Number(validatedData.price),
        bedrooms: Number(validatedData.bedrooms),
        bathrooms: Number(validatedData.bathrooms),
      }
    });

    return { 
      success: true, 
      property: JSON.parse(JSON.stringify(updatedProperty)) as Property 
    };
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
    if (!user) throw new Error("Unauthorized");

    const property = await prisma.property.findUnique({
      where: { id: propertyId, ownerId: user.id }
    });

    if (!property) throw new Error("Property not found or unauthorized");

    await prisma.property.delete({
      where: { id: propertyId }
    });

    return { success: true };
  } catch (error) {
    console.error("Property deletion failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete property",
    };
  }
}
