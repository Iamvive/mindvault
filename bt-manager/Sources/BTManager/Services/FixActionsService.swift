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
