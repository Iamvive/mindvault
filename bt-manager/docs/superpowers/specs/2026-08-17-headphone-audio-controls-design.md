# Headphone Audio & Microphone Control Suite Design Spec

**Date**: 2026-08-17  
**Status**: Approved by User  
**Target Project Location**: `bt-manager/`  
**Target Platform**: macOS 13.0+ (Ventura / Sonoma / Sequoia)  

---

## 1. Executive Summary & Goal

`BTManager` currently manages Bluetooth connection retries, audio output/input routing, exclusive device locking, and health diagnostics.

**New Feature Goal**: Extend `BTManager` with a native **Headphone Audio & Microphone Control Suite**. Users can adjust real-time Bass Boost ($0\text{ to }+12\text{ dB}$), switch 4 Equalizer Presets (*Balanced*, *Bass Boost*, *Vocal Clarity*, *Treble Boost*), instantly toggle system Microphone Mute via UI or global hotkey (`Cmd+Opt+M`), and enable low-latency (~5ms) Mic Sidetone (mic monitoring) for clear calls on closed-back headphones.

---

## 2. System Architecture & Components

```
                              ┌──────────────────────────────────┐
                              │  SwiftUI MenuBarExtra Popover    │
                              └────────────────┬─────────────────┘
                                               │ Click Headphone Expand
                                               ▼
                              ┌──────────────────────────────────┐
                              │    HeadphoneAudioControlView     │
                              └────────────────┬─────────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               ▼                               ▼                               ▼
    ┌────────────────────┐          ┌────────────────────┐          ┌────────────────────┐
    │ AudioControlService│          │GlobalHotkeyService │          │  PreferencesStore  │
    └──────────┬─────────┘          └──────────┬─────────┘          └──────────┬─────────┘
               │                               │                               │
               ▼                               ▼                               ▼
   CoreAudio AudioUnit NBandEQ          NSEvent Global Monitor        UserDefaults Persistence
  (Bass Shelf Gain & Presets)             (Cmd+Opt+M Hotkey)            (Bass, EQ, Sidetone)
```

### New Modules & Responsibilities

1. **`AudioControlService.swift`**:
   * Controls system microphone mute via `CoreAudio` `kAudioDevicePropertyMute`.
   * Manages AudioUnit N-Band Low-Shelf Equalizer DSP node for Bass Boost ($0\text{ to }+12\text{ dB}$ at $80\text{ Hz}$).
   * Configures 4 EQ presets (*Balanced*, *Bass Boost*, *Vocal Clarity*, *Treble Boost*).
   * Manages low-latency (~5ms) `AVAudioEngine` input-to-output Mic Sidetone loopback.
   * Publishes `@Published var isMicMuted: Bool`, `@Published var isSidetoneEnabled: Bool`, `@Published var bassBoostLevel: Double`, and `@Published var activeEQPreset: EQPreset`.

2. **`GlobalHotkeyService.swift`**:
   * Listens for `Cmd+Opt+M` globally using `NSEvent.addGlobalMonitorForEvents(matching: .keyDown)`.
   * Triggers `AudioControlService.toggleMicMute()` and displays system mute notifications.

3. **`EQPreset.swift`**:
   * Data model defining 5-band gain profiles ($80\text{ Hz}$, $250\text{ Hz}$, $1\text{ kHz}$, $4\text{ kHz}$, $12\text{ kHz}$).

4. **`HeadphoneAudioControlView.swift` (UI)**:
   * Embedded inside expandable headphone rows (`DeviceRowView`).
   * Renders Mic Mute button (`Cmd+Opt+M`), Sidetone toggle/slider, Bass Boost slider, and EQ preset pills.

---

## 3. Detailed Audio Specifications

### Low-Frequency Shelf Filter (Bass Boost)
* **Center Frequency**: $80\text{ Hz}$
* **Gain Range**: $0.0\text{ dB}$ to $+12.0\text{ dB}$
* **Q-Factor**: $0.707$ (Butterworth response for natural bass warmth)

### Equalizer Presets Table
| Preset Name | $80\text{ Hz}$ | $250\text{ Hz}$ | $1\text{ kHz}$ | $4\text{ kHz}$ | $12\text{ kHz}$ | Best For |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Balanced** | $0\text{ dB}$ | $0\text{ dB}$ | $0\text{ dB}$ | $0\text{ dB}$ | $0\text{ dB}$ | Neutral / Studio |
| **Bass Boost** | $+10\text{ dB}$ | $+4\text{ dB}$ | $0\text{ dB}$ | $0\text{ dB}$ | $+2\text{ dB}$ | EDM, Hip-Hop, Movies |
| **Vocal Clarity** | $-2\text{ dB}$ | $0\text{ dB}$ | $+3\text{ dB}$ | $+5\text{ dB}$ | $+1\text{ dB}$ | Podcasts, Zoom/Teams |
| **Treble Boost** | $-1\text{ dB}$ | $0\text{ dB}$ | $+2\text{ dB}$ | $+6\text{ dB}$ | $+8\text{ dB}$ | Classical, Acoustic |

---

## 4. User Interface Specification

* **Width**: Fits fixed 310px popover width smoothly.
* **Mute Badge**: Red `🔴 MIC MUTED` vs Green `🟢 MIC ACTIVE`.
* **Hotkey**: Global `Cmd+Opt+M` shortcut trigger.

---

## 5. Verification & Test Plan

1. **Unit Tests (`AudioControlServiceTests.swift`)**:
   * Test mic mute toggle state changes.
   * Test EQ preset gain curve mathematical values.
   * Test bass boost dB mapping ($0.0 \rightarrow 0\text{ dB}$, $1.0 \rightarrow +12\text{ dB}$).
2. **Integration Testing**:
   * Verify hotkey `Cmd+Opt+M` triggers mic mute.
   * Verify sidetone audio engine loopback.
   * Verify memory footprint remains < 80 MB.
