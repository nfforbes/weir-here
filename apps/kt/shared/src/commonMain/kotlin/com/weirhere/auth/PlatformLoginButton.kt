package com.weirhere.auth

import androidx.compose.runtime.Composable

@Composable
expect fun PlatformLoginButton(
    label: String,
    onAccessToken: (String) -> Unit,
    onError: (String) -> Unit,
)
