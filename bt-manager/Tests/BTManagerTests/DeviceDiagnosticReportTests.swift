import XCTest
@testable import BTManager

final class DeviceDiagnosticReportTests: XCTestCase {
    func testRSSISignalClassification() {
        let reportEx = DeviceDiagnosticReport(macAddress: "AA-BB-CC-DD-EE-FF", rssi: -55)
        XCTAssertEqual(reportEx.signalQuality, "Excellent (-55 dBm)")

        let reportGood = DeviceDiagnosticReport(macAddress: "AA-BB-CC-DD-EE-FF", rssi: -70)
        XCTAssertEqual(reportGood.signalQuality, "Good (-70 dBm)")

        let reportWeak = DeviceDiagnosticReport(macAddress: "AA-BB-CC-DD-EE-FF", rssi: -85)
        XCTAssertEqual(reportWeak.signalQuality, "Weak (-85 dBm)")
    }
}
