package com.weirhere.network

import io.ktor.client.engine.HttpClientEngine

expect fun ktorEngine(): HttpClientEngine
