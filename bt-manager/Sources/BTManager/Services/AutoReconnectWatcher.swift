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

    public func start(interval: TimeInterval = 3.0) {
        guard !isRunning else { return }
        isRunning = true
        timer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { [weak self] _ in
            self?.checkAndEnforceExclusiveLocks()
        }
    }

    public func stop() {
        timer?.invalidate()
        timer = nil
        isRunning = false
    }

    public func checkAndEnforceExclusiveLocks() {
        bluetoothService.fetchPairedDevices()
        for device in bluetoothService.devices {
            let isFav = preferencesStore.isFavorite(macAddress: device.macAddress)
            let isExclusive = preferencesStore.isExclusiveLockEnabled(macAddress: device.macAddress)
            let isAuto = preferencesStore.isAutoReconnectEnabled(macAddress: device.macAddress)

            // If Exclusive Lock or Auto Reconnect is active and device is not connected to Mac:
            if (isExclusive || isFav || isAuto) && !device.isConnected && !bluetoothService.isConnecting {
                bluetoothService.forceConnect(macAddress: device.macAddress) { [weak self] success in
                    if success {
                        self?.audioService.setSystemAudioOutput(matchingDeviceName: device.name)
                        self?.audioService.setSystemAudioInput(matchingDeviceName: device.name)
                    }
                }
            }
        }
    }
}
