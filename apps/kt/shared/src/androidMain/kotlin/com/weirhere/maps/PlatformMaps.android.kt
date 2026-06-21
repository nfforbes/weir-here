package com.weirhere.maps

import android.content.Intent
import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext

@Composable
actual fun rememberMapsOpener(): MapsOpener {
    val context = LocalContext.current
    return remember(context) {
        object : MapsOpener {
            override fun openAddress(address: String) {
                val query = Uri.encode(address.trim())
                if (query.isEmpty()) return
                val uri = Uri.parse("https://www.google.com/maps/search/?api=1&query=$query")
                context.startActivity(Intent(Intent.ACTION_VIEW, uri))
            }
        }
    }
}
