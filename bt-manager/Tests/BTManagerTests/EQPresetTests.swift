import XCTest
@testable import BTManager

final class EQPresetTests: XCTestCase {
    func testEQPresetGains() {
        let bassPreset = EQPreset.bassBoost
        XCTAssertEqual(bassPreset.gain80Hz, 10.0)
        XCTAssertEqual(bassPreset.gain250Hz, 4.0)

        let vocalPreset = EQPreset.vocalClarity
        XCTAssertEqual(vocalPreset.gain4kHz, 5.0)

        let all = EQPreset.allPresets
        XCTAssertEqual(all.count, 4)
    }
}
