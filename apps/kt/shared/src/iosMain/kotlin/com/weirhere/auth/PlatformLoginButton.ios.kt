package com.weirhere.auth

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material.Button
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
actual fun PlatformLoginButton(
    label: String,
    onAccessToken: (String) -> Unit,
    onError: (String) -> Unit,
) {
    Column(Modifier.padding(8.dp)) {
        Text(
            "Native Auth0 PKCE UI is wired for Android.\nWire Auth0.swift + URL callbacks for iOS, or paste a Bearer token temporarily during development.",
            style = MaterialTheme.typography.body2,
        )
        Button(
            onClick = {
                onError("iOS OAuth not implemented in this scaffold — see apps/kt/README.md")
            },
        ) {
            Text(label)
        }
    }
}
