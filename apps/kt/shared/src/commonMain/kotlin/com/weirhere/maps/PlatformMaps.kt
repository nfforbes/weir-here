package com.weirhere.maps

import androidx.compose.runtime.Composable

interface MapsOpener {
    fun openAddress(address: String)
}

@Composable
expect fun rememberMapsOpener(): MapsOpener
