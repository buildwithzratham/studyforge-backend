import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: String,
  content: String
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "New Chat"
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: { type: Number, default: 10 },
  premium: { type: Boolean, default: false },
  conversations: [conversationSchema]
});

export default mongoose.model("User", userSchema);