# Bluetooth Device Manager (AKG Force-Connect) - macOS Menu Bar App Design Spec

**Date**: 2026-08-17  
**Status**: Approved by User  
**Target Project Location**: `bt-manager/` (Isolated Directory)  
**Target Platform**: macOS 13.0+ (Ventura / Sonoma / Sequoia)  

---

## 1. Executive Summary & Problem Statement

Bluetooth headphones (such as AKG headphones) often suffer from connectivity friction on macOS. Common issues include:
1. macOS maintaining a stale connection handle when the headset powers on or off.
2. Headphones staying tethered to another previously paired device (e.g., a smartphone).
3. Successful Bluetooth connection occurring without macOS automatically routing system audio output to the headset.

**Goal**: Build a lightweight, native macOS Menu Bar Extra application (`bt-manager`) that provides:
* A quick dropdown UI listing all paired Bluetooth devices with instant Connect/Disconnect toggles.
* A dedicated **"Force Connect"** action that aggressive retries connections, flushes stale link states, and auto-switches macOS system audio output to the headset.
* An **Auto-Reconnect Watchdog** daemon that detects when favorited devices are available and automatically force-connects them in the background.

---

## 2. System Architecture & Components

The application is built natively for macOS using Swift and SwiftUI, packaged as a menu bar agent (`LSUIElement = true`).

```
                              ┌──────────────────────────────────┐
                              │     macOS Status Bar Icon        │
                              └────────────────┬─────────────────┘
                                               │ Click
                                               ▼
                              ┌──────────────────────────────────┐
                              │  SwiftUI MenuBarExtra Popover    │
                              └────────────────┬─────────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               ▼                               ▼                               ▼
    ┌────────────────────┐          ┌────────────────────┐          ┌────────────────────┐
    │  BluetoothService  │          │ AudioRoutingService│          │AutoReconnectWatcher│
    └──────────┬─────────┘          └──────────┬─────────┘          └──────────┬─────────┘
               │                               │                               │
               ▼                               ▼                               ▼
   IOBluetooth / blueutil                  CoreAudio                      UserDefaults
 (Device Connect/Disconnect)       (System Audio Output Switch)       (Favorites & Settings)
```

### Module Responsibilities

1. **`StatusBarController` (`App.swift` & `MenuBarExtra`)**:
   * Manages status bar icon rendering, badge counters (battery level), and connecting animations.
   * Controls popover panel presentation.

2. **`BluetoothService`**:
   * Interfaces with macOS `IOBluetooth` APIs and `blueutil` CLI wrapper.
   * Handles device enumeration (Name, MAC address, Device Class, RSSI, Battery level, Connection status).
   * Executes connection and disconnection lifecycle routines.

3. **`AudioRoutingService`**:
   * Wraps macOS `CoreAudio` APIs (`AudioObjectGetPropertyData`, `AudioObjectSetPropertyData`).
   * Queries default output audio device IDs and programmatically switches default system audio output to the connected Bluetooth device.

4. **`AutoReconnectWatcher`**:
   * Background monitoring service running a configurable timer (e.g. 10s intervals).
   * Listens for device state changes and automatically triggers the Force Connect sequence for devices tagged as "Favorite / Auto-Reconnect".

5. **`PreferencesStore`**:
   * Persists favorited MAC addresses, auto-reconnect preferences, max retry counts, and launch-at-login toggles using `UserDefaults`.

---

## 3. Bluetooth & Audio Reconnection Logic

### The Force Connect Engine

When the user clicks **"Force Connect"** or the **Auto-Reconnect Watchdog** triggers:

1. **Flush Link**: Issue an explicit `disconnect` request to the target device's MAC address to ensure macOS releases any hung/stale socket.
2. **Retry Loop**: Initiate a connection attempt sequence up to $N$ times (default: 3 retries, 1.5-second interval between attempts).
3. **Audio Routing**: Upon receiving connection confirmation from `IOBluetooth`, query `CoreAudio` for the audio device matching the Bluetooth device name and set it as default system sound output.
4. **User Feedback**: Update status bar badge, display connection status pill in UI, and trigger a macOS system notification.

### Auto-Reconnect Watchdog

* Monitors favorite devices marked with `autoReconnect = true`.
* If a favorite device drops connection or turns back on nearby, the watchdog executes the Force Connect sequence.
* To preserve system resources and battery, the watchdog pauses retries after 3 unsuccessful cycles until manually re-triggered by user action.

---

## 4. User Interface & Menu Bar Panel Design

### Status Bar Icon States
* **Connected**: Solid headphone icon 🎧 with live battery % badge.
* **Disconnected**: Outline headphone icon.
* **Connecting**: Animated spinner / pulsing badge during retry attempts.

### Menu Bar Popover Panel Layout (SwiftUI)

* **Header Bar**: App Title ("BT Manager"), Master Bluetooth toggle, Settings icon.
* **Favorites Section**: Large cards for pinned devices (e.g. AKG Headphones) featuring:
  * Device Name & Type Icon
  * Battery Level & Signal Strength (RSSI)
  * Prominent **[ ⚡ Force Connect ]** Button
  * **Auto-Reconnect Switch**
* **All Paired Devices List**: Compact list of all paired devices with instant `Connect` / `Disconnect` buttons and a Star icon to pin/unpin favorites.
* **Footer**: Active audio output status ("🔊 Audio: AKG Headphones") and shortcut to open macOS Bluetooth Settings.

---

## 5. Storage, Permissions & Error Handling

* **Project Isolation**: All codebase assets, Swift packages, docs, and build targets will reside strictly inside the dedicated directory `./bt-manager/`.
* **Data Persistence**: `UserDefaults` for Favorites array, Auto-Reconnect toggles, Auto-Switch Audio boolean, and Launch at Login preference.
* **Permissions**: `NSBluetoothAlwaysUsageDescription` in `Info.plist`. Standard CoreAudio APIs (no root/sudo privileges needed).
* **Launch at Login**: Integrates `SMAppService` (macOS 13+ native API).
* **Error Recovery**:
  * *Bluetooth Powered Off*: Show 1-click "Turn On Bluetooth" button.
  * *Device Out of Range*: Show non-intrusive notification after max retry timeout.
  * *Audio Mismatch*: Force disconnect/reconnect cycle if device is connected but audio fails to route.

---

## 6. Verification & Testing Plan

1. **Unit & Logic Testing**:
   * Mock `BluetoothService` to test retry backoff, max retry limits, and status parsing.
   * Test `PreferencesStore` persistence for favorites and auto-reconnect flags.
2. **Integration & Hardware Testing**:
   * Verify enumeration of paired Bluetooth devices on macOS.
   * Test Force Connect against AKG headphones while headphones are connected to a secondary device (e.g., phone).
   * Verify system audio output switches automatically to AKG headphones upon connection.
   * Verify menu bar popover responsiveness and low idle RAM usage (< 15 MB).
