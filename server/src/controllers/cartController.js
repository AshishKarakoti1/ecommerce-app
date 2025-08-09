import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Get user's cart
export const getCart = async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "stock");
    res.json(cart || { user: req.user._id, items: [] });
};

// Add/update an item in cart
export const upsertCartItem = async (req, res) => {
    const { productId, qty } = req.body;
    if (!productId || !qty) return res.status(400).json({ message: "productId and qty required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < qty) return res.status(400).json({ message: "Not enough stock" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx > -1) {
        cart.items[idx].qty = qty;
        cart.items[idx].price = product.price;
    } else {
        cart.items.push({
            product: product._id,
            name: product.name,
            image: product.images?.[0]?.url || "",
            price: product.price,
            qty
        });
    }

    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
};

// Remove item
export const removeCartItem = async (req, res) => {
    const { productId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
};

// Clear cart
export const clearCart = async (req, res) => {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { new: true, upsert: true });
    res.json({ message: "Cart cleared" });
};
