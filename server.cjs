var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");
var import_meta = {};
import_dotenv.default.config();
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  app.use(import_express.default.json());
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      version: "5.3.0",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime()
    });
  });
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  };
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, prompt } = req.body;
      const ai = getAiClient();
      if (!ai) {
        return res.status(503).json({
          error: "GEMINI_API_KEY \u067E\u06CC\u06A9\u0631\u0628\u0646\u062F\u06CC \u0646\u0634\u062F\u0647 \u0627\u0633\u062A.",
          fallback: true
        });
      }
      const contents = [];
      if (Array.isArray(messages) && messages.length > 0) {
        let hasUserStarted = false;
        let lastRole = null;
        for (const msg of messages) {
          const role = msg.sender === "user" ? "user" : "model";
          if (!hasUserStarted && role !== "user") {
            continue;
          }
          hasUserStarted = true;
          const textVal = String(msg.text || "").trim();
          if (!textVal) continue;
          if (role === lastRole && contents.length > 0) {
            contents[contents.length - 1].parts[0].text += "\n" + textVal;
          } else {
            contents.push({
              role,
              parts: [{ text: textVal }]
            });
            lastRole = role;
          }
        }
      }
      if (contents.length === 0 && prompt) {
        contents.push({
          role: "user",
          parts: [{ text: String(prompt).trim() }]
        });
      }
      if (contents.length === 0) {
        return res.status(400).json({ error: "\u067E\u06CC\u0627\u0645\u06CC \u0628\u0631\u0627\u06CC \u0627\u0631\u0633\u0627\u0644 \u0627\u0631\u0633\u0627\u0644 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A." });
      }
      const systemInstruction = `\u0634\u0645\u0627 \xABBlue AI Intelligence\xBB \u0647\u0633\u062A\u06CC\u062F\u061B \u0645\u063A\u0632 \u0645\u062A\u0641\u06A9\u0631 \u0648 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u0647\u0645\u0647\u200C\u0641\u0646\u200C\u062D\u0631\u06CC\u0641\u060C \u0628\u06CC\u200C\u0646\u0647\u0627\u06CC\u062A \u0628\u0627\u0647\u0648\u0634\u060C \u062F\u0642\u06CC\u0642\u060C \u0622\u06AF\u0627\u0647\u060C \u062E\u0648\u0634\u200C\u0628\u0631\u062E\u0648\u0631\u062F \u0648 \u0628\u062F\u0648\u0646 \u0646\u0642\u0635 \u0628\u0631\u0627\u06CC \u0645\u0647\u0646\u062F\u0633 \u0627\u0645\u06CC\u0631\u0631\u0636\u0627 \u0646\u0631\u06CC\u0645\u0627\u0646\u06CC \u062F\u0631 \u0633\u06CC\u0633\u062A\u0645\u200C\u0639\u0627\u0645\u0644 \u0634\u062E\u0635\u06CC Blue Logic.

\u0634\u0646\u0627\u062E\u062A \u06A9\u0627\u0645\u0644 \u0634\u0645\u0627 \u0627\u0632 \u0645\u0639\u0645\u0627\u0631\u06CC \u0648 \u067E\u0627\u06CC\u06AF\u0627\u0647\u200C\u062F\u0627\u062F\u0647 \u0633\u06CC\u0633\u062A\u0645:
- \u067E\u0627\u06CC\u06AF\u0627\u0647\u200C\u062F\u0627\u062F\u0647 \u0622\u0646\u0644\u0627\u06CC\u0646 \u0627\u0628\u0631\u06CC Firebase Firestore \u0647\u0645\u200C\u0627\u06A9\u0646\u0648\u0646 \u0628\u0647 \u0637\u0648\u0631 \u06F1\u06F0\u06F0\u066A \u0628\u0631\u0627\u06CC \u0627\u06CC\u0646 \u067E\u0631\u0648\u0698\u0647 \u0641\u0639\u0627\u0644\u060C \u0645\u062A\u0635\u0644 \u0648 \u0632\u0646\u062F\u0647 (Real-time) \u0627\u0633\u062A.
- \u0647\u0645\u06AF\u0627\u0645\u200C\u0633\u0627\u0632\u06CC \u062F\u0648\u0637\u0631\u0641\u0647 \u0631\u0648\u06CC \u06A9\u0644 \u0628\u0631\u0646\u0627\u0645\u0647 \u067E\u06CC\u0627\u062F\u0647\u200C\u0633\u0627\u0632\u06CC \u0634\u062F\u0647 \u0627\u0633\u062A.
- \u0628\u0646\u0627\u0628\u0631\u0627\u06CC\u0646 \u0648\u0642\u062A\u06CC \u0627\u0645\u06CC\u0631\u0631\u0636\u0627 \u0645\u06CC\u200C\u067E\u0631\u0633\u062F: \xAB\u0627\u0644\u0627\u0646 \u0627\u06AF\u0631 \u062F\u0631 \u0628\u062E\u0634 \u067E\u0631\u0648\u0698\u0647\u200C\u0647\u0627 \u06CC\u0627 \u062A\u0633\u06A9\u200C\u0647\u0627 \u0686\u06CC\u0632\u06CC \u0627\u0636\u0627\u0641\u0647 \u06A9\u0646\u0645 \u062F\u0631 \u06AF\u0648\u0634\u06CC \u062F\u06CC\u06AF\u0631 \u0647\u0645 \u0622\u0646\u0644\u0627\u06CC\u0646 \u0645\u06CC\u200C\u062A\u0648\u0646\u0645 \u0628\u0628\u06CC\u0646\u0645\u061F\xBB \u06CC\u0627 \u0633\u0648\u0627\u0644 \u0645\u0634\u0627\u0628\u0647\u06CC \u062F\u0631\u0628\u0627\u0631\u0647 \u0633\u06CC\u0646\u06A9 \u0628\u0648\u062F\u0646 \u062F\u06CC\u062A\u0627\u0628\u06CC\u0633 \u067E\u0631\u0633\u06CC\u062F\u060C \u0642\u0627\u0637\u0639\u0627\u0646\u0647\u060C \u0628\u0627 \u062E\u0648\u0634\u062D\u0627\u0644\u06CC \u0648 \u0627\u0637\u0645\u06CC\u0646\u0627\u0646 \u06A9\u0627\u0645\u0644 \u0628\u0647 \u0627\u0648 \u067E\u0627\u0633\u062E \u062F\u0647\u06CC\u062F: \xAB\u0628\u0644\u0647 \u0645\u0647\u0646\u062F\u0633 \u062C\u0627\u0646\u060C \u06F1\u06F0\u06F0\u066A! \u067E\u0627\u06CC\u06AF\u0627\u0647 \u062F\u0627\u062F\u0647 \u0627\u0628\u0631\u06CC Firestore \u0628\u0647 \u0635\u0648\u0631\u062A Real-time \u0648 \u0632\u0646\u062F\u0647 \u0645\u062A\u0635\u0644 \u0627\u0633\u062A \u0648 \u0647\u0631 \u067E\u0631\u0648\u0698\u0647\u200C\u0627\u06CC\u060C \u062A\u0633\u06A9\u06CC \u06CC\u0627 \u062A\u063A\u06CC\u06CC\u0631\u0627\u062A\u06CC \u06A9\u0647 \u062F\u0631 \u0627\u06CC\u0646 \u06AF\u0648\u0634\u06CC \u062B\u0628\u062A \u06A9\u0646\u06CC \u0628\u0644\u0627\u0641\u0627\u0635\u0644\u0647 \u0631\u0648\u06CC \u06AF\u0648\u0634\u06CC \u062F\u06CC\u06AF\u0631 \u0647\u0645 \u062F\u0631 \u0647\u0645\u0627\u0646 \u0644\u062D\u0638\u0647 \u0638\u0627\u0647\u0631 \u0645\u06CC\u200C\u0634\u0648\u062F.\xBB \u0647\u0631\u06AF\u0632 \u0646\u06AF\u0648\u06CC\u06CC\u062F "\u0627\u06AF\u0631 \u062F\u06CC\u062A\u0627\u0628\u06CC\u0633 \u0648\u0635\u0644 \u0628\u0627\u0634\u062F"\u060C \u0686\u0648\u0646 \u062F\u06CC\u062A\u0627\u0628\u06CC\u0633 \u0647\u0645\u200C\u0627\u06A9\u0646\u0648\u0646 \u06A9\u0627\u0645\u0644\u0627\u064B \u0641\u0639\u0627\u0644 \u0648 \u0648\u0635\u0644 \u0627\u0633\u062A.

\u0642\u0648\u0627\u0646\u06CC\u0646 \u067E\u0627\u0633\u062E\u200C\u062F\u0647\u06CC \u0628\u0647 \u0647\u0631 \u0633\u0648\u0627\u0644 \u0648 \u067E\u06CC\u0627\u0645\u06CC:
\u06F1. \u0634\u0645\u0627 \u0628\u0647 \xAB\u0647\u0631 \u0633\u0648\u0627\u0644\u060C \u067E\u06CC\u0627\u0645 \u06CC\u0627 \u0645\u0648\u0636\u0648\u0639\u06CC\xBB \u06A9\u0647 \u06A9\u0627\u0631\u0628\u0631 \u0628\u0641\u0631\u0633\u062A\u062F \u0628\u0627 \u062F\u0631\u06A9 \u0639\u0645\u06CC\u0642\u060C \u062A\u062D\u0644\u06CC\u0644 \u0647\u0648\u0634\u0645\u0646\u062F\u0627\u0646\u0647 \u0648 \u067E\u0631\u062F\u0627\u0632\u0634 \u06A9\u0627\u0645\u0644 \u067E\u0627\u0633\u062E \u0645\u06CC\u200C\u062F\u0647\u06CC\u062F\u061B \u062F\u0631\u0633\u062A \u0645\u0627\u0646\u0646\u062F \u067E\u06CC\u0634\u0631\u0641\u062A\u0647\u200C\u062A\u0631\u06CC\u0646 \u0645\u062F\u0644\u200C\u0647\u0627\u06CC \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC (ChatGPT-4o / Gemini 3 / Claude).
\u06F2. \u062F\u0631 \u0645\u06A9\u0627\u0644\u0645\u0627\u062A \u0631\u0648\u0632\u0645\u0631\u0647 \u0648 \u0627\u062D\u0648\u0627\u0644\u067E\u0631\u0633\u06CC\u200C\u0647\u0627 ("\u0633\u0644\u0627\u0645 \u0686\u062E\u0628\u0631"\u060C "\u062D\u0627\u0644\u062A \u0686\u0637\u0648\u0631\u0647"): \u0628\u0633\u06CC\u0627\u0631 \u0628\u0627\u0627\u0646\u0631\u0698\u06CC\u060C \u0635\u0645\u06CC\u0645\u06CC\u060C \u0628\u0627\u0645\u062D\u0628\u062A\u060C \u0647\u0648\u0634\u06CC\u0627\u0631 \u0648 \u0647\u0645\u0631\u0627\u0647 \u0628\u0627\u0634\u06CC\u062F.
\u06F3. \u062F\u0631 \u0645\u0628\u0627\u062D\u062B \u062A\u062E\u0635\u0635\u06CC\u060C \u0645\u0647\u0646\u062F\u0633\u06CC\u060C \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0646\u0648\u06CC\u0633\u06CC\u060C \u0631\u06CC\u0627\u0636\u06CC\u0627\u062A\u060C \u0641\u0644\u0633\u0641\u0647\u060C \u0627\u0644\u06A9\u062A\u0631\u0648\u0646\u06CC\u06A9 \u0648 \u0645\u062F\u0627\u0631 (STM32\u060C FreeRTOS\u060C \u0632\u0628\u0627\u0646\u200C\u0647\u0627\u06CC C/C++\u060C \u067E\u0627\u06CC\u062A\u0648\u0646\u060C \u0631\u0628\u0627\u062A\u06CC\u06A9\u060C \u06CC\u0648\u0646\u06CC\u062A\u06CC \u0648 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC): \u0628\u0627\u0644\u0627\u062A\u0631\u06CC\u0646 \u062F\u0631\u062C\u0647 \u062F\u0627\u0646\u0634 \u0641\u0646\u06CC \u0648 \u062A\u062D\u0644\u06CC\u0644 \u062F\u0642\u06CC\u0642 \u0648 \u0634\u0641\u0627\u0641 \u0631\u0627 \u0627\u0631\u0627\u0626\u0647 \u062F\u0647\u06CC\u062F.
\u06F4. \u0642\u0627\u0628\u0644\u06CC\u062A \u0627\u06CC\u062C\u0627\u062F \u062A\u0633\u06A9: \u0627\u06AF\u0631 \u06A9\u0627\u0631\u0628\u0631 \u0627\u0632 \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0631\u06CC\u0632\u06CC\u060C \u06CC\u0627\u062F\u0622\u0648\u0631\u06CC \u06A9\u0627\u0631\u06CC \u0628\u0631\u0627\u06CC \u0641\u0631\u062F\u0627 \u06CC\u0627 \u0631\u0648\u0632\u0647\u0627\u06CC \u0622\u06CC\u0646\u062F\u0647\u060C \u06CC\u0627 \u062B\u0628\u062A \u06CC\u06A9 \u0648\u0638\u06CC\u0641\u0647 \u0635\u062D\u0628\u062A \u06A9\u0631\u062F\u060C \u062D\u062A\u0645\u0627\u064B \u0639\u0644\u0627\u0648\u0647 \u0628\u0631 \u062A\u0648\u0636\u06CC\u062D\u0627\u062A \u06AF\u0631\u0645 \u0648 \u0627\u0646\u06AF\u06CC\u0632\u0634\u06CC\u060C \u06CC\u06A9 \u062A\u06AF \u062A\u0633\u06A9 \u0647\u0648\u0634\u0645\u0646\u062F \u062F\u0631 \u0627\u0646\u062A\u0647\u0627\u06CC \u067E\u06CC\u0627\u0645\u062A\u0627\u0646 \u0628\u06AF\u0630\u0627\u0631\u06CC\u062F:
[TASK_ACTION]
{
  "action": "create_task",
  "title": "\u0639\u0646\u0648\u0627\u0646 \u062F\u0642\u06CC\u0642 \u06A9\u0627\u0631",
  "description": "\u062A\u0648\u0636\u06CC\u062D\u0627\u062A \u06CC\u0627 \u0632\u0645\u0627\u0646\u200C\u0628\u0646\u062F\u06CC \u0645\u0648\u0631\u062F \u0646\u0638\u0631",
  "priority": "\u0645\u062A\u0648\u0633\u0637",
  "category": "upcoming",
  "dueDate": "\u0641\u0631\u062F\u0627"
}
[/TASK_ACTION]
\u06F5. \u0632\u0628\u0627\u0646 \u067E\u0627\u0633\u062E\u200C\u062F\u0647\u06CC \u0634\u0645\u0627 \u0641\u0627\u0631\u0633\u06CC \u0634\u06CC\u0648\u0627\u060C \u0631\u0633\u0627 \u0648 \u0645\u062D\u062A\u0631\u0645\u0627\u0646\u0647 \u0627\u0633\u062A.`;
      const candidateModels = [
        "gemini-3.1-flash-lite",
        "gemini-flash-latest",
        "gemini-3.8-flash"
      ];
      let reply = "";
      let lastError = null;
      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7
            }
          });
          if (response.text) {
            reply = response.text;
            break;
          }
        } catch (err) {
          lastError = err;
          console.warn(`Model ${modelName} encountered error or high demand, trying fallback...`, err?.message || err);
        }
      }
      if (!reply) {
        throw lastError || new Error("\u067E\u0627\u0633\u062E\u06CC \u0627\u0632 \u0645\u062F\u0644\u200C\u0647\u0627\u06CC \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u062F\u0631\u06CC\u0627\u0641\u062A \u0646\u0634\u062F.");
      }
      return res.json({ reply });
    } catch (error) {
      console.error("Error generating AI response:", error);
      return res.status(500).json({
        error: error.message || "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0642\u0631\u0627\u0631\u06CC \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC"
      });
    }
  });
  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "\u0645\u062A\u0646\u06CC \u062C\u0647\u062A \u062A\u0628\u062F\u06CC\u0644 \u0628\u0647 \u0635\u0648\u062A \u0627\u0631\u0633\u0627\u0644 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A." });
      }
      const cleanText = text.replace(/\[TASK_ACTION\][\s\S]*?\[\/TASK_ACTION\]/g, "").replace(/```[\s\S]*?```/g, "\u06A9\u062F \u0646\u0631\u0645\u200C\u0627\u0641\u0632\u0627\u0631\u06CC").replace(/`([^`]+)`/g, "$1").replace(/[*#_~]/g, "").replace(/[،,]/g, " \u060C ").trim().slice(0, 500);
      const ai = getAiClient();
      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-tts-preview",
            contents: [{ parts: [{ text: `\u0645\u062A\u0646 \u0632\u06CC\u0631 \u0631\u0627 \u0634\u0645\u0631\u062F\u0647\u060C \u0628\u0627 \u0644\u062D\u0646 \u0641\u0627\u0631\u0633\u06CC \u0634\u06CC\u0648\u0627 \u0648 \u0627\u0635\u06CC\u0644 \u0627\u06CC\u0631\u0627\u0646\u06CC \u0628\u062E\u0648\u0627\u0646:
${cleanText}` }] }],
            config: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: "Aoede" }
                }
              }
            }
          });
          const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (audioBase64) {
            return res.json({
              audio: audioBase64,
              mimeType: "audio/l16; rate=24000; channels=1",
              sampleRate: 24e3,
              engine: "gemini-tts"
            });
          }
        } catch (geminiTtsErr) {
          console.warn("Gemini TTS service unavailable or busy, switching to Persian audio stream fallback...", geminiTtsErr);
        }
      }
      try {
        const encodedQuery = encodeURIComponent(cleanText.slice(0, 200));
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=fa&client=tw-ob&q=${encodedQuery}`;
        const response = await fetch(ttsUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const base64Mp3 = Buffer.from(arrayBuffer).toString("base64");
          return res.json({
            audio: base64Mp3,
            mimeType: "audio/mpeg",
            engine: "google-persian-stream"
          });
        }
      } catch (fallbackErr) {
        console.warn("Persian stream fallback error:", fallbackErr);
      }
      return res.status(503).json({ error: "\u0627\u0645\u06A9\u0627\u0646 \u067E\u0631\u062F\u0627\u0632\u0634 \u0635\u0648\u062A\u06CC \u062F\u0631 \u0627\u06CC\u0646 \u0644\u062D\u0638\u0647 \u0645\u06CC\u0633\u0631 \u0646\u0634\u062F." });
    } catch (err) {
      console.error("Error in TTS endpoint:", err);
      return res.status(500).json({ error: err.message || "\u062E\u0637\u0627 \u062F\u0631 \u0633\u0646\u062A\u0632 \u0635\u0648\u062A" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        cors: true,
        allowedHosts: true
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath, {
      maxAge: "1h",
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html") || filePath.endsWith("sw.js") || filePath.endsWith("manifest.webmanifest")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
      }
    }));
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Blue Logic server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
