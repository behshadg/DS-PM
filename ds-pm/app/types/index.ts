// ds-pm/app/types/index.ts
import { User, Property, Tenant } from "@prisma/client";

// Core type definitions
export type SafeUser = Omit<User, "password"> & {
  properties: PropertyWithTenants[];
  tenants: Tenant[];
};

export type PropertyWithTenants = Property & {
  tenants: Tenant[];
  images: string[]; // explicitly include the images field
};

export type TenantWithProperty = Tenant & {
  property: Property | null;
};