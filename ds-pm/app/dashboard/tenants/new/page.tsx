// app/dashboard/tenants/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { TenantForm } from "components/tenant-form";
import { useEffect, useState } from "react";

interface Property {
  id: string;
  address: string;
  city: string;
  // Add other fields you might need from your Property type
}

export default function NewTenantPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties');
        if (response.ok) {
          const data = await response.json();
          setProperties(data);
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) return <div>Loading properties...</div>;

  return (
    <div className="p-6">
      <TenantForm 
        onSuccess={() => router.push("/dashboard/tenants")} 
        properties={properties.map(p => ({
          id: p.id,
          address: p.address,
          city: p.city
        }))}
      />
    </div>
  );
}