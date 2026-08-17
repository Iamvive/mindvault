import XCTest
@testable import BTManager

final class AutoReconnectWatcherTests: XCTestCase {
    func testWatchdogLifecycle() {
        let prefs = PreferencesStore(userDefaults: UserDefaults(suiteName: "TestWatcher_\(UUID().uuidString)")!)
        let bt = BluetoothService()
        let audio = AudioRoutingService()
        let watcher = AutoReconnectWatcher(bluetoothService: bt, audioService: audio, preferencesStore: prefs)
        
        XCTAssertFalse(watcher.isRunning)
        watcher.start(interval: 1.0)
        XCTAssertTrue(watcher.isRunning)
        watcher.stop()
        XCTAssertFalse(watcher.isRunning)
    }
}
