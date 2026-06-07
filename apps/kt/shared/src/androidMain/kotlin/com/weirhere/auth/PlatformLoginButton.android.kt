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

const val AUTH0_DOMAIN = "n4consulting.us.auth0.com"
const val AUTH0_CLIENT_ID = "7gvIVgyZkkGlws8kMjhzS47mmoBnXaFb"
val AUTH0_CUSTOM_API_AUDIENCE: String? = null
const val REDIRECT_URI = "weirhere://callback"
const val PREFS_NAME = "weirhere_auth"
const val KEY_ACCESS_TOKEN = "access_token"
const val KEY_ID_TOKEN = "id_token"
const val KEY_REFRESH_TOKEN = "refresh_token"

private suspend fun login(activity: Activity): String =
    suspendCancellableCoroutine { cont ->
        val auth0 =
            Auth0(
                AUTH0_CLIENT_ID,
                AUTH0_DOMAIN,
            )

        var req =
            WebAuthProvider.login(auth0)
                .withScheme("weirhere")
                .withRedirectUri("weirhere://callback")
                .withScope("openid profile email offline_access")
        val audience = AUTH0_CUSTOM_API_AUDIENCE ?: ""
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
                    val token = result.idToken ?: result.accessToken
                    if (token.isNullOrBlank()) {
                        if (cont.isActive) cont.resumeWithException(IllegalStateException("No token"))
                    } else {
                        if (cont.isActive) cont.resume(token)
                    }
                }
            },
        )
    }
