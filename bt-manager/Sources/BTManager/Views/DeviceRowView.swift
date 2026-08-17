import SwiftUI

struct DeviceRowView: View {
    let device: BluetoothDevice
    @ObservedObject var bluetoothService: BluetoothService
    @ObservedObject var preferencesStore: PreferencesStore
    let audioService: AudioRoutingService

    var body: some View {
        HStack(spacing: 10) {
            // Device Type Icon
            Image(systemName: device.deviceType == .headphones ? "headphones" : "bluetooth")
                .font(.system(size: 14))
                .foregroundColor(device.isConnected ? .green : .secondary)
                .frame(width: 20)

            // Name & Connection Status
            VStack(alignment: .leading, spacing: 2) {
                Text(device.name)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.primary)
                    .lineLimit(1)

                Text(device.isConnected ? "Connected" : "Disconnected")
                    .font(.system(size: 10))
                    .foregroundColor(device.isConnected ? .green : .secondary)
            }

            Spacer(minLength: 4)

            // Action Button
            Button(action: {
                bluetoothService.forceConnect(macAddress: device.macAddress) { success in
                    if success {
                        audioService.setSystemAudioOutput(matchingDeviceName: device.name)
                        audioService.setSystemAudioInput(matchingDeviceName: device.name)
                    }
                }
            }) {
                Text(device.isConnected ? "Connected" : "Connect")
                    .font(.system(size: 11, weight: .medium))
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
            .disabled(bluetoothService.isConnecting || device.isConnected)

            // Favorite Star
            Button(action: {
                let currentFav = preferencesStore.isFavorite(macAddress: device.macAddress)
                preferencesStore.setFavorite(macAddress: device.macAddress, isFavorite: !currentFav)
            }) {
                Image(systemName: preferencesStore.isFavorite(macAddress: device.macAddress) ? "star.fill" : "star")
                    .font(.system(size: 12))
                    .foregroundColor(.yellow)
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 5)
        .background(
            RoundedRectangle(cornerRadius: 6, style: .continuous)
                .fill(Color(NSColor.labelColor).opacity(0.04))
        )
    }
}
