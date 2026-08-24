# Headphone Audio & Microphone Control Suite Design Spec (v2: Stepped Rotary Dial Controls)

**Date**: 2026-08-17  
**Status**: Approved by User  
**Target Project Location**: `bt-manager/`  
**Target Platform**: macOS 13.0+ (Ventura / Sonoma / Sequoia)  

---

## 1. Executive Summary & Goal

Replace continuous seekbar sliders with **Interactive Stepped Rotary Dial Knobs** (`RotaryKnobView`) for Bass Boost and Mic Sidetone volume control in `BTManager`. Users can tap the rotary dial to step through discrete audio levels or scroll their mouse wheel over the knob to rotate it.

---

## 2. Stepped Rotary Dial Specifications

### 🔊 Bass Boost Rotary Dial (`BassLevel`)
* **Levels**:
  1. `OFF` — $0\text{ dB}$ (Gain level 0.0)
  2. `LOW` — $+4\text{ dB}$ (Gain level 0.33)
  3. `MED` — $+8\text{ dB}$ (Gain level 0.66)
  4. `HIGH` — $+12\text{ dB}$ (Gain level 1.0)
* **Interactions**:
  * **Tap / Click**: Cycles `OFF` $\rightarrow$ `LOW` $\rightarrow$ `MED` $\rightarrow$ `HIGH` $\rightarrow$ `OFF`.
  * **Scroll Wheel / Rotate**: Rotating mouse wheel over knob increments/decrements level smoothly.

### 🎧 Mic Sidetone Rotary Dial (`SidetoneLevel`)
* **Levels**:
  1. `OFF` — $0\%$ Volume (Engine Stopped)
  2. `LOW` — $35\%$ Volume (Subtle Voice Monitoring)
  3. `HIGH` — $75\%$ Volume (Full Voice Monitoring)
* **Interactions**:
  * **Tap / Click**: Cycles `OFF` $\rightarrow$ `LOW` $\rightarrow$ `HIGH` $\rightarrow$ `OFF`.
  * **Scroll Wheel / Rotate**: Rotates knob between levels.

---

## 3. UI Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ 🎧 AKG K361-BT                  Connected   [ 🔒 ] [  ⭐  ]│
│    v Hide Controls                                          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎙️ MICROPHONE & AUDIO CONTROLS                           │ │
│ │                                                         │ │
│ │ [ 🎙️ MUTE MIC (Cmd+Opt+M) ]                             │ │
│ │   Status: 🟢 Mic Active                                 │ │
│ │                                                         │ │
│ │  ROTARY DIALS (Tap to cycle or scroll to rotate):       │ │
│ │   ( 🔊 Bass: MED +8dB )       ( 🎧 Sidetone: LOW 35% )   │ │
│ │                                                         │ │
│ │ 🎵 Equalizer Presets:                                   │ │
│ │ [ Balanced ]  [ (Bass Boost) ]  [ Vocal ]  [ Treble ]   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Verification & Test Plan

1. **Unit Tests (`AudioControlServiceTests.swift`)**:
   * Test stepped bass boost enum values (`off`, `low`, `medium`, `high`).
   * Test stepped sidetone enum values (`off`, `low`, `high`).
2. **UI Integration Testing**:
   * Test tap gesture cycling level.
   * Test scroll wheel rotation gesture updating values.
