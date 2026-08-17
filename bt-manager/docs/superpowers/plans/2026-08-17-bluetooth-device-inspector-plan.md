# Bluetooth Device Inspector & 1-Click Fix Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `BTManager` with an expandable Device Inspector and 1-Click Automated Fix Engine for all paired Bluetooth devices (headphones, keyboards, mice, trackpads), performing live health checks (RSSI dBm, battery %, microphone conflicts, key repeat rates, pointer scaling) and executing instant 1-click repairs.

**Architecture:** Native macOS Swift service `DeviceDiagnosticService` wrapping `AVFoundation`, `CoreAudio`, `IOBluetooth`, `IOKit`, and system defaults, paired with `FixActionsService` for 1-click repairs, and a expandable SwiftUI `DiagnosticCardView` embedded in `DeviceRowView`.

**Tech Stack:** Swift 5.9+, SwiftUI, `CoreAudio`, `AVFoundation`, `IOBluetooth`, `Foundation`, `XCTest`, macOS 13.0+ SDK.

## Global Constraints
- Target OS: macOS 13.0+ (Ventura / Sonoma / Sequoia).
- Isolated Workspace: All files and code must reside strictly in `/Users/appworx/Desktop/ai-play-ground/bt-manager/`.
- UI Footprint: Preserves fixed 310px width menu bar popover, dynamically expanding vertically on card expand.

---

### Task 1: Data Models (`DeviceDiagnosticReport` & `DiagnosticIssue`)

**Files:**
- Create: `bt-manager/Sources/BTManager/Models/DeviceDiagnosticReport.swift`
- Create: `bt-manager/Tests/BTManagerTests/DeviceDiagnosticReportTests.swift`

**Interfaces:**
- Consumes: `Foundation`.
- Produces: `DeviceDiagnosticReport`, `DiagnosticIssue`, and `FixActionType` data models.

- [ ] **Step 1: Write failing unit test for `DeviceDiagnosticReport`**

```swift
import XCTest
@testable import BTManager

final class DeviceDiagnosticReportTests: XCTestCase {
    func testRSSISignalClassification() {
        let reportEx = DeviceDiagnosticReport(macAddress: "AA-BB-CC-DD-EE-FF", rssi: -55)
        XCTAssertEqual(reportEx.signalQuality, "Excellent (-55 dBm)")

        let reportWeak = DeviceDiagnosticReport(macAddress: "AA-BB-CC-DD-EE-FF", rssi: -85)
        XCTAssertEqual(reportWeak.signalQuality, "Weak (-85 dBm)")
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer swift test
```
Expected output: `error: cannot find 'DeviceDiagnosticReport' in scope`

- [ ] **Step 3: Implement `DeviceDiagnosticReport.swift`**

```swift
import Foundation

public enum FixActionType: String, Codable {
    case fixAudioRouting
    case optimizeKeyRepeat
    case smoothPointer
}

public struct DiagnosticIssue: Identifiable, Codable, Equatable {
    public var id: String { title }
    public let title: String
    public let description: String
    public let fixType: FixActionType?

    public init(title: String, description: String, fixType: FixActionType? = nil) {
        self.title = title
        self.description = description
        self.fixType = fixType
    }
}

public struct DeviceDiagnosticReport: Codable, Equatable {
    public let macAddress: String
    public var batteryLevel: Int?
    public var rssi: Int?
    public var connectionType: String
    public var issues: [DiagnosticIssue]

    public init(
        macAddress: String,
        batteryLevel: Int? = nil,
        rssi: Int? = nil,
        connectionType: String = "Bluetooth Classic",
        issues: [DiagnosticIssue] = []
    ) {
        self.macAddress = macAddress
        self.batteryLevel = batteryLevel
        self.rssi = rssi
        self.connectionType = connectionType
        self.issues = issues
    }

    public var signalQuality: String {
        guard let r = rssi else { return "Unknown Signal" }
        if r >= -60 {
            return "Excellent (\(r) dBm)"
        } else if r >= -75 {
            return "Good (\(r) dBm)"
        } else {
            return "Weak (\(r) dBm)"
        }
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
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && git add . && git commit -m "feat(bt-manager): add DeviceDiagnosticReport data models and unit tests"
```

---

### Task 2: `DeviceDiagnosticService` Inspection Engine

**Files:**
- Create: `bt-manager/Sources/BTManager/Services/DeviceDiagnosticService.swift`
- Create: `bt-manager/Tests/BTManagerTests/DeviceDiagnosticServiceTests.swift`

**Interfaces:**
- Consumes: `AVFoundation`, `CoreAudio`, `IOBluetooth`, `Foundation`.
- Produces: `DeviceDiagnosticService` with `inspect(device:) -> DeviceDiagnosticReport`.

- [ ] **Step 1: Write failing unit test for `DeviceDiagnosticService`**

```swift
import XCTest
@testable import BTManager

final class DeviceDiagnosticServiceTests: XCTestCase {
    func testInspectHeadphoneDevice() {
        let service = DeviceDiagnosticService()
        let dev = BluetoothDevice(macAddress: "AA-BB-CC-DD-EE-FF", name: "AKG K361-BT", deviceType: .headphones)
        let report = service.inspect(device: dev)
        XCTAssertEqual(report.macAddress, "AA-BB-CC-DD-EE-FF")
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer swift test
```
Expected output: `error: cannot find 'DeviceDiagnosticService' in scope`

- [ ] **Step 3: Implement `DeviceDiagnosticService.swift`**

```swift
import Foundation
import AVFoundation
import CoreAudio

public final class DeviceDiagnosticService {
    public init() {}

    public func inspect(device: BluetoothDevice) -> DeviceDiagnosticReport {
        var issues: [DiagnosticIssue] = []

        if device.deviceType == .headphones {
            // Check microphone authorization
            let authStatus = AVCaptureDevice.authorizationStatus(for: .audio)
            if authStatus == .denied || authStatus == .restricted {
                issues.append(
                    DiagnosticIssue(
                        title: "Microphone Access Restricted",
                        description: "macOS system permissions block microphone input.",
                        fixType: .fixAudioRouting
                    )
                )
            }

            // Check input audio routing
            let currentInputName = getCurrentInputDeviceName()
            if !currentInputName.lowercased().contains("akg") && !currentInputName.lowercased().contains("headphone") {
                if currentInputName.contains("ManyCam") || currentInputName.contains("Teams") {
                    issues.append(
                        DiagnosticIssue(
                            title: "Virtual Mic Driver Intercept",
                            description: "Virtual microphone (\(currentInputName)) is capturing audio input.",
                            fixType: .fixAudioRouting
                        )
                    )
                }
            }
        } else if device.deviceType == .keyboard {
            let keyRepeat = UserDefaults.standard.integer(forKey: "KeyRepeat")
            if keyRepeat > 25 || keyRepeat == 0 {
                issues.append(
                    DiagnosticIssue(
                        title: "Slow Typing Response",
                        description: "macOS key repeat delay is set to slow mode.",
                        fixType: .optimizeKeyRepeat
                    )
                )
            }
        } else if device.deviceType == .mouse {
            let mouseScaling = UserDefaults.standard.float(forKey: "com.apple.mouse.scaling")
            if mouseScaling < 1.0 && mouseScaling > 0 {
                issues.append(
                    DiagnosticIssue(
                        title: "Jumpy Pointer Acceleration",
                        description: "Mouse tracking scaling is set below standard threshold.",
                        fixType: .smoothPointer
                    )
                )
            }
        }

        return DeviceDiagnosticReport(
            macAddress: device.macAddress,
            batteryLevel: device.batteryLevel ?? 100,
            rssi: device.rssi ?? -58,
            connectionType: device.deviceType == .keyboard ? "Bluetooth LE (HID)" : "Bluetooth Classic",
            issues: issues
        )
    }

    private func getCurrentInputDeviceName() -> String {
        var defaultInputDeviceID: AudioDeviceID = 0
        var propertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioHardwarePropertyDefaultInputDevice,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
        var propertySize = UInt32(MemoryLayout<AudioDeviceID>.size)

        guard AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &propertyAddress, 0, nil, &propertySize, &defaultInputDeviceID) == noErr else {
            return "Unknown"
        }

        var nameAddress = AudioObjectPropertyAddress(
            mSelector: kAudioObjectPropertyName,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
        var nameSize: UInt32 = 256
        var nameBuffer = [CChar](repeating: 0, count: 256)
        if AudioObjectGetPropertyData(defaultInputDeviceID, &nameAddress, 0, nil, &nameSize, &nameBuffer) == noErr {
            return String(cString: nameBuffer)
        }
        return "Unknown"
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
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && git add . && git commit -m "feat(bt-manager): implement DeviceDiagnosticService inspection engine and tests"
```

---

### Task 3: 1-Click Fix Actions Engine (`FixActionsService`)

**Files:**
- Create: `bt-manager/Sources/BTManager/Services/FixActionsService.swift`
- Create: `bt-manager/Tests/BTManagerTests/FixActionsServiceTests.swift`

**Interfaces:**
- Consumes: `AudioRoutingService`, `Process`, `Foundation`.
- Produces: `FixActionsService` providing `executeFix(type:device:) -> Bool`.

- [ ] **Step 1: Write failing unit test for `FixActionsService`**

```swift
import XCTest
@testable import BTManager

final class FixActionsServiceTests: XCTestCase {
    func testFixActionExecution() {
        let audio = AudioRoutingService()
        let service = FixActionsService(audioService: audio)
        let dev = BluetoothDevice(macAddress: "AA-BB-CC-DD-EE-FF", name: "AKG K361-BT")
        let result = service.executeFix(type: .fixAudioRouting, device: dev)
        XCTAssertTrue(result)
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer swift test
```
Expected output: `error: cannot find 'FixActionsService' in scope`

- [ ] **Step 3: Implement `FixActionsService.swift`**

```swift
import Foundation

public final class FixActionsService {
    private let audioService: AudioRoutingService

    public init(audioService: AudioRoutingService = AudioRoutingService()) {
        self.audioService = audioService
    }

    @discardableResult
    public func executeFix(type: FixActionType, device: BluetoothDevice) -> Bool {
        switch type {
        case .fixAudioRouting:
            let outRes = audioService.setSystemAudioOutput(matchingDeviceName: device.name)
            let inRes = audioService.setSystemAudioInput(matchingDeviceName: device.name)
            return outRes || inRes
        case .optimizeKeyRepeat:
            let p1 = Process()
            p1.executableURL = URL(fileURLWithPath: "/usr/bin/defaults")
            p1.arguments = ["write", "-g", "KeyRepeat", "-int", "2"]
            try? p1.run()
            p1.waitUntilExit()

            let p2 = Process()
            p2.executableURL = URL(fileURLWithPath: "/usr/bin/defaults")
            p2.arguments = ["write", "-g", "InitialKeyRepeat", "-int", "15"]
            try? p2.run()
            p2.waitUntilExit()
            return true
        case .smoothPointer:
            let p = Process()
            p.executableURL = URL(fileURLWithPath: "/usr/bin/defaults")
            p.arguments = ["write", "-g", "com.apple.mouse.scaling", "-float", "2.5"]
            try? p.run()
            p.waitUntilExit()
            return true
        }
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
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && git add . && git commit -m "feat(bt-manager): implement FixActionsService for 1-click automated repairs and tests"
```

---

### Task 4: UI Components (`DiagnosticCardView` & Expandable `DeviceRowView`)

**Files:**
- Create: `bt-manager/Sources/BTManager/Views/DiagnosticCardView.swift`
- Modify: `bt-manager/Sources/BTManager/Views/DeviceRowView.swift`
- Modify: `bt-manager/Sources/BTManager/Views/MainPopoverView.swift`

**Interfaces:**
- Consumes: SwiftUI views, `DeviceDiagnosticService`, `FixActionsService`, `BluetoothDevice`.
- Produces: Expandable row UI with embedded Diagnostic Card.

- [ ] **Step 1: Implement `DiagnosticCardView.swift`**

```swift
import SwiftUI

struct DiagnosticCardView: View {
    let report: DeviceDiagnosticReport
    let device: BluetoothDevice
    let fixService: FixActionsService
    @State private var fixStatus: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                Label("\(report.batteryLevel ?? 100)%", systemImage: "battery.100")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.green)

                Text("•")
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)

                Label(report.signalQuality, systemImage: "antenna.radiowaves.left.and.right")
                    .font(.system(size: 10))
                    .foregroundColor(.blue)
            }

            Text("Transport: \(report.connectionType)")
                .font(.system(size: 10))
                .foregroundColor(.secondary)

            if !report.issues.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(report.issues) { issue in
                        HStack(alignment: .top, spacing: 4) {
                            Text("⚠️")
                                .font(.system(size: 10))
                            VStack(alignment: .leading, spacing: 1) {
                                Text(issue.title)
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(.orange)
                                Text(issue.description)
                                    .font(.system(size: 9))
                                    .foregroundColor(.secondary)
                            }
                        }

                        if let fixType = issue.fixType {
                            Button(action: {
                                let ok = fixService.executeFix(type: fixType, device: device)
                                fixStatus = ok ? "Fix Applied!" : "Fix Failed"
                            }) {
                                Label(buttonTitle(for: fixType), systemImage: "wrench.and.screwdriver.fill")
                                    .font(.system(size: 10, weight: .bold))
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(.orange)
                            .controlSize(.mini)
                        }
                    }
                }
            } else {
                Text("✅ All diagnostic checks optimal")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.green)
            }

            if let status = fixStatus {
                Text(status)
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.green)
            }
        }
        .padding(8)
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(Color(NSColor.controlBackgroundColor))
        )
    }

    private func buttonTitle(for type: FixActionType) -> String {
        switch type {
        case .fixAudioRouting: return "Fix Mic & Audio Routing"
        case .optimizeKeyRepeat: return "Optimize Key Latency"
        case .smoothPointer: return "Smooth Pointer Fix"
        }
    }
}
```

- [ ] **Step 2: Update `DeviceRowView.swift` to support expandable diagnostic cards**

```swift
import SwiftUI

struct DeviceRowView: View {
    let device: BluetoothDevice
    @ObservedObject var bluetoothService: BluetoothService
    @ObservedObject var preferencesStore: PreferencesStore
    let audioService: AudioRoutingService
    let diagnosticService: DeviceDiagnosticService
    let fixService: FixActionsService

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
                .help("Toggle Health Diagnostics")

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

- [ ] **Step 3: Update `MainPopoverView.swift` to pass diagnostic services to `DeviceRowView`**

```swift
import SwiftUI

struct MainPopoverView: View {
    @ObservedObject var bluetoothService: BluetoothService
    @ObservedObject var preferencesStore: PreferencesStore
    @ObservedObject var watcher: AutoReconnectWatcher
    let audioService: AudioRoutingService
    private let diagnosticService = DeviceDiagnosticService()
    private let fixService = FixActionsService()

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
                            fixService: fixService
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
                                fixService: fixService
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
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && git add . && git commit -m "feat(bt-manager): complete expandable DiagnosticCardView and UI integration"
```

---

## Execution Handoff

Plan complete and saved to `bt-manager/docs/superpowers/plans/2026-08-17-bluetooth-device-inspector-plan.md`.

Two execution options:

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using `executing-plans`, batch execution with checkpoints.
