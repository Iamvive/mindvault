import Foundation
import AVFoundation
import CoreAudio

public final class DeviceDiagnosticService {
    public init() {}

    public func inspect(device: BluetoothDevice) -> DeviceDiagnosticReport {
        var issues: [DiagnosticIssue] = []

        if device.deviceType == .headphones {
            // Check microphone authorization
            let authStatus = AVCaptureDevice.authorizationStatus(for: .audio)
            if authStatus == .denied || authStatus == .restricted {
                issues.append(
                    DiagnosticIssue(
                        title: "Microphone Access Restricted",
                        description: "macOS system permissions block microphone input.",
                        fixType: .fixAudioRouting
                    )
                )
            }

            // Check input audio routing
            let currentInputName = getCurrentInputDeviceName()
            if !currentInputName.lowercased().contains("akg") && !currentInputName.lowercased().contains("headphone") {
                if currentInputName.contains("ManyCam") || currentInputName.contains("Teams") {
                    issues.append(
                        DiagnosticIssue(
                            title: "Virtual Mic Driver Intercept",
                            description: "Virtual microphone (\(currentInputName)) is capturing audio input.",
                            fixType: .fixAudioRouting
                        )
                    )
                }
            }
        } else if device.deviceType == .keyboard {
            let keyRepeat = UserDefaults.standard.integer(forKey: "KeyRepeat")
            if keyRepeat > 25 || keyRepeat == 0 {
                issues.append(
                    DiagnosticIssue(
                        title: "Slow Typing Response",
                        description: "macOS key repeat delay is set to slow mode.",
                        fixType: .optimizeKeyRepeat
                    )
                )
            }
        } else if device.deviceType == .mouse {
            let mouseScaling = UserDefaults.standard.float(forKey: "com.apple.mouse.scaling")
            if mouseScaling < 1.0 && mouseScaling > 0 {
                issues.append(
                    DiagnosticIssue(
                        title: "Jumpy Pointer Acceleration",
                        description: "Mouse tracking scaling is set below standard threshold.",
                        fixType: .smoothPointer
                    )
                )
            }
        }

        return DeviceDiagnosticReport(
            macAddress: device.macAddress,
            batteryLevel: device.batteryLevel ?? 100,
            rssi: device.rssi ?? -58,
            connectionType: device.deviceType == .keyboard ? "Bluetooth LE (HID)" : "Bluetooth Classic",
            issues: issues
        )
    }

    private func getCurrentInputDeviceName() -> String {
        var defaultInputDeviceID: AudioDeviceID = 0
        var propertyAddress = AudioObjectPropertyAddress(
            mSelector: kAudioHardwarePropertyDefaultInputDevice,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
        var propertySize = UInt32(MemoryLayout<AudioDeviceID>.size)

        guard AudioObjectGetPropertyData(AudioObjectID(kAudioObjectSystemObject), &propertyAddress, 0, nil, &propertySize, &defaultInputDeviceID) == noErr else {
            return "Unknown"
        }

        var nameAddress = AudioObjectPropertyAddress(
            mSelector: kAudioObjectPropertyName,
            mScope: kAudioObjectPropertyScopeGlobal,
            mElement: kAudioObjectPropertyElementMain
        )
        var nameSize: UInt32 = 0
        if AudioObjectGetPropertyDataSize(defaultInputDeviceID, &nameAddress, 0, nil, &nameSize) == noErr && nameSize > 0 {
            var nameBuffer = [CChar](repeating: 0, count: Int(nameSize) + 1)
            if AudioObjectGetPropertyData(defaultInputDeviceID, &nameAddress, 0, nil, &nameSize, &nameBuffer) == noErr {
                nameBuffer[Int(nameSize)] = 0
                return String(cString: nameBuffer)
            }
        }
        return "Unknown"
    }
}
