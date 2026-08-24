import SwiftUI

struct HeadphoneAudioControlView: View {
    @ObservedObject var audioControl: AudioControlService
    let device: BluetoothDevice

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header Title
            Text("🎙️ MICROPHONE & AUDIO CONTROLS")
                .font(.system(size: 9, weight: .bold))
                .foregroundColor(.secondary)

            // Mic Mute Control Row
            HStack(spacing: 8) {
                Button(action: { audioControl.toggleMicMute() }) {
                    Label(audioControl.isMicMuted ? "MIC MUTED" : "MUTE MIC", systemImage: audioControl.isMicMuted ? "mic.slash.fill" : "mic.fill")
                        .font(.system(size: 10, weight: .bold))
                }
                .buttonStyle(.borderedProminent)
                .tint(audioControl.isMicMuted ? .red : .green)
                .controlSize(.small)
                .help("Shortcut: Cmd + Option + M")

                Spacer()

                Text("Tap knob to step")
                    .font(.system(size: 8))
                    .foregroundColor(.secondary)
            }

            Divider()

            // Rotary Dials Row (Bass & Sidetone)
            HStack(spacing: 24) {
                // Bass Boost Rotary Knob
                RotaryKnobView(
                    title: "🔊 BASS BOOST",
                    valueText: audioControl.bassStep.rawValue,
                    angle: bassAngle(for: audioControl.bassStep),
                    activeColor: audioControl.bassStep == .off ? .secondary : .blue,
                    onTap: { audioControl.cycleBassStep() },
                    onScroll: { _ in audioControl.cycleBassStep() }
                )

                Spacer()

                // Sidetone Rotary Knob
                RotaryKnobView(
                    title: "🎧 MIC SIDETONE",
                    valueText: audioControl.sidetoneStep.rawValue,
                    angle: sidetoneAngle(for: audioControl.sidetoneStep),
                    activeColor: audioControl.sidetoneStep == .off ? .secondary : .orange,
                    onTap: { audioControl.cycleSidetoneStep() },
                    onScroll: { _ in audioControl.cycleSidetoneStep() }
                )
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 2)

            Divider()

            // EQ Presets Section
            VStack(alignment: .leading, spacing: 4) {
                Text("🎵 Equalizer Presets")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.secondary)

                HStack(spacing: 4) {
                    ForEach(EQPreset.allPresets) { preset in
                        Button(action: { audioControl.setEQPreset(preset) }) {
                            Text(preset.name)
                                .font(.system(size: 9, weight: audioControl.activeEQPreset == preset ? .bold : .regular))
                        }
                        .buttonStyle(.bordered)
                        .tint(audioControl.activeEQPreset == preset ? .blue : .secondary)
                        .controlSize(.mini)
                    }
                }
            }
        }
        .padding(8)
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(Color(NSColor.controlBackgroundColor))
        )
    }

    private func bassAngle(for step: BassBoostStep) -> Double {
        switch step {
        case .off: return -120.0
        case .low: return -40.0
        case .med: return 40.0
        case .high: return 120.0
        }
    }

    private func sidetoneAngle(for step: SidetoneStep) -> Double {
        switch step {
        case .off: return -120.0
        case .low: return 0.0
        case .high: return 120.0
        }
    }
}
