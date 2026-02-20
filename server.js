import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "./models/User.js";
import { authMiddleware } from "./middleware/auth.js";

dotenv.config();

/* ================= ENV CHECK ================= */
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in environment");
  process.exit(1);
}
if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY missing in environment");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET missing in environment");
  process.exit(1);
}

/* ================= MONGO ================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ Mongo Error:", err);
    process.exit(1);
  });

/* ================= APP ================= */
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ================= GROQ ================= */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.send("StudyForge backend running 🚀");
});

/* ================= CHAT ================= */
app.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.credits <= 0) {
      return res.status(403).json({ error: "No credits left" });
    }

    // Save user message
    user.messages.push({ role: "user", content: message });

    // Limit memory
    if (user.messages.length > 10) {
      user.messages = user.messages.slice(-10);
    }

    /* ===== GROQ REQUEST ===== */
    // Remove Mongo _id fields before sending to Groq
const cleanMessages = user.messages.map(msg => ({
  role: msg.role,
  content: msg.content
}));

const completion = await groq.chat.completions.create({
  model: "llama3-8b-8192",
  messages: cleanMessages,
  temperature: 0.7,
});

    const reply =
      completion.choices?.[0]?.message?.content || "No response from AI";

    // Save assistant reply
    user.messages.push({ role: "assistant", content: reply });

    user.credits -= 1;
    await user.save();

    return res.json({
      reply,
      credits: user.credits,
    });

  } catch (err) {
    console.error("🔥 CHAT ERROR:", err.message);
    return res.status(500).json({
      error: "AI failed",
      details: err.message,
    });
  }
});

/* ================= HISTORY ================= */
app.get("/history", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      messages: user.messages || [],
      credits: user.credits || 0,
    });

  } catch (err) {
    console.error("🔥 HISTORY ERROR:", err.message);
    res.status(500).json({ error: "Failed to load history" });
  }
});

/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashed,
    });

    res.json({ message: "User created successfully" });

  } catch (err) {
    console.error("🔥 REGISTER ERROR:", err.message);
    res.status(500).json({ error: "Register failed" });
  }
});

/* ================= LOGIN ================= */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    console.error("🔥 LOGIN ERROR:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ================= START ================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});