// app/dashboard/tenants/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { TenantForm } from "components/tenant-form"; // adjust the import path as needed

export default function NewTenantPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <TenantForm onSuccess={() => router.push("/dashboard/tenants")} />
    </div>
  );
}
