import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    default: 10
  },
  messages: [
    {
      role: String,
      content: String
    }
  ],
  premium: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model("User", userSchema);