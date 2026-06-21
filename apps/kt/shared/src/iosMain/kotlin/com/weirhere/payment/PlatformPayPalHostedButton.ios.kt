package com.weirhere.payment

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.weirhere.env.Env

@Composable
actual fun PlatformPayPalHostedButton(modifier: Modifier) {
    Column(modifier.padding(16.dp)) {
        Text(
            "PayPal checkout is not yet available in the iOS app.",
            style = MaterialTheme.typography.body2,
        )
        Text(
            "Pay on the web: ${Env.apiBaseUrl().trimEnd('/')}/payment",
            style = MaterialTheme.typography.caption,
            modifier = Modifier.padding(top = 8.dp),
        )
    }
}
