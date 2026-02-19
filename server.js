import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { CohereClient } from "cohere-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// Root route
app.get("/", (req, res) => {
  res.send("StudyForge backend running 🚀");
});

app.post("/chat", async (req, res) => {
  try {
    console.log("Incoming body:", req.body);

    if (!req.body || !req.body.message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const userMessage = req.body.message;

   const response = await cohere.chat({
  model: "command-r",
  message: userMessage,
});

    res.json({
      reply: response.text,
    });

  } catch (error) {
    console.error("Cohere FULL error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

