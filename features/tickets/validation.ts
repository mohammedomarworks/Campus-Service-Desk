import * as z from "zod";

export const createTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(120, "Title must be 120 characters or fewer."),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(5000, "Description must be 5000 characters or fewer."),

  categoryId: z
    .string()
    .uuid("Invalid category."),

  locationId: z
    .string()
    .uuid("Invalid location."),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;