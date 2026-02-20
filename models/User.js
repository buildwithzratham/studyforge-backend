import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: { type: Number, default: 100 },
  totalMessages: { type: Number, default: 0 },
totalTokensUsed: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  messages: [
    {
      role: String,
      content: String
    }
  ]
});

export default mongoose.model("User", userSchema);
