import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8)
  .max(64)
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/\d/, "Password must include a number")
  .regex(/[^A-Za-z\d]/, "Password must include a special character");

const emailSchema = z.string().email().transform((value) => value.trim().toLowerCase());

const roleSchema = z.enum(["admin", "user", "organizer"]);

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: emailSchema,
    password: passwordSchema,
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const adminCreateUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: emailSchema,
    password: passwordSchema,
    role: roleSchema,
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    password: passwordSchema,
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    email: emailSchema.optional(),
    bio: z.string().max(400).optional(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const organizerRequestSchema = z.object({
  body: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const organizerReviewSchema = z.object({
  body: z.object({
    action: z.enum(["approve", "reject"]),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({
    userId: z.string().min(10),
  }),
});
