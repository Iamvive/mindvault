import SwiftUI

struct MainPopoverView: View {
    @ObservedObject var bluetoothService: BluetoothService
    @ObservedObject var preferencesStore: PreferencesStore
    @ObservedObject var watcher: AutoReconnectWatcher
    let audioService: AudioRoutingService

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Header
            HStack {
                Label("BT Manager", systemImage: "headphones")
                    .font(.system(size: 15, weight: .bold))
                Spacer()
                Button(action: { bluetoothService.fetchPairedDevices() }) {
                    Image(systemName: "arrow.clockwise.circle.fill")
                        .font(.system(size: 16))
                        .foregroundColor(.blue)
                }
                .buttonStyle(.plain)
                .help("Refresh Devices")
            }

            Text(bluetoothService.statusMessage)
                .font(.system(size: 11))
                .foregroundColor(.secondary)

            Divider()

            // Favorites Section
            VStack(alignment: .leading, spacing: 6) {
                Text("FAVORITES")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.secondary)

                let favorites = bluetoothService.devices.filter { preferencesStore.isFavorite(macAddress: $0.macAddress) }
                if favorites.isEmpty {
                    Text("No favorite devices pinned yet. Click star ⭐ to pin.")
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                        .padding(.vertical, 2)
                } else {
                    ForEach(favorites) { dev in
                        DeviceRowView(
                            device: dev,
                            bluetoothService: bluetoothService,
                            preferencesStore: preferencesStore,
                            audioService: audioService
                        )
                    }
                }
            }

            Divider()

            // All Devices Section
            VStack(alignment: .leading, spacing: 6) {
                Text("ALL PAIRED DEVICES (\(bluetoothService.devices.count))")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.secondary)

                if bluetoothService.devices.isEmpty {
                    Text("Searching for Bluetooth devices...")
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                        .padding(.vertical, 8)
                } else {
                    ScrollView {
                        VStack(spacing: 6) {
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
                    .frame(maxHeight: 220)
                }
            }

            Divider()

            // Footer
            HStack {
                Button("Quit") {
                    NSApplication.shared.terminate(nil)
                }
                .buttonStyle(.borderless)
                .font(.system(size: 12))

                Spacer()

                Button("Open Bluetooth Settings") {
                    if let url = URL(string: "x-apple.systempreferences:com.apple.preferences.Bluetooth") {
                        NSWorkspace.shared.open(url)
                    }
                }
                .buttonStyle(.borderless)
                .font(.system(size: 12))
            }
        }
        .padding(14)
        .frame(width: 360)
        .onAppear {
            bluetoothService.fetchPairedDevices()
            watcher.start()
        }
    }
}
