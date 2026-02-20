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

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ========= ROOT ========= */
app.get("/", (req, res) => {
  res.send("StudyForge Backend Running 🚀");
});

/* ========= CHAT ========= */
app.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.credits <= 0)
      return res.status(403).json({ error: "No credits left" });

    user.messages.push({ role: "user", content: message });

    const cleanMessages = user.messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: cleanMessages
    });

    const reply =
      completion.choices?.[0]?.message?.content || "No response";

    user.messages.push({ role: "assistant", content: reply });
    user.credits -= 1;

    await user.save();

    res.json({ reply, credits: user.credits });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI failed" });
  }
});

/* ========= HISTORY ========= */
app.get("/history", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    messages: user.messages,
    credits: user.credits
  });
});

/* ========= REGISTER ========= */
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashed
    });

    res.json({ message: "Registered successfully" });

  } catch {
    res.status(500).json({ error: "Register failed" });
  }
});

/* ========= LOGIN ========= */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on " + PORT));