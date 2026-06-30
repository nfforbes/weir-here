import SwiftUI

@main
struct iOSApp: App {
	init() {
		Auth0Manager.shared.install()
	}

	var body: some Scene {
		WindowGroup {
			ContentView()
		}
	}
}