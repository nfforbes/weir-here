package com.weirhere.auth

import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.material.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
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
actual fun PlatformLogoutButton(label: String, onLogout: () -> Unit) {
    val scope = rememberCoroutineScope()
    TextButton(onClick = {
        scope.launch(Dispatchers.Main) {
            beginIosAuthLogout(onLogout)
        }
    }) {
        Text(label)
    }
}
