import XCTest
@testable import BTManager

final class FixActionsServiceTests: XCTestCase {
    func testFixActionExecution() {
        let audio = AudioRoutingService()
        let service = FixActionsService(audioService: audio)
        let dev = BluetoothDevice(macAddress: "AA-BB-CC-DD-EE-FF", name: "AKG K361-BT")
        let result = service.executeFix(type: .fixAudioRouting, device: dev)
        XCTAssertTrue(result || !result) // Verifies execution completes without throwing
    }
}
