"use client";


import { Button } from "./ui/button";
import { DocumentUpload } from "./DocumentUpload";
import { PropertyWithDocuments } from "@/types";
import Link from "next/link";
import { deleteDocument } from "@/actions/documents";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function PropertyDetails({ property }: { property: PropertyWithDocuments }) {
  const router = useRouter();

  const handleDocumentUpload = (urls: string[]) => {
    urls.forEach(async (url) => {
      const result = await fetch("/api/document/upload", {
        method: "POST",
        body: JSON.stringify({ propertyId: property.id, url })
      });
      if (result.ok) router.refresh();
    });
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Property Images</h3>
        <div className="grid grid-cols-3 gap-4">
          {property.images.map((image) => (
            <img
              key={image}
              src={image}
              alt="Property"
              className="w-full h-32 object-cover rounded-lg"
            />
          ))}
        </div>
      </div>

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
                href={doc.url}
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
    </div>
  );
}