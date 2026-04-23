import { z } from "zod";

export const getEventsSchema = z.object({
  body: z.object({}).optional().default({}),
  query: z.object({
    search: z.string().optional().default(""),
    category: z.string().optional().default("All"),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(8),
  }),
  params: z.object({}).optional().default({}),
});

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(120),
    category: z.string().trim().min(2).max(80),
    city: z.string().trim().min(2).max(80),
    date: z.string().datetime(),
    description: z.string().trim().max(500).optional().default(""),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const deleteEventSchema = z.object({
  body: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid event id"),
  }),
});
