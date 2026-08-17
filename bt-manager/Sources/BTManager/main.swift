import SwiftUI

@main
struct BTManagerApp: App {
    var body: some Scene {
        MenuBarExtra("BT Manager", systemImage: "headphones") {
            VStack {
                Text("BT Manager Running")
                Button("Quit") {
                    NSApplication.shared.terminate(nil)
                }
            }
            .padding()
        }
        .menuBarExtraStyle(.window)
    }
}
