import { BskyAgent } from 'https://esm.sh/@atproto/api@0.13.20';

const status = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const visualizer = document.getElementById('visualizer');
let audioTag = null; 
let agent = null, hls = null, videoQueue = [], currentIndex = 0;
let isBusy = false; 

// Restore previous handle
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
    try {
        status.innerText = "ASCENDING...";
        localStorage.setItem('bt_handle', handle);
        agent = new BskyAgent({ service: 'https://bsky.social' });
        await agent.login({ identifier: handle, password: pass });
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('tunerSection').classList.remove('hidden');
        status.innerText = "ALTITUDE REACHED";
    } catch (e) { status.innerText = "IGNITION FAILED"; }
});

async function resetStation() {
    if (hls) {
        hls.stopLoad();
        hls.detachMedia();
        hls.destroy();
        hls = null;
    }
    if (audioTag) {
        audioTag.pause();
        audioTag.src = "";
        audioTag.load();
        audioTag.remove();
        audioTag = null;
    }
    return new Promise(resolve => setTimeout(resolve, 300)); // Longer breath for hardware
}

async function playTrack(index) {
    // SAFETY CHECK: Ensure index is valid
    if (!videoQueue || videoQueue.length === 0 || index >= videoQueue.length) {
        status.innerText = "HORIZON CLEAR";
        visualizer.classList.remove('active');
        isBusy = false;
        return;
    }

    await resetStation();

    try {
        audioTag = new Audio();
        audioTag.onended = () => { skipSignal(); };

        const { playlist, author } = videoQueue[index];
        
        hls = new Hls({
            enableWorker: true,
            backBufferLength: 0,
            manifestLoadingMaxRetry: 10,
            fragLoadingMaxRetry: 10
        });

        hls.loadSource(playlist);
        hls.attachMedia(audioTag);
        
        hls.on(Hls.Events.MANIFEST_PARSED, async () => {
            status.innerText = `SIGNAL: ${author}`;
            visualizer.classList.remove('hidden');
            visualizer.classList.add('active');
            
            try {
                await audioTag.play();
                isBusy = false; 
            } catch (error) {
                status.innerText = "TAP TO RESYNC";
                isBusy = false;
                window.addEventListener('click', () => audioTag?.play(), {once: true});
            }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                console.warn("HLS Error - Attempting Recovery", data);
                hls.recoverMediaError();
            }
        });

    } catch (err) {
        console.error("Playback System Crash:", err);
        status.innerText = "SYSTEM RECOVERY...";
        isBusy = false;
        // Auto-attempt the next track if one fails
        setTimeout(() => skipSignal(), 1000);
    }
}

async function skipSignal() {
    if (isBusy) return;
    isBusy = true;
    
    currentIndex++;
    status.innerText = `TUNING ${currentIndex + 1}/${videoQueue.length}`;
    await playTrack(currentIndex);
}

document.getElementById('tuneBtn').addEventListener('click', async () => {
    if (isBusy) return;
    status.innerText = "SCANNING...";
    try {
        const response = await fetch(`https://bsky.social/xrpc/app.bsky.feed.getTimeline?limit=50`, {
            headers: { "Authorization": `Bearer ${agent.session.accessJwt}` }
        });
        const data = await response.json();
        
        // Filter and map
        videoQueue = data.feed
            .filter(f => f.post.embed && f.post.embed.$type === 'app.bsky.embed.video#view')
            .map(f => ({ playlist: f.post.embed.playlist, author: f.post.author.handle }));
        
        if (videoQueue.length > 0) {
            currentIndex = 0;
            isBusy = true;
            await playTrack(currentIndex);
        } else { 
            status.innerText = "NO SIGNALS"; 
            isBusy = false;
        }
    } catch (e) { 
        status.innerText = "LOST SIGNAL"; 
        isBusy = false; 
    }
});

document.getElementById('skipBtn').addEventListener('click', skipSignal);

document.getElementById('stopBtn').addEventListener('click', async () => { 
    await resetStation();
    visualizer.classList.remove('active'); 
    status.innerText = "DISSIPATED"; 
    isBusy = false;
    currentIndex = 0;
});
