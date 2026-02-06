// --- DEBUG SYSTEM ---
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

// Toggle Debug View
const debugToggle = document.createElement('div');
debugToggle.id = "debugToggle";
debugToggle.innerText = "• SYSTEM TELEMETRY •";
document.querySelector('.chassis').appendChild(debugToggle);

debugToggle.onclick = () => debugLog.classList.toggle('hidden');

// --- UPDATED HLS LOGIC WITH LOGGING ---
async function playTrack(index) {
    if (index >= videoQueue.length) {
        log("Queue End Reached.");
        return;
    }

    log(`Attempting Track ${index + 1}: ${videoQueue[index].author}`);
    await resetStation();

    audioTag = new Audio();
    audioTag.onended = () => { log("Track Ended Naturally."); skipSignal(); };

    hls = new Hls({ enableWorker: true });
    hls.loadSource(videoQueue[index].playlist);
    hls.attachMedia(audioTag);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
        log("Manifest Loaded. Starting Playback.");
        audioTag.play().catch(e => log(`Playback Blocked: ${e.message}`));
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
        log(`HLS ERROR: ${data.details} | Fatal: ${data.fatal}`);
        if (data.fatal) hls.recoverMediaError();
    });
}
