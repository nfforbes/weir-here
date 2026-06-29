package com.weirhere.data

import kotlinx.cinterop.alloc
import kotlinx.cinterop.memScoped
import kotlinx.cinterop.ptr
import platform.Foundation.NSDate
import platform.Foundation.NSDateFormatter
import platform.posix.gettimeofday
import platform.posix.timeval

internal actual fun epochMillis(): Long = memScoped {
    val timeVal = alloc<timeval>()
    gettimeofday(timeVal.ptr, null)
    timeVal.tv_sec * 1000L + timeVal.tv_usec / 1000L
}

internal actual fun currentMonthYyyyMm(): String {
    val formatter = NSDateFormatter()
    formatter.dateFormat = "yyyy-MM"
    return formatter.stringFromDate(NSDate()) ?: "2026-01"
}
