# 🎧 BTManager — macOS Bluetooth Device & Audio Manager

A native, ultra-lightweight macOS Menu Bar Extra application built with **Swift** and **SwiftUI** designed to manage Bluetooth devices (AKG headphones, Keychron keyboards, Logitech mice, etc.), force-reconnect stubborn hardware, auto-route macOS audio/mic sessions, and run live health diagnostics with 1-click automated repairs.

---

## 🌟 Key Features

* **🎧 AKG "Force Connect" Engine**: Disconnects hung/stale Bluetooth link handles and performs exponential backoff connection retries to pull stubborn headphones away from phones or secondary paired devices.
* **🔊 Auto Audio & Mic Routing**: Automatically binds macOS default sound output AND microphone input to your connected headset (`CoreAudio` & `AVFoundation`).
* **🔒 Exclusive Connection Lock**: Actively protects your Mac's connection lock to prevent smartphones or external devices from hijacking your Bluetooth headphones or keyboards.
* **⚡ Keychron Keyboard Optimizer**: Optimizes macOS system key repeat response times (`KeyRepeat = 2`, `InitialKeyRepeat = 15`) to eliminate typing and backspace latency.
* **🔍 Live Device Inspector & Health Audit**: Expand any device card to view live RSSI signal quality (dBm), battery levels (%), BLE/Classic transport mode, microphone permission checks, and virtual audio driver conflicts (`ManyCam`, `Teams`).
* **🛠️ 1-Click Automated Repairs**: One-tap diagnostic fix buttons:
  * `[ 🛠️ Fix Mic & Audio Routing ]`
  * `[ ⚡ Optimize Key Latency ]`
  * `[ 🖱️ Smooth Pointer Fix ]`
* **🚀 Native & Lightweight**: Runs strictly as a Menu Bar Extra (`LSUIElement = true`) with < 75 MB RAM footprint and 0.0% idle CPU usage.

---

## 🛠️ Requirements & Tech Stack

* **Operating System**: macOS 13.0+ (Ventura / Sonoma / Sequoia)
* **Language & Frameworks**: Swift 5.9+, SwiftUI, `IOBluetooth`, `CoreAudio`, `AVFoundation`
* **System Helper**: Uses macOS native APIs with optional `blueutil` CLI integration.

---

## 📦 Building & Running Locally

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/bt-manager.git
cd bt-manager
```

### 2. Build and Test
```bash
# Run unit test suites
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer swift test

# Build release executable
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer swift build -c release
```

### 3. Launch App
```bash
./.build/release/BTManager &
```

---

## 📖 How to Use

1. Look for the **🎧 Headphones icon** in your top macOS menu bar.
2. Click the icon to view all paired devices.
3. Click **⭐ Star** to pin a device to **FAVORITES**.
4. Click **🔒 Lock** to activate **Exclusive Mac Connection Protection**.
5. Click **chevron `v`** to open the **Health Inspector** and run 1-click repairs!

---

## 📄 License

MIT License. Designed for macOS developers and power users.
