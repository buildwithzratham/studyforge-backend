import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.get("/", (req, res) => {
  res.send("StudyForge backend running 🚀");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: message }
      ],
    });

    const reply = completion.choices[0]?.message?.content || "";

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI failed" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
