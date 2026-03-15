# Wisdom AI Agent — The Socratic Voice of Logic

**Wisdom AI Agent** is an advanced, voice-based AI tutor designed to teach philosophy and logic through immersive, real-time conversations. Built for the **Google Gemini Live Agent Challenge**, it leverages the cutting-edge capabilities of the Gemini 2.0 Flash model to provide a seamless learning experience across multiple languages and philosophical traditions.

## 🚀 Live Demo
Experience the agent now: [https://wisdom-ai-agent.web.app](https://wisdom-ai-agent.web.app)

---

## ✨ Key Features

### 🎙️ 1. Real-time Voice Interaction
- **Seamless Flow**: Engage in natural, bidirectional conversations without clicking buttons.
- **Interruption Support**: Stop the AI mid-sentence just like a real human conversation.
- **Automated Initiation**: The AI greets you and starts the session proactively.

### ⚖️ 2. Specialized Intelligence Modes
- **Learning Mode**: A structured Academic University Professor persona teaching step-by-step.
- **Debate Mode**: Immersive persona adoption (Socrates, Aristotle, Rumi, etc.) where the AI speaks *as* the philosopher.
- **Compare Mode**: Contrast theories from different schools of thought (e.g., Greek vs. Islamic vs. Chinese).
- **Q&A Mode**: Instant, scholarly answers to complex philosophical dilemmas.
- **Story Mode**: Teaching logic through engaging narratives and allegories.
- **Hikmat Vision**: Specialized vision mode that uses the camera to "see" and find philosophical meaning in the real world.

### 🌍 3. Multilingual Mastery
- Native, high-quality support for **Urdu**, **Arabic**, and **English**.
- The entire UI and the AI's persona switch seamlessly between languages.

---

## 🛠️ Technology Stack
- **AI Core**: Google Gemini 2.0 Flash (Native Audio Preview).
- **Communication**: WebSockets for low-latency, real-time audio streaming.
- **Back-end Context**: Node.js & Express (Vision Proxy Server).
- **Deployment**: Firebase Hosting (Google Cloud Ecosystem).
- **Frontend**: Vanilla JavaScript, HTML5 Canvas (Waveform Visualization), and Premium CSS3 Glassmorphism UI.

---

## 🏗️ Architecture
The system follows a lean, high-performance architecture:
1. **Frontend**: Captures audio (AudioWorklet) and processes it in real-time.
2. **WebSocket Bridge**: Streams raw audio data directly to Gemini Live API.
3. **Gemini Engine**: Processes system instructions, persona context, and audio input.
4. **Real-time Output**: Streams audio back to the browser with millisecond-level latency.

---

## 📂 Project Structure
- `/` : Main application (Voice Only).
- `/vision/` : Hikmat Vision Mode (Camera + Voice).
- `app.js` : Main application logic.
- `main-server.js` : Static file server.
- `vision/server.js` : Vision Mode WebSocket Proxy.
- `SUBMISSION_GUIDE.md` : Quick-copy for hackathon judges.

---

## 👨‍💻 Spin-Up Instructions (Reproducibility)

To run this project locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/wisdom-ai-agent.git
   cd wisdom-ai-agent
   ```

2. **API Key Setup**:
   - Obtain a Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
   - Open `app.js` and replace the `GEMINI_API_KEY` value on line 9.

3. **Run Locally**:
   - Since this uses WebSockets and microphone access, it's best served via a local server (e.g., Live Server in VS Code or `npx serve .`).
   - Open your browser and navigate to `http://localhost:5000`.

4. **Deployment**:
   - Install Firebase Tools: `npm install -g firebase-tools`
   - Login: `firebase login`
   - Deploy: `firebase deploy`

---

## 📄 Findings & Learnings
Working with the **Gemini Live API** revealed the power of "Native Multimodality." Unlike traditional STT -> LLM -> TTS pipelines, Gemini Live handles audio directly, preserving tone, emotion, and pace. This allowed us to build an AI that doesn't just "read" philosophy but "performs" it as a true Socratic tutor.

---

## 🖥️ Proof of Google Cloud Deployment
- **Site URL**: `wisdom-ai-agent.web.app`
- **GCP Service**: Firebase Hosting, Vertex AI/Generative AI APIs.
- **Verification**: All API calls are routed via the Google Cloud infrastructure, using the `Generative Service.BidiGenerateContent` endpoint.

---

### #GeminiLiveAgentChallenge
Created by: [Your Name/Team Name]
Building the future of logic with Google AI.
