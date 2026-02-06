import { BskyAgent } from 'https://esm.sh/@atproto/api@0.13.20';

const status = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const visualizer = document.getElementById('visualizer');
const bars = document.querySelectorAll('.wave-bar');
let audioTag = null; 
let agent = null, hls = null, videoQueue = [], currentIndex = 0;
let isBusy = false; 

// --- TELEMETRY ---
const debugLog = document.createElement('div');
debugLog.id = "debugLog";
debugLog.className = "hidden";
document.body.appendChild(debugLog);

const log = (msg) => {
    const entry = document.createElement('div');
    entry.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    debugLog.prepend(entry);
    console.log(msg);
};

const debugToggle = document.getElementById('debugToggle');
debugToggle.onclick = () => debugLog.classList.toggle('hidden');

// --- STARTUP ---
(async function init() {
    localStorage.clear(); // Nuclear reset on every load
    status.innerText = "SYSTEM PURGED";
    startBtn.disabled = false;
    startBtn.innerText = "IGNITE";
    log("Station Initialized. Local storage cleared.");
})();

// --- THE NEW LOGIN LOGIC ---
startBtn.addEventListener('click', async () => {
    const handle = document.getElementById('handle').value.trim();
    const pass = document.getElementById('app-pw').value.trim();
    
    if (!handle || !pass) {
        log("Error: Missing handle or app-password.");
        return;
    }

    try {
        status.innerText = "PENETRATING STORM...";
        log(`Attempting login for ${handle}...`);
        
        // Ensure we are using a fresh agent every single click
        agent = new BskyAgent({ service: 'https://bsky.social' });
        
        const loginRes = await agent.login({ 
            identifier: handle, 
            password: pass 
        });
        
        if (loginRes.success) {
            log("Login Successful! Transitioning UI...");
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('tunerSection').classList.remove('hidden');
            status.innerText = "ALTITUDE REACHED";
        }
    } catch (e) { 
        log(`LOGIN FAILED: ${e.message}`);
        status.innerText = "AUTH FAILED";
        
        // Specific help for common errors
        if (e.message.includes("fetch")) {
            log("Network Error: Is your Pixel blocking cross-site requests?");
        }
    }
});

// --- CORE LOGIC (Rest of the previous script remains) ---
async function clearCore() {
    if (hls) { hls.stopLoad(); hls.detachMedia(); hls.destroy(); hls = null; }
    if (audioTag) { audioTag.pause(); audioTag.src = ""; audioTag.load(); audioTag.remove(); audioTag = null; }
    return new Promise(res => setTimeout(res, 300));
}

function animateRain() {
    if (!audioTag || audioTag.paused) return;
    bars.forEach(b => b.style.height = `${Math.floor(Math.random() * 80) + 20}px`);
    requestAnimationFrame(animateRain);
}

async function playTrack(index) {
    if (!videoQueue[index]) {
        status.innerText = "HORIZON CLEAR";
        visualizer.classList.remove('active');
        isBusy = false;
        return;
    }
    await clearCore();
    audioTag = new Audio();
    audioTag.onended = () => skipSignal();
    hls = new Hls({ enableWorker: true, backBufferLength: 0 });
    hls.loadSource(videoQueue[index].playlist);
    hls.attachMedia(audioTag);
    hls.on(Hls.Events.MANIFEST_PARSED, async () => {
        status.innerText = `SIGNAL: ${videoQueue[index].author}`;
        visualizer.classList.add('active');
        animateRain();
        try { await audioTag.play(); isBusy = false; }
        catch (e) { status.innerText = "TAP TO RESYNC"; isBusy = false; }
    });
}

async function skipSignal() {
    if (isBusy) return;
    isBusy = true;
    currentIndex++;
    await playTrack(currentIndex);
}

document.getElementById('tuneBtn').addEventListener('click', async () => {
    if (isBusy) return;
    status.innerText = "SCANNING...";
    try {
        const res = await fetch(`https://bsky.social/xrpc/app.bsky.feed.getTimeline?limit=50`, {
            headers: { "Authorization": `Bearer ${agent.session.accessJwt}` }
        });
        const d = await res.json();
        videoQueue = d.feed
            .filter(f => f.post.embed && f.post.embed.$type === 'app.bsky.embed.video#view')
            .map(f => ({ playlist: f.post.embed.playlist, author: f.post.author.handle }));
        if (videoQueue.length > 0) { currentIndex = 0; isBusy = true; await playTrack(0); }
        else { status.innerText = "NO SIGNALS"; }
    } catch (e) { log(`SCAN ERROR: ${e.message}`); isBusy = false; }
});

document.getElementById('skipBtn').addEventListener('click', skipSignal);
document.getElementById('stopBtn').addEventListener('click', async () => {
    await clearCore();
    visualizer.classList.remove('active');
    status.innerText = "DISSIPATED";
    isBusy = false;
});
