import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { CohereClient } from "cohere-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Root route (test)
app.get("/", (req, res) => {
  res.send("StudyForge backend running 🚀");
});



const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await cohere.chat({
      model: "command-r",
      message: message,
    });

    res.json({
      reply: response.text,
    });

} catch (error) {
  console.error("Cohere Error:", error.response?.data || error.message);
  res.status(500).json({ error: error.message });
}
  
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
