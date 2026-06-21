package com.weirhere.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.AlertDialog
import androidx.compose.material.MaterialTheme
import androidx.compose.material.OutlinedTextField
import androidx.compose.material.Text
import androidx.compose.material.TextButton
import androidx.compose.material.Checkbox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.weirhere.model.ClientDto
import com.weirhere.model.PhoneNumberDto
import com.weirhere.model.ProviderDto
import kotlin.math.ceil

@Composable
fun ConfirmDeleteDialog(
    title: String,
    message: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = { Text(message) },
        confirmButton = {
            TextButton(onClick = onConfirm) {
                Text("Delete", color = MaterialTheme.colors.error)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
    )
}

@Composable
fun PaginatedListControls(
    page: Int,
    totalItems: Int,
    pageSize: Int,
    onPageChange: (Int) -> Unit,
) {
    val pageCount = maxOf(1, ceil(totalItems.toDouble() / pageSize).toInt())
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        TextButton(onClick = { onPageChange(page - 1) }, enabled = page > 0) {
            Text("Previous")
        }
        Text("${page + 1} / $pageCount")
        TextButton(onClick = { onPageChange(page + 1) }, enabled = page < pageCount - 1) {
            Text("Next")
        }
    }
}

fun <T> paginatedSlice(items: List<T>, page: Int, pageSize: Int): List<T> {
    val start = page * pageSize
    if (start >= items.size) return emptyList()
    return items.subList(start, minOf(start + pageSize, items.size))
}

private fun containsQuery(text: String?, query: String): Boolean =
    text?.lowercase()?.contains(query) == true

fun filterProviders(providers: List<ProviderDto>, search: String): List<ProviderDto> {
    val query = search.trim().lowercase()
    if (query.isEmpty()) return providers
    return providers.filter { prov ->
        containsQuery(prov.name, query) ||
            containsQuery(prov.email, query) ||
            containsQuery(prov.address, query) ||
            prov.phoneNumbers.any { containsQuery(it.number, query) } ||
            prov.qualifications.any {
                containsQuery(it.description, query) || containsQuery(it.fileName, query)
            }
    }
}

fun filterClients(clients: List<ClientDto>, search: String): List<ClientDto> {
    val query = search.trim().lowercase()
    if (query.isEmpty()) return clients
    return clients.filter { cli ->
        containsQuery(cli.name, query) ||
            containsQuery(cli.address, query) ||
            cli.phoneNumbers.any { containsQuery(it.number, query) }
    }
}

@Composable
fun AdminListSearchField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        modifier = modifier.fillMaxWidth().padding(bottom = 8.dp),
        singleLine = true,
    )
}

@Composable
fun PhoneNumberEditor(
    phones: List<PhoneNumberDto>,
    onChange: (List<PhoneNumberDto>) -> Unit,
) {
    var newPhone by remember { mutableStateOf("") }
    var newPhoneIsBest by remember { mutableStateOf(false) }

    Text("Phone Numbers", fontWeight = FontWeight.SemiBold)
    phones.forEachIndexed { idx, p ->
        Row(
            Modifier.fillMaxWidth().padding(vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(p.number, modifier = Modifier.weight(1f))
            if (p.isBest) {
                Text("(Best)", color = MaterialTheme.colors.primary, style = MaterialTheme.typography.caption)
            }
            TextButton(onClick = { onChange(phones.filterIndexed { i, _ -> i != idx }) }) {
                Text("Remove", color = MaterialTheme.colors.error)
            }
        }
    }
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        OutlinedTextField(
            value = newPhone,
            onValueChange = { newPhone = it },
            label = { Text("New Phone") },
            modifier = Modifier.weight(1f),
        )
        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(checked = newPhoneIsBest, onCheckedChange = { newPhoneIsBest = it })
            Text("Best", style = MaterialTheme.typography.caption)
        }
        TextButton(
            onClick = {
                if (newPhone.isNotBlank()) {
                    onChange(phones + PhoneNumberDto(newPhone.trim(), newPhoneIsBest))
                    newPhone = ""
                    newPhoneIsBest = false
                }
            },
        ) { Text("Add") }
    }
}

@Composable
fun MoneyCentsField(
    label: String,
    cents: Int,
    onCentsChange: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    var dollarsText by remember(cents) { mutableStateOf(formatDollars(cents)) }
    OutlinedTextField(
        value = dollarsText,
        onValueChange = { raw ->
            dollarsText = raw
            val parsed = raw.toDoubleOrNull()
            if (parsed != null) onCentsChange((parsed * 100).toInt())
        },
        label = { Text(label) },
        modifier = modifier.fillMaxWidth(),
        singleLine = true,
    )
}

fun formatDollars(cents: Int): String {
    val whole = cents / 100
    val frac = kotlin.math.abs(cents % 100)
    return "$whole.${frac.toString().padStart(2, '0')}"
}

fun cardBackground(index: Int): Color =
    if (index % 2 == 0) Color(0xFFF5F5F5) else Color.White

fun formatDollarsAmount(amount: Double): String =
    "$${"%.2f".format(amount)}"

fun formatLastLogin(updatedAt: String?, sessionFallback: String?): String {
    val raw = updatedAt?.takeIf { it.isNotBlank() } ?: sessionFallback?.takeIf { it.isNotBlank() }
    return raw?.replace('T', ' ')?.substringBefore('.') ?: "—"
}
