// In TenantForm.tsx (make sure this file has "use client"; at the top)
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TenantSchema } from "@/lib/schema";
import { createTenant } from "@/actions/tenants";
import { Button } from "components/ui/button";
import { Form } from "components/ui/form";
import { Input } from "components/ui/input";
import { useRouter } from "next/navigation";

export function TenantForm() {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(TenantSchema),
  });

  async function onSubmit(values: any) {
    try {
      await createTenant(values);
      // Navigate on success from within the component.
      router.push("/dashboard/tenants");
    } catch (error) {
      console.error("Failed to create tenant:", error);
    }
  }

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div>
          <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700">
            Property ID
          </label>
          <Input id="propertyId" placeholder="Property" {...form.register("propertyId")} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving..." : "Save Tenant"}
      </Button>
    </Form>
  );
}
