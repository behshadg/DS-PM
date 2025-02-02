import { z } from 'zod'

export const PropertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  bedrooms: z.number().min(1, "At least 1 bedroom required"),
  bathrooms: z.number().min(1, "At least 1 bathroom required"),
  price: z.number().min(0, "Price cannot be negative"),
  address: z.string().min(5, "Enter a valid address"),
  city: z.string().min(2, "Enter a valid city"),
  state: z.string().length(2, "Use 2-letter state code"),
  zipCode: z.string().min(5, "Enter a valid ZIP code"),
  images: z.array(z.string()).min(1, "At least one image required")
})

export const TenantDocumentSchema = z.object({
  url: z.string().url(),
  documentType: z.string().optional(),
});

export const TenantSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Enter a valid phone number"),
  propertyId: z.string().min(1, "Property selection required"),
  documents: z.array(TenantDocumentSchema).optional()
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})