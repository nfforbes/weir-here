package com.weirhere.ui

import com.weirhere.model.JobJson
import com.weirhere.model.SalaryRangeDto

internal val screenshotMockJobs =
    listOf(
        JobJson(
            id = "screenshot-1",
            title = "Registered Nurse — ICU",
            slug = "registered-nurse-icu",
            location = "Kingston, Jamaica",
            employmentType = "Full-time",
            description = "Join our healthcare team supporting critical care units across the Kingston metropolitan area.",
            categories = listOf("Healthcare"),
            tags = listOf("Nursing", "ICU"),
            salaryRange = SalaryRangeDto(min = 850_000.0, max = 1_200_000.0, currency = "JMD"),
            skills = listOf("Patient care", "Critical care", "BLS certified"),
        ),
        JobJson(
            id = "screenshot-2",
            title = "Administrative Assistant",
            slug = "administrative-assistant",
            location = "Mandeville, Jamaica",
            employmentType = "Contract",
            description = "Support executive operations for a growing professional services firm in Manchester.",
            categories = listOf("Administration"),
            tags = listOf("Office", "Executive support"),
            salaryRange = SalaryRangeDto(min = 450_000.0, max = 650_000.0, currency = "JMD"),
            skills = listOf("Microsoft Office", "Scheduling", "Customer service"),
        ),
        JobJson(
            id = "screenshot-3",
            title = "HVAC Technician",
            slug = "hvac-technician",
            location = "Montego Bay, Jamaica",
            employmentType = "Full-time",
            description = "Install and maintain commercial HVAC systems for hospitality and retail clients.",
            categories = listOf("Trades"),
            tags = listOf("HVAC", "Maintenance"),
            salaryRange = SalaryRangeDto(min = 600_000.0, max = 900_000.0, currency = "JMD"),
            skills = listOf("HVAC repair", "Diagnostics", "Safety compliance"),
        ),
    )
