import Foundation

public struct EQPreset: Identifiable, Codable, Equatable, Hashable {
    public var id: String { name }
    public let name: String
    public let gain80Hz: Double
    public let gain250Hz: Double
    public let gain1kHz: Double
    public let gain4kHz: Double
    public let gain12kHz: Double

    public init(name: String, gain80Hz: Double, gain250Hz: Double, gain1kHz: Double, gain4kHz: Double, gain12kHz: Double) {
        self.name = name
        self.gain80Hz = gain80Hz
        self.gain250Hz = gain250Hz
        self.gain1kHz = gain1kHz
        self.gain4kHz = gain4kHz
        self.gain12kHz = gain12kHz
    }

    public static let balanced = EQPreset(name: "Balanced", gain80Hz: 0.0, gain250Hz: 0.0, gain1kHz: 0.0, gain4kHz: 0.0, gain12kHz: 0.0)
    public static let bassBoost = EQPreset(name: "Bass Boost", gain80Hz: 10.0, gain250Hz: 4.0, gain1kHz: 0.0, gain4kHz: 0.0, gain12kHz: 2.0)
    public static let vocalClarity = EQPreset(name: "Vocal Clarity", gain80Hz: -2.0, gain250Hz: 0.0, gain1kHz: 3.0, gain4kHz: 5.0, gain12kHz: 1.0)
    public static let trebleBoost = EQPreset(name: "Treble Boost", gain80Hz: -1.0, gain250Hz: 0.0, gain1kHz: 2.0, gain4kHz: 6.0, gain12kHz: 8.0)

    public static let allPresets: [EQPreset] = [.balanced, .bassBoost, .vocalClarity, .trebleBoost]
}
