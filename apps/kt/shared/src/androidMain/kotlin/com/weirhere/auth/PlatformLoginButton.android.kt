package com.weirhere.auth

import android.app.Activity
import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.platform.LocalContext
import com.auth0.android.Auth0
import com.auth0.android.authentication.AuthenticationException
import com.auth0.android.callback.Callback
import com.auth0.android.provider.WebAuthProvider
import com.auth0.android.result.Credentials
import com.weirhere.shared.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

@Composable
actual fun PlatformLoginButton(
    label: String,
    onAccessToken: (String) -> Unit,
    onError: (String) -> Unit,
) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    val activity =
        rememberActivity(ctx)
    Button(onClick = {
        if (activity == null) {
            onError("Missing Activity context.")
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

private suspend fun login(activity: Activity): String =
    suspendCancellableCoroutine { cont ->
        val domain = BuildConfig.AUTH0_DOMAIN
        val clientId = BuildConfig.AUTH0_CLIENT_ID
        val audience = BuildConfig.AUTH0_AUDIENCE
        if (domain.isBlank() || clientId.isBlank()) {
            cont.resumeWithException(IllegalArgumentException("Set AUTH0_DOMAIN and AUTH0_CLIENT_ID in apps/kt/local.properties"))
            return@suspendCancellableCoroutine
        }
        val auth0 =
            Auth0(
                domain,
                clientId,
            )

        var req =
            WebAuthProvider.login(auth0)
                .withScheme(SCHEME)
                .withScope("openid profile email offline_access")
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
                    val at = result.accessToken
                    if (at.isNullOrBlank()) {
                        if (cont.isActive) cont.resumeWithException(IllegalStateException("No access token"))
                    } else {
                        if (cont.isActive) cont.resume(at)
                    }
                }
            },
        )
    }

private const val SCHEME = "weirhere"
