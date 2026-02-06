# 📻 Nimbus: Video-to-Audio Radio

**Nimbus** is a lightweight, privacy-focused Progressive Web App (PWA) that transforms your BlueSky video feed into a hands-free audio broadcast. Designed for "de-googled" devices and hardened browsers, it extracts audio streams from BlueSky videos and plays them in a continuous, automated "radio" loop.

---

## 🚀 Key Features

* **Video-to-Audio Extraction:** Automatically identifies video posts and streams only the audio track using the `HLS.js` engine.
* **Hands-Free Playlist:** Once a video ends, the radio automatically "tunes" to the next video in your feed.
* **Privacy-First:** No trackers, no data collection, and no complex third-party dependencies beyond the AT Protocol.
* **Pixel Optimized:** Designed specifically for hardened browsers (like Vanadium) on Pixel devices.
* **PWA Ready:** Installable as a standalone app on your home screen with a full-screen, "analog hardware" interface.

---

## 🛠️ The Tech Stack

* **Language:** Vanilla JavaScript, HTML5, CSS3.
* **Engine:** `HLS.js` for real-time video stream processing.
* **Protocol:** `@atproto/api` for secure BlueSky communication.
* **Native Fetch:** Uses hardened browser networking to bypass common CORS restrictions.

---

## 📦 Installation

Since this is a Progressive Web App, no "App Store" is required:

1.  Visit the live URL on your mobile browser.
2.  Tap the browser menu (three dots) and select **"Add to Home Screen"**.
3.  Launch **BlueTune** from your app drawer for a full-screen, analog experience.

---

## 📻 Usage Instructions

1.  **Connect:** Enter your BlueSky handle and **App Password**.
2.  **Scan:** Tap **"SCAN FOR VIDEO AUDIO"** to build your local airwaves queue.
3.  **Broadcast:** Hit **"START BROADCAST"** to begin the audio loop.
4.  **Controls:** Use **SKIP** to jump to the next track or **EJECT** to stop the feed.

> **Note:** For security, always use an **App Password** (Settings > Privacy > App Passwords) rather than your main BlueSky login.

---

## 📜 Credits & License

* **Engine:** Powered by [HLS.js](https://github.com/video-dev/hls.js/)
* **API:** Built on the [AT Protocol](https://atproto.com/)
* **Development:** Created as part of the Nimbus project.

Licensed under the MIT License - feel free to fork and tune your own airwaves!
