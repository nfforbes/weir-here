package com.weirhere.auth

import com.weirhere.env.Env
import platform.Foundation.NSNotificationCenter

private const val LOGIN_NOTIFICATION = "WeirHereAuthLogin"
private const val LOGOUT_NOTIFICATION = "WeirHereAuthLogout"

private var pendingLoginSuccess: ((String) -> Unit)? = null
private var pendingLoginError: ((String) -> Unit)? = null
private var pendingLogoutDone: (() -> Unit)? = null

internal fun beginIosAuthLogin(
    onToken: (String) -> Unit,
    onError: (String) -> Unit,
) {
    if (Env.auth0Domain().isBlank() || Env.auth0ClientId().isBlank()) {
        onError("Set weir_here.auth0.domain and weir_here.auth0.clientId in apps/kt/local.properties")
        return
    }
    pendingLoginSuccess = onToken
    pendingLoginError = onError
    NSNotificationCenter.defaultCenter.postNotificationName(LOGIN_NOTIFICATION, null)
}

internal fun beginIosAuthLogout(onDone: () -> Unit) {
    pendingLogoutDone = onDone
    NSNotificationCenter.defaultCenter.postNotificationName(LOGOUT_NOTIFICATION, null)
}

fun iosAuthOnLoginSuccess(token: String) {
    pendingLoginSuccess?.invoke(token)
    pendingLoginSuccess = null
    pendingLoginError = null
}

fun iosAuthOnLoginFailure(message: String) {
    pendingLoginError?.invoke(message)
    pendingLoginSuccess = null
    pendingLoginError = null
}

fun iosAuthOnLogoutComplete() {
    pendingLogoutDone?.invoke()
    pendingLogoutDone = null
}

fun iosAuthGetDomain(): String = Env.auth0Domain()

fun iosAuthGetClientId(): String = Env.auth0ClientId()

fun iosAuthGetAudience(): String = Env.auth0Audience()
