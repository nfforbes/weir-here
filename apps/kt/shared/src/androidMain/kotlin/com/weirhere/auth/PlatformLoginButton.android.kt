package com.weirhere.auth

import android.app.Activity
import androidx.compose.material.Button
import androidx.compose.material.Icon
import androidx.compose.material.IconButton
import androidx.compose.material.Text
import androidx.compose.material.TextButton
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import com.auth0.android.Auth0
import com.auth0.android.authentication.AuthenticationException
import com.auth0.android.callback.Callback
import com.auth0.android.provider.WebAuthProvider
import com.auth0.android.result.Credentials
import com.weirhere.env.Env
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

private const val SCHEME = "weirhere"
private const val REDIRECT_URI = "weirhere://callback"

@Composable
actual fun PlatformLoginButton(
    label: String,
    onAccessToken: (String) -> Unit,
    onError: (String) -> Unit,
) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val activity = rememberActivity(ctx)
    Button(onClick = {
        if (activity == null) {
            onError("Could not find Activity for Auth0 login.")
            return@Button
        }
        scope.launch(Dispatchers.Main) {
            runCatching { login(activity) }
                .onSuccess(onAccessToken)
                .onFailure { e ->
                    onError(e.message ?: e.toString())
                }
        }
    }) {
        Text(label)
    }
}

@Composable
actual fun PlatformLoginEffect(
    start: Boolean,
    onConsumed: () -> Unit,
    onAccessToken: (String) -> Unit,
    onError: (String) -> Unit,
) {
    val ctx = LocalContext.current
    val activity = rememberActivity(ctx)
    val scope = rememberCoroutineScope()
    androidx.compose.runtime.LaunchedEffect(start) {
        if (!start) return@LaunchedEffect
        val act = activity
        if (act == null) {
            onConsumed()
            onError("Could not find Activity for Auth0 login.")
            return@LaunchedEffect
        }
        // Launch on rememberCoroutineScope first so resetting [start] does not cancel Auth0.
        scope.launch(Dispatchers.Main) {
            runCatching { login(act) }
                .onSuccess(onAccessToken)
                .onFailure { e -> onError(e.message ?: e.toString()) }
        }
        onConsumed()
    }
}

@Composable
private fun rememberActivity(ctx: android.content.Context): Activity? =
    androidx.compose.runtime.remember(ctx) {
        when (ctx) {
            is Activity -> ctx
            is android.content.ContextWrapper -> unwrap(ctx)
            else -> null
        }
    }

private tailrec fun unwrap(c: android.content.Context): Activity? =
    when {
        c is Activity -> c
        c is android.content.ContextWrapper -> unwrap(c.baseContext)
        else -> null
    }

private fun buildAuth0(): Auth0 {
    val domain = Env.auth0Domain()
    val clientId = Env.auth0ClientId()
    if (domain.isBlank() || clientId.isBlank()) {
        throw IllegalArgumentException(
            "Set weir_here.auth0.domain and weir_here.auth0.clientId in apps/kt/local.properties",
        )
    }
    return Auth0(clientId, domain)
}

/**
 * Returns a JWT suitable for Bearer API calls.
 * With [Env.auth0Audience], uses access token; otherwise falls back to ID token
 * (backend accepts mobile client id as audience when no custom API is configured).
 */
private fun pickBearerToken(result: Credentials): String {
    val audience = Env.auth0Audience().trim()
    if (audience.isNotBlank()) {
        val access = result.accessToken?.trim().orEmpty()
        if (access.isNotEmpty()) return access
    }
    val id = result.idToken?.trim().orEmpty()
    if (id.isNotEmpty()) return id
    throw IllegalStateException(
        if (audience.isNotBlank()) {
            "No access token received. Check Auth0 API audience: $audience"
        } else {
            "No ID token received from Auth0. Ensure openid scope is enabled."
        },
    )
}

private suspend fun login(activity: Activity): String =
    suspendCancellableCoroutine { cont ->
        val audience = Env.auth0Audience().trim()
        var req =
            WebAuthProvider.login(buildAuth0())
                .withScheme(SCHEME)
                .withRedirectUri(REDIRECT_URI)
                .withScope("openid profile email offline_access")
                .withParameters(mapOf("prompt" to "login"))

        if (audience.isNotBlank()) {
            req = req.withAudience(audience)
        }

        req.start(
            activity,
            object : Callback<Credentials, AuthenticationException> {
                override fun onFailure(error: AuthenticationException) {
                    if (cont.isActive) cont.resumeWithException(error)
                }

                override fun onSuccess(result: Credentials) {
                    runCatching { pickBearerToken(result) }
                        .onSuccess { token ->
                            if (cont.isActive) cont.resume(token)
                        }
                        .onFailure { e ->
                            if (cont.isActive) cont.resumeWithException(e)
                        }
                }
            },
        )
    }

suspend fun logoutAuth0(activity: Activity) =
    suspendCancellableCoroutine<Unit> { cont ->
        // Must match login redirect + Auth0 "Allowed Logout URLs" (weirhere://callback).
        // withScheme alone builds weirhere://{domain}/android/{package}/callback, which fails logout.
        WebAuthProvider.logout(buildAuth0())
            .withReturnToUrl(REDIRECT_URI)
            .start(
                activity,
                object : Callback<Void?, AuthenticationException> {
                    override fun onFailure(error: AuthenticationException) {
                        if (cont.isActive) cont.resume(Unit)
                    }

                    override fun onSuccess(result: Void?) {
                        if (cont.isActive) cont.resume(Unit)
                    }
                },
            )
    }

@Composable
actual fun PlatformLogoutButton(
    label: String,
    onLogout: () -> Unit,
    iconOnly: Boolean,
) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val activity = rememberActivity(ctx)
    val onClick: () -> Unit = {
        scope.launch(Dispatchers.Main) {
            // Clear local session first so UI returns home even if Auth0 browser fails.
            onLogout()
            if (activity != null) {
                runCatching { logoutAuth0(activity) }
            }
        }
    }
    if (iconOnly) {
        IconButton(onClick = onClick) {
            Icon(
                imageVector = Icons.Filled.ExitToApp,
                contentDescription = label,
                tint = Color(0xFF1A237E),
            )
        }
    } else {
        TextButton(onClick = onClick) {
            Text(label)
        }
    }
}
