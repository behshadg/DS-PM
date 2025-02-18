"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProperty, updateProperty } from "@/actions/properties";
import { Form } from "components/ui/form";
import { Input } from "components/ui/input";
import { Button } from "components/ui/button";
import { Textarea } from "components/ui/textarea";
import { FileUpload } from "components/file-upload";
import { DocumentUpload } from "./DocumentUpload";
import { PropertySchema, PropertyUpdateSchema } from "@/lib/propertySchemas";
import type { PropertyWithDocuments } from "@/types";

interface PropertyFormProps {
  property?: PropertyWithDocuments;
  onSuccess?: () => void;
}

export function PropertyForm({ property, onSuccess }: PropertyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const form = useForm({
    resolver: zodResolver(property ? PropertyUpdateSchema : PropertySchema),
    defaultValues: {
      ...property,
      id: property?.id || undefined,
      price: property?.price || 0,
      bedrooms: property?.bedrooms || 1,
      bathrooms: property?.bathrooms || 1,
      images: property?.images || [],
      documents: property?.documents?.map(d => d.url) || [],
    },
  });

  const handleImageUpload = (urls: string[]) => {
    form.setValue("images", urls, { shouldValidate: true });
  };

  const handleImageRemove = (url: string) => {
    const currentImages = form.getValues("images");
    form.setValue("images", currentImages.filter(u => u !== url), { shouldValidate: true });
  };

  const handleDocumentUpload = (urls: string[]) => {
    form.setValue("documents", urls, { shouldValidate: true });
  };

  const handleDocumentRemove = (url: string) => {
    const currentDocs = form.getValues("documents");
    form.setValue("documents", currentDocs.filter(u => u !== url), { shouldValidate: true });
  };

  const processUploads = async (urls: string[], type: 'image' | 'document') => {
    return Promise.all(
      urls.map(async (url) => {
        if (!url.startsWith("blob:")) return url;
        
        const formData = new FormData();
        const file = await convertBlobToFile(url);
        formData.append("file", file);
        formData.append("type", type);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "File upload failed");
        }

        const result = await response.json();
        return result.url;
      })
    );
  };

  const handleSubmit = async (data: any) => {
    setFormError("");
    setIsSubmitting(true);
    const toastId = toast.loading(property ? "Updating property..." : "Creating property...");

    try {
      // Process images and documents in parallel
      const [uploadedImages, uploadedDocs] = await Promise.all([
        processUploads(data.images || [], 'image'),
        processUploads(data.documents || [], 'document'),
      ]);

      const result = property 
        ? await updateProperty({
            ...data,
            id: property.id,
            images: uploadedImages,
            documents: uploadedDocs,
          })
        : await createProperty({
            ...data,
            images: uploadedImages,
            documents: uploadedDocs,
          });

      if (!result.success) throw new Error(result.error);

      toast.success(property ? "Property updated!" : "Property created!", { id: toastId });
      router.refresh();
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Operation failed";
      setFormError(message);
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form methods={form} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Existing form fields */}
      
      <div>
        <label className="block text-sm font-medium mb-2">Property Images</label>
        <FileUpload
          onUpload={handleImageUpload}
          onRemove={handleImageRemove}
          initialFiles={form.watch("images")}
          accept="image/*"
          maxSize={10 * 1024 * 1024}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Property Documents</label>
        <DocumentUpload
          onUpload={handleDocumentUpload}
          onRemove={handleDocumentRemove}
          initialFiles={form.watch("documents")}
          maxSize={25 * 1024 * 1024}
        />
      </div>

      {formError && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{formError}</div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting 
          ? (property ? "Updating..." : "Creating...")
          : (property ? "Update Property" : "Create Property")}
      </Button>
    </Form>
  );
}

async function convertBlobToFile(blobUrl: string): Promise<File> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new File([blob], "document", { type: blob.type });
}