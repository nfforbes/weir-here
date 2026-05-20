package com.weirhere.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.SerialName

@Serializable
data class SalaryRangeDto(
    val min: Double = 0.0,
    val max: Double = 0.0,
    val currency: String = "JMD",
)

@Serializable
data class ScreeningQuestionDto(
    val id: String = "",
    val question: String = "",
    val type: String = "text",
    val required: Boolean = false,
)

@Serializable
data class JobJson(
    @SerialName("_id") val id: String? = null,
    val title: String = "",
    val slug: String = "",
    val location: String = "",
    val employmentType: String = "",
    val description: String = "",
    val responsibilities: String = "",
    val requirements: String = "",
    val howToApply: String = "",
    val salaryRange: SalaryRangeDto? = null,
    val categories: List<String> = emptyList(),
    val tags: List<String> = emptyList(),
    val expiresAt: String? = null,
    val screeningQuestions: List<ScreeningQuestionDto> = emptyList(),
    val skills: List<String> = emptyList(),
    val benefits: List<String> = emptyList(),
    val reviewerEmails: List<String> = emptyList(),
    val postedBy: String = "",
)

@Serializable
data class JobListResponse(
    val jobs: List<JobJson> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    val limit: Int = 20,
)

@Serializable
data class JobSingleResponse(
    val job: JobJson,
)

@Serializable
data class UserBootstrap(
    val auth0Id: String = "",
    val email: String = "",
    val name: String = "",
    val personas: List<String> = emptyList(),
    val emailVerified: Boolean = false,
)

/** POST /api/jobs body mirrors web [`JobPostForm`](web) flattened JSON. */
@Serializable
data class JobUpsertPayload(
    val title: String,
    val location: String,
    val employmentType: String,
    val description: String,
    val responsibilities: String,
    val requirements: String,
    val howToApply: String,
    val salaryRange: SalaryRangeDto = SalaryRangeDto(),
    val categories: List<String>,
    val tags: List<String> = emptyList(),
    val expiresAt: String,
    val screeningQuestions: List<ScreeningQuestionDto> = emptyList(),
    val skills: List<String> = emptyList(),
    val benefits: List<String> = emptyList(),
    val reviewerEmails: List<String> = emptyList(),
)
