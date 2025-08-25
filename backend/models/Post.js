import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // AI generation context
  topic: { type: String, required: true },     
  tone: { 
    type: String, 
    enum: ["Professional", "Funny", "Casual", "Motivational"], 
    default: "Professional" 
  },

  // Generated captions (store multiple variations if needed)
  captions: [{ type: String, required: true }], 
  selectedCaption: { type: String },            

  // Scheduler
  platform: { type: String, enum: ["Instagram", "LinkedIn", "Twitter", "Facebook"], required: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ["draft", "scheduled", "published"], default: "draft" },

}, { timestamps: true });

export default mongoose.model("Post", postSchema);
