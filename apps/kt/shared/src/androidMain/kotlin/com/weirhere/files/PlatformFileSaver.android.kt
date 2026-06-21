package com.weirhere.files

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import java.io.IOException

@Composable
actual fun rememberFileSaver(
    onSaved: () -> Unit,
    onCancelled: () -> Unit,
    onError: (String) -> Unit,
): (fileName: String, bytes: ByteArray, mimeType: String) -> Unit {
    val context = LocalContext.current
    val pending = remember { mutableStateOf<Pair<ByteArray, String>?>(null) }

    val launcher =
        rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("*/*")) { uri: Uri? ->
            val payload = pending.value
            pending.value = null
            if (uri == null) {
                onCancelled()
                return@rememberLauncherForActivityResult
            }
            if (payload == null) {
                onError("Nothing to save.")
                return@rememberLauncherForActivityResult
            }
            runCatching {
                context.contentResolver.openOutputStream(uri)?.use { out ->
                    out.write(payload.first)
                } ?: throw IOException("Could not open output stream.")
            }.onSuccess { onSaved() }
                .onFailure { e -> onError(e.message ?: e.toString()) }
        }

    return remember(launcher) {
        { fileName: String, bytes: ByteArray, mimeType: String ->
            pending.value = bytes to mimeType
            launcher.launch(fileName)
        }
    }
}
