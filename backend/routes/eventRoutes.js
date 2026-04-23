import express from "express";
import {
  createEvent,
  deleteEvent,
  getEvents,
} from "../controllers/eventController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createEventSchema,
  deleteEventSchema,
  getEventsSchema,
} from "../validations/eventSchemas.js";

const router = express.Router();

router.get("/", protect, validateRequest(getEventsSchema), getEvents);
router.post(
  "/",
  protect,
  authorizeRoles("organizer"),
  validateRequest(createEventSchema),
  createEvent,
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("organizer", "admin"),
  validateRequest(deleteEventSchema),
  deleteEvent,
);

export default router;
