import XCTest
@testable import BTManager

final class BluetoothServiceTests: XCTestCase {
    func testDeviceStatusParsing() {
        let sampleOutput = """
        [{"address":"aa-bb-cc-dd-ee-ff","name":"AKG Y500","connected":false,"paired":true}]
        """
        let devices = BluetoothService.parseDeviceJSON(sampleOutput)
        XCTAssertEqual(devices.count, 1)
        XCTAssertEqual(devices.first?.name, "AKG Y500")
        XCTAssertFalse(devices.first?.isConnected ?? true)
        XCTAssertEqual(devices.first?.deviceType, .headphones)
    }

    func testDeviceStatusParsingUnknownDevice() {
        let sampleOutput = """
        [{"address":"11-22-33-44-55-66","name":"Generic Mouse","connected":true,"paired":true}]
        """
        let devices = BluetoothService.parseDeviceJSON(sampleOutput)
        XCTAssertEqual(devices.count, 1)
        XCTAssertEqual(devices.first?.name, "Generic Mouse")
        XCTAssertTrue(devices.first?.isConnected ?? false)
        XCTAssertEqual(devices.first?.deviceType, .unknown)
    }
}
