package com.weirhere.env

/**
 *Simulator default: localhost points to macOS Next dev server.
 * Override at build/run time via environment or Xcode scheme vars if supported.
 */
actual object Env {
    actual fun apiBaseUrl(): String = "https://weirheresolutions.com"

    actual fun auth0Domain(): String = ""
    actual fun auth0ClientId(): String = ""
    actual fun auth0Audience(): String = ""
}
