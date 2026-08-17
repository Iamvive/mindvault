import Foundation
import IOBluetooth

public final class BluetoothService: ObservableObject {
    @Published public var devices: [BluetoothDevice] = []
    @Published public var isConnecting: Bool = false
    @Published public var statusMessage: String = "Ready"

    private let blueutilPaths = [
        "/opt/homebrew/bin/blueutil",
        "/usr/local/bin/blueutil",
        "/usr/bin/blueutil"
    ]

    private var activeBlueutilPath: String? {
        blueutilPaths.first(where: { FileManager.default.fileExists(atPath: $0) })
    }

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
        
        var seenAddresses = Set<String>()
        var result = [BluetoothDevice]()

        for raw in rawList {
            guard !seenAddresses.contains(raw.address) else { continue }
            seenAddresses.insert(raw.address)

            let isHeadphones = (raw.name?.lowercased().contains("akg") == true ||
                                raw.name?.lowercased().contains("headphone") == true ||
                                raw.name?.lowercased().contains("buds") == true ||
                                raw.name?.lowercased().contains("ebuddies") == true)
            result.append(
                BluetoothDevice(
                    macAddress: raw.address,
                    name: raw.name ?? "Unknown Device",
                    isConnected: raw.connected ?? false,
                    isPaired: raw.paired ?? true,
                    deviceType: isHeadphones ? .headphones : .unknown
                )
            )
        }
        return result
    }

    public func fetchPairedDevices() {
        if let blueutil = activeBlueutilPath {
            let output = runProcess(executable: blueutil, arguments: ["--paired", "--format", "json"])
            let parsed = BluetoothService.parseDeviceJSON(output)
            if !parsed.isEmpty {
                DispatchQueue.main.async {
                    self.devices = parsed
                }
                return
            }
        }

        // Fallback to IOBluetooth
        guard let pairedIO = IOBluetoothDevice.pairedDevices() as? [IOBluetoothDevice] else { return }
        DispatchQueue.main.async {
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
    }

    public func forceConnect(macAddress: String, maxRetries: Int = 3, completion: @escaping (Bool) -> Void) {
        self.isConnecting = true
        self.statusMessage = "Connecting to \(macAddress)..."
        
        DispatchQueue.global().async { [weak self] in
            guard let self = self else { return }
            
            // 1. Disconnect to clear link
            if let blueutil = self.activeBlueutilPath {
                _ = self.runProcess(executable: blueutil, arguments: ["--disconnect", macAddress])
            } else if let ioDevice = IOBluetoothDevice(addressString: macAddress) {
                ioDevice.closeConnection()
            }

            Thread.sleep(forTimeInterval: 1.0)

            // 2. Retry loop
            var success = false
            for attempt in 1...maxRetries {
                DispatchQueue.main.async {
                    self.statusMessage = "Connecting... Attempt \(attempt) of \(maxRetries)"
                }

                if let blueutil = self.activeBlueutilPath {
                    let res = self.runProcess(executable: blueutil, arguments: ["--connect", macAddress])
                    if !res.contains("Failed") {
                        success = true
                        break
                    }
                } else if let ioDevice = IOBluetoothDevice(addressString: macAddress) {
                    if ioDevice.openConnection() == kIOReturnSuccess || ioDevice.isConnected() {
                        success = true
                        break
                    }
                }
                Thread.sleep(forTimeInterval: 1.5)
            }

            DispatchQueue.main.async {
                self.isConnecting = false
                if success {
                    self.statusMessage = "Connected successfully!"
                    self.fetchPairedDevices()
                    completion(true)
                } else {
                    self.statusMessage = "Connection failed. Turn AKG off/on or disconnect from phone."
                    completion(false)
                }
            }
        }
    }

    private func runProcess(executable: String, arguments: [String]) -> String {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: executable)
        process.arguments = arguments
        let pipe = Pipe()
        process.standardOutput = pipe
        process.standardError = pipe

        do {
            try process.run()
            process.waitUntilExit()
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            return String(data: data, encoding: .utf8) ?? ""
        } catch {
            return ""
        }
    }
}

private extension IOBluetoothDevice {
    var isHeadset: Bool {
        let name = (self.nameOrAddress ?? "").lowercased()
        return name.contains("akg") || name.contains("headphone") || name.contains("pods") || name.contains("buds")
    }
}
