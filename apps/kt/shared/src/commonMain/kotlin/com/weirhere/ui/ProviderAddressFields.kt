package com.weirhere.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.DropdownMenu
import androidx.compose.material.DropdownMenuItem
import androidx.compose.material.MaterialTheme
import androidx.compose.material.OutlinedTextField
import androidx.compose.material.Text
import androidx.compose.material.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.weirhere.data.JamaicaParishes
import com.weirhere.model.ProviderAddressDetailsDto

@Composable
fun ProviderAddressFields(
    value: ProviderAddressDetailsDto,
    onChange: (ProviderAddressDetailsDto) -> Unit,
    modifier: Modifier = Modifier,
) {
    var parishMenuOpen by remember { mutableStateOf(false) }

    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        OutlinedTextField(
            value.streetLine1,
            { onChange(value.copy(streetLine1 = it)) },
            label = { Text("Street address line 1") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value.streetLine2,
            { onChange(value.copy(streetLine2 = it)) },
            label = { Text("Street address line 2") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value.city,
            { onChange(value.copy(city = it)) },
            label = { Text("City / Town") },
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value.parish.ifBlank { "Select parish" },
            {},
            readOnly = true,
            label = { Text("Parish") },
            modifier = Modifier.fillMaxWidth().clickable { parishMenuOpen = true },
        )
        DropdownMenu(parishMenuOpen, { parishMenuOpen = false }) {
            JamaicaParishes.all.forEach { parish ->
                DropdownMenuItem(onClick = {
                    onChange(value.copy(parish = parish))
                    parishMenuOpen = false
                }) {
                    Text(parish)
                }
            }
        }
        OutlinedTextField(
            value.postalCode,
            { onChange(value.copy(postalCode = it)) },
            label = { Text("Postal code") },
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
fun PreferredParishesField(
    homeParish: String,
    value: List<String>,
    onChange: (List<String>) -> Unit,
    modifier: Modifier = Modifier,
) {
    var addMenuOpen by remember { mutableStateOf(false) }
    val available = JamaicaParishes.all.filter { it !in value }

    Column(modifier.fillMaxWidth()) {
        Text("Preferred parishes", fontWeight = FontWeight.SemiBold)
        Text(
            "Your home parish from your address is included automatically. Add other parishes where you are willing to work.",
            style = MaterialTheme.typography.body2,
            color = MaterialTheme.colors.onSurface.copy(alpha = 0.7f),
            modifier = Modifier.padding(vertical = 8.dp),
        )
        if (value.isEmpty()) {
            Text("Select your address parish to include your home parish.", style = MaterialTheme.typography.caption)
        } else {
            value.forEach { parish ->
                val isHome = parish == homeParish.trim()
                Row(
                    Modifier.fillMaxWidth().padding(vertical = 2.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                ) {
                    Text(if (isHome) "$parish (home)" else parish)
                    if (!isHome) {
                        TextButton(onClick = { onChange(value.filter { it != parish }) }) {
                            Text("Remove")
                        }
                    }
                }
            }
        }
        TextButton(onClick = { addMenuOpen = true }, enabled = available.isNotEmpty()) {
            Text("Add preferred parish")
        }
        DropdownMenu(addMenuOpen, { addMenuOpen = false }) {
            available.forEach { parish ->
                DropdownMenuItem(onClick = {
                    onChange(value + parish)
                    addMenuOpen = false
                }) {
                    Text(parish)
                }
            }
        }
    }
}
