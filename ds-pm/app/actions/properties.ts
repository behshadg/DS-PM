'use server';

import prisma from "../lib/db";
import { getCurrentUser } from "@/lib/domainUser";
import { PropertySchema, PropertyUpdateSchema } from "@/lib/propertySchemas";
import { revalidatePath } from "next/cache";

export async function createProperty(data: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    
    const validatedData = PropertySchema.parse(data);
    const { documents = [], ...propertyData } = validatedData;

    // Validate document URLs
    const validDocuments = documents.filter(url => 
      typeof url === 'string' && url.startsWith('http')
    );

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        ownerId: user.id,
        price: Number(propertyData.price),
        bedrooms: Number(propertyData.bedrooms),
        bathrooms: Number(propertyData.bathrooms),
        documents: {
          create: validDocuments.map(url => ({
            url,
            name: url.split('/').pop() || 'Document',
            type: getDocumentType(url),
          })),
        },
      },
      include: { documents: true },
    });

    revalidatePath('/dashboard/properties');
    return { success: true, property };
  } catch (error) {
    console.error("Property creation failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Creation failed",
    };
  }
}

export async function updateProperty(data: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    
    const validatedData = PropertyUpdateSchema.parse(data);
    const { id, documents = [], ...updateData } = validatedData;

    const existing = await prisma.property.findUnique({
      where: { id, ownerId: user.id },
      include: { documents: true },
    });

    if (!existing) throw new Error("Property not found");

    const existingDocs = existing.documents.map(d => d.url);
    const docsToAdd = documents
      .filter((url): url is string => Boolean(url) && typeof url === 'string')
      .filter(url => !existingDocs.includes(url));
    const docsToRemove = existingDocs.filter(url => !documents.includes(url));

    const updatedProperty = await prisma.$transaction(async (tx) => {
      if (docsToRemove.length > 0) {
        await tx.propertyDocument.deleteMany({
          where: { url: { in: docsToRemove }, propertyId: id },
        });
      }

      return tx.property.update({
        where: { id },
        data: {
          ...updateData,
          price: Number(updateData.price),
          bedrooms: Number(updateData.bedrooms),
          bathrooms: Number(updateData.bathrooms),
          documents: {
            create: docsToAdd.map(url => ({
              url,
              name: url.split('/').pop() || 'Document',
              type: getDocumentType(url),
            })),
          },
        },
        include: { documents: true },
      });
    });

    revalidatePath('/dashboard/properties');
    return { success: true, property: updatedProperty };
  } catch (error) {
    console.error("Property update failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}

function getDocumentType(url: string): string {
  try {
    const extension = new URL(url).pathname.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'PDF';
      case 'doc':
      case 'docx': return 'Word';
      case 'xls':
      case 'xlsx': return 'Excel';
      case 'csv': return 'CSV';
      default: return 'Document';
    }
  } catch {
    return 'Document';
  }
}

export async function deleteProperty(propertyId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Verify property exists and belongs to user
    const property = await prisma.property.findUnique({
      where: { id: propertyId, ownerId: user.id }
    });
    if (!property) throw new Error("Property not found");

    // Delete related documents first
    await prisma.propertyDocument.deleteMany({
      where: { propertyId }
    });

    await prisma.property.delete({
      where: { id: propertyId }
    });

    revalidatePath('/dashboard/properties');
    return { success: true };
  } catch (error) {
    console.error("Property deletion failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete property",
    };
  }
}