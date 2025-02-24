import { z } from "zod";

const baseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  bedrooms: z.number().min(1, "At least 1 bedroom required"),
  bathrooms: z.number().min(1, "At least 1 bathroom required"),
  price: z.number().min(0, "Price must be positive"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State must be 2-letter code"),
  zipCode: z.string().min(5, "Invalid ZIP code"),
  images: z.array(z.string().url()).min(1, "At least 1 image required"),
  documents: z.array(z.string().url()).optional(),
});

export const PropertySchema = baseSchema;

export const PropertyUpdateSchema = baseSchema
  .omit({ images: true })
  .extend({
    images: z.array(z.string().url()), // Allow any array, including empty
    id: z.string(),
  });