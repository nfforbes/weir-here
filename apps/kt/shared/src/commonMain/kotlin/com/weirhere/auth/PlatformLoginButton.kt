package com.weirhere.auth

import androidx.compose.runtime.Composable

@Composable
expect fun PlatformLoginButton(
    label: String,
    onAccessToken: (String) -> Unit,
    onError: (String) -> Unit,
)

/**
 * Starts Auth0 login when [start] becomes true, then calls [onConsumed].
 * Used by the landing Login button so Auth0 opens immediately (no intermediate screen).
 */
@Composable
expect fun PlatformLoginEffect(
    start: Boolean,
    onConsumed: () -> Unit,
    onAccessToken: (String) -> Unit,
    onError: (String) -> Unit,
)

/** Logs out from Auth0 (clears the browser session) then calls [onLogout]. */
@Composable
expect fun PlatformLogoutButton(
    label: String,
    onLogout: () -> Unit,
    iconOnly: Boolean = false,
)

