package com.weirhere.data

import platform.Foundation.NSDate
import platform.Foundation.NSDateFormatter

internal actual fun epochMillis(): Long =
    (NSDate().timeIntervalSince1970() * 1000.0).toLong()

internal actual fun currentMonthYyyyMm(): String {
    val formatter = NSDateFormatter()
    formatter.dateFormat = "yyyy-MM"
    return formatter.stringFromDate(NSDate()) ?: "2026-01"
}
