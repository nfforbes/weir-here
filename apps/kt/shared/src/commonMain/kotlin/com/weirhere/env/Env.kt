package com.weirhere.env

/** Runtime config (Android: [`BuildConfig`]; iOS: static defaults overridden via README env). */
expect object Env {
    fun apiBaseUrl(): String
    fun auth0Domain(): String
    fun auth0ClientId(): String
    fun auth0Audience(): String
}
