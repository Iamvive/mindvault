import SwiftUI

struct DeviceRowView: View {
    let device: BluetoothDevice
    @ObservedObject var bluetoothService: BluetoothService
    @ObservedObject var preferencesStore: PreferencesStore
    let audioService: AudioRoutingService

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: device.deviceType == .headphones ? "headphones" : "bluetooth")
                .font(.title3)
                .foregroundColor(device.isConnected ? .green : .gray)
                .frame(width: 24)

            VStack(alignment: .leading, spacing: 2) {
                Text(device.name)
                    .font(.body)
                    .fontWeight(.medium)
                    .lineLimit(1)
                Text(device.isConnected ? "Connected" : "Disconnected")
                    .font(.caption)
                    .foregroundColor(device.isConnected ? .green : .secondary)
            }

            Spacer()

            if preferencesStore.isFavorite(macAddress: device.macAddress) {
                Button(action: {
                    bluetoothService.forceConnect(macAddress: device.macAddress) { success in
                        if success {
                            audioService.setSystemAudioOutput(matchingDeviceName: device.name)
                        }
                    }
                }) {
                    Label("Force Connect", systemImage: "bolt.fill")
                        .font(.caption)
                }
                .buttonStyle(.borderedProminent)
                .disabled(bluetoothService.isConnecting)
            }

            Button(action: {
                let currentFav = preferencesStore.isFavorite(macAddress: device.macAddress)
                preferencesStore.setFavorite(macAddress: device.macAddress, isFavorite: !currentFav)
            }) {
                Image(systemName: preferencesStore.isFavorite(macAddress: device.macAddress) ? "star.fill" : "star")
                    .foregroundColor(.yellow)
            }
            .buttonStyle(.plain)
        }
        .padding(.vertical, 4)
    }
}
