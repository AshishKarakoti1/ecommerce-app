import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes placeholder
app.get("/", (req, res) => {
  res.send("API is running...");
});

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB Connection Error:", err);
  });