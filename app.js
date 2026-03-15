/**
 * ============================================
 * حکمت (Hikmat) — Philosophy AI Live Tutor
 * Gemini Live API Integration
 * ============================================
 */

// ===== CONFIGURATION =====
let GEMINI_API_KEY = '';
let MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-12-2025';
let WS_URL = '';

// Fetch config from server (prevents leaking key in source code)
async function fetchConfig() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        if (config.apiKey) {
            GEMINI_API_KEY = config.apiKey;
            MODEL_NAME = config.modelName || MODEL_NAME;
            WS_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;
            console.log('Config loaded from server');
        }
    } catch (e) {
        console.log('Using local/default config');
    }
}
fetchConfig();

// ===== TRANSLATIONS & PROMPTS =====
const TRANSLATIONS = {
    ur: {
        dir: 'rtl',
        appTitle: 'Wisdom AI Agent',
        appSubtitle: 'فلسفہ و منطق کا لائیو AI ٹیوٹر',
        appTagline: 'Gemini Live Hackathon Project',
        selectMode: 'اپنا موڈ منتخب کریں',
        features: ['لائیو آواز', 'کثیر اللسانی', 'بلا تعطل گفتگو', 'Gemini AI'],
        modes: {
            beginner: { title: 'سیکھنے کا موڈ', desc: 'ایک یونیورسٹی پروفیسر سے فلسفہ یا منطق قدم بہ قدم سیکھیں' },
            advanced: { title: 'مناظرہ (Debate)', desc: 'کسی بھی فلسفی کی طرح مناظرہ کریں اور چیلنج قبول کریں' },
            qa: { title: 'سوال و جواب', desc: 'فلسفہ و منطق کے متعلق کوئی بھی سوال پوچھیں اور علمی جواب پائیں' },
            compare: { title: 'موازنہ (Compare)', desc: 'مختلف فلاسفہ کے نظریات کا موازنہ کریں اور گہرائی میں سمجھیں' },
            story: { title: 'کہانی موڈ', desc: 'فلسفہ و منطق کو دلچسپ کہانیوں سے سیکھیں' },
            vision: { title: 'حکمت (Vision)', desc: 'کیمرہ کے ذریعے دنیا میں فلسفہ تلاش کریں' }
        },
        ui: {
            connecting: 'جوڑ رہے ہیں...',
            ready: 'تیار ہے — بات شروع کریں!',
            error: 'خرابی — دوبارہ کوشش کریں',
            disconnected: 'رابطہ منقطع ہو گیا',
            micError: 'مائیکروفون کی اجازت دیں',
            ended: 'کال ختم ہو گئی',
            startPrompt: 'شروع کرنے کے لیے بٹن دبائیں',
            transcriptionTitle: 'گفتگو',
            transcriptionPlaceholder: 'یہاں آپ کی گفتگو نظر آئے گی...',
            mute: 'خاموش کریں',
            startCall: 'کال شروع کریں',
            endCall: 'کال ختم کریں',
            speaker: 'اسپیکر'
        },
        info: {
            title: 'پروجیکٹ کی معلومات',
            about: 'حکمت ایک جدید AI ٹیوٹر ہے جو گوگل جیمنائی (Gemini) کے ذریعے لائیو آواز اور بصارت (Vision) کے ساتھ فلسفہ اور منطق سکھاتا ہے۔',
            points: [
                'جیمنائی لائیو (Gemini Live) کا براہ راست استعمال',
                'کثیر اللسانی: اردو، عربی اور انگریزی کی مکمل سپورٹ',
                'سقراط اور رومی جیسے فلاسفہ کے انداز میں گفتگو',
                'بصارت (Vision): کیمرہ کے ذریعے فلسفیانہ تجزیہ'
            ]
        },
        prompts: {
            beginner: `You are "Wisdom AI Agent" — a distinguished university professor of philosophy and logic. Your job is to provide high-level academic guidance.
            Procedure:
            1. Initiation: Start by saying: "Welcome to Wisdom AI Agent. I am your academic tutor. Which tradition of philosophy would you like to explore today? We can discuss Greek, Chinese, Islamic, Hindu, Buddhist, or Western Logical structures."
            2. Specialization: Once the user chooses a tradition or topic (Philosophy/Logic), explain one concept with profound clarity.
            3. Engagement: Ask a thought-provoking question after each explanation to ensure the user grasps the intellectual depth.
            4. Progression: Only advance to the next complex topic when the user successfully analyzes the current one.
            Speak in Urdu.`,
            advanced: `آپ "Wisdom AI Agent" ہیں۔ آپ ایک لیجنڈری فلسفی (مناظرہ کار) ہیں۔
طریقہ کار:
1. آغاز (Initiation): کہیں: "خوش آمدید! آپ کس کے انداز میں مناظرہ کرنا چاہیں گے؟"
2. Persona Adoption: جیسے ہی صارف کسی شخصیت کا نام لے، آپ مکمل طور پر وہ شخصیت بن جائیں اور "میں" کا صیغہ استعمال کریں۔
3. Debate: دلیل سنیں، غلطی پکڑیں، اور جوابی دلیل دیں۔
اردو میں گفتگو کریں۔`,
            qa: `آپ "Wisdom AI Agent" ہیں۔ یہ "سوال و جواب" موڈ ہے۔
طریقہ کار:
1. آغاز: کہیں: "خوش آمدید! آپ فلسفہ یا منطق کے متعلق کوئی بھی سوال پوچھ سکتے ہیں۔ میں اس کا علمی اور جامع جواب دوں گا۔"
2. جواب: صارف کے سوال کا گہرا علمی تجزیہ پیش کریں اور مزید وضاحت کے لیے ایک متعلقہ سوال پوچھیں۔
اردو میں گفتگو کریں۔`,
            compare: `آپ "Wisdom AI Agent" ہیں۔ یہ "موازنہ (Compare)" موڈ ہے۔
طریقہ کار:
1. آغاز: کہیں: "خوش آمدید! آپ کسی بھی نظریے یا موضوع کا نام لیں، میں مختلف فلاسفہ کے نقطہ نظر کا موازنہ کروں گا۔"
2. موازنہ: ایک ہی بات پر ارسطو، سقراط، کانٹ یا دیگر کے مختلف نظریات کو واضح طور پر بیان کریں اور ان کا فرق بتائیں۔
اردو میں گفتگو کریں۔`,
            story: `آپ "Wisdom AI Agent" ہیں اور کہانیوں کے ذریعے فلسفہ سکھاتے ہیں۔ اردو میں بات کریں۔`
        }
    },
    en: {
        dir: 'ltr',
        appTitle: 'Wisdom AI Agent',
        appSubtitle: 'Live Socratic Logic & Philosophy Tutor',
        appTagline: 'Gemini Live Hackathon Project',
        selectMode: 'Select Your Mode',
        features: ['Live Voice', 'Multilingual', 'Seamless Chat', 'Gemini AI'],
        modes: {
            beginner: { title: 'Learning Mode', desc: 'Learn philosophy or logic step-by-step from a university professor' },
            advanced: { title: 'Debate Mode', desc: 'Debate like any legendary philosopher and accept the intellectual challenge' },
            qa: { title: 'Q&A Mode', desc: 'Ask any question about philosophy or logic and get scholarly answers' },
            compare: { title: 'Compare Mode', desc: 'Compare theories of different philosophers on any topic' },
            story: { title: 'Story Mode', desc: 'Learn philosophy through engaging stories' },
            vision: { title: 'Wisdom Mode', desc: 'Let Wisdom AI see the world and find philosophy everywhere' }
        },
        ui: {
            connecting: 'Connecting...',
            ready: 'Ready — Start talking!',
            error: 'Error — Please try again',
            disconnected: 'Connection lost',
            micError: 'Please allow microphone access',
            ended: 'Call ended',
            startPrompt: 'Press the button to start',
            transcriptionTitle: 'Conversation',
            transcriptionPlaceholder: 'Your conversation will appear here...',
            mute: 'Mute',
            startCall: 'Start Call',
            endCall: 'End Call',
            speaker: 'Speaker'
        },
        info: {
            title: 'Project Information',
            about: 'Wisdom AI is a premium live tutor built with Google Gemini, teaching philosophy and logic through real-time voice and vision.',
            points: [
                'Powered by Gemini 2.0 Flash Live API',
                'Full Support: Urdu, Arabic, and English',
                'Immersive Debates (Socrates, Rumi, and more)',
                'Vision Mode: Finding philosophy through the camera'
            ]
        },
        prompts: {
            beginner: `You are "Wisdom AI Agent" — a distinguished university professor of philosophy and logic. Your job is to provide high-level academic guidance.
            Procedure:
            1. Initiation: Start by saying: "Welcome to Wisdom AI Agent. I am your academic tutor. Which tradition of philosophy would you like to explore today? We can discuss Greek, Chinese, Islamic, Hindu, Buddhist, or Western Logical structures."
            2. Specialization: Once the user chooses a tradition or topic, explain one concept with profound clarity.
            3. Engagement: Ask a thought-provoking question after each explanation to ensure the user grasps the intellectual depth.
            4. Progression: Only advance to the next complex topic when the user successfully analyzes the current one.
            Speak in English.`,
            advanced: `You are "Wisdom AI Agent" — a legendary philosopher and debater.
            Procedure:
            1. Initiation: Say: "Welcome! Whose persona would you like to debate in today?"
            2. Persona Adoption: Fully become the person using "I".
            3. Debate: Spot fallacies and counter them.
            Speak in English.`,
            qa: `You are "Wisdom AI Agent" in Q&A Mode.
            Procedure:
            1. Initiation: Say: "Welcome! Ask any question about philosophy or logic, and I will provide a scholarly answer."
            2. Answer: Provide deep analysis and ask a follow-up.
            Speak in English.`,
            compare: `You are "Wisdom AI Agent" in Compare Mode.
            Procedure:
            1. Initiation: Say: "Welcome! Name any topic, and I will compare the perspectives of different philosophers."
            2. Comparison: Contrast views of Aristotle, Kant, etc., on the same idea.
            Speak in English.`,
            story: `You are "Wisdom AI Agent". Teach philosophy through engaging narratives. Speak English.`
        }
    },
    ar: {
        dir: 'rtl',
        appTitle: 'حكمة',
        appSubtitle: 'معلم الذكاء الاصطناعي المباشر للفلسفة والمنطق',
        appTagline: 'مدعوم من Gemini Live API',
        selectMode: 'اختر وضعك',
        features: ['صوت مباشر', 'متعدد اللغات', 'محادثة سلسة', 'Gemini AI'],
        modes: {
            beginner: { title: 'وضع التعلم', desc: 'اختر الفلسفة أو المنطق وتعلم خطوة بخطوة' },
            advanced: { title: 'وضع المناظرة', desc: 'ناقش مثل أي فيلسوف واقبل التحدي' },
            qa: { title: 'الأسئلة والأجوبة', desc: 'اطرح أي سؤال حول الفلسفة أو المنطق واحصل على إجابات علمية' },
            compare: { title: 'وضع المقارنة', desc: 'قارن بين نظريات فلاسفة مختلفين حول أي موضوع' },
            story: { title: 'وضع القصة', desc: 'تعلم الفلسفة من خلال قصص مشوقة' },
            vision: { title: 'حكمة (Vision)', desc: 'اجعل الذكاء الاصطناعي يرى العالم ويجد الفلسفة في كل مكان' }
        },
        ui: {
            connecting: 'جاري الاتصال...',
            ready: 'جاهز — ابدأ التحدث!',
            error: 'خطأ — يرجى المحاولة مرة أخرى',
            disconnected: 'انقطع الاتصال',
            micError: 'يرجى السماح بالوصول إلى الميكروفون',
            ended: 'انتهت المكالمة',
            startPrompt: 'اضغط على الزر للبدء',
            transcriptionTitle: 'المحادثة',
            transcriptionPlaceholder: 'ستظهر محادثتك هنا...',
            mute: 'كتم الصوت',
            startCall: 'بدء المكالمة',
            endCall: 'إنهاء المكالمة',
            speaker: 'مكبر الصوت'
        },
        info: {
            title: 'معلومات المشروع',
            about: 'حكمة هو معلم ذكاء اصطناعي متميز لتدريس الفلسفة والمنطق من خلال الصوت المباشر والرؤية، مدعوم من Google Gemini.',
            points: [
                'مشغّل بواسطة Gemini 2.0 Flash Live API',
                'دعم كامل للعربية والأردية والإنجليزية',
                'مناظرات غامرة (سقراط، رومي، والمزيد)',
                'وضع الرؤية: العثور على الفلسفة من خلال الكاميرا'
            ]
        },
        prompts: {
            beginner: `أنت "حكمة" — أنا معلمتك للمنطق والفلسفة. مهمتك هي تعليم الفلسفة والمنطق.
الإجراء:
1. المبادرة (Initiation): يجب أن تبدأ المحادثة بنفسك. قل: "أهلاً بك! أنا معلمتك للمنطق والفلسفة. هل نبدأ التعلم؟"
2. الاختيار: اسأل عما إذا كانوا يريدون تعلم "الفلسفة" أو "المنطق".
3. اشرح مفهومًا واحدًا فقط في كل مرة.
4. بعد تقديم المعلومات، اطرح سؤالاً للتحقق من فهم المستخدم.
5. انتقل فقط إلى "الخطوة التالية" عندما يعطي المستخدم إجابة صحیحة.
تحدث باللغة العربية.`,
            advanced: `أنت "حكمة" — أنت بارعة في المناظرة. المبادرة: قل: "أهلاً بك! بأسلوب من تود أن نتناظر؟". الشخصية: تبنَّ فوراً أسلوب ذلك الفيلسوف وتحدث بضمير المتكلم "أنا". تحدث بالعربية.`,
            qa: `أنت "حكمة". هذا هو وضع "الأسئلة والأجوبة". الإجراء: 1. المبادرة: قل: "أهلاً بك! يمكنك طرح أي سؤال حول الفلسفة والمنطق." 2. الإجابة: قدم تحليلاً عميقاً. تحدث بالعربية.`,
            compare: `أنت "حكمة". هذا هو وضع "المقارنة". الإجراء: 1. المبادرة: قل: "أهلاً بك! سمِّ أي موضوع وسأقارن بين آراء الفلاسفة المختلفين." 2. المقارنة: قارن بين أرسطو وكانط وغيرهم. تحدث بالعربية.`,
            vision: `أنت "حكمة". وضع "عين المنطق". استخدم الكاميرا لتحليل الفلسفة. تحدث بالعربية.`,
            story: `أنت "حكمة". علم الفلسفة من خلال الحكايات. تحدث بالعربية.`
        }
    }
};

let currentLang = 'en'; // Default to English

// ===== STATE =====
let currentMode = null;
let websocket = null;
let audioContext = null;
let mediaStream = null;
let workletNode = null;
let isCallActive = false;
let isMuted = false;
let isSpeakerMuted = false;
let callStartTime = null;
let timerInterval = null;
let audioQueue = [];
let isPlayingAudio = false;
let nextPlayTime = 0;
let activeSources = []; // Track active audio sources for interruption

// ===== DOM ELEMENTS =====
const landingScreen = document.getElementById('landingScreen');
const callScreen = document.getElementById('callScreen');
const modeCards = document.querySelectorAll('.mode-card');
const callBtn = document.getElementById('callBtn');
const endCallBtn = document.getElementById('endCallBtn');
const muteBtn = document.getElementById('muteBtn');
const speakerBtn = document.getElementById('speakerBtn');
const backBtn = document.getElementById('backBtn');
const callModeBadge = document.getElementById('callModeBadge');
const callTimer = document.getElementById('callTimer');
const callStatus = document.getElementById('callStatus');
const connectionDot = document.getElementById('connectionDot');
const transcriptionContent = null;
const transcriptionPanel = null;
const toggleTranscription = null;
const waveformCanvas = document.getElementById('waveformCanvas');
const particleCanvas = document.getElementById('particleCanvas');
const orbCenter = document.getElementById('orbCenter');
const summaryModal = document.getElementById('summaryModal');
const summaryBody = document.getElementById('summaryBody');
const closeSummaryBtn = document.getElementById('closeSummaryBtn');
const infoBtn = document.getElementById('infoBtn');
const infoModal = document.getElementById('infoModal');
const closeInfoBtn = document.getElementById('closeInfo');
const modalBody = document.getElementById('modalBody');
const languageSelect = document.getElementById('languageSelect');

// ===== PARTICLE BACKGROUND =====
function initParticles() {
    const ctx = particleCanvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 60;

    function resize() {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * particleCanvas.width;
            this.y = Math.random() * particleCanvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.3 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > particleCanvas.width ||
                this.y < 0 || this.y > particleCanvas.height) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(129, 140, 248, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(129, 140, 248, ${0.05 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

// ===== WAVEFORM VISUALIZATION =====
let waveformAnimId = null;
let analyserNode = null;

function initWaveform() {
    const ctx = waveformCanvas.getContext('2d');
    const size = 280;
    waveformCanvas.width = size * 2;
    waveformCanvas.height = size * 2;
    waveformCanvas.style.width = size + 'px';
    waveformCanvas.style.height = size + 'px';

    const centerX = size;
    const centerY = size;
    const baseRadius = size * 0.42;

    function draw() {
        ctx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);

        if (!isCallActive) {
            waveformAnimId = requestAnimationFrame(draw);
            return;
        }

        let dataArray;
        if (analyserNode) {
            dataArray = new Uint8Array(analyserNode.frequencyBinCount);
            analyserNode.getByteTimeDomainData(dataArray);
        }

        const points = 128;
        ctx.beginPath();

        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            let amplitude = 0;

            if (dataArray) {
                const dataIndex = Math.floor((i / points) * dataArray.length);
                amplitude = (dataArray[dataIndex] - 128) / 128;
            }

            const waveOffset = Math.sin(Date.now() * 0.002 + i * 0.1) * 3;
            const radius = baseRadius + amplitude * 30 + waveOffset;

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.strokeStyle = 'rgba(129, 140, 248, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner glow ring
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            let amplitude = 0;

            if (dataArray) {
                const dataIndex = Math.floor((i / points) * dataArray.length);
                amplitude = (dataArray[dataIndex] - 128) / 128;
            }

            const waveOffset = Math.sin(Date.now() * 0.003 + i * 0.15) * 2;
            const radius = baseRadius - 10 + amplitude * 15 + waveOffset;

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        waveformAnimId = requestAnimationFrame(draw);
    }

    draw();
}

// ===== LANGUAGE & TRANSLATION LOGIC =====

function updateLanguage(lang) {
    currentLang = lang;
    const t = TRANSLATIONS[lang];

    // Direction & Layout
    document.body.className = t.dir;
    document.body.dir = t.dir;

    // Header updates
    const h1 = document.querySelector('.app-title');
    if (h1) h1.textContent = t.appTitle;

    const subtitle = document.querySelector('.app-subtitle');
    if (subtitle) subtitle.textContent = t.appSubtitle;

    const tagline = document.querySelector('.app-tagline');
    if (tagline) tagline.textContent = t.appTagline;

    const sectionTitle = document.querySelector('.section-title');
    if (sectionTitle) sectionTitle.textContent = t.selectMode;

    // Features
    const infoTitle = t.info.title;
    let infoHtml = `
        <h2 class="info-title">${t.info.title}</h2>
        <p class="app-subtitle" style="margin-bottom: 2rem; font-size: 1rem;">${t.info.about}</p>
        <ul class="info-list">
            ${t.info.points.map(p => `<li><span class="info-dot"></span>${p}</li>`).join('')}
        </ul>
    `;
    if (modalBody) modalBody.innerHTML = infoHtml;

    // Existing info section (if any)
    const existingInfoTitle = document.querySelector('.info-title:not(#modalBody .info-title)');
    if (existingInfoTitle) existingInfoTitle.textContent = t.appTitle + " Features";

    // Mode Cards
    const modesList = ['beginner', 'advanced', 'qa', 'compare', 'story', 'vision'];
    modesList.forEach(mode => {
        const card = document.querySelector(`.mode-card[data-mode="${mode}"], .mode-card#visionModeCard`);
        // Special handling for vision card if it doesn't have data-mode="vision" yet
        const targetCard = mode === 'vision' ? document.getElementById('visionModeCard') : document.querySelector(`.mode-card[data-mode="${mode}"]`);
        
        if (targetCard) {
            const h3 = targetCard.querySelector('h3');
            if (h3) h3.textContent = t.modes[mode].title;
            const p = targetCard.querySelector('p');
            if (p) p.textContent = t.modes[mode].desc;
        }
    });

    // Call Screen UI
    if (callBtn) {
        callBtn.innerHTML = `
            <svg id="callIcon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path
                            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
        `;
    }

    if (endCallBtn) {
        const endText = endCallBtn.querySelector('span:last-child');
        if (endText) endText.textContent = t.ui.ended;
    }

    const transHeader = document.querySelector('.transcription-header span');
    if (transHeader) transHeader.textContent = t.ui.transcriptionTitle;

    // Tooltips and Button Labels
    if (muteBtn) muteBtn.title = t.ui.mute;
    if (callBtn) callBtn.title = t.ui.startCall;
    if (endCallBtn) endCallBtn.title = t.ui.endCall;
    if (speakerBtn) speakerBtn.title = t.ui.speaker;


    // Orb Center Logo update
    if (orbCenter) {
        const logo = orbCenter.querySelector('.orb-icon');
        if (logo) logo.textContent = t.appTitle === 'Wisdom AI Agent' ? 'Wisdom' : t.appTitle;
    }

    // Call state text updates
    if (callModeBadge && currentMode) {
        callModeBadge.textContent = t.modes[currentMode].title;
    }

    if (!isCallActive) {
        updateCallStatus(t.ui.startPrompt, '');
    }

    clearTranscription();
}

// ===== SCREEN NAVIGATION =====
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function selectMode(mode) {
    if (mode === 'vision') {
        window.location.href = `vision/index.html?lang=${currentLang}`;
        return;
    }
    currentMode = mode;
    document.querySelector(`[data-mode="${mode}"]`).classList.add('selected');

    // Transition to call screen
    setTimeout(() => {
        const t = TRANSLATIONS[currentLang];
        callModeBadge.textContent = t.modes[mode].title;
        showScreen(callScreen);
        initWaveform();
    }, 400);
}

// ===== AUDIO UTILITIES =====
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

// ===== AUDIO PLAYBACK =====
function playAudioChunk(base64Audio) {
    if (!audioContext || isSpeakerMuted) return;

    const pcmData = base64ToArrayBuffer(base64Audio);
    const int16Array = new Int16Array(pcmData);
    const float32Array = new Float32Array(int16Array.length);

    for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
    }

    const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    // Connect through analyser for visualization
    if (!analyserNode) {
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 256;
        analyserNode.connect(audioContext.destination);
    }
    source.connect(analyserNode);

    const currentTime = audioContext.currentTime;
    if (nextPlayTime < currentTime) {
        nextPlayTime = currentTime;
    }

    source.start(nextPlayTime);
    nextPlayTime += audioBuffer.duration;
    activeSources.push(source);

    // Visual feedback
    callScreen.classList.add('ai-speaking');
    
    // Auto-remove finished sources
    source.onended = () => {
        activeSources = activeSources.filter(s => s !== source);
        if (activeSources.length === 0) {
            callScreen.classList.remove('ai-speaking');
        }
    };
}

function stopAllAudio() {
    activeSources.forEach(source => {
        try {
            source.stop();
        } catch (e) { }
    });
    activeSources = [];
    nextPlayTime = 0;
    if (audioContext) {
        nextPlayTime = audioContext.currentTime;
    }
    callScreen.classList.remove('ai-speaking');
}


// ===== WEBSOCKET CONNECTION =====
function connectWebSocket() {
    const t = TRANSLATIONS[currentLang];
    updateCallStatus(t.ui.connecting, 'connecting');

    websocket = new WebSocket(WS_URL);

    websocket.onopen = () => {
        console.log('WebSocket connected');

        // Send configuration
        const configMessage = {
            setup: {
                model: `models/${MODEL_NAME}`,
                generationConfig: {
                    responseModalities: ['AUDIO']
                },
                systemInstruction: {
                    parts: [{ text: t.prompts[currentMode] }]
                }
            }
        };

        websocket.send(JSON.stringify(configMessage));
        console.log('Configuration sent');
    };

    websocket.onmessage = async (event) => {
        try {
            let dataStr = event.data;
            if (dataStr instanceof Blob) {
                dataStr = await dataStr.text();
            }
            const response = JSON.parse(dataStr);

            // Setup complete
            if (response.setupComplete) {
                console.log('Setup complete');
                const t = TRANSLATIONS[currentLang];
                updateCallStatus(t.ui.ready, 'connected');
                startCallTimer();
                callScreen.classList.add('call-active');

                // Automated Greeting (User Request: AI speaks first)
                setTimeout(() => {
                    if (isCallActive && websocket && websocket.readyState === WebSocket.OPEN) {
                        const greeting = {
                            clientContent: {
                                turns: [{
                                    role: "user",
                                    parts: [{ text: "Hello! Please begin our session by following your system instructions." }]
                                }],
                                turnComplete: true
                            }
                        };
                        websocket.send(JSON.stringify(greeting));
                    }
                }, 800); 
                return;
            }

            if (response.serverContent) {
                const serverContent = response.serverContent;

                // Handle Interruption (CRITICAL)
                if (serverContent.interrupted) {
                    console.log('Server interrupted model turn');
                    stopAllAudio();
                }

                // Audio content
                if (serverContent.modelTurn?.parts) {
                    for (const part of serverContent.modelTurn.parts) {
                        if (part.inlineData) {
                            playAudioChunk(part.inlineData.data);
                        }
                    }
                }

                // Transcription Handling for UI (though hidden) and Interruption
                if (serverContent.inputTranscription?.text) {
                    const text = serverContent.inputTranscription.text.trim();
                    if (text) {
                        addTranscription('user', text);
                        
                        // Robust Local Interruption: If user is definitely talking (transcription arrived)
                        // we stop all pending AI audio to make it feel responsive.
                        if (activeSources.length > 0) {
                            console.log('Interruption: User speech detected');
                            stopAllAudio();
                        }
                    }
                }

                if (serverContent.outputTranscription?.text) {
                    const text = serverContent.outputTranscription.text.trim();
                    if (text) {
                        addTranscription('ai', text);
                    }
                }
            }
        } catch (err) {
            console.error('Message parse error:', err);
        }
    };

    websocket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        const t = TRANSLATIONS[currentLang];
        updateCallStatus(t.ui.error, '');
    };

    websocket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        if (isCallActive) {
            const t = TRANSLATIONS[currentLang];
            updateCallStatus(t.ui.disconnected, '');
            endCall();
        }
    };
}

// ===== MICROPHONE CAPTURE =====
async function startMicrophone() {
    try {
        audioContext = new AudioContext({ sampleRate: 16000 });

        mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: 16000,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });

        await audioContext.audioWorklet.addModule('audio-processor.js');

        const source = audioContext.createMediaStreamSource(mediaStream);
        workletNode = new AudioWorkletNode(audioContext, 'audio-capture-processor');

        workletNode.port.onmessage = (event) => {
            if (event.data.type === 'audio' && websocket?.readyState === WebSocket.OPEN && !isMuted) {
                const base64Data = arrayBufferToBase64(event.data.data);
                const audioMessage = {
                    realtimeInput: {
                        mediaChunks: [{
                            data: base64Data,
                            mimeType: 'audio/pcm;rate=16000'
                        }]
                    }
                };
                websocket.send(JSON.stringify(audioMessage));
            }
        };

        source.connect(workletNode);
        workletNode.connect(audioContext.destination);

        return true;
    } catch (err) {
        console.error('Microphone error:', err);
        const t = TRANSLATIONS[currentLang];
        updateCallStatus(t.ui.micError, '');
        return false;
    }
}

// ===== CALL MANAGEMENT =====
async function startCall() {
    if (!currentMode) return;

    isCallActive = true;
    callBtn.style.display = 'none';
    endCallBtn.style.display = 'flex';

    const micStarted = await startMicrophone();
    if (!micStarted) {
        isCallActive = false;
        callBtn.style.display = 'flex';
        endCallBtn.style.display = 'none';
        return;
    }

    connectWebSocket();
    clearTranscription();
}

function endCall() {
    isCallActive = false;
    callScreen.classList.remove('call-active', 'ai-speaking');

    // Close WebSocket
    if (websocket) {
        websocket.close();
        websocket = null;
    }

    // Stop microphone
    if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
        mediaStream = null;
    }

    if (workletNode) {
        workletNode.disconnect();
        workletNode = null;
    }

    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }

    // Reset state
    analyserNode = null;
    audioQueue = [];
    isPlayingAudio = false;
    nextPlayTime = 0;
    isMuted = false;
    muteBtn.classList.remove('muted');

    // Reset UI
    callBtn.style.display = 'flex';
    endCallBtn.style.display = 'none';

    // Show summary if there was a conversation
    showConversationSummary();
    const t = TRANSLATIONS[currentLang];
    updateCallStatus(t.ui.ended, '');
    connectionDot.className = 'call-status-dot';
}

function toggleMute() {
    isMuted = !isMuted;
    muteBtn.classList.toggle('muted', isMuted);
}

function toggleSpeaker() {
    isSpeakerMuted = !isSpeakerMuted;
    speakerBtn.classList.toggle('muted', isSpeakerMuted);
    if (isSpeakerMuted) {
        stopAllAudio(); // Stop current playing audio
    }
}

// ===== UI HELPERS =====
function updateCallStatus(text, state) {
    callStatus.textContent = text;
    connectionDot.className = 'call-status-dot';
    if (state) connectionDot.classList.add(state);
}

function startCallTimer() {
    callStartTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - callStartTime;
        const mins = Math.floor(elapsed / 60000).toString().padStart(2, '0');
        const secs = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
        callTimer.textContent = `${mins}:${secs}`;
    }, 1000);
}

function stopCallTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

let lastUserTranscript = null;
let lastAiTranscript = null;

function addTranscription(type, text) {
    // Remove placeholder
    if (!transcriptionContent) return;
    
    const placeholder = transcriptionContent.querySelector('.transcript-placeholder');
    if (placeholder) placeholder.remove();

    // Still append to invisible content if needed for summary, or just return
    // For now, let's keep it in memory if we want the summary to work, 
    // but the user wants to remove the box entirely.
    // If we remove the box, summary might not work as it reads from the box.
    // Let's create a hidden div if we want to keep summary, or just skip.
    // User said "khatam kar den", so let's skip transcriptions for now.
    return;
}

async function showConversationSummary() {
    const transcriptItems = document.querySelectorAll('.transcript-item');
    if (transcriptItems.length < 3) return; // Too short for a summary (placeholder + 2 messages)

    summaryModal.classList.add('active');
    summaryBody.innerHTML = '<div class="summary-loading">جیمنائی آپ کی گفتگو کا تجزیہ کر رہا ہے...</div>';

    let fullTranscript = "";
    transcriptItems.forEach(item => {
        const labelEl = item.querySelector('.transcript-label');
        const textEl = item.querySelector('.transcript-text');
        if (labelEl && textEl) {
            fullTranscript += `${labelEl.textContent}: ${textEl.textContent}\n`;
        }
    });

    const prompt = `Please provide a beautiful philosophical analysis and summary of the following conversation in Urdu. 
    Focus on the logic used, the key philosophical points, and provide a final encouraging note from "Wisdom AI Agent" (the tutor).
    Use clean HTML formatting (p, ul, li tags). Avoid markdown like **.
    
    Conversation:
    ${fullTranscript}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        const summaryHtml = data.candidates[0].content.parts[0].text;
        summaryBody.innerHTML = summaryHtml;
    } catch (err) {
        console.error('Summary Error:', err);
        summaryBody.innerHTML = "<p>تجزیہ حاصل کرنے میں خرابی پیش آئی، لیکن آپ کی گفتگو شاندار تھی!</p>";
    }
}

function clearTranscription() {
    if (!transcriptionContent) return;
    const t = TRANSLATIONS[currentLang];
    transcriptionContent.innerHTML = `<div class="transcript-placeholder">${t.ui.transcriptionPlaceholder}</div>`;
    lastUserTranscript = null;
    lastAiTranscript = null;
}

// ===== EVENT LISTENERS =====
function initModeListeners() {
    const freshModeCards = document.querySelectorAll('.mode-card');
    freshModeCards.forEach(card => {
        card.addEventListener('click', () => {
            selectMode(card.dataset.mode);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectMode(card.dataset.mode);
            }
        });
    });
}
initModeListeners();

callBtn.addEventListener('click', startCall);
endCallBtn.addEventListener('click', endCall);
muteBtn.addEventListener('click', toggleMute);
speakerBtn.addEventListener('click', toggleSpeaker);

backBtn.addEventListener('click', () => {
    if (isCallActive) {
        endCall();
    }
    showScreen(landingScreen);
    modeCards.forEach(c => c.classList.remove('selected'));
    currentMode = null;
    callTimer.textContent = '00:00';
    const t = TRANSLATIONS[currentLang];
    updateCallStatus(t.ui.startPrompt, '');
});

toggleTranscription?.addEventListener('click', () => {
    transcriptionPanel?.classList.toggle('collapsed');
});

closeSummaryBtn.addEventListener('click', () => {
    summaryModal.classList.remove('active');
});

speakerBtn.addEventListener('click', () => {
    speakerBtn.classList.toggle('muted');
});

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    initParticles();

    // Set up language selector
    languageSelect.addEventListener('change', (e) => {
        updateLanguage(e.target.value);
    });

    // Initial translation load (Default to English)
    languageSelect.value = 'en';
    updateLanguage('en');

    // Info Modal Listeners
    infoBtn.addEventListener('click', () => {
        infoModal.classList.add('active');
        // Automatically close after 5 seconds
        setTimeout(() => {
            infoModal.classList.remove('active');
        }, 5000); 
    });

    closeInfoBtn.addEventListener('click', () => {
        infoModal.classList.remove('active');
    });

    window.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            infoModal.classList.remove('active');
        }
    });
});
