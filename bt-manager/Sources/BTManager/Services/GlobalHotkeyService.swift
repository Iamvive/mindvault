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
