package com.weirhere.platform

import platform.Foundation.NSProcessInfo

actual fun isScreenshotMode(): Boolean =
    NSProcessInfo.processInfo.arguments.any { arg ->
        val value = arg.toString()
        value == "-ScreenshotMode" || value.startsWith("-ScreenshotTab=")
    }

actual fun screenshotLaunchTab(): String? {
    for (arg in NSProcessInfo.processInfo.arguments) {
        val value = arg.toString()
        if (value.startsWith("-ScreenshotTab=")) {
            return value.removePrefix("-ScreenshotTab=").trim().lowercase().ifEmpty { null }
        }
    }
    return null
}
