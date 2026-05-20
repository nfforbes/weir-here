package com.weirhere.env

import com.weirhere.shared.BuildConfig

actual object Env {
    actual fun apiBaseUrl(): String = BuildConfig.WEIR_HERE_API_URL.trimEnd('/')
    actual fun auth0Domain(): String = BuildConfig.AUTH0_DOMAIN.trim()
    actual fun auth0ClientId(): String = BuildConfig.AUTH0_CLIENT_ID.trim()
    actual fun auth0Audience(): String = BuildConfig.AUTH0_AUDIENCE.trim()
}
