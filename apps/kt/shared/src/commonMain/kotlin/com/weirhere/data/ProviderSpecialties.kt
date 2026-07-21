package com.weirhere.data

import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

object ProviderSpecialties {
    const val OPTIONS_KEY = "PROVIDER_SPECIALTY_OPTIONS"
    const val OTHER_VALUE = "__other__"

    private val json = Json { ignoreUnknownKeys = true }

    fun parseOptions(raw: String?): List<String> {
        val trimmed = raw?.trim().orEmpty()
        if (trimmed.isEmpty()) return emptyList()
        return runCatching {
            json.decodeFromString<List<String>>(trimmed)
                .map { it.trim() }
                .filter { it.isNotEmpty() }
                .distinct()
        }.getOrDefault(emptyList())
    }

    fun serializeOptions(options: List<String>): String {
        val unique = options.map { it.trim() }.filter { it.isNotEmpty() }.distinct()
        return json.encodeToString(unique)
    }
}

data class ProviderSpecialtyRow(
    val selection: String,
    val customValue: String = "",
)

fun specialtiesToRows(specialties: List<String>, options: List<String>): List<ProviderSpecialtyRow> {
    if (specialties.isEmpty()) return emptyList()
    return specialties.map { name ->
        val match = options.firstOrNull { it.equals(name, ignoreCase = true) }
        if (match != null) {
            ProviderSpecialtyRow(selection = match)
        } else {
            ProviderSpecialtyRow(selection = ProviderSpecialties.OTHER_VALUE, customValue = name)
        }
    }
}

fun rowsToSpecialties(rows: List<ProviderSpecialtyRow>): List<String> {
    val values = rows.mapNotNull { row ->
        val value =
            if (row.selection == ProviderSpecialties.OTHER_VALUE) row.customValue.trim()
            else row.selection.trim()
        value.takeIf { it.isNotEmpty() }
    }
    return values.distinct()
}
