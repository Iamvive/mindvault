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
