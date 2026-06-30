package com.weirhere.data

import kotlinx.datetime.Clock
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime

internal fun epochMillis(): Long = Clock.System.now().toEpochMilliseconds()

internal fun currentMonthYyyyMm(): String {
    val now = Clock.System.now().toLocalDateTime(TimeZone.currentSystemDefault())
    val month = now.monthNumber.toString().padStart(2, '0')
    return "${now.year}-$month"
}
