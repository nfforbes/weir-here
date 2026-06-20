package com.weirhere.auth

import androidx.compose.runtime.Composable

@Composable
expect fun PlatformLoginButton(
    label: String,
    onAccessToken: (String) -> Unit,
    onError: (String) -> Unit,
)

/** Logs out from Auth0 (clears the browser session) then calls [onLogout]. */
@Composable
expect fun PlatformLogoutButton(
    label: String,
    onLogout: () -> Unit,
)

