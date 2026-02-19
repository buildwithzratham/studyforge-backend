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

app.get("/", (req, res) => {
  res.send("StudyForge backend running 🚀");
});

app.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 🔥 STEP 2 GOES HERE
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.credits <= 0) {
      return res.status(403).json({ error: "No credits left" });
    }


// Add new user message
user.messages.push({ role: "user", content: message });

// Keep only last 5 messages
if (user.messages.length > 5) {
  user.messages = user.messages.slice(-5);
}

const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: user.messages
});

const reply = completion.choices[0]?.message?.content || "";

// Save AI reply
user.messages.push({ role: "assistant", content: reply });

// Reduce credits
user.credits -= 1;

await user.save();

res.json({
  reply,
  credits: user.credits
});


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI failed" });
  }
});

   
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // 2️⃣ Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Wrong password" });
    }

    // 3️⃣ Create token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 4️⃣ Send token
    res.json({ token });

  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed
    });

    res.json({ message: "User created" });

  } catch (err) {
    res.status(500).json({ error: "Register failed" });
  }
});


const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
