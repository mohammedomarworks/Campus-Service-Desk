import * as z from "zod";
import { TicketStatus } from "@/generated/prisma/client";

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

export const ticketListQuerySchema = z.object({
  page: z.coerce
    .number({ error: "Page must be a number." })
    .int("Page must be an integer.")
    .min(1, "Page must be at least 1.")
    .default(1),

  limit: z.coerce
    .number({ error: "Limit must be a number." })
    .int("Limit must be an integer.")
    .min(1, "Limit must be at least 1.")
    .max(100, "Limit cannot exceed 100.")
    .default(10),

  status: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.nativeEnum(TicketStatus, {
      error: "Status must be a valid ticket status.",
    }).optional(),
  ),
});

export type TicketListQueryInput = z.infer<typeof ticketListQuerySchema>;