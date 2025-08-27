// backend/models/Post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  topic: { type: String, required: true },
  tone: { 
    type: String, 
    enum: ["Professional", "Funny", "Casual", "Motivational"], 
    default: "Professional" 
  },

  captions: [{ type: String, required: true }],
  selectedCaption: { type: String },

  platform: { type: String, enum: ["Instagram", "LinkedIn", "Twitter", "Facebook"], required: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ["draft", "scheduled", "published"], default: "draft" },

}, { timestamps: true });

// Index for fast date-range queries per user
postSchema.index({ user: 1, scheduledAt: 1 });

// nice toJSON transform (optional but handy)
postSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

export default mongoose.model("Post", postSchema);
