import express from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
} from "../controllers/productController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createProductSchema,
  deleteProductSchema,
  getProductsSchema,
} from "../validations/productSchemas.js";

const router = express.Router();

router.get("/", protect, validateRequest(getProductsSchema), getProducts);
router.post(
  "/",
  protect,
  authorizeRoles("organizer"),
  validateRequest(createProductSchema),
  createProduct,
);
router.delete(
  "/:id",
  protect,
  authorizeRoles("organizer", "admin"),
  validateRequest(deleteProductSchema),
  deleteProduct,
);

export default router;
