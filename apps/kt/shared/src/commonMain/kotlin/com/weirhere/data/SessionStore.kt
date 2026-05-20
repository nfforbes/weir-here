package com.weirhere.data

import com.russhwolf.settings.Settings
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Bearer access token persisted with multiplatform-settings.
 * Call [initWith] early (e.g. first Composable frame) with Settings().
 */
object SessionStore {
    private lateinit var settings: Settings

    private val _accessToken = MutableStateFlow<String?>(null)
    val accessToken: StateFlow<String?> = _accessToken.asStateFlow()

    fun initWith(s: Settings) {
        settings = s
        _accessToken.value = settings.getStringOrNull(KEY_AT)
    }

    fun setAccess(token: String?) {
        _accessToken.value = token
        if (token == null || token.isBlank()) {
            settings.remove(KEY_AT)
        } else {
            settings.putString(KEY_AT, token)
        }
    }

    fun readSync(): String? = if (::settings.isInitialized) settings.getStringOrNull(KEY_AT) else null

    private const val KEY_AT = "weir_here_access_token"
}
