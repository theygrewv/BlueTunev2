import { BskyAgent } from 'https://esm.sh/@atproto/api@0.13.20';

const status = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const visualizer = document.getElementById('visualizer');
const bars = document.querySelectorAll('.wave-bar');
let audioTag = null; 
let agent = null, hls = null, videoQueue = [], currentIndex = 0;
let isBusy = false; 

const debugLog = document.createElement('div');
debugLog.id = "debugLog";
debugLog.className = "hidden";
document.body.appendChild(debugLog);

const log = (msg) => {
    const entry = document.createElement('div');
    entry.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    debugLog.prepend(entry);
};

const debugToggle = document.getElementById('debugToggle');
debugToggle.onclick = () => debugLog.classList.toggle('hidden');

const savedHandle = localStorage.getItem('bt_handle');
if (savedHandle) document.getElementById('handle').value = savedHandle;

(async function init() {
    status.innerText = "ATMOSPHERE STABLE";
    startBtn.disabled = false;
    startBtn.innerText = "IGNITE";
})();

startBtn.addEventListener('click', async () => {
    const handle = document.getElementById('handle').value.trim();
    const pass = document.getElementById('app-pw').value.trim();
    if (!handle || !pass) return log("Error: Credentials required.");

    try {
        status.innerText = "ASCENDING...";
        log(`Ignition for ${handle}`);
        localStorage.removeItem('bt_handle');
        agent = new BskyAgent({ service: 'https://bsky.social' });
        await agent.login({ identifier: handle, password: pass });
        
        localStorage.setItem('bt_handle', handle);
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('tunerSection').classList.remove('hidden');
        status.innerText = "ALTITUDE REACHED";
        log("System Online.");
    } catch (e) { 
        log(`IGNITION ERROR: ${e.message}`);
        status.innerText = "AUTH FAILED"; 
    }
});

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

    const { playlist, author } = videoQueue[index];
    hls = new Hls({ enableWorker: true, backBufferLength: 0 });
    hls.loadSource(playlist);
    hls.attachMedia(audioTag);

    hls.on(Hls.Events.MANIFEST_PARSED, async () => {
        log(`Signal Locked: ${author}`);
        status.innerText = `SIGNAL: ${author}`;
        visualizer.classList.add('active');
        animateRain();
        try {
            await audioTag.play();
            isBusy = false;
        } catch (e) {
            status.innerText = "TAP TO RESYNC";
            isBusy = false;
            window.addEventListener('click', () => audioTag?.play(), {once: true});
        }
    });

    hls.on(Hls.Events.ERROR, (e, d) => {
        log(`HLS: ${d.details}`);
        if (d.fatal) hls.recoverMediaError();
    });
}

async function skipSignal() {
    if (isBusy) return;
    isBusy = true;
    currentIndex++;
    status.innerText = "TUNING NEXT...";
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
    } catch (e) { log(`SCAN ERR: ${e.message}`); isBusy = false; }
});

document.getElementById('skipBtn').addEventListener('click', skipSignal);
document.getElementById('stopBtn').addEventListener('click', async () => {
    await clearCore();
    visualizer.classList.remove('active');
    status.innerText = "DISSIPATED";
    isBusy = false;
});
