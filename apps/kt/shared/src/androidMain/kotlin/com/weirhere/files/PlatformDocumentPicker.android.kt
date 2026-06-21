package com.weirhere.files

import android.content.Context
import android.net.Uri
import android.webkit.MimeTypeMap
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import com.weirhere.model.PickedFilePayload
import java.io.IOException

private val DOCUMENT_MIME_TYPES =
    arrayOf(
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    )

@Composable
actual fun rememberDocumentPicker(
    onPicked: (PickedFilePayload) -> Unit,
    onCancelled: () -> Unit,
    onError: (String) -> Unit,
): () -> Unit {
    val context = LocalContext.current
    val launcher =
        rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri: Uri? ->
            if (uri == null) {
                onCancelled()
                return@rememberLauncherForActivityResult
            }
            runCatching { readPickedFile(context, uri) }
                .onSuccess(onPicked)
                .onFailure { e -> onError(e.message ?: e.toString()) }
        }
    return remember(launcher) { { launcher.launch(DOCUMENT_MIME_TYPES) } }
}

private fun readPickedFile(context: Context, uri: Uri): PickedFilePayload {
    val resolver = context.contentResolver
    val fileName =
        resolver.query(uri, null, null, null, null)?.use { cursor ->
            val nameIdx = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
            if (nameIdx >= 0 && cursor.moveToFirst()) cursor.getString(nameIdx) else null
        } ?: uri.lastPathSegment ?: "document"

    val mime = resolver.getType(uri) ?: guessMime(fileName)
    val bytes =
        resolver.openInputStream(uri)?.use { it.readBytes() }
            ?: throw IOException("Could not read selected file.")

    return PickedFilePayload(fileName = fileName, bytes = bytes, contentType = mime)
}

private fun guessMime(fileName: String): String {
    val ext = fileName.substringAfterLast('.', "").lowercase()
    return MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext) ?: "application/octet-stream"
}
