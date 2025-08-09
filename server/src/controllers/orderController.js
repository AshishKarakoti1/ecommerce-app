import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// Create order from cart
export const createOrder = async (req, res) => {
    const {
        shippingAddress, paymentMethod, taxPrice = 0, shippingPrice = 0
    } = req.body;

    // fetch cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

    // compute prices
    const itemsPrice = cart.items.reduce((acc, i) => acc + i.price * i.qty, 0);
    const totalPrice = Number((itemsPrice + Number(taxPrice) + Number(shippingPrice)).toFixed(2));

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        // Decrement stock
        for (const item of cart.items) {
            const prod = await Product.findById(item.product).session(session);
            if (!prod) throw new Error(`Product ${item.product} not found`);
            if (prod.stock < item.qty) throw new Error(`Insufficient stock for ${prod.name}`);
            prod.stock -= item.qty;
            await prod.save({ session });
        }

        // Create order
        const order = await Order.create([{
            user: req.user._id,
            items: cart.items,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        }], { session });

        // Clear cart
        await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(order[0]);
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ message: err.message });
    }
};

// Get order by id (user or admin)
export const getOrderById = async (req, res) => {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (req.user.role !== "admin" && order.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
    }
    res.json(order);
};

// Mark order paid
export const markOrderPaid = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = req.body.paymentResult || {};
    order.status = "processing";
    await order.save();
    res.json(order);
};

// Admin: update to delivered
export const markOrderDelivered = async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = "delivered";
    await order.save();
    res.json(order);
};

// Get user orders
export const getUserOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
};

// Admin get all orders
export const getAllOrders = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Order.countDocuments();
    const orders = await Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "name email");
    res.json({ orders, page, pages: Math.ceil(total / limit), total });
};
