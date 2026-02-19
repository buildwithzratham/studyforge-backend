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

app.get("/", (req, res) => {
  res.json({ message: "StudyForge backend running 🚀" });
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await cohere.chat({
      model: "command-r",
      message: message,
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating response" });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
