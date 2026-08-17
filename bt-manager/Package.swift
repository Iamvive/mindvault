// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "BTManager",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(name: "BTManager", targets: ["BTManager"])
    ],
    targets: [
        .executableTarget(
            name: "BTManager",
            dependencies: [],
            path: "Sources/BTManager",
            resources: [
                .process("Info.plist")
            ]
        ),
        .testTarget(
            name: "BTManagerTests",
            dependencies: ["BTManager"],
            path: "Tests/BTManagerTests"
        )
    ]
)
