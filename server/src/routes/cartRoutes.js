import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getCart, upsertCartItem, removeCartItem, clearCart } from "../controllers/cartController.js";

const router = express.Router();
router.get("/", protect, getCart);
router.post("/", protect, upsertCartItem);
router.delete("/item/:productId", protect, removeCartItem);
router.delete("/", protect, clearCart);

export default router;
