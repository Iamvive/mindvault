import SwiftUI

struct DeviceRowView: View {
    let device: BluetoothDevice
    @ObservedObject var bluetoothService: BluetoothService
    @ObservedObject var preferencesStore: PreferencesStore
    let audioService: AudioRoutingService

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: device.deviceType == .headphones ? "headphones" : "bluetooth")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(device.isConnected ? .green : .blue)
                .frame(width: 24)

            VStack(alignment: .leading, spacing: 2) {
                Text(device.name)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.primary)
                    .lineLimit(1)

                HStack(spacing: 4) {
                    Text(device.macAddress)
                        .font(.system(size: 10))
                        .foregroundColor(.secondary)
                    
                    Text("•")
                        .font(.system(size: 10))
                        .foregroundColor(.secondary)

                    Text(device.isConnected ? "Connected" : "Disconnected")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(device.isConnected ? .green : .secondary)
                }
            }

            Spacer()

            Button(action: {
                bluetoothService.forceConnect(macAddress: device.macAddress) { success in
                    if success {
                        audioService.setSystemAudioOutput(matchingDeviceName: device.name)
                        audioService.setSystemAudioInput(matchingDeviceName: device.name)
                    }
                }
            }) {
                Label("Connect", systemImage: "bolt.fill")
                    .font(.system(size: 11, weight: .semibold))
            }
            .buttonStyle(.borderedProminent)
            .tint(device.isConnected ? .gray : .blue)
            .disabled(bluetoothService.isConnecting)

            Button(action: {
                let currentFav = preferencesStore.isFavorite(macAddress: device.macAddress)
                preferencesStore.setFavorite(macAddress: device.macAddress, isFavorite: !currentFav)
            }) {
                Image(systemName: preferencesStore.isFavorite(macAddress: device.macAddress) ? "star.fill" : "star")
                    .font(.system(size: 14))
                    .foregroundColor(.yellow)
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 6)
        .background(RoundedRectangle(cornerRadius: 8).fill(Color(NSColor.controlBackgroundColor).opacity(0.5)))
    }
}
