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
