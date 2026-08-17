import SwiftUI

struct MainPopoverView: View {
    @ObservedObject var bluetoothService: BluetoothService
    @ObservedObject var preferencesStore: PreferencesStore
    @ObservedObject var watcher: AutoReconnectWatcher
    let audioService: AudioRoutingService

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header
            HStack {
                Label("BT Manager", systemImage: "headphones")
                    .font(.system(size: 13, weight: .bold))
                Spacer()
                Button(action: { bluetoothService.fetchPairedDevices() }) {
                    Image(systemName: "arrow.clockwise")
                        .font(.system(size: 12))
                        .foregroundColor(.secondary)
                }
                .buttonStyle(.plain)
                .help("Refresh Devices")
            }

            if !bluetoothService.statusMessage.isEmpty {
                Text(bluetoothService.statusMessage)
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }

            Divider()

            // Favorites Section
            let favorites = bluetoothService.devices.filter { preferencesStore.isFavorite(macAddress: $0.macAddress) }
            if !favorites.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("FAVORITES")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(.secondary)

                    ForEach(favorites) { dev in
                        DeviceRowView(
                            device: dev,
                            bluetoothService: bluetoothService,
                            preferencesStore: preferencesStore,
                            audioService: audioService
                        )
                    }
                }

                Divider()
            }

            // All Devices Section
            VStack(alignment: .leading, spacing: 4) {
                Text("PAIRED DEVICES")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.secondary)

                if bluetoothService.devices.isEmpty {
                    Text("No Bluetooth devices found")
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                        .padding(.vertical, 4)
                } else {
                    ScrollView {
                        VStack(spacing: 4) {
                            ForEach(bluetoothService.devices) { dev in
                                DeviceRowView(
                                    device: dev,
                                    bluetoothService: bluetoothService,
                                    preferencesStore: preferencesStore,
                                    audioService: audioService
                                )
                            }
                        }
                    }
                    .frame(maxHeight: 200)
                }
            }

            Divider()

            // Footer
            HStack {
                Button("Quit") {
                    NSApplication.shared.terminate(nil)
                }
                .buttonStyle(.plain)
                .font(.system(size: 11))
                .foregroundColor(.secondary)

                Spacer()

                Button("Bluetooth Settings") {
                    if let url = URL(string: "x-apple.systempreferences:com.apple.preferences.Bluetooth") {
                        NSWorkspace.shared.open(url)
                    }
                }
                .buttonStyle(.plain)
                .font(.system(size: 11))
                .foregroundColor(.secondary)
            }
        }
        .padding(12)
        .frame(width: 290)
        .onAppear {
            bluetoothService.fetchPairedDevices()
            watcher.start()
        }
    }
}
