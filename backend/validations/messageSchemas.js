import { z } from "zod";

export const sendMessageSchema = z.object({
  body: z.object({
    chatId: z.string().min(10),
    content: z.string().optional().default(""),
    messageType: z.enum(["text", "image", "file"]).optional().default("text"),
    fileUrl: z.string().url().optional(),
    fileName: z.string().optional(),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const markReadSchema = z.object({
  body: z.object({
    chatId: z.string().min(10),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const reactMessageSchema = z.object({
  body: z.object({
    messageId: z.string().min(10),
    emoji: z.string().min(1).max(8),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const deleteMessageSchema = z.object({
  body: z.object({
    messageId: z.string().min(10),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const editMessageSchema = z.object({
  body: z.object({
    messageId: z.string().min(10),
    content: z.string().trim().min(1).max(2000),
  }),
  query: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
});

export const allMessagesSchema = z.object({
  body: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
  params: z.object({
    chatId: z.string().min(10),
  }),
});
