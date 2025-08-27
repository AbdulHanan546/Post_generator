import express from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();


// ✅ Create new post (draft or scheduled)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { topic, tone, captions, selectedCaption, platform, scheduledAt, status } = req.body;

    // Validate required fields
    if (!topic || !captions || captions.length === 0 || !platform || !scheduledAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate scheduled date
    if (new Date(scheduledAt) < new Date()) {
      return res.status(400).json({ error: "Scheduled date must be in the future" });
    }

    const post = new Post({
      user: req.user.id,
      topic,
      tone,
      captions,
      selectedCaption,
      platform,
      scheduledAt,
      status: status || "draft",
    });

    await post.save();
    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post", details: error.message });
  }
});


// ✅ Get all posts for logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).sort({ scheduledAt: 1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts", details: error.message });
  }
});


// ✅ Update a post
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Post ID" });
    }

    let post = await Post.findOne({ _id: id, user: req.user.id });
    if (!post) {
      return res.status(404).json({ error: "Post not found or unauthorized" });
    }

    post = await Post.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, post });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Failed to update post", details: error.message });
  }
});


// ✅ Delete a post
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Post ID" });
    }

    const post = await Post.findOneAndDelete({ _id: id, user: req.user.id });
    if (!post) {
      return res.status(404).json({ error: "Post not found or unauthorized" });
    }

    res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Failed to delete post", details: error.message });
  }
});

router.get("/calendar", verifyToken, async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ error: "start and end query params required (ISO dates)" });

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate) || isNaN(endDate)) return res.status(400).json({ error: "Invalid start or end date" });
    if (startDate > endDate) return res.status(400).json({ error: "start must be <= end" });

    const posts = await Post.find({
      user: req.user.id,
      scheduledAt: { $gte: startDate, $lte: endDate }
    }).sort({ scheduledAt: 1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error("Calendar fetch error:", err);
    res.status(500).json({ error: "Failed to fetch calendar posts", details: err.message });
  }
});


router.get("/calendar/summary", verifyToken, async (req, res) => {
  try {
    const { start, end, includePosts } = req.query;
    if (!start || !end) return res.status(400).json({ error: "start and end query params required (ISO dates)" });

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate) || isNaN(endDate)) return res.status(400).json({ error: "Invalid start or end date" });
    if (startDate > endDate) return res.status(400).json({ error: "start must be <= end" });

    const pipeline = [
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), scheduledAt: { $gte: startDate, $lte: endDate } } },
      { $addFields: {
          year: { $year: "$scheduledAt" },
          month: { $month: "$scheduledAt" },
          day: { $dayOfMonth: "$scheduledAt" }
        }
      },
      { $group: {
          _id: { year: "$year", month: "$month", day: "$day" },
          count: { $sum: 1 },
          posts: { $push: "$$ROOT" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ];

    const agg = await Post.aggregate(pipeline);

    const result = agg.map(item => {
      const { year, month, day } = item._id;
      // convert to YYYY-MM-DD (UTC)
      const dateISO = new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
      return {
        date: dateISO,
        count: item.count,
        posts: includePosts === "true" ? item.posts : undefined
      };
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Calendar summary error:", err);
    res.status(500).json({ error: "Failed to fetch calendar summary", details: err.message });
  }
});


export default router;
