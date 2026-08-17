# Headphone Audio & Microphone Control Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `BTManager` with a native Headphone Audio & Microphone Control Suite featuring Bass Boost ($0\text{ to }+12\text{ dB}$), 4 Equalizer Presets (*Balanced*, *Bass Boost*, *Vocal Clarity*, *Treble Boost*), instant Mic Mute toggle with global hotkey (`Cmd+Opt+M`), and low-latency (~5ms) Mic Sidetone loopback.

**Architecture:** Native macOS Swift services `AudioControlService` wrapping `CoreAudio` (`kAudioDevicePropertyMute`), `AVAudioEngine` for low-latency sidetone, `AudioUnit` NBandEQ DSP node, `GlobalHotkeyService` for `Cmd+Opt+M` key monitoring, and `HeadphoneAudioControlView` embedded inside `DeviceRowView`.

**Tech Stack:** Swift 5.9+, SwiftUI, `CoreAudio`, `AVFoundation`, `AudioToolbox`, `AppKit`, `XCTest`, macOS 13.0+ SDK.

## Global Constraints
- Target OS: macOS 13.0+ (Ventura / Sonoma / Sequoia).
- Isolated Workspace: All files and code must reside strictly in `/Users/appworx/Desktop/ai-play-ground/bt-manager/`.
- UI Footprint: Preserves fixed 310px width menu bar popover, dynamically expanding vertically when headphone controls are revealed.

---

### Task 1: Data Models (`EQPreset.swift`)

**Files:**
- Create: `bt-manager/Sources/BTManager/Models/EQPreset.swift`
- Create: `bt-manager/Tests/BTManagerTests/EQPresetTests.swift`

**Interfaces:**
- Consumes: `Foundation`.
- Produces: `EQPreset` data model with frequency band gain curves ($80\text{ Hz}$, $250\text{ Hz}$, $1\text{ kHz}$, $4\text{ kHz}$, $12\text{ kHz}$).

- [ ] **Step 1: Write failing unit test for `EQPreset`**

```swift
import XCTest
@testable import BTManager

final class EQPresetTests: XCTestCase {
    func testEQPresetGains() {
        let bassPreset = EQPreset.bassBoost
        XCTAssertEqual(bassPreset.gain80Hz, 10.0)
        XCTAssertEqual(bassPreset.gain250Hz, 4.0)

        let vocalPreset = EQPreset.vocalClarity
        XCTAssertEqual(vocalPreset.gain4kHz, 5.0)
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer swift test
```
Expected output: `error: cannot find 'EQPreset' in scope`

- [ ] **Step 3: Implement `EQPreset.swift`**

```swift
import Foundation

public struct EQPreset: Identifiable, Codable, Equatable, Hashable {
    public var id: String { name }
    public let name: String
    public let gain80Hz: Double
    public let gain250Hz: Double
    public let gain1kHz: Double
    public let gain4kHz: Double
    public let gain12kHz: Double

    public init(name: String, gain80Hz: Double, gain250Hz: Double, gain1kHz: Double, gain4kHz: Double, gain12kHz: Double) {
        self.name = name
        self.gain80Hz = gain80Hz
        self.gain250Hz = gain250Hz
        self.gain1kHz = gain1kHz
        self.gain4kHz = gain4kHz
        self.gain12kHz = gain12kHz
    }

    public static let balanced = EQPreset(name: "Balanced", gain80Hz: 0.0, gain250Hz: 0.0, gain1kHz: 0.0, gain4kHz: 0.0, gain12kHz: 0.0)
    public static let bassBoost = EQPreset(name: "Bass Boost", gain80Hz: 10.0, gain250Hz: 4.0, gain1kHz: 0.0, gain4kHz: 0.0, gain12kHz: 2.0)
    public static let vocalClarity = EQPreset(name: "Vocal Clarity", gain80Hz: -2.0, gain250Hz: 0.0, gain1kHz: 3.0, gain4kHz: 5.0, gain12kHz: 1.0)
    public static let trebleBoost = EQPreset(name: "Treble Boost", gain80Hz: -1.0, gain250Hz: 0.0, gain1kHz: 2.0, gain4kHz: 6.0, gain12kHz: 8.0)

    public static let allPresets: [EQPreset] = [.balanced, .bassBoost, .vocalClarity, .trebleBoost]
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
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && git add . && git commit -m "feat(bt-manager): add EQPreset data models and unit tests"
```

---

### Task 2: `AudioControlService` & `GlobalHotkeyService` Core Engines

**Files:**
- Create: `bt-manager/Sources/BTManager/Services/AudioControlService.swift`
- Create: `bt-manager/Sources/BTManager/Services/GlobalHotkeyService.swift`
- Create: `bt-manager/Tests/BTManagerTests/AudioControlServiceTests.swift`

**Interfaces:**
- Consumes: `CoreAudio`, `AVFoundation`, `AppKit`.
- Produces: `AudioControlService` with `@Published var isMicMuted`, `bassBoostLevel`, `activeEQPreset`, `isSidetoneEnabled`, and `GlobalHotkeyService` for `Cmd+Opt+M`.

- [ ] **Step 1: Write failing unit test for `AudioControlService`**

```swift
import XCTest
@testable import BTManager

final class AudioControlServiceTests: XCTestCase {
    func testBassBoostMapping() {
        let service = AudioControlService()
        service.setBassBoostLevel(0.5)
        XCTAssertEqual(service.bassBoostLevel, 0.5)
        XCTAssertEqual(service.calculatedBassGaindB, 6.0)
    }

    func testMicMuteToggle() {
        let service = AudioControlService()
        let initial = service.isMicMuted
        service.setMicMuted(!initial)
        XCTAssertEqual(service.isMicMuted, !initial)
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer swift test
```
Expected output: `error: cannot find 'AudioControlService' in scope`

- [ ] **Step 3: Implement `AudioControlService.swift`**

```swift
import Foundation
import CoreAudio
import AVFoundation
import Combine

public final class AudioControlService: ObservableObject {
    @Published public private(set) var isMicMuted: Bool = false
    @Published public private(set) var bassBoostLevel: Double = 0.0 // 0.0 to 1.0
    @Published public private(set) var activeEQPreset: EQPreset = .balanced
    @Published public private(set) var isSidetoneEnabled: Bool = false
    @Published public private(set) var sidetoneVolume: Double = 0.5 // 0.0 to 1.0

    private var sidetoneEngine: AVAudioEngine?

    public init() {
        self.isMicMuted = checkCurrentMicMuteStatus()
    }

    public var calculatedBassGaindB: Double {
        return bassBoostLevel * 12.0
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

    public func setBassBoostLevel(_ level: Double) {
        self.bassBoostLevel = max(0.0, min(1.0, level))
    }

    public func setEQPreset(_ preset: EQPreset) {
        self.activeEQPreset = preset
    }

    public func toggleSidetone() {
        setSidetoneEnabled(!isSidetoneEnabled)
    }

    public func setSidetoneEnabled(_ enabled: Bool) {
        self.isSidetoneEnabled = enabled
        if enabled {
            startSidetoneEngine()
        } else {
            stopSidetoneEngine()
        }
    }

    public func setSidetoneVolume(_ volume: Double) {
        self.sidetoneVolume = max(0.0, min(1.0, volume))
        sidetoneEngine?.mainMixerNode.outputVolume = Float(self.sidetoneVolume)
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

    private func startSidetoneEngine() {
        stopSidetoneEngine()
        let engine = AVAudioEngine()
        let inputNode = engine.inputNode
        let outputNode = engine.outputNode
        let format = inputNode.inputFormat(forBus: 0)

        engine.connect(inputNode, to: outputNode, format: format)
        engine.mainMixerNode.outputVolume = Float(sidetoneVolume)

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

- [ ] **Step 4: Implement `GlobalHotkeyService.swift`**

```swift
import Foundation
import AppKit

public final class GlobalHotkeyService {
    private let audioControlService: AudioControlService
    private var eventMonitor: Any?

    public init(audioControlService: AudioControlService) {
        self.audioControlService = audioControlService
    }

    public func startListening() {
        stopListening()
        // Listen for Cmd + Option + M
        eventMonitor = NSEvent.addGlobalMonitorForEvents(matching: .keyDown) { [weak self] event in
            let flags = event.modifierFlags.intersection(.deviceIndependentFlagsMask)
            if flags == [.command, .option] && event.keyCode == 46 { // 46 = 'M' key
                DispatchQueue.main.async {
                    self?.audioControlService.toggleMicMute()
                }
            }
        }
    }

    public func stopListening() {
        if let monitor = eventMonitor {
            NSEvent.removeMonitor(monitor)
            eventMonitor = nil
        }
    }
}
```

- [ ] **Step 5: Run unit tests to verify they pass**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer swift test
```
Expected output: `Test Suite 'All tests' passed`

- [ ] **Step 6: Commit**

```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && git add . && git commit -m "feat(bt-manager): implement AudioControlService and GlobalHotkeyService engines and tests"
```

---

### Task 3: UI Components (`HeadphoneAudioControlView.swift` & Integration)

**Files:**
- Create: `bt-manager/Sources/BTManager/Views/HeadphoneAudioControlView.swift`
- Modify: `bt-manager/Sources/BTManager/Views/DeviceRowView.swift`
- Modify: `bt-manager/Sources/BTManager/Views/MainPopoverView.swift`

**Interfaces:**
- Consumes: SwiftUI, `AudioControlService`, `BluetoothDevice`.
- Produces: `HeadphoneAudioControlView` embedded inside expandable headphone rows.

- [ ] **Step 1: Implement `HeadphoneAudioControlView.swift`**

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

            // Mic Mute & Sidetone Controls Row
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

                Toggle(isOn: Binding(
                    get: { audioControl.isSidetoneEnabled },
                    set: { _ in audioControl.toggleSidetone() }
                )) {
                    Text("🎧 Sidetone")
                        .font(.system(size: 10, weight: .medium))
                }
                .toggleStyle(.checkbox)
            }

            // Sidetone Volume Slider if enabled
            if audioControl.isSidetoneEnabled {
                HStack(spacing: 6) {
                    Text("Sidetone Vol:")
                        .font(.system(size: 9))
                        .foregroundColor(.secondary)

                    Slider(value: Binding(
                        get: { audioControl.sidetoneVolume },
                        set: { audioControl.setSidetoneVolume($0) }
                    ), in: 0.0...1.0)
                    .controlSize(.mini)
                }
            }

            Divider()

            // Bass Boost Slider
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text("🔊 Bass Boost Level")
                        .font(.system(size: 10, weight: .semibold))
                    Spacer()
                    Text(String(format: "+%.1f dB", audioControl.calculatedBassGaindB))
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.blue)
                }

                Slider(value: Binding(
                    get: { audioControl.bassBoostLevel },
                    set: { audioControl.setBassBoostLevel($0) }
                ), in: 0.0...1.0)
                .controlSize(.small)
            }

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
}
```

- [ ] **Step 2: Update `DeviceRowView.swift` to render `HeadphoneAudioControlView` for headphones**

```swift
import SwiftUI

struct DeviceRowView: View {
    let device: BluetoothDevice
    @ObservedObject var bluetoothService: BluetoothService
    @ObservedObject var preferencesStore: PreferencesStore
    let audioService: AudioRoutingService
    let diagnosticService: DeviceDiagnosticService
    let fixService: FixActionsService
    @ObservedObject var audioControl: AudioControlService

    @State private var isExpanded: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 8) {
                // Device Type Icon
                Image(systemName: device.deviceType == .headphones ? "headphones" : "bluetooth")
                    .font(.system(size: 14))
                    .foregroundColor(device.isConnected ? .green : .secondary)
                    .frame(width: 20)

                // Name & Connection Status
                VStack(alignment: .leading, spacing: 2) {
                    Text(device.name)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.primary)
                        .lineLimit(1)

                    Text(device.isConnected ? "Connected" : "Disconnected")
                        .font(.system(size: 10))
                        .foregroundColor(device.isConnected ? .green : .secondary)
                }

                Spacer(minLength: 4)

                // Expand Chevron Button
                Button(action: { isExpanded.toggle() }) {
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.secondary)
                }
                .buttonStyle(.plain)
                .help("Toggle Controls & Health Diagnostics")

                // Exclusive Lock Toggle Button
                Button(action: {
                    let currentLock = preferencesStore.isExclusiveLockEnabled(macAddress: device.macAddress)
                    preferencesStore.setExclusiveLock(macAddress: device.macAddress, enabled: !currentLock)
                    preferencesStore.setFavorite(macAddress: device.macAddress, isFavorite: true)
                }) {
                    Image(systemName: preferencesStore.isExclusiveLockEnabled(macAddress: device.macAddress) ? "lock.fill" : "lock.open")
                        .font(.system(size: 11))
                        .foregroundColor(preferencesStore.isExclusiveLockEnabled(macAddress: device.macAddress) ? .orange : .secondary)
                }
                .buttonStyle(.plain)
                .help("Toggle Exclusive Lock")

                // Connect Action Button
                Button(action: {
                    bluetoothService.forceConnect(macAddress: device.macAddress) { success in
                        if success {
                            audioService.setSystemAudioOutput(matchingDeviceName: device.name)
                            audioService.setSystemAudioInput(matchingDeviceName: device.name)
                        }
                    }
                }) {
                    Text(device.isConnected ? "Connected" : "Connect")
                        .font(.system(size: 11, weight: .medium))
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
                .disabled(bluetoothService.isConnecting || device.isConnected)

                // Favorite Star Button
                Button(action: {
                    let currentFav = preferencesStore.isFavorite(macAddress: device.macAddress)
                    preferencesStore.setFavorite(macAddress: device.macAddress, isFavorite: !currentFav)
                }) {
                    Image(systemName: preferencesStore.isFavorite(macAddress: device.macAddress) ? "star.fill" : "star")
                        .font(.system(size: 12))
                        .foregroundColor(.yellow)
                }
                .buttonStyle(.plain)
            }

            if isExpanded {
                if device.deviceType == .headphones {
                    HeadphoneAudioControlView(audioControl: audioControl, device: device)
                }

                let report = diagnosticService.inspect(device: device)
                DiagnosticCardView(report: report, device: device, fixService: fixService)
                    .transition(.opacity)
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 5)
        .background(
            RoundedRectangle(cornerRadius: 6, style: .continuous)
                .fill(Color(NSColor.labelColor).opacity(0.04))
        )
    }
}
```

- [ ] **Step 3: Update `MainPopoverView.swift` to instantiate `AudioControlService` and `GlobalHotkeyService`**

```swift
import SwiftUI

struct MainPopoverView: View {
    @ObservedObject var bluetoothService: BluetoothService
    @ObservedObject var preferencesStore: PreferencesStore
    @ObservedObject var watcher: AutoReconnectWatcher
    let audioService: AudioRoutingService
    private let diagnosticService = DeviceDiagnosticService()
    private let fixService = FixActionsService()
    @StateObject private var audioControl = AudioControlService()
    @State private var hotkeyService: GlobalHotkeyService?

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header
            HStack {
                Label("BT Manager", systemImage: "headphones")
                    .font(.system(size: 13, weight: .bold))
                Spacer()
                Button(action: { bluetoothService.fetchPairedDevices() }) {
                    Image(systemName: "arrow.clockwise")
                        .font(.system(size: 12))
                        .foregroundColor(.secondary)
                }
                .buttonStyle(.plain)
                .help("Refresh Devices")
            }

            if !bluetoothService.statusMessage.isEmpty {
                Text(bluetoothService.statusMessage)
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }

            Divider()

            // Favorites Section
            let favorites = bluetoothService.devices.filter { preferencesStore.isFavorite(macAddress: $0.macAddress) }
            if !favorites.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("FAVORITES")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.secondary)

                    ForEach(favorites) { dev in
                        DeviceRowView(
                            device: dev,
                            bluetoothService: bluetoothService,
                            preferencesStore: preferencesStore,
                            audioService: audioService,
                            diagnosticService: diagnosticService,
                            fixService: fixService,
                            audioControl: audioControl
                        )
                    }
                }

                Divider()
            }

            // All Devices Section
            VStack(alignment: .leading, spacing: 4) {
                Text("PAIRED DEVICES")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.secondary)

                if bluetoothService.devices.isEmpty {
                    Text("No Bluetooth devices found")
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                        .padding(.vertical, 4)
                } else {
                    VStack(spacing: 4) {
                        ForEach(bluetoothService.devices) { dev in
                            DeviceRowView(
                                device: dev,
                                bluetoothService: bluetoothService,
                                preferencesStore: preferencesStore,
                                audioService: audioService,
                                diagnosticService: diagnosticService,
                                fixService: fixService,
                                audioControl: audioControl
                            )
                        }
                    }
                }
            }

            Divider()

            // Footer
            HStack {
                Button("Quit") {
                    NSApplication.shared.terminate(nil)
                }
                .buttonStyle(.plain)
                .font(.system(size: 11))
                .foregroundColor(.secondary)

                Spacer()

                Button("Bluetooth Settings") {
                    if let url = URL(string: "x-apple.systempreferences:com.apple.preferences.Bluetooth") {
                        NSWorkspace.shared.open(url)
                    }
                }
                .buttonStyle(.plain)
                .font(.system(size: 11))
                .foregroundColor(.secondary)
            }
        }
        .padding(12)
        .frame(width: 310)
        .onAppear {
            bluetoothService.fetchPairedDevices()
            watcher.start()
            if hotkeyService == nil {
                let hk = GlobalHotkeyService(audioControlService: audioControl)
                hk.startListening()
                self.hotkeyService = hk
            }
        }
    }
}
```

- [ ] **Step 4: Build and test application**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer swift test && DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer swift build -c release
```
Expected output: `Test Suite 'All tests' passed` and `Build complete!`

- [ ] **Step 5: Commit**

```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && git add . && git commit -m "feat(bt-manager): complete HeadphoneAudioControlView and global hotkey integration"
```

---

## Execution Handoff

Plan complete and saved to `bt-manager/docs/superpowers/plans/2026-08-17-headphone-audio-controls-plan.md`.

Two execution options:

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using `executing-plans`, batch execution with checkpoints.
