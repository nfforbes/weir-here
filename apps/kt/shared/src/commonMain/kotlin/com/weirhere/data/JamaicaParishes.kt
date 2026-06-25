package com.weirhere.data

import com.weirhere.model.ProviderAddressDetailsDto

object JamaicaParishes {
    val all =
        listOf(
            "Clarendon",
            "Hanover",
            "Kingston",
            "Manchester",
            "Portland",
            "St. Andrew",
            "St. Ann",
            "St. Catherine",
            "St. Elizabeth",
            "St. James",
            "St. Mary",
            "St. Thomas",
            "Trelawny",
            "Westmoreland",
        )

    fun normalizePreferred(homeParish: String, preferred: List<String>): List<String> {
        val result = linkedSetOf<String>()
        homeParish.trim().takeIf { it.isNotEmpty() }?.let(result::add)
        preferred.map { it.trim() }.filter { it.isNotEmpty() }.forEach(result::add)
        return result.toList()
    }

    fun hydrateAddressDetails(
        details: ProviderAddressDetailsDto,
        legacyAddress: String = "",
    ): ProviderAddressDetailsDto {
        val legacy = legacyAddress.trim()
        return if (details.streetLine1.isBlank() && legacy.isNotEmpty()) {
            details.copy(streetLine1 = legacy)
        } else {
            details
        }
    }

    fun formatAddress(details: ProviderAddressDetailsDto, legacyAddress: String = ""): String {
        val parts =
            listOfNotNull(
                details.streetLine1.trim().takeIf { it.isNotEmpty() },
                details.streetLine2.trim().takeIf { it.isNotEmpty() },
                listOfNotNull(
                    details.city.trim().takeIf { it.isNotEmpty() },
                    details.parish.trim().takeIf { it.isNotEmpty() },
                ).joinToString(", ").takeIf { it.isNotEmpty() },
                details.postalCode.trim().takeIf { it.isNotEmpty() },
            )
        return parts.joinToString(", ").ifBlank { legacyAddress.trim() }
    }
}
