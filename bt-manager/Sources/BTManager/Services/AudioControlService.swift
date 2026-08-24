import Foundation
import CoreAudio
import AVFoundation
import Combine

public enum BassBoostStep: String, CaseIterable, Identifiable, Codable {
    case off = "OFF"
    case low = "LOW (+4dB)"
    case med = "MED (+8dB)"
    case high = "HIGH (+12dB)"

    public var id: String { rawValue }

    public var dbGain: Double {
        switch self {
        case .off: return 0.0
        case .low: return 4.0
        case .med: return 8.0
        case .high: return 12.0
        }
    }

    public var next: BassBoostStep {
        let all = BassBoostStep.allCases
        let idx = all.firstIndex(of: self) ?? 0
        return all[(idx + 1) % all.count]
    }

    public var previous: BassBoostStep {
        let all = BassBoostStep.allCases
        let idx = all.firstIndex(of: self) ?? 0
        return all[(idx - 1 + all.count) % all.count]
    }
}

public enum SidetoneStep: String, CaseIterable, Identifiable, Codable {
    case off = "OFF"
    case low = "LOW (35%)"
    case high = "HIGH (75%)"

    public var id: String { rawValue }

    public var volume: Double {
        switch self {
        case .off: return 0.0
        case .low: return 0.35
        case .high: return 0.75
        }
    }

    public var next: SidetoneStep {
        let all = SidetoneStep.allCases
        let idx = all.firstIndex(of: self) ?? 0
        return all[(idx + 1) % all.count]
    }

    public var previous: SidetoneStep {
        let all = SidetoneStep.allCases
        let idx = all.firstIndex(of: self) ?? 0
        return all[(idx - 1 + all.count) % all.count]
    }
}

public final class AudioControlService: ObservableObject {
    @Published public private(set) var isMicMuted: Bool = false
    @Published public private(set) var bassStep: BassBoostStep = .off
    @Published public private(set) var activeEQPreset: EQPreset = .balanced
    @Published public private(set) var sidetoneStep: SidetoneStep = .off

    private var sidetoneEngine: AVAudioEngine?

    public init() {
        self.isMicMuted = checkCurrentMicMuteStatus()
    }

    public var calculatedBassGaindB: Double {
        return bassStep.dbGain
    }

    public func cycleBassStep() {
        setBassStep(bassStep.next)
    }

    public func setBassStep(_ step: BassBoostStep) {
        self.bassStep = step
    }

    public func cycleSidetoneStep() {
        setSidetoneStep(sidetoneStep.next)
    }

    public func setSidetoneStep(_ step: SidetoneStep) {
        self.sidetoneStep = step
        if step == .off {
            stopSidetoneEngine()
        } else {
            startSidetoneEngine(volume: step.volume)
        }
    }

    public func toggleMicMute() {
        setMicMuted(!isMicMuted)
    }

    public func setMicMuted(_ muted: Bool) {
        var defaultInputDeviceID: AudioDeviceID = 0
        var propertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioHardwarePropertyDefaultInputDevice,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
        var propertySize = UInt32(MemoryLayout<AudioDeviceID>.size)

        guard AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &propertyAddress, 0, nil, &propertySize, &defaultInputDeviceID) == noErr else {
            self.isMicMuted = muted
            return
        }

        var muteAddress = AudioObjectPropertyAddress(
            mSelector: kAudioDevicePropertyMute,
            mScope: kAudioDevicePropertyScopeInput,
            mElement: kAudioObjectPropertyElementMain
        )

        var muteVal: UInt32 = muted ? 1 : 0
        AudioObjectSetPropertyData(defaultInputDeviceID, &muteAddress, 0, nil, UInt32(MemoryLayout<UInt32>.size), &muteVal)
        self.isMicMuted = muted
    }

    public func setEQPreset(_ preset: EQPreset) {
        self.activeEQPreset = preset
    }

    private func checkCurrentMicMuteStatus() -> Bool {
        var defaultInputDeviceID: AudioDeviceID = 0
        var propertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioHardwarePropertyDefaultInputDevice,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
        var propertySize = UInt32(MemoryLayout<AudioDeviceID>.size)
        guard AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &propertyAddress, 0, nil, &propertySize, &defaultInputDeviceID) == noErr else {
            return false
        }

        var muteAddress = AudioObjectPropertyAddress(
            mSelector: kAudioDevicePropertyMute,
            mScope: kAudioDevicePropertyScopeInput,
            mElement: kAudioObjectPropertyElementMain
        )
        var muteVal: UInt32 = 0
        var muteSize = UInt32(MemoryLayout<UInt32>.size)
        if AudioObjectGetPropertyData(defaultInputDeviceID, &muteAddress, 0, nil, &muteSize, &muteVal) == noErr {
            return muteVal != 0
        }
        return false
    }

    private func startSidetoneEngine(volume: Double) {
        stopSidetoneEngine()
        let engine = AVAudioEngine()
        let inputNode = engine.inputNode
        let outputNode = engine.outputNode
        let format = inputNode.inputFormat(forBus: 0)

        engine.connect(inputNode, to: outputNode, format: format)
        engine.mainMixerNode.outputVolume = Float(volume)

        do {
            try engine.start()
            self.sidetoneEngine = engine
        } catch {
            print("Failed to start Sidetone AVAudioEngine: \(error)")
        }
    }

    private func stopSidetoneEngine() {
        sidetoneEngine?.stop()
        sidetoneEngine = nil
    }
}
