"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PropertyUpdateSchema } from "@/lib/propertySchemas";
import { updateProperty } from "@/actions/properties";
import { Form } from "components/ui/form";
import { Input } from "components/ui/input";
import { Button } from "components/ui/button";
import { Textarea } from "components/ui/textarea";
import { FileUpload } from "components/file-upload";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EditPropertyFormProps {
  initialData: any;
}

export default function EditPropertyForm({ initialData }: EditPropertyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const form = useForm({
    resolver: zodResolver(PropertyUpdateSchema),
    defaultValues: {
      ...initialData,
      documents: initialData.documents?.map((d: any) => d.url) || [],
    },
  });

  useEffect(() => {
    form.reset({
      ...initialData,
      documents: initialData.documents?.map((d: any) => d.url) || [],
    });
  }, [initialData, form]);

  const handleImageUpload = (urls: string[]) => {
    form.setValue("images", urls, { shouldValidate: true });
  };

  const handleImageRemove = (url: string) => {
    const currentImages = form.getValues("images");
    const newImages = currentImages.filter((u: string) => u !== url);
    form.setValue("images", newImages, { shouldValidate: true });
  };

  const handleDocumentUpload = (urls: string[]) => {
    form.setValue("documents", urls, { shouldValidate: true });
  };

  const handleDocumentRemove = (url: string) => {
    const currentDocs = form.getValues("documents");
    const newDocs = currentDocs.filter((u: string) => u !== url);
    form.setValue("documents", newDocs, { shouldValidate: true });
  };

  async function convertBlobUrlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const handleSubmit = async (data: any) => {
    setFormError("");
    setIsSubmitting(true);
    const toastId = toast.loading("Updating property...");

    try {
      const [uploadedImages, uploadedDocs] = await Promise.all([
        Promise.all(
          data.images.map(async (url: string) => {
            if (url.startsWith("blob:")) {
              const base64Image = await convertBlobUrlToBase64(url);
              const response = await fetch("/api/upload", {
                method: "POST",
                body: JSON.stringify({ image: base64Image }),
                headers: { "Content-Type": "application/json" },
              });
              const result = await response.json();
              if (!response.ok) throw new Error(result.error || "Image upload failed");
              return result.url;
            }
            return url;
          })
        ),
        Promise.all(
          data.documents.map(async (url: string) => {
            if (url.startsWith("blob:")) {
              const response = await fetch(url);
              const blob = await response.blob();
              const formData = new FormData();
              formData.append("file", blob);
              
              const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                body: formData,
              });
              const result = await uploadResponse.json();
              if (!uploadResponse.ok) throw new Error(result.error || "Document upload failed");
              return result.url;
            }
            return url;
          })
        ),
      ]);

      const updated = await updateProperty({ 
        ...data,
        images: uploadedImages,
        documents: uploadedDocs,
      });

      if (updated?.error) throw new Error(updated.error);

      toast.success("Property updated successfully", { id: toastId });
      router.push(`/dashboard/properties/${data.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update property";
      setFormError(message);
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-6"
    >
      <input type="hidden" {...form.register("id")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Keep all your existing form fields the same */}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Property Images</label>
        <FileUpload
          onUpload={handleImageUpload}
          onRemove={handleImageRemove}
          initialFiles={form.watch("images")}
          accept="image/*"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Property Documents</label>
        <FileUpload
          onUpload={handleDocumentUpload}
          onRemove={handleDocumentRemove}
          initialFiles={form.watch("documents")}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
        />
      </div>

      {formError && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{formError}</div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Updating Property..." : "Update Property"}
      </Button>
    </Form>
  );
}