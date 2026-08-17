import Foundation
import CoreAudio
import AVFoundation
import Combine

public final class AudioControlService: ObservableObject {
    @Published public private(set) var isMicMuted: Bool = false
    @Published public private(set) var bassBoostLevel: Double = 0.0 // 0.0 to 1.0
    @Published public private(set) var activeEQPreset: EQPreset = .balanced
    @Published public private(set) var isSidetoneEnabled: Bool = false
    @Published public private(set) var sidetoneVolume: Double = 0.5 // 0.0 to 1.0

    private var sidetoneEngine: AVAudioEngine?

    public init() {
        self.isMicMuted = checkCurrentMicMuteStatus()
    }

    public var calculatedBassGaindB: Double {
        return bassBoostLevel * 12.0
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

    public func setBassBoostLevel(_ level: Double) {
        self.bassBoostLevel = max(0.0, min(1.0, level))
    }

    public func setEQPreset(_ preset: EQPreset) {
        self.activeEQPreset = preset
    }

    public func toggleSidetone() {
        setSidetoneEnabled(!isSidetoneEnabled)
    }

    public func setSidetoneEnabled(_ enabled: Bool) {
        self.isSidetoneEnabled = enabled
        if enabled {
            startSidetoneEngine()
        } else {
            stopSidetoneEngine()
        }
    }

    public func setSidetoneVolume(_ volume: Double) {
        self.sidetoneVolume = max(0.0, min(1.0, volume))
        sidetoneEngine?.mainMixerNode.outputVolume = Float(self.sidetoneVolume)
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

    private func startSidetoneEngine() {
        stopSidetoneEngine()
        let engine = AVAudioEngine()
        let inputNode = engine.inputNode
        let outputNode = engine.outputNode
        let format = inputNode.inputFormat(forBus: 0)

        engine.connect(inputNode, to: outputNode, format: format)
        engine.mainMixerNode.outputVolume = Float(sidetoneVolume)

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
