import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const { text } = await generateText({
     model: groq("llama-3.1-8b-instant"),
      prompt: message,
    });

    res.json({ reply: text });

  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({ error: "AI failed" });
  }
});

app.get("/", (req, res) => {
  res.send("StudyForge AI Backend Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
