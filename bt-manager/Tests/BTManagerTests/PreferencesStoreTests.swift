import XCTest
@testable import BTManager

final class PreferencesStoreTests: XCTestCase {
    func testFavoriteDevicePersistence() {
        let testDefaults = UserDefaults(suiteName: "TestPreferences_\(UUID().uuidString)")!
        let store = PreferencesStore(userDefaults: testDefaults)
        let testMac = "00-11-22-33-44-55"
        
        XCTAssertFalse(store.isFavorite(macAddress: testMac))
        
        store.setFavorite(macAddress: testMac, isFavorite: true)
        XCTAssertTrue(store.isFavorite(macAddress: testMac))
        
        store.setFavorite(macAddress: testMac, isFavorite: false)
        XCTAssertFalse(store.isFavorite(macAddress: testMac))
    }

    func testAutoReconnectPersistence() {
        let testDefaults = UserDefaults(suiteName: "TestAutoReconnect_\(UUID().uuidString)")!
        let store = PreferencesStore(userDefaults: testDefaults)
        let testMac = "AA-BB-CC-DD-EE-FF"

        XCTAssertFalse(store.isAutoReconnectEnabled(macAddress: testMac))

        store.setAutoReconnect(macAddress: testMac, enabled: true)
        XCTAssertTrue(store.isAutoReconnectEnabled(macAddress: testMac))

        store.setAutoReconnect(macAddress: testMac, enabled: false)
        XCTAssertFalse(store.isAutoReconnectEnabled(macAddress: testMac))
    }
}
