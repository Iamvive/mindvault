# Bluetooth Device Inspector & 1-Click Fix Engine Design Spec

**Date**: 2026-08-17  
**Status**: Approved by User  
**Target Project Location**: `bt-manager/`  
**Target Platform**: macOS 13.0+ (Ventura / Sonoma / Sequoia)  

---

## 1. Executive Summary & Goal

`BTManager` currently manages connection retries, audio output routing, and exclusive connection locking for AKG headphones and paired Bluetooth devices.

**New Feature Goal**: Expand `BTManager` with an **Integrated Expandable Device Inspector & 1-Click Fix Engine**. Users can expand any device row (Headphones, Keyboards, Mice, Trackpads, Speakers) to inspect live health diagnostics (RSSI signal dBm, Battery %, Connection Mode, Audio Codecs, Virtual Driver Conflicts, Key Repeat Latencies) and execute instant 1-click automated repairs.

---

## 2. System Architecture & Components

```
                              ┌──────────────────────────────────┐
                              │  SwiftUI MenuBarExtra Popover    │
                              └────────────────┬─────────────────┘
                                               │ Click Expand Chevron
                                               ▼
                              ┌──────────────────────────────────┐
                              │     Expandable Diagnostic Card   │
                              └────────────────┬─────────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               ▼                               ▼                               ▼
    ┌────────────────────┐          ┌────────────────────┐          ┌────────────────────┐
    │DeviceDiagnosticSvc │          │ AudioRoutingService│          │   SystemCommands   │
    └──────────┬─────────┘          └──────────┬─────────┘          └──────────┬─────────┘
               │                               │                               │
               ▼                               ▼                               ▼
     AVFoundation / IOKit                 CoreAudio                    macOS Defaults
 (Mic Auth, RSSI, Battery %)      (Input & Output Audio Routing)   (Key Repeat, Mouse Scaling)
```

### New Modules & Responsibilities

1. **`DeviceDiagnosticService.swift`**:
   * Inspects hardware status for any device MAC address.
   * Queries `AVFoundation` for microphone privacy authorization and active input session conflicts.
   * Queries `IOBluetooth` and `blueutil` for RSSI signal strength dBm and battery percentage.
   * Queries macOS system defaults for keyboard repeat rate and mouse scaling.
   * Generates a `DeviceDiagnosticReport` containing identified issues and available 1-click fix actions.

2. **`DeviceDiagnosticReport.swift`**:
   * Data model containing `batteryLevel: Int?`, `rssi: Int?`, `connectionType: String`, `issues: [DiagnosticIssue]`, and `suggestedFix: FixAction?`.

3. **`DeviceRowView.swift` & `DiagnosticCardView.swift` (UI)**:
   * Adds an expandable chevron toggle (`chevron.down` / `chevron.up`) to each device row.
   * Renders the inline diagnostic card displaying health badges (Battery, Signal RSSI, Type) and 1-Click Repair buttons.

---

## 3. Inspection Rules & 1-Click Fix Actions by Device Category

### 🎧 Headphones & Audio Devices (AKG, eBuddies, Buds)
* **Diagnostics**:
  * Microphone input authorization status (`AVCaptureDevice`).
  * Virtual audio driver conflict check (`ManyCam`, `Teams`).
  * Active sample rate check (16kHz HFP Mono vs 44.1kHz A2DP Stereo).
  * RSSI signal strength (Excellent > -60 dBm, Good -60 to -75, Weak < -75).
* **Automated Action**: **`[ 🛠️ Fix Mic & Audio Routing ]`**
  * Programmatically sets macOS Default Audio Input AND Output to target headset.
  * Flushes virtual audio input sessions and resets CoreAudio device handles.

### ⌨️ Keyboards (Keychron K6, Wireless Keyboards)
* **Diagnostics**:
  * Transport type (Bluetooth Low Energy vs Classic Bluetooth).
  * Key repeat speed & initial delay until repeat (`KeyRepeat`, `InitialKeyRepeat`).
  * Function Key mode (`com.apple.keyboard.fnState`).
* **Automated Action**: **`[ ⚡ Optimize Key Latency ]`**
  * Sets optimal macOS key repeat response time for zero typing lag (`KeyRepeat = 2`, `InitialKeyRepeat = 15`).
  * Re-asserts Bluetooth HID connection handle.

### 🖱️ Mice & Trackpads (M720 Triathlon, Wireless Mice)
* **Diagnostics**:
  * Battery percentage monitoring (< 20% low battery warning).
  * Pointer tracking scaling (`com.apple.mouse.scaling`).
* **Automated Action**: **`[ 🖱️ Smooth Pointer Fix ]`**
  * Normalizes mouse tracking scaling to standard smooth response (`scaling = 2.5`).
  * Flushes BLE HID input buffers.

---

## 4. User Interface & Expandable Card Specification

* **Compact Popover Bounds**: Preserves fixed 310px width and expands vertically when a card is opened.
* **Badges**:
  * 🔋 **Battery**: `100%`, `85%`, `⚠️ 15% (Low)`
  * 📶 **Signal**: `Excellent (-57 dBm)`, `Good (-68 dBm)`, `Weak (-82 dBm)`
  * ⚙️ **Status**: `Mic: Active`, `⌨️ Key Repeat: Fast`, `🖱️ Mouse: Normal`
* **Fix Buttons**: Colored `.borderedProminent` action buttons embedded inside the expanded card.

---

## 5. Verification & Test Plan

1. **Unit Tests (`DeviceDiagnosticServiceTests.swift`)**:
   * Verify RSSI classification (Excellent, Good, Weak).
   * Verify diagnostic issue detection for audio, keyboard, and mouse models.
2. **Integration Testing**:
   * Verify expanding cards in SwiftUI `MainPopoverView`.
   * Verify 1-click fix actions execute without errors.
   * Verify memory footprint remains < 80 MB.
