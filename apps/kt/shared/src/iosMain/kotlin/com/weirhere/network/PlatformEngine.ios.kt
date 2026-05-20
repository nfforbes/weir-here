package com.weirhere.network

import io.ktor.client.engine.HttpClientEngine
import io.ktor.client.engine.darwin.Darwin

actual fun ktorEngine(): HttpClientEngine = Darwin.create()
