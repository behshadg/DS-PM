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

export async function uploadDocument(propertyId: string, url: string, originalName: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const fileExtension = originalName.split('.').pop()?.toLowerCase() || 'file';
    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv'];

    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error("Unsupported file type");
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId, ownerId: user.id }
    });

    if (!property) throw new Error("Property not found");

    const document = await prisma.propertyDocument.create({
      data: {
        propertyId,
        url: url.replace('/image/upload/', '/raw/upload/'),
        name: originalName,
        type: originalName.split('.').pop()?.toUpperCase() || 'FILE'
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