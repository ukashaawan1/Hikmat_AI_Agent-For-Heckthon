const video = document.getElementById("video");
const captureCanvas = document.getElementById("captureCanvas");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const switchCamBtn = document.getElementById("switchCamBtn");
const transcriptText = document.getElementById("transcriptText");
const analysisBox = document.getElementById("analysisBox");
const loader = document.getElementById("loader");
const backBtn = document.querySelector(".back-btn");
const statusText = document.querySelector(".status-badge span");

const VISION_TRANSLATIONS = {
    ur: { back: "واپس", status: "حکمت لائیو", dir: "rtl" },
    en: { back: "Back", status: "Wisdom Live", dir: "ltr" },
    ar: { back: "عودة", status: "حكمة مباشر", dir: "rtl" }
};

let stream = null;
let useFront = true;
let socket = null;
let audioCtx = null;
let micStream = null;
let processor = null;
let audioQueue = Promise.resolve();
let isActive = false;
let frameInterval = null;
let activeSources = [];

async function initCamera() {
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
    }

    const constraints = {
        video: {
            facingMode: useFront ? "user" : "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };

    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.style.transform = useFront ? "scaleX(-1)" : "scaleX(1)";
    } catch (e) {
        setTranscript("کیمرہ تک رسائی نہیں ملی۔ براہ کرم اجازت دیں۔");
    }
}

function setTranscript(text) {
    transcriptText.textContent = text;
    analysisBox.classList.add("active");
}

function captureFrame() {
    const ctx = captureCanvas.getContext("2d");
    const width = video.videoWidth;
    const height = video.videoHeight;
    captureCanvas.width = width;
    captureCanvas.height = height;
    ctx.drawImage(video, 0, 0, width, height);
    return captureCanvas.toDataURL("image/jpeg", 0.6).split(",")[1];
}

async function startSession() {
    if (isActive) return;
    
    loader.style.display = "block";
    startBtn.disabled = true;

    try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws/vision`;
        
        // Get language from URL
        const urlParams = new URLSearchParams(window.location.search);
        const lang = urlParams.get('lang') || 'en';

        socket = new WebSocket(wsUrl);

        socket.onopen = async () => {
            isActive = true;
            loader.style.display = "none";
            startBtn.style.display = "none";
            stopBtn.style.display = "flex";

            // Send initial config with language
            socket.send(JSON.stringify({ type: "setup", lang: lang }));
            // setTranscript("رابطہ ہو گیا۔ 'عینِ حکمت' سے بات کریں...");

            // Start Audio
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioCtx = new AudioContext({ sampleRate: 16000 });
            
            await audioCtx.audioWorklet.addModule('audio-processor.js');
            const source = audioCtx.createMediaStreamSource(micStream);
            processor = new AudioWorkletNode(audioCtx, 'audio-capture-processor');
            
            processor.port.onmessage = (e) => {
                if (!isActive || socket.readyState !== 1) return;
                if (e.data.type === 'audio') {
                    const b64 = base64FromInt16(new Int16Array(e.data.data));
                    socket.send(JSON.stringify({ type: "audio", data: b64 }));
                }
            };

            source.connect(processor);
            processor.connect(audioCtx.destination);

            // Trigger AI Welcome
            setTimeout(() => {
                if (isActive && socket.readyState === 1) {
                    socket.send(JSON.stringify({ type: "greet" }));
                }
            }, 1500);

            // Start Frame Capture Feed (every 3 seconds for vision)
            frameInterval = setInterval(() => {
                if (!isActive || socket.readyState !== 1) return;
                const b64 = captureFrame();
                socket.send(JSON.stringify({ type: "image", data: b64, mimeType: "image/jpeg" }));
            }, 3000);
        };

        socket.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            if (msg.type === "interrupted") {
                stopAllAudio();
            } else if (msg.type === "audio") {
                audioQueue = audioQueue.then(() => playPcmChunk(msg.data));
            } else if (msg.type === "text" || msg.type === "transcript") {
                // setTranscript(msg.text);
                console.log("AI Transcript:", msg.text);
            }
        };

        socket.onclose = () => stopSession();
        socket.onerror = () => {
             loader.style.display = "none";
             startBtn.disabled = false;
             // setTranscript("رابطے میں مسئلہ پیش آیا۔");
        };

    } catch (e) {
        loader.style.display = "none";
        startBtn.disabled = false;
        // setTranscript("سیشن شروع نہیں ہو سکا۔");
    }
}

function stopSession() {
    isActive = false;
    if (socket) socket.close();
    if (processor) processor.disconnect();
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    if (audioCtx) audioCtx.close();
    clearInterval(frameInterval);

    startBtn.style.display = "flex";
    startBtn.disabled = false;
    stopBtn.style.display = "none";
    setTranscript("سیشن ختم ہو گیا۔");
}

// Audio Utilities (Adapted from Camra ai)
function downsampleBuffer(buffer, inputRate, outputRate) {
    if (outputRate === inputRate) {
        const result = new Int16Array(buffer.length);
        for (let i = 0; i < buffer.length; i++) result[i] = Math.max(-1, Math.min(1, buffer[i])) * 0x7fff;
        return result;
    }
    const ratio = inputRate / outputRate;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Int16Array(newLength);
    let offset = 0;
    for (let i = 0; i < newLength; i++) {
        const nextOffset = Math.round((i + 1) * ratio);
        let sum = 0, count = 0;
        for (let j = offset; j < nextOffset && j < buffer.length; j++) { sum += buffer[j]; count++; }
        result[i] = Math.max(-1, Math.min(1, count ? sum / count : 0)) * 0x7fff;
        offset = nextOffset;
    }
    return result;
}

function base64FromInt16(int16) {
    let binary = "";
    const bytes = new Uint8Array(int16.buffer);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

function base64ToInt16(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Int16Array(bytes.buffer);
}

async function playPcmChunk(base64) {
    if (!audioCtx) audioCtx = new AudioContext({ sampleRate: 24000 });
    const int16 = base64ToInt16(base64);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 0x8000;

    const buffer = audioCtx.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0, 0);

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();

    activeSources.push(source);
    source.onended = () => {
        activeSources = activeSources.filter(s => s !== source);
    };

    return new Promise(resolve => {
        const originalOnEnded = source.onended;
        source.onended = () => {
            if (originalOnEnded) originalOnEnded();
            resolve();
        };
    });
}

function stopAllAudio() {
    activeSources.forEach(s => {
        try { s.stop(); } catch(e) {}
    });
    activeSources = [];
    audioQueue = Promise.resolve();
}

// Events
startBtn.onclick = startSession;
stopBtn.onclick = stopSession;
switchCamBtn.onclick = () => {
    useFront = !useFront;
    initCamera();
};

const urlParams = new URLSearchParams(window.location.search);
const currentLang = urlParams.get('lang') || 'en';
const vt = VISION_TRANSLATIONS[currentLang] || VISION_TRANSLATIONS['en'];

// Update UI Text
backBtn.textContent = vt.back;
statusText.textContent = vt.status;
document.documentElement.dir = vt.dir;
document.documentElement.lang = currentLang;

initCamera();
