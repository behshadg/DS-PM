import { z } from "zod";

export const PropertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().default(""), // default to an empty string
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State must be 2-letter code"),
  zipCode: z.string().min(5, "Zip code must be 5 digits"),
  price: z.number().positive(),
  bedrooms: z.number().int().positive(),
  bathrooms: z.number().int().positive(),
  images: z.array(z.string()).optional().default([]),
  documents: z.array(z.string()).optional().default([]), // For additional document URLs
});

export const PropertyUpdateSchema = PropertySchema.extend({
  id: z.string().uuid(),
});
