import SwiftUI

struct MainPopoverView: View {
    @ObservedObject var bluetoothService: BluetoothService
    @ObservedObject var preferencesStore: PreferencesStore
    @ObservedObject var watcher: AutoReconnectWatcher
    let audioService: AudioRoutingService

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("BT Manager", systemImage: "headphones")
                    .font(.headline)
                Spacer()
                Button(action: { bluetoothService.fetchPairedDevices() }) {
                    Image(systemName: "arrow.clockwise")
                }
                .buttonStyle(.plain)
            }

            Divider()

            if !bluetoothService.statusMessage.isEmpty {
                Text(bluetoothService.statusMessage)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Text("FAVORITES")
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(.secondary)

            let favorites = bluetoothService.devices.filter { preferencesStore.isFavorite(macAddress: $0.macAddress) }
            if favorites.isEmpty {
                Text("No favorite devices pinned yet. Click star to pin.")
                    .font(.caption)
                    .foregroundColor(.secondary)
            } else {
                ForEach(favorites) { dev in
                    DeviceRowView(device: dev, bluetoothService: bluetoothService, preferencesStore: preferencesStore, audioService: audioService)
                }
            }

            Divider()

            Text("ALL DEVICES")
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundColor(.secondary)

            ScrollView {
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(bluetoothService.devices) { dev in
                        DeviceRowView(device: dev, bluetoothService: bluetoothService, preferencesStore: preferencesStore, audioService: audioService)
                    }
                }
            }
            .frame(maxHeight: 200)

            Divider()

            HStack {
                Button("Quit") {
                    NSApplication.shared.terminate(nil)
                }
                .buttonStyle(.borderless)
                
                Spacer()

                Button("Open System Settings") {
                    if let url = URL(string: "x-apple.systempreferences:com.apple.preferences.Bluetooth") {
                        NSWorkspace.shared.open(url)
                    }
                }
                .buttonStyle(.borderless)
            }
        }
        .padding()
        .frame(width: 340)
        .onAppear {
            bluetoothService.fetchPairedDevices()
            watcher.start()
        }
    }
}
