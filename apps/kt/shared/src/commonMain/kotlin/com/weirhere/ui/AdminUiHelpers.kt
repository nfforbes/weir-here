package com.weirhere.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.AlertDialog
import androidx.compose.material.Icon
import androidx.compose.material.MaterialTheme
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.OutlinedTextField
import androidx.compose.material.Text
import androidx.compose.material.TextButton
import androidx.compose.material.Checkbox
import androidx.compose.material.DropdownMenu
import androidx.compose.material.DropdownMenuItem
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
import com.weirhere.data.ClientServiceRow
import com.weirhere.data.ClientServices
import com.weirhere.data.ProviderSpecialties
import com.weirhere.data.ProviderSpecialtyRow
import com.weirhere.model.ClientDto
import com.weirhere.model.PhoneNumberDto
import com.weirhere.model.ProviderDto
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.roundToInt

@Composable
fun BackNavButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    TextButton(onClick = onClick, modifier = modifier) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = Icons.Filled.ArrowBack,
                contentDescription = null,
                modifier = Modifier.size(18.dp),
            )
            Spacer(Modifier.width(4.dp))
            Text(label)
        }
    }
}

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
            containsQuery(prov.addressDetails.streetLine1, query) ||
            containsQuery(prov.addressDetails.streetLine2, query) ||
            containsQuery(prov.addressDetails.city, query) ||
            containsQuery(prov.addressDetails.parish, query) ||
            containsQuery(prov.addressDetails.postalCode, query) ||
            prov.preferredParishes.any { containsQuery(it, query) } ||
            prov.specialties.any { containsQuery(it, query) } ||
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
            containsQuery(cli.email, query) ||
            containsQuery(cli.address, query) ||
            containsQuery(cli.addressDetails.streetLine1, query) ||
            containsQuery(cli.addressDetails.streetLine2, query) ||
            containsQuery(cli.addressDetails.city, query) ||
            containsQuery(cli.addressDetails.parish, query) ||
            containsQuery(cli.addressDetails.postalCode, query) ||
            containsQuery(cli.rate, query) ||
            containsQuery(cli.patientName, query) ||
            cli.services.any { containsQuery(it, query) } ||
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
fun ClientServicesEditor(
    rows: List<ClientServiceRow>,
    options: List<String>,
    onChange: (List<ClientServiceRow>) -> Unit,
) {
    Text("Services (optional)", fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 8.dp))
    rows.forEachIndexed { idx, row ->
        var menuOpen by remember(idx, row.selection) { mutableStateOf(false) }
        val label =
            if (row.selection == ClientServices.OTHER_VALUE) "Other"
            else row.selection.ifBlank { "Select service" }
        Row(
            Modifier.fillMaxWidth().padding(vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(Modifier.weight(1f)) {
                OutlinedTextField(
                    value = label,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Service") },
                    modifier = Modifier.fillMaxWidth().clickable { menuOpen = true },
                )
                DropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }) {
                    options.forEach { option ->
                        DropdownMenuItem(onClick = {
                            onChange(rows.mapIndexed { i, r -> if (i == idx) r.copy(selection = option) else r })
                            menuOpen = false
                        }) { Text(option) }
                    }
                    DropdownMenuItem(onClick = {
                        onChange(rows.mapIndexed { i, r -> if (i == idx) r.copy(selection = ClientServices.OTHER_VALUE) else r })
                        menuOpen = false
                    }) { Text("Other") }
                }
            }
            if (row.selection == ClientServices.OTHER_VALUE) {
                OutlinedTextField(
                    value = row.customValue,
                    onValueChange = { value ->
                        onChange(rows.mapIndexed { i, r -> if (i == idx) r.copy(customValue = value) else r })
                    },
                    label = { Text("Custom service") },
                    modifier = Modifier.weight(1f).padding(start = 8.dp),
                )
            }
            TextButton(onClick = { onChange(rows.filterIndexed { i, _ -> i != idx }) }) {
                Text("Remove", color = MaterialTheme.colors.error)
            }
        }
    }
    TextButton(
        onClick = {
            val defaultSelection = options.firstOrNull() ?: ClientServices.OTHER_VALUE
            onChange(rows + ClientServiceRow(selection = defaultSelection))
        },
    ) { Text("Add service") }
}

@Composable
fun ProviderSpecialtiesEditor(
    rows: List<ProviderSpecialtyRow>,
    options: List<String>,
    onChange: (List<ProviderSpecialtyRow>) -> Unit,
) {
    Text("Specialties (optional)", fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 8.dp))
    rows.forEachIndexed { idx, row ->
        var menuOpen by remember(idx, row.selection) { mutableStateOf(false) }
        val label =
            if (row.selection == ProviderSpecialties.OTHER_VALUE) "Other"
            else row.selection.ifBlank { "Select specialty" }
        Row(
            Modifier.fillMaxWidth().padding(vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(Modifier.weight(1f)) {
                OutlinedTextField(
                    value = label,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Specialty") },
                    modifier = Modifier.fillMaxWidth().clickable { menuOpen = true },
                )
                DropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }) {
                    options.forEach { option ->
                        DropdownMenuItem(onClick = {
                            onChange(rows.mapIndexed { i, r -> if (i == idx) r.copy(selection = option) else r })
                            menuOpen = false
                        }) { Text(option) }
                    }
                    DropdownMenuItem(onClick = {
                        onChange(rows.mapIndexed { i, r -> if (i == idx) r.copy(selection = ProviderSpecialties.OTHER_VALUE) else r })
                        menuOpen = false
                    }) { Text("Other") }
                }
            }
            if (row.selection == ProviderSpecialties.OTHER_VALUE) {
                OutlinedTextField(
                    value = row.customValue,
                    onValueChange = { value ->
                        onChange(rows.mapIndexed { i, r -> if (i == idx) r.copy(customValue = value) else r })
                    },
                    label = { Text("Custom specialty") },
                    modifier = Modifier.weight(1f).padding(start = 8.dp),
                )
            }
            TextButton(onClick = { onChange(rows.filterIndexed { i, _ -> i != idx }) }) {
                Text("Remove", color = MaterialTheme.colors.error)
            }
        }
    }
    TextButton(
        onClick = {
            val defaultSelection = options.firstOrNull() ?: ProviderSpecialties.OTHER_VALUE
            onChange(rows + ProviderSpecialtyRow(selection = defaultSelection))
        },
    ) { Text("Add specialty") }
}

@Composable
fun ProviderSpecialtyOptionsEditor(
    options: List<String>,
    onChange: (List<String>) -> Unit,
) {
    var input by remember { mutableStateOf("") }
    Text("Provider Specialties", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.h6)
    Text(
        "Specialties appear in the provider form dropdown. Choose Other on a provider to enter a custom specialty.",
        style = MaterialTheme.typography.body2,
        color = MaterialTheme.colors.onSurface.copy(alpha = 0.7f),
        modifier = Modifier.padding(bottom = 8.dp),
    )
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        OutlinedTextField(
            value = input,
            onValueChange = { input = it },
            label = { Text("Specialty name") },
            modifier = Modifier.weight(1f),
        )
        TextButton(
            onClick = {
                val trimmed = input.trim()
                if (trimmed.isNotEmpty() && options.none { it.equals(trimmed, ignoreCase = true) }) {
                    onChange((options + trimmed).sorted())
                    input = ""
                }
            },
        ) { Text("Add") }
    }
    if (options.isEmpty()) {
        Text("No specialties configured yet.", style = MaterialTheme.typography.body2, color = MaterialTheme.colors.onSurface.copy(alpha = 0.6f))
    } else {
        Column(Modifier.padding(vertical = 8.dp)) {
            options.forEach { option ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(option)
                    TextButton(onClick = { onChange(options.filter { it != option }) }) {
                        Text("Remove", color = MaterialTheme.colors.error)
                    }
                }
            }
        }
    }
}

@Composable
fun ClientServiceOptionsEditor(
    options: List<String>,
    onChange: (List<String>) -> Unit,
) {
    var input by remember { mutableStateOf("") }
    Text("Client Services", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.h6)
    Text(
        "Services appear in the client form dropdown. Choose Other on a client to enter a custom service.",
        style = MaterialTheme.typography.body2,
        color = MaterialTheme.colors.onSurface.copy(alpha = 0.7f),
        modifier = Modifier.padding(bottom = 8.dp),
    )
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        OutlinedTextField(
            value = input,
            onValueChange = { input = it },
            label = { Text("Service name") },
            modifier = Modifier.weight(1f),
        )
        TextButton(
            onClick = {
                val trimmed = input.trim()
                if (trimmed.isNotEmpty() && options.none { it.equals(trimmed, ignoreCase = true) }) {
                    onChange((options + trimmed).sorted())
                    input = ""
                }
            },
        ) { Text("Add") }
    }
    if (options.isEmpty()) {
        Text("No services configured yet.", style = MaterialTheme.typography.body2, color = MaterialTheme.colors.onSurface.copy(alpha = 0.6f))
    } else {
        Column(Modifier.padding(vertical = 8.dp)) {
            options.forEach { option ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(option)
                    TextButton(onClick = { onChange(options.filter { it != option }) }) {
                        Text("Remove", color = MaterialTheme.colors.error)
                    }
                }
            }
        }
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

fun formatDollarsAmount(amount: Double): String {
    val negative = amount < 0.0
    val absCents = (abs(amount) * 100.0).roundToInt()
    val dollars = absCents / 100
    val cents = absCents % 100
    val sign = if (negative) "-" else ""
    return "${sign}$$dollars.${cents.toString().padStart(2, '0')}"
}

fun formatLastLogin(updatedAt: String?, sessionFallback: String?): String {
    val raw = updatedAt?.takeIf { it.isNotBlank() } ?: sessionFallback?.takeIf { it.isNotBlank() }
    return raw?.replace('T', ' ')?.substringBefore('.') ?: "—"
}
