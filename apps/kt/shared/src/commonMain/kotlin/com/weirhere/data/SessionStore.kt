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
            settings.remove(KEY_LAST_LOGIN)
        } else {
            settings.putString(KEY_AT, token)
            settings.putString(KEY_LAST_LOGIN, epochMillis().toString())
        }
    }

    fun readSync(): String? = if (::settings.isInitialized) settings.getStringOrNull(KEY_AT) else null

    fun lastLoginAt(): String? =
        if (::settings.isInitialized) settings.getStringOrNull(KEY_LAST_LOGIN) else null

    private const val KEY_AT = "weir_here_access_token"
    private const val KEY_LAST_LOGIN = "weir_here_last_login_at"
}
