import Product from "../models/Product.js";

// Create product (admin)
export const createProduct = async (req, res) => {
    try {
        const data = req.body;
        data.createdBy = req.user._id;
        const product = await Product.create(data);
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get product list with search, filter, pagination, sorting
export const getProducts = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const keyword = req.query.search
            ? { name: { $regex: req.query.search, $options: "i" } }
            : {};

        const categoryFilter = req.query.category ? { category: req.query.category } : {};
        const priceMin = req.query.priceMin ? { price: { $gte: Number(req.query.priceMin) } } : {};
        const priceMax = req.query.priceMax ? { price: { ...priceMin.price, $lte: Number(req.query.priceMax) } } : {};

        const filter = { ...keyword, ...categoryFilter, ...(priceMin.price || priceMax.price ? { price: {} } : {}) };
        if (priceMin.price) filter.price.$gte = priceMin.price.$gte;
        if (priceMax.price) filter.price.$lte = priceMax.price.$lte;

        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            products,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single product
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update product (admin)
export const updateProduct = async (req, res) => {
    try {
        const updates = req.body;
        const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete product (admin)
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product removed" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add review
export const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );
        if (alreadyReviewed) {
            return res.status(400).json({ message: "Product already reviewed by user" });
        }

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.numReviews;

        await product.save();
        res.status(201).json({ message: "Review added" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
