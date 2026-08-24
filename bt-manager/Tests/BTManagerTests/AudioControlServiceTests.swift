import XCTest
@testable import BTManager

final class AudioControlServiceTests: XCTestCase {
    func testBassBoostStepCycling() {
        let service = AudioControlService()
        XCTAssertEqual(service.bassStep, .off)
        service.cycleBassStep()
        XCTAssertEqual(service.bassStep, .low)
        XCTAssertEqual(service.calculatedBassGaindB, 4.0)
        service.cycleBassStep()
        XCTAssertEqual(service.bassStep, .med)
        XCTAssertEqual(service.calculatedBassGaindB, 8.0)
        service.cycleBassStep()
        XCTAssertEqual(service.bassStep, .high)
        XCTAssertEqual(service.calculatedBassGaindB, 12.0)
        service.cycleBassStep()
        XCTAssertEqual(service.bassStep, .off)
    }

    func testSidetoneStepCycling() {
        let service = AudioControlService()
        XCTAssertEqual(service.sidetoneStep, .off)
        service.cycleSidetoneStep()
        XCTAssertEqual(service.sidetoneStep, .low)
        service.cycleSidetoneStep()
        XCTAssertEqual(service.sidetoneStep, .high)
        service.cycleSidetoneStep()
        XCTAssertEqual(service.sidetoneStep, .off)
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
