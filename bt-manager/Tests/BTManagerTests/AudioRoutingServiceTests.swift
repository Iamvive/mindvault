import XCTest
@testable import BTManager

final class AudioRoutingServiceTests: XCTestCase {
    func testAudioDeviceNameNormalization() {
        let rawName = "AKG Y500 Stereo"
        let target = "AKG Y500"
        XCTAssertTrue(AudioRoutingService.isDeviceMatch(deviceName: rawName, targetName: target))
    }

    func testAudioDeviceNameNoMatch() {
        let rawName = "Built-in Speaker"
        let target = "AKG Y500"
        XCTAssertFalse(AudioRoutingService.isDeviceMatch(deviceName: rawName, targetName: target))
    }
}
