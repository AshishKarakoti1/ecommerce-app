import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import {
    createOrder, getOrderById, markOrderPaid, markOrderDelivered,
    getUserOrders, getAllOrders
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/myorders", protect, getUserOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/pay", protect, markOrderPaid);
router.put("/:id/deliver", protect, admin, markOrderDelivered);
router.get("/", protect, admin, getAllOrders);

export default router;