package com.weirhere.files

import androidx.compose.runtime.Composable
import com.weirhere.model.PickedFilePayload

/** Returns a launcher function that opens the platform document picker. */
@Composable
expect fun rememberDocumentPicker(
    onPicked: (PickedFilePayload) -> Unit,
    onCancelled: () -> Unit = {},
    onError: (String) -> Unit = {},
): () -> Unit
