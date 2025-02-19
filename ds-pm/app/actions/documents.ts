'use server';

import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/domainUser";

export async function deleteDocument(documentId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const document = await prisma.propertyDocument.findFirst({
      where: { 
        id: documentId,
        property: { ownerId: user.id } 
      }
    });

    if (!document) throw new Error("Document not found");

    await prisma.propertyDocument.delete({ where: { id: documentId } });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete document"
    };
  }
}

export async function uploadDocument(propertyId: string, url: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const property = await prisma.property.findUnique({
      where: { id: propertyId, ownerId: user.id }
    });

    if (!property) throw new Error("Property not found");

    const document = await prisma.propertyDocument.create({
      data: {
        propertyId,
        url,
        name: url.split('/').pop() || 'Document',
        type: url.split('.').pop()?.toUpperCase() || 'FILE'
      }
    });

    return { success: true, document };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload document"
    };
  }
}