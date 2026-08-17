import XCTest
@testable import BTManager

final class AudioControlServiceTests: XCTestCase {
    func testBassBoostMapping() {
        let service = AudioControlService()
        service.setBassBoostLevel(0.5)
        XCTAssertEqual(service.bassBoostLevel, 0.5)
        XCTAssertEqual(service.calculatedBassGaindB, 6.0)

        service.setBassBoostLevel(1.0)
        XCTAssertEqual(service.calculatedBassGaindB, 12.0)
    }

    func testMicMuteToggle() {
        let service = AudioControlService()
        let initial = service.isMicMuted
        service.setMicMuted(!initial)
        XCTAssertEqual(service.isMicMuted, !initial)
    }

    func testEQPresetSelection() {
        let service = AudioControlService()
        XCTAssertEqual(service.activeEQPreset, .balanced)
        service.setEQPreset(.bassBoost)
        XCTAssertEqual(service.activeEQPreset, .bassBoost)
    }
}
