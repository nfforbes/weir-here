package com.weirhere.network

import com.weirhere.env.Env
import com.weirhere.model.JobJson
import com.weirhere.model.JobListResponse
import com.weirhere.model.JobSingleResponse
import com.weirhere.model.JobUpsertPayload
import com.weirhere.model.UserBootstrap
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.ClientRequestException
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.parameter
import io.ktor.client.request.patch
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import io.ktor.client.request.forms.MultiPartFormDataContent
import io.ktor.client.request.forms.formData
import io.ktor.http.Headers
import io.ktor.http.HttpStatusCode
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

@kotlinx.serialization.Serializable
private data class BootstrapResponse(val user: UserBootstrap? = null)

@kotlinx.serialization.Serializable
private data class SingleUserResponse(val user: com.weirhere.model.AdminUserDto)

@kotlinx.serialization.Serializable
data class SimpleMessageDto(val message: String)

@kotlinx.serialization.Serializable
private data class ApiErrorDto(val error: String? = null)

/** Thrown when the API returns HTTP 401 (invalid or expired Bearer token). */
class ApiUnauthorizedException(message: String = "Not authenticated") : Exception(message)

/** Thrown when the API returns HTTP 409 (e.g. duplicate job application). */
class ApiConflictException(message: String = "Conflict") : Exception(message)

class WeirHereApi(engine: io.ktor.client.engine.HttpClientEngine = ktorEngine()) {
    private val apiRoot = Env.apiBaseUrl().trimEnd('/') + '/'

    private val json =
        Json {
            ignoreUnknownKeys = true
            isLenient = true
        }

    private val client =
        HttpClient(engine) {
            install(HttpTimeout) {
                requestTimeoutMillis = 60_000
            }
            install(ContentNegotiation) {
                json(json)
            }
            expectSuccess = true
            defaultRequest {
                url(apiRoot)
                header(HttpHeaders.Accept, ContentType.Application.Json.toString())
                contentType(ContentType.Application.Json)
            }
        }

    suspend fun bootstrap(bearerAccessToken: String): UserBootstrap? {
        try {
            val res: BootstrapResponse =
                client.post("api/users/bootstrap") {
                    header(HttpHeaders.Authorization, bearer(bearerAccessToken))
                }.body()
            return res.user
        } catch (e: ClientRequestException) {
            if (e.response.status.value == 401) {
                throw ApiUnauthorizedException(
                    e.response.status.description.ifBlank { "Not authenticated" },
                )
            }
            throw e
        }
    }

    suspend fun listJobs(
        page: Int = 1,
        limit: Int = 20,
        q: String? = null,
    ): JobListResponse =
        client.get("api/jobs") {
            parameter("page", page)
            parameter("limit", limit)
            if (!q.isNullOrBlank()) parameter("q", q.trim())
        }.body()

    suspend fun listJobs(
        accessToken: String,
        page: Int = 1,
        limit: Int = 10
    ): JobListResponse =
        client.get("api/jobs") {
            parameter("page", page)
            parameter("limit", limit)
            header(HttpHeaders.Authorization, bearer(accessToken))
        }.body()

    suspend fun listMyJobs(accessToken: String): JobListResponse =
        client.get("api/jobs") {
            parameter("mine", "true")
            header(HttpHeaders.Authorization, bearer(accessToken))
        }.body()

    suspend fun getJob(identifier: String): JobJson =
        client.get("api/jobs/$identifier").body<JobSingleResponse>().job

    suspend fun createJob(
        accessToken: String,
        body: JobUpsertPayload,
    ): JobSingleResponse =
        client.post("api/jobs") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.Application.Json)
            setBody(body)
        }.body()

    suspend fun updateJob(
        accessToken: String,
        id: String,
        body: JobUpsertPayload,
    ): JobSingleResponse =
        client.put("api/jobs/$id") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.Application.Json)
            setBody(body)
        }.body()

    suspend fun deleteJob(
        accessToken: String,
        id: String,
    ): SimpleMessageDto =
        client.delete("api/jobs/$id") {
            header(HttpHeaders.Authorization, bearer(accessToken))
        }.body()

    suspend fun applyToJob(
        accessToken: String,
        body: com.weirhere.model.ApplicationPayload,
    ) {
        client.post("api/applications") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.Application.Json)
            setBody(body)
        }
    }

    suspend fun applyToJobMultipart(
        accessToken: String,
        jobId: String,
        answers: List<com.weirhere.model.ScreeningAnswerDto>,
        resume: com.weirhere.model.PickedFilePayload?,
    ) {
        val answersJson: String = json.encodeToString(answers)

        try {
            client.post("api/applications") {
                header(HttpHeaders.Authorization, bearer(accessToken))
                contentType(ContentType.MultiPart.FormData)
                setBody(
                    MultiPartFormDataContent(
                        formData {
                            append("jobId", jobId)
                            append("answers", answersJson)
                            resume?.let { picked ->
                                append(
                                    "resume",
                                    picked.bytes,
                                    Headers.build {
                                        append(HttpHeaders.ContentDisposition, "filename=\"${picked.fileName}\"")
                                        append(HttpHeaders.ContentType, picked.contentType)
                                    },
                                )
                            }
                        },
                    ),
                )
            }
        } catch (e: ClientRequestException) {
            if (e.response.status == HttpStatusCode.Conflict) {
                throw ApiConflictException("You have already applied for this job.")
            }
            throw e
        }
    }

    suspend fun submitReview(
        accessToken: String,
        applicationId: String,
        rating: Int,
        eliminated: Boolean,
        notes: String,
    ): com.weirhere.model.ReviewDto {
        val resp: com.weirhere.model.ReviewSingleResponse =
            client.post("api/reviews") {
                header(HttpHeaders.Authorization, bearer(accessToken))
                contentType(ContentType.Application.Json)
                setBody(
                    com.weirhere.model.ReviewSubmitPayload(
                        applicationId = applicationId,
                        rating = rating,
                        eliminated = eliminated,
                        notes = notes,
                    ),
                )
            }.body()
        return resp.review
    }

    suspend fun uploadQualification(
        accessToken: String,
        providerId: String,
        description: String,
        file: com.weirhere.model.PickedFilePayload,
    ): com.weirhere.model.QualificationDto =
        client.post("api/admin/qualifications") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.MultiPart.FormData)
            setBody(
                MultiPartFormDataContent(
                    formData {
                        append("providerId", providerId)
                        append("description", description)
                        append(
                            "file",
                            file.bytes,
                            Headers.build {
                                append(HttpHeaders.ContentDisposition, "filename=\"${file.fileName}\"")
                                append(HttpHeaders.ContentType, file.contentType)
                            },
                        )
                    },
                ),
            )
        }.body()

    suspend fun updateQualification(
        accessToken: String,
        id: String,
        description: String,
    ): com.weirhere.model.QualificationDto =
        client.put("api/admin/qualifications") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.Application.Json)
            setBody(com.weirhere.model.QualificationUpdatePayload(id = id, description = description))
        }.body()

    suspend fun deleteQualification(accessToken: String, id: String): SimpleMessageDto =
        client.delete("api/admin/qualifications") {
            parameter("id", id)
            header(HttpHeaders.Authorization, bearer(accessToken))
        }.body()

    suspend fun listAdminUsers(accessToken: String): com.weirhere.model.AdminUsersResponse =
        client.get("api/admin/users") {
            header(HttpHeaders.Authorization, bearer(accessToken))
        }.body()

    suspend fun updateUserPersonas(
        accessToken: String,
        userId: String,
        personas: List<String>,
    ): com.weirhere.model.AdminUserDto {
        val resp: SingleUserResponse = client.patch("api/admin/users/$userId") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.Application.Json)
            setBody(com.weirhere.model.UpdatePersonasPayload(personas))
        }.body()
        return resp.user
    }

    suspend fun deleteAdminUser(accessToken: String, userId: String) {
        client.delete("api/admin/users/$userId") {
            header(HttpHeaders.Authorization, bearer(accessToken))
        }
    }

    suspend fun inviteAdminUser(
        accessToken: String,
        email: String,
        roles: List<String>,
    ): com.weirhere.model.InviteUserResponse =
        client.post("api/admin/users/invite") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.Application.Json)
            setBody(com.weirhere.model.InviteUserPayload(email = email.trim(), roles = roles))
        }.body()

    suspend fun listApplications(
        accessToken: String,
        jobId: String
    ): com.weirhere.model.ApplicationsResponse =
        client.get("api/applications") {
            parameter("jobId", jobId)
            header(HttpHeaders.Authorization, bearer(accessToken))
        }.body()

    suspend fun listReviews(
        accessToken: String,
        applicationId: String
    ): com.weirhere.model.ReviewsResponse =
        client.get("api/reviews") {
            parameter("applicationId", applicationId)
            header(HttpHeaders.Authorization, bearer(accessToken))
        }.body()

    suspend fun listProviders(accessToken: String): List<com.weirhere.model.ProviderDto> =
        client.get("api/admin/providers") {
            header(HttpHeaders.Authorization, bearer(accessToken))
        }.body()

    suspend fun createProvider(accessToken: String, payload: com.weirhere.model.ProviderUpsertPayload): com.weirhere.model.ProviderDto =
        client.post("api/admin/providers") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.Application.Json)
            setBody(payload)
        }.body()

    suspend fun updateProvider(accessToken: String, payload: com.weirhere.model.ProviderUpsertPayload): com.weirhere.model.ProviderDto =
        client.put("api/admin/providers") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.Application.Json)
            setBody(payload)
        }.body()

    suspend fun deleteProvider(accessToken: String, id: String): SimpleMessageDto =
        client.delete("api/admin/providers") {
            parameter("id", id)
            header(HttpHeaders.Authorization, bearer(accessToken))
        }.body()

    suspend fun listClients(accessToken: String): List<com.weirhere.model.ClientDto> =
        client.get("api/admin/clients") {
            header(HttpHeaders.Authorization, bearer(accessToken))
        }.body()

    suspend fun createClient(accessToken: String, payload: com.weirhere.model.ClientUpsertPayload): com.weirhere.model.ClientDto =
        client.post("api/admin/clients") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.Application.Json)
            setBody(payload)
        }.body()

    suspend fun updateClient(accessToken: String, payload: com.weirhere.model.ClientUpsertPayload): com.weirhere.model.ClientDto =
        client.put("api/admin/clients") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.Application.Json)
            setBody(payload)
        }.body()

    suspend fun deleteClient(accessToken: String, id: String): SimpleMessageDto =
        client.delete("api/admin/clients") {
            parameter("id", id)
            header(HttpHeaders.Authorization, bearer(accessToken))
        }.body()

    suspend fun listAssignments(accessToken: String): List<com.weirhere.model.AssignmentDto> =
        client.get("api/admin/assignments") {
            header(HttpHeaders.Authorization, bearer(accessToken))
        }.body()

    suspend fun createAssignment(accessToken: String, payload: com.weirhere.model.AssignmentUpsertPayload): com.weirhere.model.AssignmentDto =
        client.post("api/admin/assignments") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.Application.Json)
            setBody(payload)
        }.body()

    suspend fun updateAssignment(accessToken: String, payload: com.weirhere.model.AssignmentUpsertPayload): com.weirhere.model.AssignmentDto =
        client.put("api/admin/assignments") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.Application.Json)
            setBody(payload)
        }.body()

    suspend fun deleteAssignment(accessToken: String, id: String): SimpleMessageDto =
        client.delete("api/admin/assignments") {
            parameter("id", id)
            header(HttpHeaders.Authorization, bearer(accessToken))
        }.body()

    suspend fun getConfiguration(accessToken: String): com.weirhere.model.ConfigValuesDto =
        client.get("api/admin/configuration") {
            header(HttpHeaders.Authorization, bearer(accessToken))
        }.body()

    suspend fun updateConfiguration(accessToken: String, payload: com.weirhere.model.ConfigValuesDto): com.weirhere.model.ConfigValuesDto =
        client.post("api/admin/configuration") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.Application.Json)
            setBody(payload)
        }.body()

    suspend fun listTestimonials(accessToken: String): com.weirhere.model.TestimonialsResponse =
        client.get("api/admin/testimonials") {
            header(HttpHeaders.Authorization, bearer(accessToken))
        }.body()

    suspend fun createTestimonial(
        accessToken: String,
        payload: com.weirhere.model.TestimonialUpsertPayload,
    ): com.weirhere.model.TestimonialDto =
        client.post("api/admin/testimonials") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.Application.Json)
            setBody(payload)
        }.body<com.weirhere.model.TestimonialSingleResponse>().testimonial

    suspend fun updateTestimonial(
        accessToken: String,
        id: String,
        payload: com.weirhere.model.TestimonialUpsertPayload,
    ): com.weirhere.model.TestimonialDto =
        client.patch("api/admin/testimonials/$id") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.Application.Json)
            setBody(payload)
        }.body<com.weirhere.model.TestimonialSingleResponse>().testimonial

    suspend fun deleteTestimonial(accessToken: String, id: String) {
        client.delete("api/admin/testimonials/$id") {
            header(HttpHeaders.Authorization, bearer(accessToken))
        }
    }

    suspend fun getAdminSettings(accessToken: String): com.weirhere.model.AdminSettingsResponse =
        client.get("api/admin/settings") {
            header(HttpHeaders.Authorization, bearer(accessToken))
        }.body()

    suspend fun updateAdminSettings(
        accessToken: String,
        settings: Map<String, String>,
    ): SimpleMessageDto =
        client.put("api/admin/settings") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            contentType(ContentType.Application.Json)
            setBody(com.weirhere.model.AdminSettingsPutPayload(settings = settings))
        }.body()

    suspend fun getAdminReport(
        accessToken: String,
        month: String,
        providerId: String? = null,
    ): com.weirhere.model.AdminReportResponse =
        client.get("api/admin/reports") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            parameter("month", month)
            if (!providerId.isNullOrBlank()) parameter("providerId", providerId)
        }.body()

    suspend fun downloadAdminReportExcel(
        accessToken: String,
        month: String,
        providerId: String? = null,
    ): ByteArray =
        client.get("api/admin/reports") {
            header(HttpHeaders.Authorization, bearer(accessToken))
            parameter("month", month)
            parameter("format", "excel")
            if (!providerId.isNullOrBlank()) parameter("providerId", providerId)
        }.body()

    suspend fun listProviderAssignments(accessToken: String): List<com.weirhere.model.AssignmentDto> =
        try {
            client.get("api/provider/assignments") {
                header(HttpHeaders.Authorization, bearer(accessToken))
            }.body()
        } catch (e: ClientRequestException) {
            throwProviderApiException(e)
        }

    suspend fun providerAssignmentAction(
        accessToken: String,
        assignmentId: String,
        action: String,
    ): com.weirhere.model.AssignmentDto =
        try {
            client.patch("api/provider/assignments/$assignmentId") {
                header(HttpHeaders.Authorization, bearer(accessToken))
                contentType(ContentType.Application.Json)
                setBody(com.weirhere.model.ProviderAssignmentActionPayload(action = action))
            }.body()
        } catch (e: ClientRequestException) {
            throwProviderApiException(e)
        }

    private suspend fun throwProviderApiException(e: ClientRequestException): Nothing {
        val apiError =
            runCatching { e.response.body<ApiErrorDto>().error }
                .getOrNull()
                ?.takeIf { it.isNotBlank() }
        when (e.response.status.value) {
            401 -> throw ApiUnauthorizedException(apiError ?: "Not authenticated")
            404 ->
                throw Exception(
                    if (apiError?.contains("Provider record", ignoreCase = true) == true) {
                        "No provider profile matches your login email. Ask an administrator to verify your provider record uses the same email you sign in with."
                    } else {
                        apiError ?: "Not found"
                    },
                )
            else -> throw Exception(apiError ?: e.message ?: e.toString())
        }
    }

    private fun bearer(token: String) = if (token.startsWith("Bearer ")) token else "Bearer $token"
}
