import { User, Property, Tenant, PropertyDocument } from '@prisma/client';

export type SafeUser = Omit<User, 'password'> & {
  properties: PropertyWithTenants[];
  tenants: TenantWithProperty[];
};

export type PropertyWithTenants = Property & {
  tenants: Tenant[];
  images: string[];
  documents: PropertyDocument[];
};

export type TenantWithProperty = Tenant & {
  property: Property | null;
};

export type PropertyWithDocuments = Property & {
  documents: PropertyDocument[];
  images: string[];
  tenants: Tenant[];
};