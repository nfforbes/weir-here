@file:OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)

package com.weirhere.data

import platform.Foundation.NSDate
import platform.Foundation.NSDateFormatter
import platform.posix.time

internal actual fun epochMillis(): Long = time(null) * 1000L

internal actual fun currentMonthYyyyMm(): String {
    val formatter = NSDateFormatter()
    formatter.dateFormat = "yyyy-MM"
    return formatter.stringFromDate(NSDate()) ?: "2026-01"
}
