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
