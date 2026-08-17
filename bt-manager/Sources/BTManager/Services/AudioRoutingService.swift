import Foundation
import CoreAudio

public final class AudioRoutingService {
    public init() {}

    public static func isDeviceMatch(deviceName: String, targetName: String) -> Bool {
        let d = deviceName.lowercased()
        let t = targetName.lowercased()
        return d.contains(t) || t.contains(d)
    }

    @discardableResult
    public func setSystemAudioOutput(matchingDeviceName targetName: String) -> Bool {
        return setSystemAudioDevice(matchingDeviceName: targetName, isInput: false)
    }

    @discardableResult
    public func setSystemAudioInput(matchingDeviceName targetName: String) -> Bool {
        return setSystemAudioDevice(matchingDeviceName: targetName, isInput: true)
    }

    private func setSystemAudioDevice(matchingDeviceName targetName: String, isInput: Bool) -> Bool {
        var propertySize: UInt32 = 0
        var address = AudioObjectPropertyAddress(
            mSelector: kAudioHardwarePropertyDevices,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )

        guard AudioObjectGetPropertyDataSize(AudioObjectID(kAudioObjectSystemObject), &address, 0, nil, &propertySize) == noErr else {
            return false
        }

        let deviceCount = Int(propertySize) / MemoryLayout<AudioDeviceID>.size
        var deviceIDs = [AudioDeviceID](repeating: 0, count: deviceCount)
        guard AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &address, 0, nil, &propertySize, &deviceIDs) == noErr else {
            return false
        }

        let targetSelector = isInput ? kAudioHardwarePropertyDefaultInputDevice : kAudioHardwarePropertyDefaultOutputDevice

        for id in deviceIDs {
            var nameSize: UInt32 = 0
            var nameAddress = AudioObjectPropertyAddress(
                mSelector: kAudioObjectPropertyName,
                mScope: kAudioObjectPropertyScopeGlobal,
                mElement: kAudioObjectPropertyElementMain
            )
            if AudioObjectGetPropertyDataSize(id, &nameAddress, 0, nil, &nameSize) == noErr {
                var nameBuffer = [CChar](repeating: 0, count: Int(nameSize))
                if AudioObjectGetPropertyData(id, &nameAddress, 0, nil, &nameSize, &nameBuffer) == noErr {
                    let devName = String(cString: nameBuffer)
                    if AudioRoutingService.isDeviceMatch(deviceName: devName, targetName: targetName) {
                        var defaultAddress = AudioObjectPropertyAddress(
                            mSelector: targetSelector,
                            mScope: kAudioObjectPropertyScopeGlobal,
                            mElement: kAudioObjectPropertyElementMain
                        )
                        var targetID = id
                        let status = AudioObjectSetPropertyData(AudioObjectID(kAudioObjectSystemObject), &defaultAddress, 0, nil, UInt32(MemoryLayout<AudioDeviceID>.size), &targetID)
                        return status == noErr
                    }
                }
            }
        }
        return false
    }
}
