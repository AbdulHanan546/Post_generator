import express from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get posts by user
router.get("/", verifyToken, async (req, res) => {
  try {
    const { user } = req.query;

    if (!user) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ error: "Invalid User ID" });
    }

    // Fetch posts for the user
    const posts = await Post.find({ user }).populate("user", "name email");

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts", details: error.message });
  }
});

export default router;
