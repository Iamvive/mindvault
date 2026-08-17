import Foundation

public final class PreferencesStore: ObservableObject {
    private let userDefaults: UserDefaults
    private let favoritesKey = "BTManager_FavoriteMACs"
    private let autoReconnectKey = "BTManager_AutoReconnectMACs"
    private let exclusiveLockKey = "BTManager_ExclusiveLockMACs"

    @Published public private(set) var favoriteMacs: Set<String>
    @Published public private(set) var autoReconnectMacs: Set<String>
    @Published public private(set) var exclusiveLockMacs: Set<String>

    public init(userDefaults: UserDefaults = .standard) {
        self.userDefaults = userDefaults
        let storedFavs = userDefaults.stringArray(forKey: favoritesKey) ?? []
        let storedAuto = userDefaults.stringArray(forKey: autoReconnectKey) ?? []
        let storedLock = userDefaults.stringArray(forKey: exclusiveLockKey) ?? []
        self.favoriteMacs = Set(storedFavs)
        self.autoReconnectMacs = Set(storedAuto)
        self.exclusiveLockMacs = Set(storedLock)
    }

    public func isFavorite(macAddress: String) -> Bool {
        favoriteMacs.contains(macAddress)
    }

    public func setFavorite(macAddress: String, isFavorite: Bool) {
        if isFavorite {
            favoriteMacs.insert(macAddress)
        } else {
            favoriteMacs.remove(macAddress)
        }
        userDefaults.set(Array(favoriteMacs), forKey: favoritesKey)
    }

    public func isAutoReconnectEnabled(macAddress: String) -> Bool {
        autoReconnectMacs.contains(macAddress)
    }

    public func setAutoReconnect(macAddress: String, enabled: Bool) {
        if enabled {
            autoReconnectMacs.insert(macAddress)
        } else {
            autoReconnectMacs.remove(macAddress)
        }
        userDefaults.set(Array(autoReconnectMacs), forKey: autoReconnectKey)
    }

    public func isExclusiveLockEnabled(macAddress: String) -> Bool {
        exclusiveLockMacs.contains(macAddress)
    }

    public func setExclusiveLock(macAddress: String, enabled: Bool) {
        if enabled {
            exclusiveLockMacs.insert(macAddress)
        } else {
            exclusiveLockMacs.remove(macAddress)
        }
        userDefaults.set(Array(exclusiveLockMacs), forKey: exclusiveLockKey)
    }
}
