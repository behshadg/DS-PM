// ds-pm/app/types/index.ts
import { User, Property, Tenant, PropertyDocument } from "@prisma/client";

export type SafeUser = Omit<User, "password"> & {
  properties: PropertyWithTenants[];
  tenants: Tenant[];
};

export type PropertyWithTenants = Property & {
  tenants: Tenant[];
  images: string[];
  documents: PropertyDocument[]; // Add documents to existing type
};

export type TenantWithProperty = Tenant & {
  property: Property | null;
};

export type PropertyWithDocuments = Property & {
  documents: PropertyDocument[];
  images: string[];
  tenants: Tenant[]; // Maintain tenant relationship
};