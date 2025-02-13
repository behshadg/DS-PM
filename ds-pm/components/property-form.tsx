"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createProperty } from "@/actions/properties";
import { Form } from "components/ui/form";
import { Input } from "components/ui/input";
import { Button } from "components/ui/button";
import { Textarea } from "components/ui/textarea";
import { FileUpload } from "components/file-upload";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PropertySchema } from "@/lib/schema";

interface PropertyFormProps {
  onSuccess?: () => void;
}

export function PropertyForm({ onSuccess }: PropertyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const form = useForm({
    resolver: zodResolver(PropertySchema),
    defaultValues: {
      title: "",
      description: "",
      bedrooms: 1,
      bathrooms: 1,
      price: 0,
      address: "",
      city: "",
      state: "",
      zipCode: "",
      images: [],
    },
  });

  const handleImageUpload = (urls: string[]) => {
    form.setValue("images", urls, { shouldValidate: true });
  };

  const handleImageRemove = (url: string) => {
    const currentImages = form.getValues("images");
    const newImages = currentImages.filter((u: string) => u !== url);
    form.setValue("images", newImages, { shouldValidate: true });
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
    const toastId = toast.loading("Creating property...");

    try {
      const imagesToProcess = data.images || [];

      // Process images only if there are any
      const uploadedUrls = imagesToProcess.length > 0 
        ? await Promise.all(
            imagesToProcess.map(async (url: string) => {
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
          )
        : [];

      const result = await createProperty({ 
        ...data,
        images: uploadedUrls,
        price: Number(data.price),
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
      });

      if (!result.success) throw new Error(result.error);

      toast.success("Property created successfully", { id: toastId });
      router.push("/dashboard/properties");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create property";
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <Input id="title" placeholder="Modern Apartment" {...form.register("title")} />
          {form.formState.errors.title && (
            <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <Input id="address" placeholder="123 Main St" {...form.register("address")} />
          {form.formState.errors.address && (
            <p className="text-red-500 text-sm">{form.formState.errors.address.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <Input id="city" placeholder="New York" {...form.register("city")} />
          {form.formState.errors.city && (
            <p className="text-red-500 text-sm">{form.formState.errors.city.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State
          </label>
          <Input id="state" placeholder="NY" maxLength={2} {...form.register("state")} />
          {form.formState.errors.state && (
            <p className="text-red-500 text-sm">{form.formState.errors.state.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
            Zip Code
          </label>
          <Input id="zipCode" placeholder="10001" {...form.register("zipCode")} />
          {form.formState.errors.zipCode && (
            <p className="text-red-500 text-sm">{form.formState.errors.zipCode.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
            Bedrooms
          </label>
          <Input
            id="bedrooms"
            type="number"
            placeholder="3"
            min={1}
            {...form.register("bedrooms", { valueAsNumber: true })}
          />
          {form.formState.errors.bedrooms && (
            <p className="text-red-500 text-sm">{form.formState.errors.bedrooms.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
            Bathrooms
          </label>
          <Input
            id="bathrooms"
            type="number"
            placeholder="2"
            min={1}
            {...form.register("bathrooms", { valueAsNumber: true })}
          />
          {form.formState.errors.bathrooms && (
            <p className="text-red-500 text-sm">{form.formState.errors.bathrooms.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <Input
            id="price"
            type="number"
            placeholder="2500"
            min={0}
            {...form.register("price", { valueAsNumber: true })}
          />
          {form.formState.errors.price && (
            <p className="text-red-500 text-sm">{form.formState.errors.price.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          id="description"
          placeholder="Beautiful modern apartment in the heart of the city"
          {...form.register("description")}
        />
      </div>

      <FileUpload
        onUpload={handleImageUpload}
        onRemove={handleImageRemove}
        initialFiles={form.watch("images")}
      />

      {formError && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">{formError}</div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating Property..." : "Create Property"}
      </Button>
    </Form>
  );
}