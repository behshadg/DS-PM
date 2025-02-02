// components/tenant-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TenantSchema } from "@/lib/schema";
import { createTenant } from "@/actions/tenants";
import { Button } from "components/ui/button";
import { Form } from "components/ui/form";
import { Input } from "components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { useState } from "react";
import { FileUpload } from "components/file-upload";

interface DocumentData {
  url: string;
  documentType?: string;
}

interface TenantFormProps {
  onSuccess: () => void;
  properties: Array<{ id: string; address: string; city: string }>;
}

export function TenantForm({ onSuccess, properties }: TenantFormProps) {
  const form = useForm({
    resolver: zodResolver(TenantSchema),
  });

  // State to hold uploaded document data.
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [formError, setFormError] = useState("");

  async function onSubmit(values: any) {
    try {
      // Combine the form values with the documents array.
      const payload = { ...values, documents };
      await createTenant(payload);
      onSuccess();
    } catch (error) {
      console.error("Failed to create tenant:", error);
      setFormError(
        error instanceof Error ? error.message : "Failed to create tenant"
      );
    }
  }

  // Handler for uploading tenant documents.
  const handleDocumentUpload = async (urls: string[]) => {
    // For each uploaded file URL, create a DocumentData object.
    // (In production you might also collect a document type.)
    const newDocs = urls.map((url) => ({ url }));
    setDocuments((prev) => [...prev, ...newDocs]);
  };

  const handleDocumentRemove = (url: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.url !== url));
  };

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tenant basic fields */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <Input id="name" placeholder="Full Name" {...form.register("name")} />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input id="email" type="email" placeholder="Email" {...form.register("email")} />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <Input id="phone" placeholder="Phone Number" {...form.register("phone")} />
        </div>
        {/* Updated Property Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Property</label>
          <Select
            onValueChange={(value) => form.setValue("propertyId", value, { shouldValidate: true })}
            value={form.watch("propertyId") || ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.address}, {property.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.propertyId && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.propertyId.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Tenant Documents Upload Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Tenant Documents</label>
        <FileUpload
          onUpload={handleDocumentUpload}
          onRemove={handleDocumentRemove}
          initialFiles={documents.map((doc) => doc.url)}
        />
        {documents.length > 0 && (
          <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
            {documents.map((doc, index) => (
              <li key={index}>{doc.url}</li>
            ))}
          </ul>
        )}
      </div>

      {formError && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{formError}</div>
      )}

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving..." : "Save Tenant"}
      </Button>
    </Form>
  );
}
