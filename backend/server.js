import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import aiRoutes from "./routes/aiRoutes.js";

import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/post.js";

dotenv.config();
const app = express();

// Middleware
const corsOptions = {
  origin: [
    "https://post-generator-psi-two.vercel.app", // production
    "http://localhost:3000",              // local dev
  ],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/ai", aiRoutes);


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
