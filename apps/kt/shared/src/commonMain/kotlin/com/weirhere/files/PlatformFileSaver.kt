package com.weirhere.files

import androidx.compose.runtime.Composable

/** Opens a platform save dialog and writes [bytes] to the user-chosen location. */
@Composable
expect fun rememberFileSaver(
    onSaved: () -> Unit = {},
    onCancelled: () -> Unit = {},
    onError: (String) -> Unit = {},
): (fileName: String, bytes: ByteArray, mimeType: String) -> Unit
