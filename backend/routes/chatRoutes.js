import express from "express";
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  accessChatSchema,
  createGroupSchema,
  groupMembershipSchema,
  renameGroupSchema,
} from "../validations/chatSchemas.js";

const router = express.Router();

router.post("/", protect, validateRequest(accessChatSchema), accessChat);
router.get("/", protect, fetchChats);
router.post("/group", protect, validateRequest(createGroupSchema), createGroupChat);
router.put("/rename", protect, validateRequest(renameGroupSchema), renameGroup);
router.put("/group-add", protect, validateRequest(groupMembershipSchema), addToGroup);
router.put(
  "/group-remove",
  protect,
  validateRequest(groupMembershipSchema),
  removeFromGroup,
);

export default router;
