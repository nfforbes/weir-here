package com.weirhere.files

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember

@Composable
actual fun rememberDocumentPicker(
    onPicked: (com.weirhere.model.PickedFilePayload) -> Unit,
    onCancelled: () -> Unit,
    onError: (String) -> Unit,
): () -> Unit =
    remember {
        {
            onError("Document picker is not yet available on iOS.")
        }
    }
