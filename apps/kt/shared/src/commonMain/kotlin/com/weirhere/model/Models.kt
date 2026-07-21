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
    val updatedAt: String? = null,
)

@Serializable
data class ReviewSubmitPayload(
    val applicationId: String,
    val rating: Int = 0,
    val eliminated: Boolean = false,
    val notes: String = "",
)

@Serializable
data class ReviewSingleResponse(val review: ReviewDto)

@Serializable
data class TestimonialDto(
    val id: String = "",
    val quote: String = "",
    val authorName: String = "",
    val authorTitle: String = "",
    val context: String = "",
    val avatarUrl: String = "",
    val published: Boolean = true,
    val sortOrder: Int = 0,
    val createdAt: String = "",
    val updatedAt: String = "",
)

@Serializable
data class TestimonialsResponse(val testimonials: List<TestimonialDto> = emptyList())

@Serializable
data class TestimonialUpsertPayload(
    val quote: String,
    val authorName: String,
    val authorTitle: String = "",
    val context: String = "",
    val avatarUrl: String = "",
    val published: Boolean = true,
    val sortOrder: Int = 0,
)

@Serializable
data class TestimonialSingleResponse(val testimonial: TestimonialDto)

@Serializable
data class AdminSettingsResponse(val settings: Map<String, String> = emptyMap())

@Serializable
data class AdminSettingsPutPayload(val settings: Map<String, String>)

@Serializable
data class AdminReportRowDto(
    val client: String = "",
    val address: String = "",
    val provider: String = "",
    val description: String = "",
    val serviceDate: String = "",
    val chargeAmount: Double = 0.0,
    val providerPay: Double = 0.0,
    val invoiced: Boolean = false,
)

@Serializable
data class AdminReportResponse(
    val month: String = "",
    val rows: List<AdminReportRowDto> = emptyList(),
    val total: Double = 0.0,
)

@Serializable
data class QualificationUpdatePayload(val id: String, val description: String? = null)

@Serializable
data class PickedFilePayload(
    val fileName: String,
    val bytes: ByteArray,
    val contentType: String,
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class != other::class) return false
        other as PickedFilePayload
        return fileName == other.fileName && bytes.contentEquals(other.bytes) && contentType == other.contentType
    }

    override fun hashCode(): Int {
        var result = fileName.hashCode()
        result = 31 * result + bytes.contentHashCode()
        result = 31 * result + contentType.hashCode()
        return result
    }
}

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
    val expiresAt: String? = null,
    val screeningQuestions: List<ScreeningQuestionDto> = emptyList(),
    val skills: List<String> = emptyList(),
    val benefits: List<String> = emptyList(),
    val reviewerEmails: List<String> = emptyList(),
)

@Serializable
data class ScreeningAnswerDto(
    val questionId: String,
    val answer: String
)

@Serializable
data class ApplicationPayload(
    val jobId: String,
    val answers: List<ScreeningAnswerDto> = emptyList(),
    val resumePath: String = ""
)

@Serializable
data class AdminUserDto(
    val id: String = "",
    val auth0Id: String = "",
    val email: String = "",
    val name: String = "",
    val personas: List<String> = emptyList(),
    val emailVerified: Boolean = false,
    val createdAt: String = "",
    val updatedAt: String = "",
)

@Serializable
data class AdminUsersResponse(
    val users: List<AdminUserDto> = emptyList(),
)

@Serializable
data class UpdatePersonasPayload(
    val personas: List<String>,
)

@Serializable
data class InviteUserPayload(
    val email: String,
    val roles: List<String>,
)

@Serializable
data class InviteUserResponse(
    val message: String = "",
)

@Serializable
data class ApplicationDto(
    @SerialName("_id") val id: String? = null,
    val jobId: String = "",
    val applicantId: String = "",
    val applicantName: String = "",
    val applicantEmail: String = "",
    val answers: List<ScreeningAnswerDto> = emptyList(),
    val resumePath: String = "",
    val status: String = "submitted",
    val createdAt: String = "",
    val updatedAt: String = "",
)

@Serializable
data class ApplicationsResponse(
    val applications: List<ApplicationDto> = emptyList(),
)

@Serializable
data class ReviewDto(
    @SerialName("_id") val id: String? = null,
    val applicationId: String = "",
    val reviewerId: String = "",
    val rating: Int = 0,
    val eliminated: Boolean = false,
    val notes: String = "",
    val createdAt: String = "",
    val updatedAt: String = "",
)

@Serializable
data class ReviewsResponse(
    val reviews: List<ReviewDto> = emptyList(),
)

@Serializable
data class QualificationDto(
    @SerialName("_id") val id: String,
    val fileName: String,
    val description: String? = null,
    val driveWebViewLink: String,
    val uploadedAt: String? = null
)

@Serializable
data class PhoneNumberDto(
    val number: String,
    val isBest: Boolean = false
)

@Serializable
data class ProviderAddressDetailsDto(
    val streetLine1: String = "",
    val streetLine2: String = "",
    val city: String = "",
    val parish: String = "",
    val postalCode: String = "",
)

@Serializable
data class ProviderDto(
    @SerialName("_id") val id: String,
    val name: String,
    val email: String? = null,
    val address: String,
    val addressDetails: ProviderAddressDetailsDto = ProviderAddressDetailsDto(),
    val preferredParishes: List<String> = emptyList(),
    val specialties: List<String> = emptyList(),
    val phoneNumbers: List<PhoneNumberDto> = emptyList(),
    val qualifications: List<QualificationDto> = emptyList()
)

@Serializable
data class ProviderUpsertPayload(
    val id: String? = null,
    val name: String,
    val email: String? = null,
    val address: String = "",
    val addressDetails: ProviderAddressDetailsDto = ProviderAddressDetailsDto(),
    val preferredParishes: List<String> = emptyList(),
    val specialties: List<String> = emptyList(),
    val phoneNumbers: List<PhoneNumberDto> = emptyList()
)

@Serializable
data class ProviderProfileDto(
    @SerialName("_id") val id: String? = null,
    val name: String = "",
    val email: String = "",
    val address: String = "",
    val addressDetails: ProviderAddressDetailsDto = ProviderAddressDetailsDto(),
    val preferredParishes: List<String> = emptyList(),
    val specialties: List<String> = emptyList(),
    val phoneNumbers: List<PhoneNumberDto> = emptyList(),
)

@Serializable
data class ProviderProfileUpdatePayload(
    val name: String,
    val addressDetails: ProviderAddressDetailsDto,
    val preferredParishes: List<String> = emptyList(),
    val specialties: List<String> = emptyList(),
    val phoneNumbers: List<PhoneNumberDto> = emptyList(),
)

@Serializable
data class ClientDto(
    @SerialName("_id") val id: String? = null,
    val name: String = "",
    val email: String = "",
    val address: String = "",
    val addressDetails: ProviderAddressDetailsDto = ProviderAddressDetailsDto(),
    val phoneNumbers: List<PhoneNumberDto> = emptyList(),
    val rate: String = "",
    val services: List<String> = emptyList(),
    val patientName: String = "",
)

@Serializable
data class ClientUpsertPayload(
    val id: String? = null,
    val name: String,
    val email: String = "",
    val address: String = "",
    val addressDetails: ProviderAddressDetailsDto = ProviderAddressDetailsDto(),
    val phoneNumbers: List<PhoneNumberDto> = emptyList(),
    val rate: String = "",
    val services: List<String> = emptyList(),
    val patientName: String = "",
)

@Serializable
data class EmbeddedClientDto(
    @SerialName("_id") val id: String? = null,
    val name: String = "",
    val address: String = ""
)

@Serializable
data class EmbeddedProviderDto(
    @SerialName("_id") val id: String? = null,
    val name: String = ""
)

@Serializable
data class AssignmentDto(
    @SerialName("_id") val id: String? = null,
    val clientId: EmbeddedClientDto? = null,
    val providerId: EmbeddedProviderDto? = null,
    val clientChargeCents: Int = 0,
    val providerPayCents: Int = 0,
    val providerHourlyRateCents: Int = 0,
    val description: String = "",
    val serviceDate: String = "",
    val status: String = "assigned",
    val invoiced: Boolean = false,
)

@Serializable
data class ProviderAssignmentActionPayload(val action: String)

@Serializable
data class AssignmentUpsertPayload(
    val id: String? = null,
    val clientId: String,
    val providerId: String,
    val clientChargeCents: Int,
    val providerPayCents: Int,
    val providerHourlyRateCents: Int,
    val description: String,
    val serviceDate: String,
    val status: String? = null,
)

@Serializable
data class ConfigValuesDto(
    val gdrive_client_id: String = "",
    val gdrive_client_secret: String = "",
    val gdrive_refresh_token: String = "",
    val gdrive_folder_id: String = "",
)
