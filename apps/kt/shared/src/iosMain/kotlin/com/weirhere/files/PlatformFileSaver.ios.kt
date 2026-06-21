package com.weirhere.files

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember

@Composable
actual fun rememberFileSaver(
    onSaved: () -> Unit,
    onCancelled: () -> Unit,
    onError: (String) -> Unit,
): (fileName: String, bytes: ByteArray, mimeType: String) -> Unit =
    remember {
        { _: String, _: ByteArray, _: String ->
            onError("Export is not yet available on iOS.")
        }
    }
