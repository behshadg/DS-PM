// ds-pm/app/types/index.ts
import { User, Property, Tenant, PropertyDocument } from "@prisma/client";

// Core type definitions
export type SafeUser = Omit<User, "password"> & {
  properties: (PropertyWithTenants | PropertyWithDocuments)[];
  tenants: Tenant[];
};

export type PropertyWithTenants = Property & {
  tenants: Tenant[];
  images: string[];
};

export type PropertyWithDocuments = Property & {
  documents: PropertyDocument[];
  images: string[];
};

export type TenantWithProperty = Tenant & {
  property: Property | null;
};

// Extended types for full property details
export type FullProperty = Property & {
  tenants: Tenant[];
  documents: PropertyDocument[];
  images: string[];
};

// Helper type for document management
export type PropertyDocumentWithUrl = PropertyDocument & {
  previewUrl?: string;
  downloadUrl?: string;
};