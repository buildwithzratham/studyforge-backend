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

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await cohere.chat({
      model: "command-r",
      messages: [
        {
          role: "user",
          content: message
        }
      ]
    });

    res.json({
      reply: response.message.content[0].text
    });

  } catch (error) {
    console.error("Cohere error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

