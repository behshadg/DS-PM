// ds-pm/app/types/index.ts
import { User, Property, Tenant } from "@prisma/client";
import "next-auth/jwt"

// Core type definitions
export type SafeUser = Omit<User, "password"> & {
  properties: Property[];
  tenants: Tenant[];
};

export type PropertyWithTenants = Property & {
  tenants: Tenant[];
};

export type TenantWithProperty = Tenant & {
  property: Property | null;
};

// NextAuth type extensions
declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email: string;
    properties?: Property[];
    tenants?: Tenant[];
  }

  interface Session {
    user: SafeUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
  }
}