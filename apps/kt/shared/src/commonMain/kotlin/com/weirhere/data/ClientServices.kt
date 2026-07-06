package com.weirhere.data

import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

object ClientServices {
    const val OPTIONS_KEY = "CLIENT_SERVICE_OPTIONS"
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

data class ClientServiceRow(
    val selection: String,
    val customValue: String = "",
)

fun servicesToRows(services: List<String>, options: List<String>): List<ClientServiceRow> {
    if (services.isEmpty()) return emptyList()
    return services.map { name ->
        val match = options.firstOrNull { it.equals(name, ignoreCase = true) }
        if (match != null) {
            ClientServiceRow(selection = match)
        } else {
            ClientServiceRow(selection = ClientServices.OTHER_VALUE, customValue = name)
        }
    }
}

fun rowsToServices(rows: List<ClientServiceRow>): List<String> {
    val values = rows.mapNotNull { row ->
        val value =
            if (row.selection == ClientServices.OTHER_VALUE) row.customValue.trim()
            else row.selection.trim()
        value.takeIf { it.isNotEmpty() }
    }
    return values.distinct()
}
