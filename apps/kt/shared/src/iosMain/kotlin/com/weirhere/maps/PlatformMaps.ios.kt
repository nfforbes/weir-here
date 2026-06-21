package com.weirhere.maps

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember

@Composable
actual fun rememberMapsOpener(): MapsOpener {
    return remember {
        object : MapsOpener {
            override fun openAddress(address: String) {
                // iOS maps integration can be wired when native shell is ready.
            }
        }
    }
}
