import cloudinary from "../config/cloudinary.js";

// Single image upload
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const result = await cloudinary.uploader.upload_stream(
            { folder: "techshop_products" },
            (error, uploaded) => {
                if (error) return res.status(500).json({ message: error.message });
                res.status(200).json({
                    url: uploaded.secure_url,
                    public_id: uploaded.public_id
                });
            }
        );

        result.end(req.file.buffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete image
export const deleteImage = async (req, res) => {
    try {
        const { public_id } = req.body;
        if (!public_id) return res.status(400).json({ message: "public_id is required" });

        await cloudinary.uploader.destroy(public_id);
        res.json({ message: "Image deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
