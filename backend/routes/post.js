import express from "express";
import Post from "../models/Post.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all posts of logged-in user
router.get("/my-posts", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).sort({ scheduledAt: 1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

export default router;
