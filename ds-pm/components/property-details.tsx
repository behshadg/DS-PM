"use client";

import { Button } from "./ui/button";
import { DocumentUpload } from "./DocumentUpload";
import { PropertyWithDocuments } from "@/types";
import Link from "next/link";
import { deleteDocument } from "@/actions/documents";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function PropertyDetails({ property }: { property: PropertyWithDocuments }) {
  const router = useRouter();

  const handleDocumentUpload = async (urls: string[]) => {
    try {
      const uploadPromises = urls.map(async (url) => {
        const response = await fetch("/api/document/upload", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            propertyId: property.id, 
            url,
            originalName: new URL(url).pathname.split('/').pop() || 'document'
          })
        });
        if (!response.ok) throw new Error('Failed to save document');
      });

      await Promise.all(uploadPromises);
      router.refresh();
      toast.success('Documents uploaded successfully');
    } catch (error) {
      console.error('Document save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save documents');
    }
  };

  const handleDelete = async (documentId: string) => {
    const result = await deleteDocument(documentId);
    if (result.success) {
      toast.success("Document deleted");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid grid-cols-2 w-[300px] mb-6">
        <TabsTrigger value="details">Property Details</TabsTrigger>
        <TabsTrigger value="documents">Documents ({property.documents.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="documents">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Documents</h3>
          <DocumentUpload 
            onUpload={handleDocumentUpload}
            onRemove={() => {}}
          />
          <div className="space-y-2">
            {property.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                <Link
                  href={doc.url.replace('/image/upload/', '/raw/upload/')}
                  target="_blank"
                  className="text-primary hover:underline truncate"
                >
                  {doc.name}
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(doc.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}