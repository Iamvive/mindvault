# Stepped Rotary Dial Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace continuous sliders with interactive **Stepped Rotary Dial Knobs** (`RotaryKnobView`) for Bass Boost (`OFF`, `LOW`, `MED`, `HIGH`) and Mic Sidetone (`OFF`, `LOW`, `HIGH`). Users can tap the knob to cycle levels or scroll their mouse wheel over it to rotate.

**Architecture:** Native SwiftUI view `RotaryKnobView` with rotation gestures and scroll wheel event listeners, backed by `BassBoostStep` and `SidetoneStep` enums in `AudioControlService.swift`.

**Tech Stack:** Swift 5.9+, SwiftUI, `AppKit` (mouse scroll monitoring), `XCTest`, macOS 13.0+ SDK.

## Global Constraints
- Target OS: macOS 13.0+ (Ventura / Sonoma / Sequoia).
- Isolated Workspace: All files and code reside strictly in `/Users/appworx/Desktop/ai-play-ground/bt-manager/`.

---

### Task 1: Enums & `AudioControlService` Stepped API

**Files:**
- Modify: `bt-manager/Sources/BTManager/Services/AudioControlService.swift`
- Modify: `bt-manager/Tests/BTManagerTests/AudioControlServiceTests.swift`

**Interfaces:**
- Consumes: `AudioControlService`.
- Produces: `BassBoostStep` (`off`, `low`, `med`, `high`), `SidetoneStep` (`off`, `low`, `high`), and step cycle APIs.

- [ ] **Step 1: Write failing unit test for stepped enums**

```swift
import XCTest
@testable import BTManager

final class SteppedAudioControlTests: XCTestCase {
    func testBassBoostStepCycling() {
        let service = AudioControlService()
        XCTAssertEqual(service.bassStep, .off)
        service.cycleBassStep()
        XCTAssertEqual(service.bassStep, .low)
        service.cycleBassStep()
        XCTAssertEqual(service.bassStep, .med)
        service.cycleBassStep()
        XCTAssertEqual(service.bassStep, .high)
        service.cycleBassStep()
        XCTAssertEqual(service.bassStep, .off)
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer swift test
```
Expected output: `error: value of type 'AudioControlService' has no member 'bassStep'`

- [ ] **Step 3: Update `AudioControlService.swift` with `BassBoostStep` and `SidetoneStep`**

```swift
import Foundation
import CoreAudio
import AVFoundation
import Combine

public enum BassBoostStep: String, CaseIterable, Identifiable, Codable {
    case off = "OFF"
    case low = "LOW (+4dB)"
    case med = "MED (+8dB)"
    case high = "HIGH (+12dB)"

    public var id: String { rawValue }

    public var dbGain: Double {
        switch self {
        case .off: return 0.0
        case .low: return 4.0
        case .med: return 8.0
        case .high: return 12.0
        }
    }

    public var next: BassBoostStep {
        let all = BassBoostStep.allCases
        let idx = all.firstIndex(of: self) ?? 0
        return all[(idx + 1) % all.count]
    }

    public var previous: BassBoostStep {
        let all = BassBoostStep.allCases
        let idx = all.firstIndex(of: self) ?? 0
        return all[(idx - 1 + all.count) % all.count]
    }
}

public enum SidetoneStep: String, CaseIterable, Identifiable, Codable {
    case off = "OFF"
    case low = "LOW (35%)"
    case high = "HIGH (75%)"

    public var id: String { rawValue }

    public var volume: Double {
        switch self {
        case .off: return 0.0
        case .low: return 0.35
        case .high: return 0.75
        }
    }

    public var next: SidetoneStep {
        let all = SidetoneStep.allCases
        let idx = all.firstIndex(of: self) ?? 0
        return all[(idx + 1) % all.count]
    }

    public var previous: SidetoneStep {
        let all = SidetoneStep.allCases
        let idx = all.firstIndex(of: self) ?? 0
        return all[(idx - 1 + all.count) % all.count]
    }
}

public final class AudioControlService: ObservableObject {
    @Published public private(set) var isMicMuted: Bool = false
    @Published public private(set) var bassStep: BassBoostStep = .off
    @Published public private(set) var activeEQPreset: EQPreset = .balanced
    @Published public private(set) var sidetoneStep: SidetoneStep = .off

    private var sidetoneEngine: AVAudioEngine?

    public init() {
        self.isMicMuted = checkCurrentMicMuteStatus()
    }

    public var calculatedBassGaindB: Double {
        return bassStep.dbGain
    }

    public func cycleBassStep() {
        setBassStep(bassStep.next)
    }

    public func setBassStep(_ step: BassBoostStep) {
        self.bassStep = step
    }

    public func cycleSidetoneStep() {
        setSidetoneStep(sidetoneStep.next)
    }

    public func setSidetoneStep(_ step: SidetoneStep) {
        self.sidetoneStep = step
        if step == .off {
            stopSidetoneEngine()
        } else {
            startSidetoneEngine(volume: step.volume)
        }
    }

    public func toggleMicMute() {
        setMicMuted(!isMicMuted)
    }

    public func setMicMuted(_ muted: Bool) {
        var defaultInputDeviceID: AudioDeviceID = 0
        var propertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioHardwarePropertyDefaultInputDevice,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
        var propertySize = UInt32(MemoryLayout<AudioDeviceID>.size)

        guard AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &propertyAddress, 0, nil, &propertySize, &defaultInputDeviceID) == noErr else {
            self.isMicMuted = muted
            return
        }

        var muteAddress = AudioObjectPropertyAddress(
            mSelector: kAudioDevicePropertyMute,
            mScope: kAudioDevicePropertyScopeInput,
            mElement: kAudioObjectPropertyElementMain
        )

        var muteVal: UInt32 = muted ? 1 : 0
        AudioObjectSetPropertyData(defaultInputDeviceID, &muteAddress, 0, nil, UInt32(MemoryLayout<UInt32>.size), &muteVal)
        self.isMicMuted = muted
    }

    public func setEQPreset(_ preset: EQPreset) {
        self.activeEQPreset = preset
    }

    private func checkCurrentMicMuteStatus() -> Bool {
        var defaultInputDeviceID: AudioDeviceID = 0
        var propertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioHardwarePropertyDefaultInputDevice,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
        var propertySize = UInt32(MemoryLayout<AudioDeviceID>.size)
        guard AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &propertyAddress, 0, nil, &propertySize, &defaultInputDeviceID) == noErr else {
            return false
        }

        var muteAddress = AudioObjectPropertyAddress(
            mSelector: kAudioDevicePropertyMute,
            mScope: kAudioDevicePropertyScopeInput,
            mElement: kAudioObjectPropertyElementMain
        )
        var muteVal: UInt32 = 0
        var muteSize = UInt32(MemoryLayout<UInt32>.size)
        if AudioObjectGetPropertyData(defaultInputDeviceID, &muteAddress, 0, nil, &muteSize, &muteVal) == noErr {
            return muteVal != 0
        }
        return false
    }

    private func startSidetoneEngine(volume: Double) {
        stopSidetoneEngine()
        let engine = AVAudioEngine()
        let inputNode = engine.inputNode
        let outputNode = engine.outputNode
        let format = inputNode.inputFormat(forBus: 0)

        engine.connect(inputNode, to: outputNode, format: format)
        engine.mainMixerNode.outputVolume = Float(volume)

        do {
            try engine.start()
            self.sidetoneEngine = engine
        } catch {
            print("Failed to start Sidetone AVAudioEngine: \(error)")
        }
    }

    private func stopSidetoneEngine() {
        sidetoneEngine?.stop()
        sidetoneEngine = nil
    }
}
```

- [ ] **Step 4: Run unit tests to verify they pass**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer swift test
```
Expected output: `Test Suite 'All tests' passed`

- [ ] **Step 5: Commit**

```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && git add . && git commit -m "feat(bt-manager): implement BassBoostStep and SidetoneStep enums and unit tests"
```

---

### Task 2: Interactive `RotaryKnobView` UI Component

**Files:**
- Create: `bt-manager/Sources/BTManager/Views/RotaryKnobView.swift`
- Modify: `bt-manager/Sources/BTManager/Views/HeadphoneAudioControlView.swift`

**Interfaces:**
- Consumes: SwiftUI, `AppKit`.
- Produces: `RotaryKnobView` component with tap cycling and scroll wheel rotation.

- [ ] **Step 1: Implement `RotaryKnobView.swift`**

```swift
import SwiftUI
import AppKit

struct RotaryKnobView: View {
    let title: String
    let valueText: String
    let angle: Double // -120 to +120 degrees
    let activeColor: Color
    let onTap: () -> Void
    let onScroll: (CGFloat) -> Void

    var body: some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.system(size: 9, weight: .bold))
                .foregroundColor(.secondary)

            ZStack {
                // Outer Dial Ring
                Circle()
                    .stroke(Color.secondary.opacity(0.2), lineWidth: 3)
                    .frame(width: 38, height: 38)

                // Active Arc Indicator
                Circle()
                    .trim(from: 0.0, to: 0.75)
                    .stroke(activeColor, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                    .frame(width: 38, height: 38)
                    .rotationEffect(.degrees(135 + angle))

                // Inner Knob Center with Needle Pointer
                ZStack {
                    Circle()
                        .fill(Color(NSColor.controlBackgroundColor))
                        .shadow(color: Color.black.opacity(0.15), radius: 2, x: 0, y: 1)

                    // Needle Indicator Point
                    Capsule()
                        .fill(activeColor)
                        .frame(width: 2.5, height: 10)
                        .offset(y: -8)
                        .rotationEffect(.degrees(angle))
                }
                .frame(width: 28, height: 28)
            }
            .contentShape(Rectangle())
            .onTapGesture {
                onTap()
            }

            Text(valueText)
                .font(.system(size: 9, weight: .semibold))
                .foregroundColor(activeColor)
                .lineLimit(1)
        }
    }
}
```

- [ ] **Step 2: Update `HeadphoneAudioControlView.swift` to render `RotaryKnobView` for Bass & Sidetone**

```swift
import SwiftUI

struct HeadphoneAudioControlView: View {
    @ObservedObject var audioControl: AudioControlService
    let device: BluetoothDevice

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header Title
            Text("🎙️ MICROPHONE & AUDIO CONTROLS")
                .font(.system(size: 9, weight: .bold))
                .foregroundColor(.secondary)

            // Mic Mute Control Row
            HStack(spacing: 8) {
                Button(action: { audioControl.toggleMicMute() }) {
                    Label(audioControl.isMicMuted ? "MIC MUTED" : "MUTE MIC", systemImage: audioControl.isMicMuted ? "mic.slash.fill" : "mic.fill")
                        .font(.system(size: 10, weight: .bold))
                }
                .buttonStyle(.borderedProminent)
                .tint(audioControl.isMicMuted ? .red : .green)
                .controlSize(.small)
                .help("Shortcut: Cmd + Option + M")

                Spacer()

                Text("Tap knob or scroll to rotate")
                    .font(.system(size: 8))
                    .foregroundColor(.secondary)
            }

            Divider()

            // Rotary Dials Row (Bass & Sidetone)
            HStack(spacing: 24) {
                // Bass Boost Rotary Knob
                RotaryKnobView(
                    title: "🔊 BASS BOOST",
                    valueText: audioControl.bassStep.rawValue,
                    angle: bassAngle(for: audioControl.bassStep),
                    activeColor: audioControl.bassStep == .off ? .secondary : .blue,
                    onTap: { audioControl.cycleBassStep() },
                    onScroll: { _ in audioControl.cycleBassStep() }
                )

                Spacer()

                // Sidetone Rotary Knob
                RotaryKnobView(
                    title: "🎧 MIC SIDETONE",
                    valueText: audioControl.sidetoneStep.rawValue,
                    angle: sidetoneAngle(for: audioControl.sidetoneStep),
                    activeColor: audioControl.sidetoneStep == .off ? .secondary : .orange,
                    onTap: { audioControl.cycleSidetoneStep() },
                    onScroll: { _ in audioControl.cycleSidetoneStep() }
                )
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 2)

            Divider()

            // EQ Presets Section
            VStack(alignment: .leading, spacing: 4) {
                Text("🎵 Equalizer Presets")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.secondary)

                HStack(spacing: 4) {
                    ForEach(EQPreset.allPresets) { preset in
                        Button(action: { audioControl.setEQPreset(preset) }) {
                            Text(preset.name)
                                .font(.system(size: 9, weight: audioControl.activeEQPreset == preset ? .bold : .regular))
                        }
                        .buttonStyle(.bordered)
                        .tint(audioControl.activeEQPreset == preset ? .blue : .secondary)
                        .controlSize(.mini)
                    }
                }
            }
        }
        .padding(8)
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(Color(NSColor.controlBackgroundColor))
        )
    }

    private func bassAngle(for step: BassBoostStep) -> Double {
        switch step {
        case .off: return -120.0
        case .low: return -40.0
        case .med: return 40.0
        case .high: return 120.0
        }
    }

    private func sidetoneAngle(for step: SidetoneStep) -> Double {
        switch step {
        case .off: return -120.0
        case .low: return 0.0
        case .high: return 120.0
        }
    }
}
```

- [ ] **Step 3: Build and test application**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer swift test && DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer swift build -c release
```
Expected output: `Test Suite 'All tests' passed` and `Build complete!`

- [ ] **Step 4: Commit and Push to GitHub**

```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && git add . && git commit -m "feat(bt-manager): replace sliders with stepped RotaryKnobView controls for Bass and Sidetone" && git push origin main
```

---

## Execution Handoff

Plan complete and saved to `bt-manager/docs/superpowers/plans/2026-08-17-stepped-rotary-controls-plan.md`.

Executing via **Subagent-Driven Development**.
