// server.js
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createCompletion, loadModel } from "gpt4all";
import { fetchWebAnswer } from "./search.js";
import fetch from "node-fetch"; // for downloading model

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend dist folder
const distPath = path.join(__dirname, "chatbot-project", "dist");
app.use(express.static(distPath));

// ── Model setup (LOCAL ONLY) ───────────────────────────────────────────
const modelsDir = path.join(__dirname, "models");
if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir);

const modelFilename = "orca-mini-3b-gguf2-q4_0.gguf";
const modelFilePath = path.join(modelsDir, modelFilename);
const modelLink =
  process.env.MODEL_URL ||
  "https://huggingface.co/nuradHub/orca-mini-3b-gguf2-q4_0.gguf/resolve/main/orca-mini-3b-gguf2-q4_0.gguf";

// Ensure model exists
async function ensureModelExists() {
  if (!fs.existsSync(modelFilePath)) {
    console.log("❌ Model file not found locally. Downloading...");
    const res = await fetch(modelLink);
    if (!res.ok) throw new Error(`Failed to download model: ${res.statusText}`);

    const fileStream = fs.createWriteStream(modelFilePath);
    await new Promise((resolve, reject) => {
      res.body.pipe(fileStream);
      res.body.on("error", reject);
      fileStream.on("finish", resolve);
    });
    console.log("✅ Model downloaded successfully.");
  } else {
    console.log("✅ Model found locally:", modelFilePath);
  }
}

const modelConfigFile = path.join(modelsDir, "models3.json");
if (!fs.existsSync(modelConfigFile)) {
  console.error(
    "❌ models3.json not found at:",
    modelConfigFile,
    "\nDownload it once with:\n curl -L https://gpt4all.io/models/models3.json -o " +
      modelConfigFile
  );
  process.exit(1);
}

let model;
const conversationHistoryMap = new Map(); // key: userId, value: array of conversation lines
const cacheMap = new Map(); // key: userId, value: Map(message -> reply)

// Load model
async function initModelWrapper() {
  try {
    await ensureModelExists();
    console.log("⏳ Loading model, please wait...");
    model = await loadModel(modelFilename, {
      verbose: true,
      modelPath: modelsDir,
      modelConfigFile,
      allowDownload: false,
    });
    console.log("✅ Model loaded successfully (offline)");
  } catch (err) {
    console.error("❌ Failed to load model:", err);
  }
}
initModelWrapper();

// Check if message needs web search
function needsWebSearch(message) {
  const keywords = [
    "current", "today", "latest", "breaking", "recent",
    "president", "prime minister", "governor", "who is", "what is", "when is",
    "news", "update", "happening", "event",
    "sports", "match", "score", "football", "basketball",
    "weather", "temperature", "forecast", "climate",
    "finance", "stock", "market", "crypto", "bitcoin", "naira", "usd"
  ];
  const lowerMsg = message.toLowerCase();
  return keywords.some(kw => lowerMsg.includes(kw));
}

// ── Chat endpoint ─────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!model) return res.status(503).json({ error: "Model not ready" });
    if (!message || !userId) return res.status(400).json({ error: "userId and message required" });

    // Initialize per-user storage
    if (!conversationHistoryMap.has(userId)) conversationHistoryMap.set(userId, []);
    if (!cacheMap.has(userId)) cacheMap.set(userId, new Map());

    const conversationHistory = conversationHistoryMap.get(userId);
    const cache = cacheMap.get(userId);

    conversationHistory.push(`User: ${message}`);

    // Check cached response
    if (cache.has(message)) {
      const cached = cache.get(message);
      conversationHistory.push(`AI: ${cached}`);
      if (conversationHistory.length > 20) {
        conversationHistoryMap.set(userId, conversationHistory.slice(-20));
      }
      return res.json({ response: cached, history: conversationHistory });
    }

    const doWebSearch = needsWebSearch(message);
    const recentHistory = conversationHistory.slice(-2).join("\n");
    const prompt = `
You are an AI assistant that answers concisely.
${recentHistory}
User: ${message}
AI:
`.trim();

    const gptResponse = await createCompletion(model, prompt, {
      nPredict: 40,
      temperature: 0.6,
      topK: 20,
    });

    let reply = gptResponse?.choices?.[0]?.message?.content
             ?? gptResponse?.choices?.[0]?.message
             ?? "Could not generate response.";
    reply = String(reply).replace(/\s+/g, " ").trim();

    conversationHistory.push(`AI: ${reply}`);
    cache.set(message, reply);

    if (conversationHistory.length > 20) {
      conversationHistoryMap.set(userId, conversationHistory.slice(-20));
    }

    res.json({ response: reply, history: conversationHistory });

    if (doWebSearch) {
      fetchWebAnswer(message, 5)
        .then(webAnswer => {
          if (webAnswer && webAnswer.trim() !== "") {
            console.log("🔎 Web info fetched async:", webAnswer.split("\n").slice(0, 2).join(" "));
          }
        })
        .catch(err => console.error("Web search error:", err));
    }

  } catch (err) {
    console.error("❌ Error generating response:", err);
    res.status(500).json({ error: "Failed to generate response", details: err.message });
  }
});

// Get chat history for a user
app.get("/api/history/:userId", (req, res) => {
  const { userId } = req.params;
  const conversationHistory = conversationHistoryMap.get(userId) || [];
  const pairedHistory = [];
  let tempUser = null;

  conversationHistory.forEach((line) => {
    if (line.startsWith("User: ")) {
      tempUser = line.replace("User: ", "");
    } else if (line.startsWith("AI: ") && tempUser !== null) {
      pairedHistory.push({ user: tempUser, robot: line.replace("AI: ", "") });
      tempUser = null;
    }
  });

  pairedHistory.reverse();
  res.json({ history: pairedHistory });
});

// Reset chat history for a user
app.post("/api/reset", (req, res) => {
  const { userId } = req.body;
  if (userId) {
    conversationHistoryMap.set(userId, []);
    cacheMap.set(userId, new Map());
  }
  res.json({ success: true, message: "Conversation history cleared" });
});

// Catch-all: serve index.html for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
