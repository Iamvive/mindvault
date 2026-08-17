# Bluetooth Device Manager (`bt-manager`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a native macOS Menu Bar Extra application in an isolated `./bt-manager/` directory that manages paired Bluetooth devices, featuring a "Force Connect" engine for AKG headphones that flushes stale link states, retries connection, auto-routes macOS audio output, and runs an auto-reconnect watchdog daemon.

**Architecture:** A native macOS Swift / SwiftUI menu bar app (`MenuBarExtra`) structured with modular services: `BluetoothService` (`IOBluetooth` / `blueutil`), `AudioRoutingService` (`CoreAudio`), `AutoReconnectWatcher` background daemon, `PreferencesStore` (`UserDefaults`), and a clean SwiftUI popover interface.

**Tech Stack:** Swift 5.9+, SwiftUI, `IOBluetooth`, `CoreAudio`, `Foundation`, `XCTest`, macOS 13.0+ SDK.

## Global Constraints
- Target OS: macOS 13.0+ (Ventura / Sonoma / Sequoia).
- Isolated Workspace: All files and code must reside strictly in `/Users/appworx/Desktop/ai-play-ground/bt-manager/`.
- UI Footprint: Runs strictly as a Menu Bar Extra (`LSUIElement = true`), low RAM footprint (< 15 MB).
- Permissions: `NSBluetoothAlwaysUsageDescription` required in `Info.plist`.

---

### Task 1: Project Scaffolding & macOS Executable Setup

**Files:**
- Create: `bt-manager/Package.swift`
- Create: `bt-manager/Sources/BTManager/Info.plist`
- Create: `bt-manager/Sources/BTManager/main.swift`

**Interfaces:**
- Consumes: macOS AppKit / SwiftUI frameworks.
- Produces: Executable package target `BTManager` building cleanly with `swift build`.

- [ ] **Step 1: Create `bt-manager` directory and `Package.swift`**

```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "BTManager",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(name: "BTManager", targets: ["BTManager"])
    ],
    targets: [
        .executableTarget(
            name: "BTManager",
            dependencies: [],
            path: "Sources/BTManager",
            resources: [
                .process("Info.plist")
            ]
        ),
        .testTarget(
            name: "BTManagerTests",
            dependencies: ["BTManager"],
            path: "Tests/BTManagerTests"
        )
    ]
)
```

- [ ] **Step 2: Create `Info.plist` with Bluetooth Privacy Keys**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleIdentifier</key>
    <string>com.user.btmanager</string>
    <key>CFBundleName</key>
    <string>BTManager</string>
    <key>LSUIElement</key>
    <true/>
    <key>NSBluetoothAlwaysUsageDescription</key>
    <string>BT Manager requires Bluetooth access to discover and force-connect your headphones and audio devices.</string>
</dict>
</plist>
```

- [ ] **Step 3: Create initial `main.swift` entry point**

```swift
import SwiftUI

@main
struct BTManagerApp: App {
    var body: some Scene {
        MenuBarExtra("BT Manager", systemImage: "headphones") {
            VStack {
                Text("BT Manager Running")
                Button("Quit") {
                    NSApplication.shared.terminate(nil)
                }
            }
            .padding()
        }
        .menuBarExtraStyle(.window)
    }
}
```

- [ ] **Step 4: Verify package builds successfully**

Run command in shell:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && swift build
```
Expected output: `Build complete!`

- [ ] **Step 5: Commit**

```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && git add . && git commit -m "feat: scaffold macOS Swift Package for BTManager"
```

---

### Task 2: Data Models & `PreferencesStore` Layer

**Files:**
- Create: `bt-manager/Sources/BTManager/Models/BluetoothDevice.swift`
- Create: `bt-manager/Sources/BTManager/Services/PreferencesStore.swift`
- Create: `bt-manager/Tests/BTManagerTests/PreferencesStoreTests.swift`

**Interfaces:**
- Consumes: `Foundation`, `UserDefaults`.
- Produces: `BluetoothDevice` struct and `PreferencesStore` object managing user favorites and auto-reconnect toggles.

- [ ] **Step 1: Write the failing unit test for `PreferencesStore`**

```swift
import XCTest
@testable import BTManager

final class PreferencesStoreTests: XCTestCase {
    func testFavoriteDevicePersistence() {
        let store = PreferencesStore(userDefaults: UserDefaults(suiteName: "TestPreferences")!)
        let testMac = "00-11-22-33-44-55"
        
        store.setFavorite(macAddress: testMac, isFavorite: true)
        XCTAssertTrue(store.isFavorite(macAddress: testMac))
        
        store.setFavorite(macAddress: testMac, isFavorite: false)
        XCTAssertFalse(store.isFavorite(macAddress: testMac))
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && swift test
```
Expected output: `error: cannot find 'PreferencesStore' in scope`

- [ ] **Step 3: Implement `BluetoothDevice.swift` model**

```swift
import Foundation

public enum DeviceType: String, Codable {
    case headphones
    case speaker
    case mouse
    case keyboard
    case unknown
}

public struct BluetoothDevice: Identifiable, Codable, Equatable {
    public var id: String { macAddress }
    public let macAddress: String
    public let name: String
    public var isConnected: Bool
    public var isPaired: Bool
    public var batteryLevel: Int?
    public var rssi: Int?
    public var deviceType: DeviceType
    public var isFavorite: Bool
    public var autoReconnect: Bool

    public init(
        macAddress: String,
        name: String,
        isConnected: Bool = false,
        isPaired: Bool = true,
        batteryLevel: Int? = nil,
        rssi: Int? = nil,
        deviceType: DeviceType = .headphones,
        isFavorite: Bool = false,
        autoReconnect: Bool = false
    ) {
        self.macAddress = macAddress
        self.name = name
        self.isConnected = isConnected
        self.isPaired = isPaired
        self.batteryLevel = batteryLevel
        self.rssi = rssi
        self.deviceType = deviceType
        self.isFavorite = isFavorite
        self.autoReconnect = autoReconnect
    }
}
```

- [ ] **Step 4: Implement `PreferencesStore.swift`**

```swift
import Foundation

public final class PreferencesStore: ObservableObject {
    private let userDefaults: UserDefaults
    private let favoritesKey = "BTManager_FavoriteMACs"
    private let autoReconnectKey = "BTManager_AutoReconnectMACs"

    @Published public private(set) var favoriteMacs: Set<String>
    @Published public private(set) var autoReconnectMacs: Set<String>

    public init(userDefaults: UserDefaults = .standard) {
        self.userDefaults = userDefaults
        let storedFavs = userDefaults.stringArray(forKey: favoritesKey) ?? []
        let storedAuto = userDefaults.stringArray(forKey: autoReconnectKey) ?? []
        self.favoriteMacs = Set(storedFavs)
        self.autoReconnectMacs = Set(storedAuto)
    }

    public func isFavorite(macAddress: String) -> Bool {
        favoriteMacs.contains(macAddress)
    }

    public func setFavorite(macAddress: String, isFavorite: Bool) {
        if isFavorite {
            favoriteMacs.insert(macAddress)
        } else {
            favoriteMacs.remove(macAddress)
        }
        userDefaults.set(Array(favoriteMacs), forKey: favoritesKey)
    }

    public func isAutoReconnectEnabled(macAddress: String) -> Bool {
        autoReconnectMacs.contains(macAddress)
    }

    public func setAutoReconnect(macAddress: String, enabled: Bool) {
        if enabled {
            autoReconnectMacs.insert(macAddress)
        } else {
            autoReconnectMacs.remove(macAddress)
        }
        userDefaults.set(Array(autoReconnectMacs), forKey: autoReconnectKey)
    }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && swift test
```
Expected output: `Test Suite 'All Tests' passed`

- [ ] **Step 6: Commit**

```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && git add . && git commit -m "feat: add BluetoothDevice model and PreferencesStore with unit tests"
```

---

### Task 3: Core `BluetoothService` & Force Connect Engine

**Files:**
- Create: `bt-manager/Sources/BTManager/Services/BluetoothService.swift`
- Create: `bt-manager/Tests/BTManagerTests/BluetoothServiceTests.swift`

**Interfaces:**
- Consumes: `IOBluetooth` framework / Process commands (`blueutil` / system APIs).
- Produces: `BluetoothService` providing `fetchPairedDevices()`, `connect(mac:)`, `disconnect(mac:)`, and `forceConnect(mac:maxRetries:)`.

- [ ] **Step 1: Write failing unit test for `BluetoothService` mock parsing**

```swift
import XCTest
@testable import BTManager

final class BluetoothServiceTests: XCTestCase {
    func testDeviceStatusParsing() {
        let sampleOutput = """
        [{"address":"aa-bb-cc-dd-ee-ff","name":"AKG Y500","connected":false,"paired":true}]
        """
        let devices = BluetoothService.parseDeviceJSON(sampleOutput)
        XCTAssertEqual(devices.count, 1)
        XCTAssertEqual(devices.first?.name, "AKG Y500")
        XCTAssertFalse(devices.first?.isConnected ?? true)
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && swift test
```
Expected output: `error: static method 'parseDeviceJSON' not found in BluetoothService`

- [ ] **Step 3: Implement `BluetoothService.swift`**

```swift
import Foundation
import IOBluetooth

public final class BluetoothService: ObservableObject {
    @Published public var devices: [BluetoothDevice] = []
    @Published public var isConnecting: Bool = false
    @Published public var statusMessage: String = "Ready"

    public init() {}

    public static func parseDeviceJSON(_ jsonString: String) -> [BluetoothDevice] {
        guard let data = jsonString.data(using: .utf8) else { return [] }
        struct RawDevice: Decodable {
            let address: String
            let name: String?
            let connected: Bool?
            let paired: Bool?
        }
        guard let rawList = try? JSONDecoder().decode([RawDevice].self, from: data) else { return [] }
        return rawList.map { raw in
            BluetoothDevice(
                macAddress: raw.address,
                name: raw.name ?? "Unknown Device",
                isConnected: raw.connected ?? false,
                isPaired: raw.paired ?? true,
                deviceType: (raw.name?.lowercased().contains("akg") == true || raw.name?.lowercased().contains("headphone") == true) ? .headphones : .unknown
            )
        }
    }

    public func fetchPairedDevices() {
        guard let pairedIO = IOBluetoothDevice.pairedDevices() as? [IOBluetoothDevice] else { return }
        self.devices = pairedIO.map { ioDevice in
            BluetoothDevice(
                macAddress: ioDevice.addressString ?? "Unknown",
                name: ioDevice.nameOrAddress ?? "Unknown Device",
                isConnected: ioDevice.isConnected(),
                isPaired: true,
                batteryLevel: nil,
                rssi: Int(ioDevice.rawRSSI()),
                deviceType: ioDevice.isHeadset ? .headphones : .unknown
            )
        }
    }

    public func forceConnect(macAddress: String, maxRetries: Int = 3, completion: @escaping (Bool) -> Void) {
        self.isConnecting = true
        self.statusMessage = "Flushing stale link for \(macAddress)..."
        
        // Step 1: Disconnect to clear stale socket
        if let ioDevice = IOBluetoothDevice(addressString: macAddress) {
            ioDevice.closeConnection()
        }
        
        // Step 2: Retry loop
        DispatchQueue.global().asyncAfter(deadline: .now() + 1.0) { [weak self] in
            self?.attemptConnectLoop(macAddress: macAddress, remainingRetries: maxRetries, completion: completion)
        }
    }

    private func attemptConnectLoop(macAddress: String, remainingRetries: Int, completion: @escaping (Bool) -> Void) {
        guard let ioDevice = IOBluetoothDevice(addressString: macAddress) else {
            DispatchQueue.main.async {
                self.isConnecting = false
                self.statusMessage = "Device not found"
                completion(false)
            }
            return
        }

        let result = ioDevice.openConnection()
        if result == kIOReturnSuccess || ioDevice.isConnected() {
            DispatchQueue.main.async {
                self.isConnecting = false
                self.statusMessage = "Connected successfully!"
                self.fetchPairedDevices()
                completion(true)
            }
        } else if remainingRetries > 1 {
            DispatchQueue.main.async {
                self.statusMessage = "Retrying connection... (\(remainingRetries - 1) left)"
            }
            DispatchQueue.global().asyncAfter(deadline: .now() + 1.5) { [weak self] in
                self?.attemptConnectLoop(macAddress: macAddress, remainingRetries: remainingRetries - 1, completion: completion)
            }
        } else {
            DispatchQueue.main.async {
                self.isConnecting = false
                self.statusMessage = "Connection failed after retries."
                completion(false)
            }
        }
    }
}

private extension IOBluetoothDevice {
    var isHeadset: Bool {
        let name = (self.nameOrAddress ?? "").lowercased()
        return name.contains("akg") || name.contains("headphone") || name.contains("pods") || name.contains("buds")
    }
}
```

- [ ] **Step 4: Run unit tests to verify they pass**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && swift test
```
Expected output: `Test Suite 'All Tests' passed`

- [ ] **Step 5: Commit**

```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && git add . && git commit -m "feat: implement BluetoothService with Force Connect engine and tests"
```

---

### Task 4: `AudioRoutingService` (macOS CoreAudio Integration)

**Files:**
- Create: `bt-manager/Sources/BTManager/Services/AudioRoutingService.swift`
- Create: `bt-manager/Tests/BTManagerTests/AudioRoutingServiceTests.swift`

**Interfaces:**
- Consumes: `CoreAudio`, `AudioToolbox`.
- Produces: `AudioRoutingService` providing `setSystemAudioOutput(matchingDeviceName:) -> Bool`.

- [ ] **Step 1: Write failing unit test for `AudioRoutingService`**

```swift
import XCTest
@testable import BTManager

final class AudioRoutingServiceTests: XCTestCase {
    func testAudioDeviceNameNormalization() {
        let rawName = "AKG Y500 Stereo"
        let target = "AKG Y500"
        XCTAssertTrue(AudioRoutingService.isDeviceMatch(deviceName: rawName, targetName: target))
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && swift test
```
Expected output: `error: static method 'isDeviceMatch' not found in AudioRoutingService`

- [ ] **Step 3: Implement `AudioRoutingService.swift`**

```swift
import Foundation
import CoreAudio

public final class AudioRoutingService {
    public init() {}

    public static func isDeviceMatch(deviceName: String, targetName: String) -> Bool {
        let d = deviceName.lowercased()
        let t = targetName.lowercased()
        return d.contains(t) || t.contains(d)
    }

    @discardableResult
    public func setSystemAudioOutput(matchingDeviceName targetName: String) -> Bool {
        var propertySize: UInt32 = 0
        var address = AudioObjectPropertyAddress(
            mSelector: kAudioHardwarePropertyDevices,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )

        guard AudioObjectGetPropertyDataSize(AudioObjectID(kAudioObjectSystemObject), &address, 0, nil, &propertySize) == noErr else {
            return false
        }

        let deviceCount = Int(propertySize) / MemoryLayout<AudioDeviceID>.size
        var deviceIDs = [AudioDeviceID](repeating: 0, count: deviceCount)
        guard AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &address, 0, nil, &propertySize, &deviceIDs) == noErr else {
            return false
        }

        for id in deviceIDs {
            var nameSize: UInt32 = 0
            var nameAddress = AudioObjectPropertyAddress(
                mSelector: kAudioObjectPropertyName,
                mScope: kAudioObjectPropertyScopeGlobal,
                mElement: kAudioObjectPropertyElementMain
            )
            if AudioObjectGetPropertyDataSize(id, &nameAddress, 0, nil, &nameSize) == noErr {
                var nameBuffer = [CChar](repeating: 0, count: Int(nameSize))
                if AudioObjectGetPropertyData(id, &nameAddress, 0, nil, &nameSize, &nameBuffer) == noErr {
                    let devName = String(cString: nameBuffer)
                    if AudioRoutingService.isDeviceMatch(deviceName: devName, targetName: targetName) {
                        var defaultAddress = AudioObjectPropertyAddress(
                            mSelector: kAudioHardwarePropertyDefaultOutputDevice,
                            mScope: kAudioObjectPropertyScopeGlobal,
                            mElement: kAudioObjectPropertyElementMain
                        )
                        var targetID = id
                        let status = AudioObjectSetPropertyData(AudioObjectID(kAudioObjectSystemObject), &defaultAddress, 0, nil, UInt32(MemoryLayout<AudioDeviceID>.size), &targetID)
                        return status == noErr
                    }
                }
            }
        }
        return false
    }
}
```

- [ ] **Step 4: Run unit tests to verify they pass**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && swift test
```
Expected output: `Test Suite 'All Tests' passed`

- [ ] **Step 5: Commit**

```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && git add . && git commit -m "feat: implement AudioRoutingService with CoreAudio integration and tests"
```

---

### Task 5: `AutoReconnectWatcher` Background Daemon

**Files:**
- Create: `bt-manager/Sources/BTManager/Services/AutoReconnectWatcher.swift`
- Create: `bt-manager/Tests/BTManagerTests/AutoReconnectWatcherTests.swift`

**Interfaces:**
- Consumes: `BluetoothService`, `AudioRoutingService`, `PreferencesStore`.
- Produces: `AutoReconnectWatcher` background daemon.

- [ ] **Step 1: Write failing test for `AutoReconnectWatcher`**

```swift
import XCTest
@testable import BTManager

final class AutoReconnectWatcherTests: XCTestCase {
    func testWatchdogInit() {
        let prefs = PreferencesStore(userDefaults: UserDefaults(suiteName: "TestWatcher")!)
        let bt = BluetoothService()
        let audio = AudioRoutingService()
        let watcher = AutoReconnectWatcher(bluetoothService: bt, audioService: audio, preferencesStore: prefs)
        XCTAssertFalse(watcher.isRunning)
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && swift test
```
Expected output: `error: cannot find 'AutoReconnectWatcher' in scope`

- [ ] **Step 3: Implement `AutoReconnectWatcher.swift`**

```swift
import Foundation

public final class AutoReconnectWatcher: ObservableObject {
    private let bluetoothService: BluetoothService
    private let audioService: AudioRoutingService
    private let preferencesStore: PreferencesStore
    private var timer: Timer?

    @Published public private(set) var isRunning: Bool = false

    public init(bluetoothService: BluetoothService, audioService: AudioRoutingService, preferencesStore: PreferencesStore) {
        self.bluetoothService = bluetoothService
        self.audioService = audioService
        self.preferencesStore = preferencesStore
    }

    public func start(interval: TimeInterval = 10.0) {
        guard !isRunning else { return }
        isRunning = true
        timer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] _ in
            self?.checkAndReconnectFavorites()
        }
    }

    public func stop() {
        timer?.invalidate()
        timer = nil
        isRunning = false
    }

    private func checkAndReconnectFavorites() {
        bluetoothService.fetchPairedDevices()
        for device in bluetoothService.devices {
            if preferencesStore.isAutoReconnectEnabled(macAddress: device.macAddress) && !device.isConnected {
                bluetoothService.forceConnect(macAddress: device.macAddress) { [weak self] success in
                    if success {
                        self?.audioService.setSystemAudioOutput(matchingDeviceName: device.name)
                    }
                }
            }
        }
    }
}
```

- [ ] **Step 4: Run unit tests to verify they pass**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && swift test
```
Expected output: `Test Suite 'All Tests' passed`

- [ ] **Step 5: Commit**

```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && git add . && git commit -m "feat: add AutoReconnectWatcher background daemon and tests"
```

---

### Task 6: SwiftUI MenuBarExtra UI & Popover Views

**Files:**
- Create: `bt-manager/Sources/BTManager/Views/DeviceRowView.swift`
- Create: `bt-manager/Sources/BTManager/Views/MainPopoverView.swift`
- Modify: `bt-manager/Sources/BTManager/main.swift`

**Interfaces:**
- Consumes: SwiftUI views, `BluetoothService`, `PreferencesStore`, `AudioRoutingService`, `AutoReconnectWatcher`.
- Produces: Complete status bar UI with popover panel.

- [ ] **Step 1: Implement `DeviceRowView.swift`**

```swift
import SwiftUI

struct DeviceRowView: View {
    let device: BluetoothDevice
    @ObservedObject var bluetoothService: BluetoothService
    @ObservedObject var preferencesStore: PreferencesStore
    let audioService: AudioRoutingService

    var body: some View {
        HStack {
            Image(systemName: device.deviceType == .headphones ? "headphones" : "bluetooth")
                .font(.title3)
                .foregroundColor(device.isConnected ? .green : .gray)

            VStack(alignment: .leading, spacing: 2) {
                Text(device.name)
                    .font(.body)
                    .fontWeight(.medium)
                Text(device.isConnected ? "Connected" : "Disconnected")
                    .font(.caption)
                    .foregroundColor(device.isConnected ? .green : .secondary)
            }

            Spacer()

            if preferencesStore.isFavorite(macAddress: device.macAddress) {
                Button(action: {
                    bluetoothService.forceConnect(macAddress: device.macAddress) { success in
                        if success {
                            audioService.setSystemAudioOutput(matchingDeviceName: device.name)
                        }
                    }
                }) {
                    Label("Force Connect", systemImage: "bolt.fill")
                        .font(.caption)
                }
                .buttonStyle(.borderedProminent)
                .disabled(bluetoothService.isConnecting)
            }

            Button(action: {
                let currentFav = preferencesStore.isFavorite(macAddress: device.macAddress)
                preferencesStore.setFavorite(macAddress: device.macAddress, isFavorite: !currentFav)
            }) {
                Image(systemName: preferencesStore.isFavorite(macAddress: device.macAddress) ? "star.fill" : "star")
                    .foregroundColor(.yellow)
            }
            .buttonStyle(.plain)
        }
        .padding(.vertical, 4)
    }
}
```

- [ ] **Step 2: Implement `MainPopoverView.swift`**

```swift
import SwiftUI

struct MainPopoverView: View {
    @ObservedObject var bluetoothService: BluetoothService
    @ObservedObject var preferencesStore: PreferencesStore
    @ObservedObject var watcher: AutoReconnectWatcher
    let audioService: AudioRoutingService

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("BT Manager", systemImage: "headphones")
                    .font(.headline)
                Spacer()
                Button(action: { bluetoothService.fetchPairedDevices() }) {
                    Image(systemName: "arrow.clockwise")
                }
                .buttonStyle(.plain)
            }

            Divider()

            if !bluetoothService.statusMessage.isEmpty {
                Text(bluetoothService.statusMessage)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Text("FAVORITES")
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(.secondary)

            let favorites = bluetoothService.devices.filter { preferencesStore.isFavorite(macAddress: $0.macAddress) }
            if favorites.isEmpty {
                Text("No favorite devices pinned yet. Click star to pin.")
                    .font(.caption)
                    .foregroundColor(.secondary)
            } else {
                ForEach(favorites) { dev in
                    DeviceRowView(device: dev, bluetoothService: bluetoothService, preferencesStore: preferencesStore, audioService: audioService)
                }
            }

            Divider()

            Text("ALL DEVICES")
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(.secondary)

            ScrollView {
                VStack {
                    ForEach(bluetoothService.devices) { dev in
                        DeviceRowView(device: dev, bluetoothService: bluetoothService, preferencesStore: preferencesStore, audioService: audioService)
                    }
                }
            }
            .frame(maxHeight: 200)

            Divider()

            HStack {
                Button("Quit") {
                    NSApplication.shared.terminate(nil)
                }
                .buttonStyle(.borderless)
                
                Spacer()

                Button("Open System Settings") {
                    if let url = URL(string: "x-apple.systempreferences:com.apple.preferences.Bluetooth") {
                        NSWorkspace.shared.open(url)
                    }
                }
                .buttonStyle(.borderless)
            }
        }
        .padding()
        .frame(width: 320)
        .onAppear {
            bluetoothService.fetchPairedDevices()
            watcher.start()
        }
    }
}
```

- [ ] **Step 3: Update `main.swift` to bind all views and services**

```swift
import SwiftUI

@main
struct BTManagerApp: App {
    @StateObject private var bluetoothService = BluetoothService()
    @StateObject private var preferencesStore = PreferencesStore()
    private let audioService = AudioRoutingService()
    @StateObject private var watcher: AutoReconnectWatcher

    init() {
        let bt = BluetoothService()
        let prefs = PreferencesStore()
        let audio = AudioRoutingService()
        let w = AutoReconnectWatcher(bluetoothService: bt, audioService: audio, preferencesStore: prefs)
        _bluetoothService = StateObject(wrappedValue: bt)
        _preferencesStore = StateObject(wrappedValue: prefs)
        _watcher = StateObject(wrappedValue: w)
    }

    var body: some Scene {
        MenuBarExtra("BT Manager", systemImage: "headphones") {
            MainPopoverView(
                bluetoothService: bluetoothService,
                preferencesStore: preferencesStore,
                watcher: watcher,
                audioService: audioService
            )
        }
        .menuBarExtraStyle(.window)
    }
}
```

- [ ] **Step 4: Build and test application**

Run:
```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && swift build
```
Expected output: `Build complete!`

- [ ] **Step 5: Commit**

```bash
cd /Users/appworx/Desktop/ai-play-ground/bt-manager && git add . && git commit -m "feat: complete SwiftUI MenuBarExtra UI popover and main application binding"
```

---

## Execution Handoff

Plan complete and saved to `bt-manager/docs/superpowers/plans/2026-08-17-bluetooth-device-manager-plan.md`.

Two execution options:

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using `executing-plans`, batch execution with checkpoints.
