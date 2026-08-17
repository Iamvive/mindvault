import SwiftUI

struct DiagnosticCardView: View {
    let report: DeviceDiagnosticReport
    let device: BluetoothDevice
    let fixService: FixActionsService
    @State private var fixStatus: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                Label("\(report.batteryLevel ?? 100)%", systemImage: "battery.100")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.green)

                Text("•")
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)

                Label(report.signalQuality, systemImage: "antenna.radiowaves.left.and.right")
                    .font(.system(size: 10))
                    .foregroundColor(.blue)
            }

            Text("Transport: \(report.connectionType)")
                .font(.system(size: 10))
                .foregroundColor(.secondary)

            if !report.issues.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(report.issues) { issue in
                        HStack(alignment: .top, spacing: 4) {
                            Text("⚠️")
                                .font(.system(size: 10))
                            VStack(alignment: .leading, spacing: 1) {
                                Text(issue.title)
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(.orange)
                                Text(issue.description)
                                    .font(.system(size: 9))
                                    .foregroundColor(.secondary)
                            }
                        }

                        if let fixType = issue.fixType {
                            Button(action: {
                                let ok = fixService.executeFix(type: fixType, device: device)
                                fixStatus = ok ? "Fix Applied!" : "Fix Failed"
                            }) {
                                Label(buttonTitle(for: fixType), systemImage: "wrench.and.screwdriver.fill")
                                    .font(.system(size: 10, weight: .bold))
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(.orange)
                            .controlSize(.mini)
                        }
                    }
                }
            } else {
                Text("✅ All diagnostic checks optimal")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.green)
            }

            if let status = fixStatus {
                Text(status)
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.green)
            }
        }
        .padding(8)
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(Color(NSColor.controlBackgroundColor))
        )
    }

    private func buttonTitle(for type: FixActionType) -> String {
        switch type {
        case .fixAudioRouting: return "Fix Mic & Audio Routing"
        case .optimizeKeyRepeat: return "Optimize Key Latency"
        case .smoothPointer: return "Smooth Pointer Fix"
        }
    }
}
