import { z } from "zod";

export const getProductsSchema = z.object({
  body: z.object({}).optional().default({}),
  query: z.object({
    search: z.string().optional().default(""),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(6),
  }),
  params: z.object({}).optional().default({}),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    type: z.string().trim().min(2).max(80),
    price: z.coerce.number().min(0),
    rating: z.coerce.number().min(0).max(5).optional().default(0),
    description: z.string().trim().max(500).optional().default(""),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const deleteProductSchema = z.object({
  body: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product id"),
  }),
});
