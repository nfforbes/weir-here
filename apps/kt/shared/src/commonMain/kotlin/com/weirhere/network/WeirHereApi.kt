package com.weirhere.network

import com.weirhere.env.Env
import com.weirhere.model.JobJson
import com.weirhere.model.JobListResponse
import com.weirhere.model.JobSingleResponse
import com.weirhere.model.JobUpsertPayload
import com.weirhere.model.UserBootstrap
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.parameter
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json

class WeirHereApi(engine: io.ktor.client.engine.HttpClientEngine = ktorEngine()) {
    private val apiRoot = Env.apiBaseUrl().trimEnd('/') + '/'

    private val client =
        HttpClient(engine) {
            install(HttpTimeout) {
                requestTimeoutMillis = 60_000
            }
            install(ContentNegotiation) {
                json(
                    Json {
                        ignoreUnknownKeys = true
                        isLenient = true
                    },
                )
            }
            defaultRequest {
                url(apiRoot)
                header(HttpHeaders.Accept, ContentType.Application.Json.toString())
            }
        }

    suspend fun bootstrap(bearerAccessToken: String): UserBootstrap? {
        val res: BootstrapResponse =
            client.post("api/users/bootstrap") {
                header(HttpHeaders.Authorization, bearer(bearerAccessToken))
            }.body()
        return res.user
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
            setBody(body)
        }.body()

    suspend fun updateJob(
        accessToken: String,
        id: String,
        body: JobUpsertPayload,
    ): JobSingleResponse =
        client.put("api/jobs/$id") {
            header(HttpHeaders.Authorization, bearer(accessToken))
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
            setBody(body)
        }
    }

    private fun bearer(token: String) = if (token.startsWith("Bearer ")) token else "Bearer $token"
}

@kotlinx.serialization.Serializable
private data class BootstrapResponse(val user: UserBootstrap? = null)

@kotlinx.serialization.Serializable
data class SimpleMessageDto(val message: String)
