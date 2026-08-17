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

    public func checkAndReconnectFavorites() {
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
