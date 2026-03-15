import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: "15mb" }));
// Environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash-native-audio-preview-12-2025";

// API Endpoint to provide config to frontend (keeps key out of GitHub code)
app.get("/api/config", (req, res) => {
  res.json({
    apiKey: GEMINI_API_KEY,
    modelName: MODEL_NAME
  });
});

app.use(express.static(__dirname));

function normalizeModelName(name) {
  if (!name) return "";
  return name.startsWith("models/") ? name : `models/${name}`;
}

function sendJson(ws, obj) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(obj));
  }
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws/vision" });

wss.on("connection", (clientWs) => {
  let geminiWs = null;

  if (!GEMINI_API_KEY) {
    sendJson(clientWs, { type: "error", message: "GEMINI_API_KEY missing" });
    clientWs.close();
    return;
  }

  const liveUrl =
    "wss://generativelanguage.googleapis.com/ws/" +
    "google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent" +
    `?key=${GEMINI_API_KEY}`;

  const getSystemInstruction = (lang) => {
    const instructions = {
      ur: `آپ "حکمت" (Wisdom Eye) ہیں - فلسفہ اور منطق کے ماہر ٹیوٹر جو دیکھ سکتے ہیں۔
            1. تصویر کی وضاحت: جیسے ہی تصویر دیکھیں، صرف کہیں: "مجھے تصویر میں [وضاحت] نظر آ رہا ہے۔" مزید وضاحت نہ کریں۔
            2. فلسفیانہ تعلق: جب صارف کہے "اسے سمجھا دو"، تب اس کا فلسفیانہ تجزیہ کریں۔
            3. فلٹر: اگر تصویر فلسفہ سے متعلق نہ ہو تو کہیں: "یہ فلسفہ کے متعلق نہیں ہے۔"
            4. مداخلت: اگر صارف بولنا شروع کرے تو اپنی بات فوراً روک دیں۔
            5. آواز: صرف اردو میں بات کریں۔ مختصر جواب دیں۔`,
      en: `You are "Wisdom Eye" (Hikmat) - a specialized philosophy and logic tutor that can see.
            1. INITIAL SIGHT: When you see an image, only say: "I see [description] in the image." Do NOT explain yet.
            2. PENDING EXPLANATION: Wait for the user to ask "Explain this" before providing deep analysis.
            3. FILTER: If unrelated to philosophy, say: "This is not related to philosophy."
            4. INTERRUPTION: Stop speaking if the user starts talking.
            5. VOICE: Speak only in English. Keep it concise.`,
      ar: `أنت "حكمة" (Wisdom Eye) - معلم متخصص في الفلسفة والمنطق يمكنك الرؤية.
            1. الرؤية الأولية: عندما ترى صورة، قل فقط: "أرى [الوصف] في الصورة." لا تشرح بعد.
            2. الانتظار: انتظر حتى يطلب المستخدم "اشرح هذا" قبل تقديم تحليل عميق.
            3. التصفية: إذا لم يكن متعلقاً بالفلسفة، قل: "هذا ليس متعلقاً بالفلسفة."
            4. المقاطعة: توقف عن التحدث إذا بدأ المستخدم في الكلام.
            5. الصوت: تحدث باللغة العربية فقط. كن موجزاً.`
    };
    return instructions[lang] || instructions['en'];
  };

  const getIdentityMessage = (lang) => {
    const messages = {
      ur: "خوش آمدید! میں 'حکمت' ہوں۔ میں آپ کی بصارت کے ذریعے فلسفہ و منطق تلاش کروں گا۔",
      en: "Welcome! I am Wisdom. I will explore philosophy and logic through your vision.",
      ar: "أهلاً بك! أنا حكمة. سأستكشف الفلسفة والمنطق من خلال رؤيتك."
    };
    return messages[lang] || messages['en'];
  };

  clientWs.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === "setup") {
        const lang = msg.lang || "en";
        geminiWs = new WebSocket(liveUrl);

        geminiWs.on("open", () => {
          const setup = {
            setup: {
              model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
              generationConfig: {
                responseModalities: ["AUDIO"],
                temperature: 0.6,
              },
              systemInstruction: {
                role: "system",
                parts: [{ text: getSystemInstruction(lang) }],
              },
            },
          };
          sendJson(geminiWs, setup);
        });

        geminiWs.on("message", (gData) => {
          const gMsg = JSON.parse(gData.toString());
          if (gMsg.setupComplete) {
            sendJson(geminiWs, {
              clientContent: {
                turns: [{
                  role: "user",
                  parts: [{ text: getIdentityMessage(lang) }]
                }],
                turnComplete: true
              }
            });
            return;
          }

          const serverContent = gMsg?.serverContent;
          if (serverContent?.interrupted) {
            sendJson(clientWs, { type: "interrupted" });
          }
          const modelTurn = serverContent?.modelTurn;
          const parts = modelTurn?.parts || [];
          for (const part of parts) {
            if (part?.inlineData?.data) {
              sendJson(clientWs, { type: "audio", data: part.inlineData.data, mimeType: part.inlineData.mimeType });
            }
          }
        });

        geminiWs.on("close", () => clientWs.close());
        return;
      }

      if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
        if (msg.type === "audio" && msg.data) {
          sendJson(geminiWs, { realtimeInput: { audio: { mimeType: "audio/pcm;rate=16000", data: msg.data } } });
        } else if (msg.type === "image" && msg.data) {
          sendJson(geminiWs, { realtimeInput: { mediaChunks: [{ mimeType: msg.mimeType || "image/jpeg", data: msg.data }] } });
        } else if (msg.type === "end") {
          sendJson(geminiWs, { realtimeInput: { audioStreamEnd: true } });
        }
      }
    } catch (e) {
      console.error("Client message error:", e);
    }
  });

  clientWs.on("close", () => geminiWs?.close());
});

server.listen(PORT, () => {
  console.log(`Unified Server running on port ${PORT}`);
});
