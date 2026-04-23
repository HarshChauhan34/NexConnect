import express from "express";
import {
  sendMessage,
  allMessages,
  uploadChatFile,
  markMessagesAsRead,
  reactToMessage,
  deleteMessage,
  editMessage,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../config/cloudinaryMulter.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  allMessagesSchema,
  deleteMessageSchema,
  editMessageSchema,
  markReadSchema,
  reactMessageSchema,
  sendMessageSchema,
} from "../validations/messageSchemas.js";

const router = express.Router();

router.post("/upload", protect, upload.single("file"), uploadChatFile);
router.post("/read", protect, validateRequest(markReadSchema), markMessagesAsRead);
router.post("/react", protect, validateRequest(reactMessageSchema), reactToMessage);
router.post("/", protect, validateRequest(sendMessageSchema), sendMessage);
router.put("/", protect, validateRequest(editMessageSchema), editMessage);
router.delete("/", protect, validateRequest(deleteMessageSchema), deleteMessage);
router.get("/:chatId", protect, validateRequest(allMessagesSchema), allMessages);

export default router;
