// components/DashboardContent.tsx
"use client";

import Link from "next/link";
import { Button } from "components/ui/button";
import { PropertyWithTenants, TenantWithProperty } from "@/types";

type DashboardContentProps = {
  user: {
    name?: string;
    properties: (PropertyWithTenants | {
      id: string;
      address: string;
      title: string;
      description: string;
      state: string;
      bedrooms: number;
      bathrooms: number;
      price: number;
      city: string;
      zipCode: string;
      images: string[];
      createdAt: string; // or Date, as appropriate
      updatedAt: string;
      ownerId: string;
      // In case tenants isn’t included, default to an empty array.
      tenants?: TenantWithProperty[];
    })[];
    tenants: TenantWithProperty[];
  };
};

export default function DashboardContent({ user }: DashboardContentProps) {
  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Welcome back, {user.name || "User"}
        </h1>
        <div className="space-x-4">
          <Link href="/dashboard/properties/new">
            <Button>Add Property</Button>
          </Link>
          <Link href="/dashboard/tenants/new">
            <Button variant="outline">Add Tenant</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Properties Section */}
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Properties</h2>
          {user.properties.length === 0 ? (
            <div className="text-muted-foreground">
              No properties yet. Add your first property to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {user.properties.map((property) => {
                // Ensure tenants is always an array.
                const tenants = property.tenants ?? [];
                return (
                  <div
                    key={property.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <h3 className="font-medium">{property.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {property.address}, {property.city}
                    </p>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span>{property.bedrooms} beds</span>
                      <span>{property.bathrooms} baths</span>
                      <span>${property.price}/mo</span>
                    </div>
                    {tenants.length > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">
                          Tenants:{" "}
                        </span>
                        {tenants.map((tenant) => (
                          <span key={tenant.id} className="mr-2">
                            {tenant.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tenants Section */}
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Active Tenants</h2>
          {user.tenants.length === 0 ? (
            <div className="text-muted-foreground">
              No tenants yet. Add tenants to your properties.
            </div>
          ) : (
            <div className="space-y-4">
              {user.tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-medium">{tenant.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {tenant.email} · {tenant.phone}
                  </p>
                  {tenant.property && (
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">
                        Property:{" "}
                      </span>
                      <Link
                        href={`/dashboard/properties/${tenant.property.id}`}
                        className="text-primary hover:underline"
                      >
                        {tenant.property.title}
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
