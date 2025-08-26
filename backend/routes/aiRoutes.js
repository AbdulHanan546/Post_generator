// backend/routes/aiRoutes.js (FINAL VERSION with 3 variations)

import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("🔑 Gemini Key Loaded:", !!process.env.GEMINI_API_KEY);

router.post("/generate-post", async (req, res) => {
  try {
    const { topic, tone, platform } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    console.log("🔍 Incoming request for 3 posts:", { topic, tone, platform });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate 3 distinct social media posts. Each post should be for the platform '${platform}' with a '${tone}' tone, about the topic '${topic}'. Format the output as a JSON array of strings, like this: ["Post 1 text...", "Post 2 text...", "Post 3 text..."]. Do not include any other text or markdown formatting outside of this JSON array.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let textResponse = response.text();

    console.log("✅ Raw AI Response:", textResponse);

    // Clean up the response to ensure it's valid JSON
    // The model might sometimes add ```json ... ``` around the output
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    const posts = JSON.parse(textResponse);

    res.json({ posts: posts }); // Send the array of 3 posts

  } catch (error) {
    console.error("❌ AI Route Error:", error);
    res.status(500).json({ error: "Failed to generate posts", details: error.message });
  }
});

export default router;