"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProperty, updateProperty } from "@/actions/properties";
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

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(property ? PropertyUpdateSchema : PropertySchema),
    defaultValues: {
      title: property?.title || "",
      description: property?.description || "",
      bedrooms: property?.bedrooms ?? 1,
      bathrooms: property?.bathrooms ?? 1,
      price: property?.price ?? 0,
      address: property?.address || "",
      city: property?.city || "",
      state: property?.state || "",
      zipCode: property?.zipCode || "",
      images: property?.images || [],
      documents: property?.documents
        ?.map(d => d.url ? decodeURIComponent(d.url) : '')
        .filter(url => url) || [],
      id: property?.id || undefined,
    },
  });

  const handleImageUpload = (urls: string[]) => {
    setValue("images", urls, { shouldValidate: true });
  };

  const handleImageRemove = (url: string) => {
    const currentImages = watch("images") || [];
    setValue("images", currentImages.filter(u => u !== url), { shouldValidate: true });
  };

  const handleDocumentUpload = (urls: string[]) => {
    setValue("documents", urls, { shouldValidate: true });
  };

  const handleDocumentRemove = (url: string) => {
    const currentDocs = watch("documents") || [];
    setValue("documents", currentDocs.filter(u => u !== url), { shouldValidate: true });
  };

 const processUploads = async (urls: string[], type: 'image' | 'document') => {
  return Promise.all(
    urls.map(async (url) => {
      // Skip processing for existing cloud URLs
      if (url.startsWith('http') && !url.startsWith('blob:')) {
        return url;
      }
      
      if (!url.startsWith("blob:")) {
        console.error('Invalid URL format:', url);
        return url;
      }

      try {
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
      } catch (error) {
        console.error('File upload error:', error);
        return url; // Return original URL if upload fails
      }
    })
  );
};

  const onSubmit = async (data: any) => {
    setFormError("");
    setIsSubmitting(true);
    const toastId = toast.loading(property ? "Updating property..." : "Creating property...");

    try {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <Input {...register("title")} placeholder="Property Title" />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea {...register("description")} placeholder="Property Description" />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Bedrooms</label>
          <Input
            type="number"
            min="1"
            {...register("bedrooms", { valueAsNumber: true })}
            defaultValue={1}
          />
          {errors.bedrooms && <p className="text-red-500 text-sm">{errors.bedrooms.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Bathrooms</label>
          <Input
            type="number"
            min="1"
            {...register("bathrooms", { valueAsNumber: true })}
            defaultValue={1}
          />
          {errors.bathrooms && <p className="text-red-500 text-sm">{errors.bathrooms.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Price ($/mo)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            defaultValue={0}
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Address</label>
        <Input {...register("address")} placeholder="Street Address" />
        {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <Input {...register("city")} placeholder="City" />
          {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">State</label>
          <Input {...register("state")} placeholder="State" />
          {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Zip Code</label>
          <Input {...register("zipCode")} placeholder="Zip Code" />
          {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode.message}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Property Images</label>
        <FileUpload
          onUpload={handleImageUpload}
          onRemove={handleImageRemove}
          initialFiles={watch("images")}
          accept="image/*"
          maxSize={10 * 1024 * 1024}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Property Documents</label>
        <DocumentUpload
          onUpload={handleDocumentUpload}
          onRemove={handleDocumentRemove}
          initialFiles={watch("documents")}
          maxSize={25 * 1024 * 1024}
        />
      </div>
      {formError && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{formError}</div>
      )}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting
          ? property
            ? "Updating..."
            : "Creating..."
          : property
          ? "Update Property"
          : "Create Property"}
      </Button>
    </form>
  );
}

async function convertBlobToFile(blobUrl: string): Promise<File> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new File([blob], "document", { type: blob.type });
}