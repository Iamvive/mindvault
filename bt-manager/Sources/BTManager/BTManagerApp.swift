import SwiftUI
import AppKit

final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
    }
}

@main
struct BTManagerApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
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
