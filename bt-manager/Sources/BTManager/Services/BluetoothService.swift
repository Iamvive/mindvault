import Foundation
import IOBluetooth

public final class BluetoothService: ObservableObject {
    @Published public var devices: [BluetoothDevice] = []
    @Published public var isConnecting: Bool = false
    @Published public var statusMessage: String = "Loading devices..."

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
            let cleanAddress = raw.address.replacingOccurrences(of: "-", with: ":").uppercased()
            guard !seenAddresses.contains(cleanAddress) else { continue }
            seenAddresses.insert(cleanAddress)

            let nameStr = raw.name ?? "Unknown Device"
            let isHeadphones = (nameStr.lowercased().contains("akg") ||
                                nameStr.lowercased().contains("headphone") ||
                                nameStr.lowercased().contains("buds") ||
                                nameStr.lowercased().contains("ebuddies"))
            result.append(
                BluetoothDevice(
                    macAddress: cleanAddress,
                    name: nameStr,
                    isConnected: raw.connected ?? false,
                    isPaired: raw.paired ?? true,
                    deviceType: isHeadphones ? .headphones : .unknown
                )
            )
        }
        return result
    }

    public func fetchPairedDevices() {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            var fetched: [BluetoothDevice] = []

            // 1. Try blueutil CLI
            if let blueutil = self.activeBlueutilPath {
                let output = self.runProcess(executable: blueutil, arguments: ["--paired", "--format", "json"])
                fetched = BluetoothService.parseDeviceJSON(output)
            }

            // 2. Fallback / Merge with IOBluetooth
            if let pairedIO = IOBluetoothDevice.pairedDevices() as? [IOBluetoothDevice] {
                for ioDevice in pairedIO {
                    guard let rawAddr = ioDevice.addressString else { continue }
                    let cleanAddr = rawAddr.replacingOccurrences(of: "-", with: ":").uppercased()
                    let nameStr = ioDevice.nameOrAddress ?? "Unknown Device"
                    let isConn = ioDevice.isConnected()

                    if let idx = fetched.firstIndex(where: { $0.macAddress == cleanAddr }) {
                        fetched[idx].isConnected = fetched[idx].isConnected || isConn
                    } else {
                        let isHeadphones = nameStr.lowercased().contains("akg") ||
                                           nameStr.lowercased().contains("headphone") ||
                                           nameStr.lowercased().contains("buds")
                        fetched.append(
                            BluetoothDevice(
                                macAddress: cleanAddr,
                                name: nameStr,
                                isConnected: isConn,
                                isPaired: true,
                                batteryLevel: nil,
                                rssi: Int(ioDevice.rawRSSI()),
                                deviceType: isHeadphones ? .headphones : .unknown
                            )
                        )
                    }
                }
            }

            DispatchQueue.main.async {
                self.devices = fetched
                if fetched.isEmpty {
                    self.statusMessage = "No paired devices found"
                } else {
                    let connectedCount = fetched.filter { $0.isConnected }.count
                    self.statusMessage = "\(fetched.count) paired device(s) (\(connectedCount) connected)"
                }
            }
        }
    }

    public func forceConnect(macAddress: String, maxRetries: Int = 3, completion: @escaping (Bool) -> Void) {
        self.isConnecting = true
        self.statusMessage = "Connecting to \(macAddress)..."
        
        let blueutilFormattedAddr = macAddress.replacingOccurrences(of: ":", with: "-").lowercased()

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            
            // 1. Disconnect to clear stale socket
            if let blueutil = self.activeBlueutilPath {
                _ = self.runProcess(executable: blueutil, arguments: ["--disconnect", blueutilFormattedAddr])
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
                    let res = self.runProcess(executable: blueutil, arguments: ["--connect", blueutilFormattedAddr])
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
                    self.statusMessage = "Connection failed. Check AKG pairing LED."
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
