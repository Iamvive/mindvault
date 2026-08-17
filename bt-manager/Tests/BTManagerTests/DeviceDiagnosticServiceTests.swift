import XCTest
@testable import BTManager

final class DeviceDiagnosticServiceTests: XCTestCase {
    func testInspectHeadphoneDevice() {
        let service = DeviceDiagnosticService()
        let dev = BluetoothDevice(macAddress: "AA-BB-CC-DD-EE-FF", name: "AKG K361-BT", deviceType: .headphones)
        let report = service.inspect(device: dev)
        XCTAssertEqual(report.macAddress, "AA-BB-CC-DD-EE-FF")
        XCTAssertEqual(report.connectionType, "Bluetooth Classic")
    }

    func testInspectKeyboardDevice() {
        let service = DeviceDiagnosticService()
        let dev = BluetoothDevice(macAddress: "11-22-33-44-55-66", name: "Keychron K6", deviceType: .keyboard)
        let report = service.inspect(device: dev)
        XCTAssertEqual(report.macAddress, "11-22-33-44-55-66")
        XCTAssertEqual(report.connectionType, "Bluetooth LE (HID)")
    }
}
