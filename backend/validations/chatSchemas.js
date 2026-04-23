import { z } from "zod";

export const accessChatSchema = z.object({
  body: z.object({
    userId: z.string().min(10),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    users: z.union([z.string().min(2), z.array(z.string().min(10))]),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const renameGroupSchema = z.object({
  body: z.object({
    chatId: z.string().min(10),
    chatName: z.string().trim().min(2).max(80),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const groupMembershipSchema = z.object({
  body: z.object({
    chatId: z.string().min(10),
    userId: z.string().min(10),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});
