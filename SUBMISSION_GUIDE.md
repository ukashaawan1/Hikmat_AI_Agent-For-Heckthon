# 🏆 Hackathon Submission Guide

This document contains everything you need to copy and paste for your hackathon submission.

## 📃 1. Text Description (Summarized)

**English Version (for Judges):**
> **Wisdom AI Agent** is a professional voice-based AI tutor for philosophy and logic, built using the Gemini Live API. It enables real-time, bidirectional conversations where the AI can adopt legendary personas (like Socrates or Rumi) or act as a university professor. 
> 
> **Key Functionalities:**
> - **Live Voice & Interruption**: Natural, lag-free conversations without buttons.
> - **Persona Adoption**: Immersive role-playing as historical philosophers.
> - **Native Multilingualism**: Seamlessly switches between Urdu, Arabic, and English.
> - **Specialized Modes**: Learning, Debate, Q&A, Story-telling, and Comparative Analysis.
- **Hikmat Vision**: Specialized mode that uses the camera to "see" and find philosophical meaning in the real world.
> 
> **Technologies Used:**
> - Gemini 2.0 Flash (Native Audio Preview)
> - WebSockets (Bidirectional Streaming)
> - Node.js & Express (Vision Proxy)
> - Firebase Hosting (Google Cloud)
> - Vanilla JS & HTML5 Canvas
> 
> **Findings:** 
> Native audio multimodality significantly reduces latency and allows for emotional resonance in AI personas, making learning more immersive than traditional text-based workflows.

---

## 🏗️ 2. Architecture Details

The app uses a client-side architecture that interacts directly with Google Cloud's Generative AI WebSockets. Audio is captured via `AudioWorklet` for low-latency processing.

**Flow:**
`User Mic` -> `Frontend (JS)` -> `Gemini Live API (WebSocket)` -> `Audio Engine` -> `Real-time Audio Back`.

---

## 📹 3. Video Demo Script (Points to cover)
Your video must be under 4 minutes. Here is a suggested flow:
1. **Introduction**: Show the landing page, select **Urdu**, and start a call.
2. **AI Greeting**: Show the AI greeting you automatically (the AI speaks first).
3. **Conversational Learning**: Ask a philosophical question (e.g., "What is the Cave Allegory?") and listen to the scholarly response.
4. **Vision Mode (Hikmat)**: Demonstrate the camera feature. Show how the AI identifies an object and provides a philosophical reflection (e.g., seeing a book or a lamp).
5. **Persona & Interruption**: Switch to **Debate Mode** and debate with Socrates. Demonstrate **interruption** (start talking while the AI is speaking) to show the realism.
5. **Conclusion**: Briefly explain how this solves the problem of static online learning by making it live and interactive.

---

## 🖥️ 4. Proof of Deployment
Use your hosting URL: `https://wisdom-ai-agent.web.app`
For the recording, you can show:
- The Firebase Hosting dashboard.
- The browser console showing logs like `WebSocket connected` and `Setup complete`.

---

## 👨‍💻 5. Public Repository Instructions
1. Upload your project folder to **GitHub**.
2. Ensure the `README.md` is in the main folder.
3. Check that your API key is secure or documented for testing purposes.

---

### 📝 ہیک تھون کے لیے اہم ہدایات (Urdu Summary)
یہ آپ کی ایپ کی خصوصیات کا خلاصہ ہے:
1. **لائیو آواز**: بغیر بٹن دبائے قدرتی بات چیت۔
2. **فلسفیانہ انداز**: سقراط یا ارسطو بن کر علمی بحث کرنا۔
3. **مختلف موڈز**: سیکھنے، موازنے اور کہانیوں کے ذریعے منطق کی تعلیم۔
4. **حکمت (Vision)**: کیمرہ کے ذریعے دنیا کو دیکھنا اور اس میں فلسفہ تلاش کرنا۔
5. **تین زبانیں**: اردو، عربی اور انگریزی کی مکمل سپورٹ۔
5. **گوگل کلاؤڈ**: مکمل طور پر گوگل کلاؤڈ کے انفراسٹرکچر پر چلنے والی ایپ۔

---

Good luck with the Hackathon! 🚀
