package com.weirhere.rbac

/** Mirrors `packages/shared` permission names (subset used in UI). */

fun hasAdministrator(personas: List<String>): Boolean = personas.any { it == "administrator" }

fun hasProvider(personas: List<String>): Boolean = personas.any { it == "provider" }
