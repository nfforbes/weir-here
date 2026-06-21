package com.weirhere.data

import java.time.YearMonth

internal actual fun epochMillis(): Long = System.currentTimeMillis()

internal actual fun currentMonthYyyyMm(): String = YearMonth.now().toString()
