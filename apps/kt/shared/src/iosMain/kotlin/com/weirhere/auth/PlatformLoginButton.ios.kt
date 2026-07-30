package com.weirhere.auth

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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Composable
actual fun PlatformLoginButton(
    label: String,
    onAccessToken: (String) -> Unit,
    onError: (String) -> Unit,
) {
    val scope = rememberCoroutineScope()
    Button(onClick = {
        scope.launch(Dispatchers.Main) {
            beginIosAuthLogin(onAccessToken, onError)
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
    val scope = rememberCoroutineScope()
    androidx.compose.runtime.LaunchedEffect(start) {
        if (!start) return@LaunchedEffect
        // Launch on rememberCoroutineScope first so resetting [start] does not cancel Auth0.
        scope.launch(Dispatchers.Main) {
            beginIosAuthLogin(onAccessToken, onError)
        }
        onConsumed()
    }
}

@Composable
actual fun PlatformLogoutButton(
    label: String,
    onLogout: () -> Unit,
    iconOnly: Boolean,
) {
    val scope = rememberCoroutineScope()
    val onClick: () -> Unit = {
        scope.launch(Dispatchers.Main) {
            beginIosAuthLogout(onLogout)
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
