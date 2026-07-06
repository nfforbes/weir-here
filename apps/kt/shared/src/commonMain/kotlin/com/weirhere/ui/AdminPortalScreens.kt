package com.weirhere.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.AlertDialog
import androidx.compose.material.Card
import androidx.compose.material.Checkbox
import androidx.compose.material.CircularProgressIndicator
import androidx.compose.material.DropdownMenu
import androidx.compose.material.DropdownMenuItem
import androidx.compose.material.MaterialTheme
import androidx.compose.material.OutlinedTextField
import androidx.compose.material.Slider
import androidx.compose.material.Text
import androidx.compose.material.TextButton
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.weirhere.data.currentMonthYyyyMm
import com.weirhere.files.rememberDocumentPicker
import com.weirhere.files.rememberFileSaver
import com.weirhere.model.AdminReportRowDto
import com.weirhere.model.AssignmentDto
import com.weirhere.model.AssignmentUpsertPayload
import com.weirhere.model.ClientDto
import com.weirhere.model.ClientUpsertPayload
import com.weirhere.model.JobJson
import com.weirhere.model.PhoneNumberDto
import com.weirhere.model.PickedFilePayload
import com.weirhere.data.ClientServiceRow
import com.weirhere.data.ClientServices
import com.weirhere.data.JamaicaParishes
import com.weirhere.data.rowsToServices
import com.weirhere.data.servicesToRows
import com.weirhere.model.ProviderAddressDetailsDto
import com.weirhere.model.ProviderDto
import com.weirhere.model.ProviderUpsertPayload
import com.weirhere.model.QualificationDto
import com.weirhere.model.ScreeningAnswerDto
import com.weirhere.model.TestimonialDto
import com.weirhere.model.TestimonialUpsertPayload
import com.weirhere.network.ApiConflictException
import com.weirhere.network.WeirHereApi
import kotlinx.coroutines.launch

private const val PAGE_SIZE = 10
private const val MASKED_SECRET = "********"

private data class StagedQualification(val file: PickedFilePayload, val description: String)

@Composable
fun ApplyJobDialog(
    job: JobJson,
    api: WeirHereApi,
    accessToken: String,
    onDismiss: () -> Unit,
    onSuccess: () -> Unit,
    onAlreadyApplied: () -> Unit,
    onError: (String) -> Unit,
) {
    val scope = rememberCoroutineScope()
    var answers by remember(job.id) {
        mutableStateOf(
            job.screeningQuestions.associate { q -> q.id to "" },
        )
    }
    var resume by remember { mutableStateOf<PickedFilePayload?>(null) }
    var submitting by remember { mutableStateOf(false) }

    val pickDocument =
        rememberDocumentPicker(
            onPicked = { resume = it },
            onError = onError,
        )

    AlertDialog(
        onDismissRequest = { if (!submitting) onDismiss() },
        title = { Text("Apply: ${job.title}") },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState())) {
                job.screeningQuestions.forEach { q ->
                    OutlinedTextField(
                        value = answers[q.id].orEmpty(),
                        onValueChange = { answers = answers + (q.id to it) },
                        label = { Text(q.question) },
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        minLines = if (q.type == "textarea") 3 else 1,
                    )
                }
                Spacer(Modifier.height(8.dp))
                TextButton(onClick = pickDocument, enabled = !submitting) {
                    Text(if (resume == null) "Pick resume (optional)" else "Resume: ${resume!!.fileName}")
                }
            }
        },
        confirmButton = {
            TextButton(
                enabled = !submitting,
                onClick = {
                    scope.launch {
                        submitting = true
                        val answerList =
                            answers.map { (qid, ans) -> ScreeningAnswerDto(qid, ans) }
                                .filter { it.answer.isNotBlank() }
                        runCatching {
                            api.applyToJobMultipart(
                                accessToken,
                                job.id ?: job.slug,
                                answerList,
                                resume,
                            )
                        }.onSuccess {
                            onSuccess()
                            onDismiss()
                        }.onFailure { e ->
                            if (e is ApiConflictException) {
                                onAlreadyApplied()
                                onDismiss()
                            } else if (e !is kotlinx.coroutines.CancellationException) {
                                onError(e.message ?: e.toString())
                            }
                        }
                        submitting = false
                    }
                },
            ) { Text(if (submitting) "…" else "Submit") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss, enabled = !submitting) { Text("Cancel") }
        },
    )
}

@Composable
fun AdminJobDetailUi(api: WeirHereApi, accessToken: String, job: JobJson) {
    val scope = rememberCoroutineScope()
    var applications by remember { mutableStateOf<List<com.weirhere.model.ApplicationDto>>(emptyList()) }
    var reviewsByApp by remember { mutableStateOf<Map<String, List<com.weirhere.model.ReviewDto>>>(emptyMap()) }
    var loadingApps by remember { mutableStateOf(true) }
    var expandedAppId by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var showEdit by remember { mutableStateOf(false) }

    var reviewRating by remember { mutableStateOf(5f) }
    var reviewEliminated by remember { mutableStateOf(false) }
    var reviewNotes by remember { mutableStateOf("") }
    var submittingReview by remember { mutableStateOf(false) }

    fun reloadApps() {
        scope.launch {
            loadingApps = true
            error = null
            job.id?.let { jid ->
                runCatching { api.listApplications(accessToken, jid) }
                    .onSuccess { applications = it.applications }
                    .onFailure {
                        if (it !is kotlinx.coroutines.CancellationException) {
                            error = it.message ?: it.toString()
                        }
                    }
            }
            loadingApps = false
        }
    }

    LaunchedEffect(job.id) { reloadApps() }

    LaunchedEffect(expandedAppId) {
        val appId = expandedAppId ?: return@LaunchedEffect
        if (!reviewsByApp.containsKey(appId)) {
            runCatching { api.listReviews(accessToken, appId) }
                .onSuccess { resp -> reviewsByApp = reviewsByApp + (appId to resp.reviews) }
        }
    }

    if (showEdit) {
        EditJobScreen(
            job = job,
            api = api,
            bearerToken = accessToken,
            onDismiss = { showEdit = false },
            onSaved = { showEdit = false },
        )
        return
    }

    Column(Modifier.fillMaxSize()) {
        Card(modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp), elevation = 2.dp) {
            Column(Modifier.padding(16.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Column(Modifier.weight(1f)) {
                        Text(job.title, style = MaterialTheme.typography.h5, fontWeight = FontWeight.Bold)
                        Text("${job.location} • ${job.employmentType}", color = Color.Gray)
                    }
                    TextButton(onClick = { showEdit = true }) { Text("Edit job") }
                }
                Spacer(Modifier.height(8.dp))
                Text("Total Applicants: ${applications.size}")
            }
        }

        if (loadingApps) {
            CircularProgressIndicator(Modifier.padding(16.dp))
        } else if (error != null) {
            Text("Error: $error", color = MaterialTheme.colors.error, modifier = Modifier.padding(16.dp))
        } else if (applications.isEmpty()) {
            Text("No applications yet.", modifier = Modifier.padding(16.dp))
        } else {
            LazyColumn(Modifier.fillMaxSize()) {
                items(applications, key = { it.id.orEmpty() }) { app ->
                    val isExpanded = expandedAppId == app.id
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).clickable {
                            expandedAppId = if (isExpanded) null else app.id
                            reviewRating = 5f
                            reviewEliminated = false
                            reviewNotes = ""
                        },
                        elevation = 1.dp,
                    ) {
                        Column(Modifier.padding(16.dp)) {
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Column {
                                    Text(app.applicantName, fontWeight = FontWeight.Bold)
                                    Text(app.applicantEmail, style = MaterialTheme.typography.body2, color = Color.Gray)
                                }
                                Box(
                                    modifier = Modifier
                                        .background(Color(0xFFE3F2FD), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 8.dp, vertical = 4.dp),
                                ) {
                                    Text(app.status, color = Color(0xFF1565C0), style = MaterialTheme.typography.caption)
                                }
                            }

                            if (isExpanded) {
                                Spacer(Modifier.height(12.dp))
                                Text("Screening Answers", fontWeight = FontWeight.SemiBold)
                                if (app.answers.isEmpty()) {
                                    Text("No screening answers.", color = Color.Gray, style = MaterialTheme.typography.body2)
                                } else {
                                    app.answers.forEach { ans ->
                                        val qText = job.screeningQuestions.find { it.id == ans.questionId }?.question ?: ans.questionId
                                        Text("Q: $qText", style = MaterialTheme.typography.caption, fontWeight = FontWeight.Medium)
                                        Text("A: ${ans.answer}", style = MaterialTheme.typography.body2)
                                    }
                                }

                                Spacer(Modifier.height(12.dp))
                                Text("Submit review", fontWeight = FontWeight.SemiBold)
                                Text("Rating: ${reviewRating.toInt()}/10")
                                Slider(
                                    value = reviewRating,
                                    onValueChange = { reviewRating = it },
                                    valueRange = 0f..10f,
                                    steps = 9,
                                )
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Checkbox(checked = reviewEliminated, onCheckedChange = { reviewEliminated = it })
                                    Text("Eliminate")
                                }
                                OutlinedTextField(
                                    value = reviewNotes,
                                    onValueChange = { reviewNotes = it },
                                    label = { Text("Notes") },
                                    modifier = Modifier.fillMaxWidth(),
                                    minLines = 2,
                                )
                                TextButton(
                                    enabled = !submittingReview,
                                    onClick = {
                                        scope.launch {
                                            submittingReview = true
                                            runCatching {
                                                api.submitReview(
                                                    accessToken,
                                                    app.id.orEmpty(),
                                                    reviewRating.toInt(),
                                                    reviewEliminated,
                                                    reviewNotes,
                                                )
                                            }.onSuccess {
                                                reviewsByApp = reviewsByApp - app.id.orEmpty()
                                                runCatching { api.listReviews(accessToken, app.id.orEmpty()) }
                                                    .onSuccess { reviewsByApp = reviewsByApp + (app.id.orEmpty() to it.reviews) }
                                            }
                                            submittingReview = false
                                        }
                                    },
                                ) { Text(if (submittingReview) "…" else "Submit review") }

                                Spacer(Modifier.height(12.dp))
                                Text("Reviews", fontWeight = FontWeight.SemiBold)
                                val reviews = reviewsByApp[app.id.orEmpty()]
                                if (reviews == null) {
                                    CircularProgressIndicator(Modifier.size(20.dp))
                                } else if (reviews.isEmpty()) {
                                    Text("No reviews yet.", color = Color.Gray, style = MaterialTheme.typography.body2)
                                } else {
                                    reviews.forEach { rev ->
                                        Column(
                                            Modifier.padding(top = 4.dp).background(Color(0xFFFAFAFA)).padding(8.dp).fillMaxWidth(),
                                        ) {
                                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                Text("Rating: ${rev.rating}/10", fontWeight = FontWeight.Medium)
                                                if (rev.eliminated) {
                                                    Text("Eliminated", color = MaterialTheme.colors.error)
                                                }
                                            }
                                            if (rev.notes.isNotBlank()) Text(rev.notes, style = MaterialTheme.typography.caption)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AdminProvidersUi(api: WeirHereApi, accessToken: String?) {
    val scope = rememberCoroutineScope()
    val tok = accessToken?.trim().orEmpty()
    var providers by remember { mutableStateOf<List<ProviderDto>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var page by remember { mutableStateOf(0) }
    var search by remember { mutableStateOf("") }
    var formTarget by remember { mutableStateOf<ProviderDto?>(null) }
    var showCreate by remember { mutableStateOf(false) }
    var deleteTarget by remember { mutableStateOf<ProviderDto?>(null) }

    fun reload() {
        if (tok.isEmpty()) return
        scope.launch {
            loading = true
            error = null
            runCatching { api.listProviders(tok) }
                .onSuccess { providers = it }
                .onFailure {
                    if (it !is kotlinx.coroutines.CancellationException) error = it.message ?: it.toString()
                }
            loading = false
        }
    }

    LaunchedEffect(tok) { reload() }
    LaunchedEffect(search) { page = 0 }

    val filtered = remember(providers, search) { filterProviders(providers, search) }

    deleteTarget?.let { target ->
        ConfirmDeleteDialog(
            title = "Delete provider",
            message = "Delete ${target.name}?",
            onConfirm = {
                scope.launch {
                    runCatching { api.deleteProvider(tok, target.id) }.onSuccess { reload() }
                    deleteTarget = null
                }
            },
            onDismiss = { deleteTarget = null },
        )
    }

    if (showCreate || formTarget != null) {
        ProviderFormScreen(
            api = api,
            tok = tok,
            initial = formTarget,
            onDone = { showCreate = false; formTarget = null; reload() },
            onCancel = { showCreate = false; formTarget = null },
        )
        return
    }

    Column(Modifier.fillMaxSize()) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("Providers", style = MaterialTheme.typography.h5, fontWeight = FontWeight.Bold)
            TextButton(onClick = { showCreate = true }) {
                androidx.compose.material.Icon(Icons.Filled.Add, "Add")
                Text("Add")
            }
        }
        error?.let { Text("Error: $it", color = MaterialTheme.colors.error) }
        AdminListSearchField(
            value = search,
            onValueChange = { search = it },
            label = "Search name, email, address, phone, or qualification",
        )

        if (loading) {
            CircularProgressIndicator(Modifier.padding(16.dp))
        } else if (filtered.isEmpty()) {
            Text(
                if (providers.isEmpty()) "No providers yet." else "No providers match your search.",
                color = Color.Gray,
                modifier = Modifier.padding(16.dp),
            )
        } else {
            val pageItems = paginatedSlice(filtered, page, PAGE_SIZE)
            LazyColumn(Modifier.weight(1f)) {
                itemsIndexed(pageItems, key = { _, p -> p.id }) { index, prov ->
                    Card(
                        Modifier.fillMaxWidth().padding(vertical = 4.dp).background(cardBackground(index)),
                    ) {
                        Column(Modifier.padding(12.dp)) {
                            Text(prov.name, fontWeight = FontWeight.Bold)
                            prov.email?.let { Text(it, color = MaterialTheme.colors.primary, style = MaterialTheme.typography.body2) }
                            val displayAddress = JamaicaParishes.formatAddress(prov.addressDetails, prov.address)
                            if (displayAddress.isNotBlank()) Text(displayAddress, style = MaterialTheme.typography.body2)
                            if (prov.preferredParishes.isNotEmpty()) {
                                Text(
                                    "Preferred: ${prov.preferredParishes.joinToString(", ")}",
                                    style = MaterialTheme.typography.caption,
                                )
                            }
                            prov.phoneNumbers.forEach { p ->
                                Text(p.number + if (p.isBest) " (Best)" else "", style = MaterialTheme.typography.body2)
                            }
                            if (prov.qualifications.isNotEmpty()) {
                                Spacer(Modifier.height(4.dp))
                                Text("Qualifications", fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.caption)
                                prov.qualifications.forEach { q -> QualificationRow(q, api, tok, onChanged = { reload() }) }
                            }
                            Row {
                                TextButton(onClick = { formTarget = prov }) { Text("Edit") }
                                TextButton(onClick = { deleteTarget = prov }) {
                                    Text("Delete", color = MaterialTheme.colors.error)
                                }
                            }
                        }
                    }
                }
            }
            PaginatedListControls(page, filtered.size, PAGE_SIZE) { page = it }
        }
    }
}

@Composable
private fun QualificationRow(
    qual: QualificationDto,
    api: WeirHereApi,
    tok: String,
    onChanged: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var editing by remember { mutableStateOf(false) }
    var desc by remember(qual.id) { mutableStateOf(qual.description.orEmpty()) }

    Row(Modifier.fillMaxWidth().padding(vertical = 2.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Column(Modifier.weight(1f)) {
            Text(qual.description?.ifBlank { qual.fileName } ?: qual.fileName, style = MaterialTheme.typography.body2)
            if (qual.driveWebViewLink.isNotBlank()) {
                Text(qual.fileName, style = MaterialTheme.typography.caption, color = Color.Gray)
            }
        }
        Row {
            TextButton(onClick = { editing = !editing }) { Text("Edit") }
            TextButton(onClick = {
                scope.launch {
                    runCatching { api.deleteQualification(tok, qual.id) }.onSuccess { onChanged() }
                }
            }) { Text("Del", color = MaterialTheme.colors.error) }
        }
    }
    if (editing) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(desc, { desc = it }, label = { Text("Description") }, modifier = Modifier.weight(1f))
            TextButton(onClick = {
                scope.launch {
                    runCatching { api.updateQualification(tok, qual.id, desc) }.onSuccess { editing = false; onChanged() }
                }
            }) { Text("Save") }
        }
    }
}

@Composable
private fun ProviderFormScreen(
    api: WeirHereApi,
    tok: String,
    initial: ProviderDto?,
    onDone: () -> Unit,
    onCancel: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var name by remember(initial) { mutableStateOf(initial?.name ?: "") }
    var email by remember(initial) { mutableStateOf(initial?.email ?: "") }
    var addressDetails by remember(initial) {
        mutableStateOf(
            JamaicaParishes.hydrateAddressDetails(
                initial?.addressDetails ?: ProviderAddressDetailsDto(),
                initial?.address.orEmpty(),
            ),
        )
    }
    var preferredParishes by remember(initial) {
        mutableStateOf(
            JamaicaParishes.normalizePreferred(
                initial?.addressDetails?.parish.orEmpty(),
                initial?.preferredParishes ?: emptyList(),
            ),
        )
    }
    var phones by remember(initial) { mutableStateOf(initial?.phoneNumbers ?: emptyList()) }
    var staged by remember { mutableStateOf<List<StagedQualification>>(emptyList()) }
    var pendingFile by remember { mutableStateOf<PickedFilePayload?>(null) }
    var pendingDesc by remember { mutableStateOf("") }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    val pickDocument = rememberDocumentPicker(onPicked = { pendingFile = it }, onError = { error = it })

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(8.dp)) {
        Text(if (initial == null) "Add Provider" else "Edit Provider", style = MaterialTheme.typography.h6)
        OutlinedTextField(name, { name = it }, label = { Text("Name *") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(email, { email = it }, label = { Text("Email *") }, modifier = Modifier.fillMaxWidth())
        Text("Address", fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 8.dp))
        ProviderAddressFields(
            value = addressDetails,
            onChange = { updated ->
                addressDetails = updated
                preferredParishes = JamaicaParishes.normalizePreferred(updated.parish, preferredParishes)
            },
        )
        PreferredParishesField(
            homeParish = addressDetails.parish,
            value = preferredParishes,
            onChange = { preferredParishes = it },
            modifier = Modifier.padding(top = 8.dp),
        )
        PhoneNumberEditor(phones, { phones = it })
        Spacer(Modifier.height(8.dp))
        Text("New qualifications", fontWeight = FontWeight.SemiBold)
        OutlinedTextField(pendingDesc, { pendingDesc = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth())
        TextButton(onClick = pickDocument) {
            Text(if (pendingFile == null) "Pick file" else pendingFile!!.fileName)
        }
        TextButton(onClick = {
            val f = pendingFile ?: return@TextButton
            staged = staged + StagedQualification(f, pendingDesc)
            pendingFile = null
            pendingDesc = ""
        }) { Text("Stage upload") }
        staged.forEach { s -> Text("• ${s.description.ifBlank { s.file.fileName }}", style = MaterialTheme.typography.body2) }
        initial?.qualifications?.forEach { q -> QualificationRow(q, api, tok, onChanged = {}) }
        error?.let { Text(it, color = MaterialTheme.colors.error) }
        Row(Modifier.padding(top = 8.dp)) {
            androidx.compose.material.Button(
                enabled = !saving && name.isNotBlank() && email.isNotBlank(),
                onClick = {
                    scope.launch {
                        saving = true
                        error = null
                        val normalizedParishes =
                            JamaicaParishes.normalizePreferred(addressDetails.parish, preferredParishes)
                        val payload = ProviderUpsertPayload(
                            id = initial?.id,
                            name = name.trim(),
                            email = email.trim(),
                            addressDetails = addressDetails,
                            preferredParishes = normalizedParishes,
                            phoneNumbers = phones,
                        )
                        runCatching {
                            val saved = if (initial == null) api.createProvider(tok, payload) else api.updateProvider(tok, payload)
                            staged.forEach { s ->
                                api.uploadQualification(tok, saved.id, s.description, s.file)
                            }
                        }.onSuccess { onDone() }
                            .onFailure {
                                if (it !is kotlinx.coroutines.CancellationException) error = it.message ?: it.toString()
                            }
                        saving = false
                    }
                },
            ) { Text(if (saving) "…" else "Save") }
            TextButton(onClick = onCancel) { Text("Cancel") }
        }
    }
}

@Composable
fun AdminClientsUi(api: WeirHereApi, accessToken: String?) {
    val scope = rememberCoroutineScope()
    val tok = accessToken?.trim().orEmpty()
    var clients by remember { mutableStateOf<List<ClientDto>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var page by remember { mutableStateOf(0) }
    var search by remember { mutableStateOf("") }
    var formTarget by remember { mutableStateOf<ClientDto?>(null) }
    var showCreate by remember { mutableStateOf(false) }
    var deleteTarget by remember { mutableStateOf<ClientDto?>(null) }

    fun reload() {
        if (tok.isEmpty()) return
        scope.launch {
            loading = true
            runCatching { api.listClients(tok) }
                .onSuccess { clients = it }
                .onFailure {
                    if (it !is kotlinx.coroutines.CancellationException) error = it.message ?: it.toString()
                }
            loading = false
        }
    }

    LaunchedEffect(tok) { reload() }
    LaunchedEffect(search) { page = 0 }

    val filtered = remember(clients, search) { filterClients(clients, search) }

    deleteTarget?.let { target ->
        ConfirmDeleteDialog(
            title = "Delete client",
            message = "Delete ${target.name}?",
            onConfirm = {
                scope.launch {
                    runCatching { api.deleteClient(tok, target.id.orEmpty()) }.onSuccess { reload() }
                    deleteTarget = null
                }
            },
            onDismiss = { deleteTarget = null },
        )
    }

    if (showCreate || formTarget != null) {
        ClientFormScreen(
            tok = tok,
            api = api,
            initial = formTarget,
            onDone = { showCreate = false; formTarget = null; reload() },
            onCancel = { showCreate = false; formTarget = null },
        )
        return
    }

    Column(Modifier.fillMaxSize()) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Clients", style = MaterialTheme.typography.h5, fontWeight = FontWeight.Bold)
            TextButton(onClick = { showCreate = true }) { Text("Add") }
        }
        error?.let { Text("Error: $it", color = MaterialTheme.colors.error) }
        AdminListSearchField(
            value = search,
            onValueChange = { search = it },
            label = "Search name, email, address, or phone",
        )
        if (loading) CircularProgressIndicator(Modifier.padding(16.dp))
        else if (filtered.isEmpty()) {
            Text(
                if (clients.isEmpty()) "No clients yet." else "No clients match your search.",
                color = Color.Gray,
                modifier = Modifier.padding(16.dp),
            )
        } else {
            val pageItems = paginatedSlice(filtered, page, PAGE_SIZE)
            LazyColumn(Modifier.weight(1f)) {
                itemsIndexed(pageItems, key = { _, c -> c.id.orEmpty() }) { index, cli ->
                    Card(Modifier.fillMaxWidth().padding(vertical = 4.dp).background(cardBackground(index))) {
                        Column(Modifier.padding(12.dp)) {
                            Text(cli.name, fontWeight = FontWeight.Bold)
                            if (cli.email.isNotBlank()) {
                                Text(cli.email, style = MaterialTheme.typography.body2)
                            }
                            val displayAddress = JamaicaParishes.formatAddress(cli.addressDetails, cli.address)
                            if (displayAddress.isNotBlank()) Text(displayAddress, style = MaterialTheme.typography.body2)
                            cli.phoneNumbers.forEach { p ->
                                Text(p.number + if (p.isBest) " (Best)" else "", style = MaterialTheme.typography.body2)
                            }
                            Row {
                                TextButton(onClick = { formTarget = cli }) { Text("Edit") }
                                TextButton(onClick = { deleteTarget = cli }) {
                                    Text("Delete", color = MaterialTheme.colors.error)
                                }
                            }
                        }
                    }
                }
            }
            PaginatedListControls(page, filtered.size, PAGE_SIZE) { page = it }
        }
    }
}

@Composable
private fun ClientFormScreen(
    api: WeirHereApi,
    tok: String,
    initial: ClientDto?,
    onDone: () -> Unit,
    onCancel: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var name by remember(initial) { mutableStateOf(initial?.name ?: "") }
    var email by remember(initial) { mutableStateOf(initial?.email ?: "") }
    var addressDetails by remember(initial) {
        mutableStateOf(
            JamaicaParishes.hydrateAddressDetails(
                initial?.addressDetails ?: ProviderAddressDetailsDto(),
                initial?.address.orEmpty(),
            ),
        )
    }
    var phones by remember(initial) { mutableStateOf(initial?.phoneNumbers ?: emptyList()) }
    var rate by remember(initial) { mutableStateOf(initial?.rate ?: "") }
    var serviceRows by remember(initial) { mutableStateOf(emptyList<ClientServiceRow>()) }
    var serviceOptions by remember { mutableStateOf<List<String>>(emptyList()) }
    var patientName by remember(initial) { mutableStateOf(initial?.patientName ?: "") }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(tok, initial) {
        if (tok.isEmpty()) return@LaunchedEffect
        runCatching { api.getAdminSettings(tok) }
            .onSuccess { response ->
                val options = ClientServices.parseOptions(response.settings[ClientServices.OPTIONS_KEY])
                serviceOptions = options
                serviceRows = servicesToRows(initial?.services.orEmpty(), options)
            }
            .onFailure {
                serviceRows = servicesToRows(initial?.services.orEmpty(), emptyList())
            }
    }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(8.dp)) {
        Text(if (initial == null) "Add Client" else "Edit Client", style = MaterialTheme.typography.h6)
        OutlinedTextField(name, { name = it }, label = { Text("Name *") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(email, { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(rate, { rate = it }, label = { Text("Rate (optional)") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(patientName, { patientName = it }, label = { Text("Patient Name (optional)") }, modifier = Modifier.fillMaxWidth())
        ClientServicesEditor(serviceRows, serviceOptions) { serviceRows = it }
        Text("Address *", fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 8.dp))
        ProviderAddressFields(
            value = addressDetails,
            onChange = { addressDetails = it },
        )
        PhoneNumberEditor(phones, { phones = it })
        error?.let { Text(it, color = MaterialTheme.colors.error) }
        Row(Modifier.padding(top = 8.dp)) {
            androidx.compose.material.Button(
                enabled = !saving && name.isNotBlank() && JamaicaParishes.formatAddress(addressDetails).isNotBlank(),
                onClick = {
                    scope.launch {
                        saving = true
                        val payload = ClientUpsertPayload(
                            id = initial?.id,
                            name = name.trim(),
                            email = email.trim(),
                            addressDetails = addressDetails,
                            phoneNumbers = phones,
                            rate = rate.trim(),
                            services = rowsToServices(serviceRows),
                            patientName = patientName.trim(),
                        )
                        runCatching {
                            if (initial == null) api.createClient(tok, payload) else api.updateClient(tok, payload)
                        }.onSuccess { onDone() }
                            .onFailure {
                                if (it !is kotlinx.coroutines.CancellationException) error = it.message ?: it.toString()
                            }
                        saving = false
                    }
                },
            ) { Text("Save") }
            TextButton(onClick = onCancel) { Text("Cancel") }
        }
    }
}

@Composable
fun AdminAssignmentsUi(api: WeirHereApi, accessToken: String?) {
    val scope = rememberCoroutineScope()
    val tok = accessToken?.trim().orEmpty()
    var assignments by remember { mutableStateOf<List<AssignmentDto>>(emptyList()) }
    var clients by remember { mutableStateOf<List<ClientDto>>(emptyList()) }
    var providers by remember { mutableStateOf<List<ProviderDto>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var page by remember { mutableStateOf(0) }
    var formTarget by remember { mutableStateOf<AssignmentDto?>(null) }
    var showCreate by remember { mutableStateOf(false) }
    var deleteTarget by remember { mutableStateOf<AssignmentDto?>(null) }

    fun reload() {
        if (tok.isEmpty()) return
        scope.launch {
            loading = true
            runCatching {
                assignments = api.listAssignments(tok)
                clients = api.listClients(tok)
                providers = api.listProviders(tok)
            }.onFailure {
                if (it !is kotlinx.coroutines.CancellationException) error = it.message ?: it.toString()
            }
            loading = false
        }
    }

    LaunchedEffect(tok) { reload() }

    deleteTarget?.let { target ->
        ConfirmDeleteDialog(
            title = "Delete assignment",
            message = "Delete this assignment?",
            onConfirm = {
                scope.launch {
                    runCatching { api.deleteAssignment(tok, target.id.orEmpty()) }.onSuccess { reload() }
                    deleteTarget = null
                }
            },
            onDismiss = { deleteTarget = null },
        )
    }

    if (showCreate || formTarget != null) {
        AssignmentFormScreen(
            api = api,
            tok = tok,
            clients = clients,
            providers = providers,
            initial = formTarget,
            onDone = { showCreate = false; formTarget = null; reload() },
            onCancel = { showCreate = false; formTarget = null },
        )
        return
    }

    Column(Modifier.fillMaxSize()) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Assignments", style = MaterialTheme.typography.h5, fontWeight = FontWeight.Bold)
            TextButton(onClick = { showCreate = true }) { Text("Add") }
        }
        error?.let { Text("Error: $it", color = MaterialTheme.colors.error) }
        if (loading) CircularProgressIndicator(Modifier.padding(16.dp))
        else {
            val pageItems = paginatedSlice(assignments, page, PAGE_SIZE)
            LazyColumn(Modifier.weight(1f)) {
                itemsIndexed(pageItems, key = { _, a -> a.id.orEmpty() }) { index, asg ->
                    Card(Modifier.fillMaxWidth().padding(vertical = 4.dp).background(cardBackground(index))) {
                        Column(Modifier.padding(12.dp)) {
                            Text("Client: ${asg.clientId?.name ?: "—"}", fontWeight = FontWeight.Bold)
                            Text("Provider: ${asg.providerId?.name ?: "—"}")
                            Text("Service date: ${asg.serviceDate}", style = MaterialTheme.typography.body2)
                            Text("Client charge: ${formatDollars(asg.clientChargeCents)}", style = MaterialTheme.typography.body2)
                            Text("Provider pay: ${formatDollars(asg.providerPayCents)}", style = MaterialTheme.typography.body2)
                            Text("Description: ${asg.description}", style = MaterialTheme.typography.body2)
                            Text("Status: ${asg.status}", style = MaterialTheme.typography.body2)
                            if (asg.invoiced) {
                                Text("Invoiced", color = MaterialTheme.colors.primary, style = MaterialTheme.typography.caption)
                            }
                            Row {
                                TextButton(onClick = { formTarget = asg }) { Text("Edit") }
                                TextButton(onClick = { deleteTarget = asg }) {
                                    Text("Delete", color = MaterialTheme.colors.error)
                                }
                            }
                        }
                    }
                }
            }
            PaginatedListControls(page, assignments.size, PAGE_SIZE) { page = it }
        }
    }
}

@Composable
private fun AssignmentFormScreen(
    api: WeirHereApi,
    tok: String,
    clients: List<ClientDto>,
    providers: List<ProviderDto>,
    initial: AssignmentDto?,
    onDone: () -> Unit,
    onCancel: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var clientId by remember(initial) { mutableStateOf(initial?.clientId?.id ?: "") }
    var providerId by remember(initial) { mutableStateOf(initial?.providerId?.id ?: "") }
    var clientCharge by remember(initial) { mutableStateOf(initial?.clientChargeCents ?: 0) }
    var providerPay by remember(initial) { mutableStateOf(initial?.providerPayCents ?: 0) }
    var hourlyRate by remember(initial) { mutableStateOf(initial?.providerHourlyRateCents ?: 0) }
    var desc by remember(initial) { mutableStateOf(initial?.description ?: "") }
    var serviceDate by remember(initial) { mutableStateOf(initial?.serviceDate?.take(10) ?: "") }
    var status by remember(initial) { mutableStateOf(initial?.status ?: "assigned") }
    var clientMenuOpen by remember { mutableStateOf(false) }
    var providerMenuOpen by remember { mutableStateOf(false) }
    var statusMenuOpen by remember { mutableStateOf(false) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    val clientLabel = clients.find { it.id == clientId }?.name ?: "Select client"
    val providerLabel = providers.find { it.id == providerId }?.name ?: "Select provider"
    val statuses = listOf("assigned", "arrived", "completed")

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(8.dp)) {
        Text(if (initial == null) "Add Assignment" else "Edit Assignment", style = MaterialTheme.typography.h6)
        Box {
            OutlinedTextField(clientLabel, {}, readOnly = true, modifier = Modifier.fillMaxWidth().clickable { clientMenuOpen = true }, label = { Text("Client") })
            DropdownMenu(clientMenuOpen, { clientMenuOpen = false }) {
                clients.forEach { c ->
                    DropdownMenuItem(onClick = { clientId = c.id.orEmpty(); clientMenuOpen = false }) { Text(c.name) }
                }
            }
        }
        Box {
            OutlinedTextField(providerLabel, {}, readOnly = true, modifier = Modifier.fillMaxWidth().clickable { providerMenuOpen = true }, label = { Text("Provider") })
            DropdownMenu(providerMenuOpen, { providerMenuOpen = false }) {
                providers.forEach { p ->
                    DropdownMenuItem(onClick = { providerId = p.id; providerMenuOpen = false }) { Text(p.name) }
                }
            }
        }
        OutlinedTextField(desc, { desc = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth())
        MoneyCentsField("Client charge", clientCharge, { clientCharge = it })
        MoneyCentsField("Provider pay", providerPay, { providerPay = it })
        MoneyCentsField("Provider hourly rate", hourlyRate, { hourlyRate = it })
        OutlinedTextField(serviceDate, { serviceDate = it }, label = { Text("Service date (YYYY-MM-DD)") }, modifier = Modifier.fillMaxWidth())
        Box {
            OutlinedTextField(status, {}, readOnly = true, modifier = Modifier.fillMaxWidth().clickable { statusMenuOpen = true }, label = { Text("Status") })
            DropdownMenu(statusMenuOpen, { statusMenuOpen = false }) {
                statuses.forEach { s ->
                    DropdownMenuItem(onClick = { status = s; statusMenuOpen = false }) { Text(s) }
                }
            }
        }
        error?.let { Text(it, color = MaterialTheme.colors.error) }
        Row(Modifier.padding(top = 8.dp)) {
            androidx.compose.material.Button(
                enabled = !saving && clientId.isNotBlank() && providerId.isNotBlank(),
                onClick = {
                    scope.launch {
                        saving = true
                        val dateIso = if (serviceDate.length == 10) "${serviceDate}T00:00:00.000Z" else serviceDate
                        val payload = AssignmentUpsertPayload(
                            id = initial?.id,
                            clientId = clientId,
                            providerId = providerId,
                            clientChargeCents = clientCharge,
                            providerPayCents = providerPay,
                            providerHourlyRateCents = hourlyRate,
                            description = desc,
                            serviceDate = dateIso.ifBlank { "2026-01-01T00:00:00.000Z" },
                            status = status,
                        )
                        runCatching {
                            if (initial == null) api.createAssignment(tok, payload) else api.updateAssignment(tok, payload)
                        }.onSuccess { onDone() }
                            .onFailure {
                                if (it !is kotlinx.coroutines.CancellationException) error = it.message ?: it.toString()
                            }
                        saving = false
                    }
                },
            ) { Text("Save") }
            TextButton(onClick = onCancel) { Text("Cancel") }
        }
    }
}

@Composable
fun AdminTestimonialsUi(api: WeirHereApi, accessToken: String?) {
    val scope = rememberCoroutineScope()
    val tok = accessToken?.trim().orEmpty()
    var items by remember { mutableStateOf<List<TestimonialDto>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var editTarget by remember { mutableStateOf<TestimonialDto?>(null) }
    var showCreate by remember { mutableStateOf(false) }
    var deleteTarget by remember { mutableStateOf<TestimonialDto?>(null) }

    fun reload() {
        scope.launch {
            loading = true
            runCatching { api.listTestimonials(tok) }
                .onSuccess { items = it.testimonials }
                .onFailure {
                    if (it !is kotlinx.coroutines.CancellationException) error = it.message ?: it.toString()
                }
            loading = false
        }
    }

    LaunchedEffect(tok) { reload() }

    deleteTarget?.let { t ->
        ConfirmDeleteDialog("Delete testimonial", "Delete quote by ${t.authorName}?", onConfirm = {
            scope.launch {
                runCatching { api.deleteTestimonial(tok, t.id) }.onSuccess { reload() }
                deleteTarget = null
            }
        }, onDismiss = { deleteTarget = null })
    }

    if (showCreate || editTarget != null) {
        TestimonialFormScreen(api, tok, editTarget, onDone = { showCreate = false; editTarget = null; reload() }, onCancel = { showCreate = false; editTarget = null })
        return
    }

    Column(Modifier.fillMaxSize()) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Testimonials", style = MaterialTheme.typography.h5, fontWeight = FontWeight.Bold)
            TextButton(onClick = { showCreate = true }) { Text("Add") }
        }
        error?.let { Text(it, color = MaterialTheme.colors.error) }
        if (loading) CircularProgressIndicator()
        else LazyColumn {
            items(items, key = { it.id }) { t ->
                Card(Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                    Column(Modifier.padding(12.dp)) {
                        Text("\"${t.quote}\"", style = MaterialTheme.typography.body1)
                        Text("— ${t.authorName}, ${t.authorTitle}", style = MaterialTheme.typography.caption)
                        Text("Published: ${t.published} · Order: ${t.sortOrder}", style = MaterialTheme.typography.caption)
                        Row {
                            TextButton(onClick = { editTarget = t }) { Text("Edit") }
                            TextButton(onClick = { deleteTarget = t }) { Text("Delete", color = MaterialTheme.colors.error) }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun TestimonialFormScreen(
    api: WeirHereApi,
    tok: String,
    initial: TestimonialDto?,
    onDone: () -> Unit,
    onCancel: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var quote by remember(initial) { mutableStateOf(initial?.quote ?: "") }
    var authorName by remember(initial) { mutableStateOf(initial?.authorName ?: "") }
    var authorTitle by remember(initial) { mutableStateOf(initial?.authorTitle ?: "") }
    var context by remember(initial) { mutableStateOf(initial?.context ?: "") }
    var avatarUrl by remember(initial) { mutableStateOf(initial?.avatarUrl ?: "") }
    var published by remember(initial) { mutableStateOf(initial?.published ?: true) }
    var sortOrder by remember(initial) { mutableStateOf((initial?.sortOrder ?: 0).toString()) }
    var saving by remember { mutableStateOf(false) }

    Column(Modifier.verticalScroll(rememberScrollState()).padding(8.dp)) {
        OutlinedTextField(quote, { quote = it }, label = { Text("Quote *") }, modifier = Modifier.fillMaxWidth(), minLines = 3)
        OutlinedTextField(authorName, { authorName = it }, label = { Text("Author name *") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(authorTitle, { authorTitle = it }, label = { Text("Author title") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(context, { context = it }, label = { Text("Context") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(avatarUrl, { avatarUrl = it }, label = { Text("Avatar URL") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(sortOrder, { sortOrder = it }, label = { Text("Sort order") }, modifier = Modifier.fillMaxWidth())
        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(checked = published, onCheckedChange = { published = it })
            Text("Published")
        }
        Row {
            androidx.compose.material.Button(
                enabled = !saving && quote.isNotBlank() && authorName.isNotBlank(),
                onClick = {
                    scope.launch {
                        saving = true
                        val payload = TestimonialUpsertPayload(
                            quote = quote.trim(),
                            authorName = authorName.trim(),
                            authorTitle = authorTitle.trim(),
                            context = context.trim(),
                            avatarUrl = avatarUrl.trim(),
                            published = published,
                            sortOrder = sortOrder.toIntOrNull() ?: 0,
                        )
                        runCatching {
                            if (initial == null) api.createTestimonial(tok, payload)
                            else api.updateTestimonial(tok, initial.id, payload)
                        }.onSuccess { onDone() }
                        saving = false
                    }
                },
            ) { Text("Save") }
            TextButton(onClick = onCancel) { Text("Cancel") }
        }
    }
}

private val MS365_SETTING_KEYS =
    listOf(
        "MS365_CLIENT_ID",
        "MS365_TENANT_ID",
        "MS365_CLIENT_SECRET",
        "MS365_MAIL_FROM",
        "MS365_MAIL_TO",
        "MS365_MAIL_TO_2",
        "MS365_CONSULTATION_DELIVERY",
        "MS365_APPLICATIONS_MAIL_TO",
        "MS365_APPLICATIONS_MAIL_TO_2",
        "MS365_APPLICATIONS_DELIVERY",
        "MS365_SHAREPOINT_SITE_ID",
        "MS365_RESUME_FOLDER_PATH",
        "MS365_LOGO_FOLDER_PATH",
        "MS365_JOB_ATTACHMENT_PATH",
    )

@Composable
fun AdminSettingsUi(api: WeirHereApi, accessToken: String?) {
    val scope = rememberCoroutineScope()
    val tok = accessToken?.trim().orEmpty()
    var settings by remember { mutableStateOf<Map<String, String>>(emptyMap()) }
    var clientServiceOptions by remember { mutableStateOf<List<String>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var success by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(tok) {
        if (tok.isEmpty()) return@LaunchedEffect
        loading = true
        runCatching { api.getAdminSettings(tok) }
            .onSuccess { response ->
                settings = response.settings
                clientServiceOptions = ClientServices.parseOptions(response.settings[ClientServices.OPTIONS_KEY])
            }
            .onFailure {
                if (it !is kotlinx.coroutines.CancellationException) error = it.message ?: it.toString()
            }
        loading = false
    }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(8.dp)) {
        Text("Settings", style = MaterialTheme.typography.h5, fontWeight = FontWeight.Bold)
        error?.let { Text(it, color = MaterialTheme.colors.error) }
        success?.let { Text(it, color = MaterialTheme.colors.primary) }
        if (loading) CircularProgressIndicator()
        else {
            ClientServiceOptionsEditor(
                options = clientServiceOptions,
                onChange = { clientServiceOptions = it },
            )
            Spacer(Modifier.height(16.dp))
            MS365_SETTING_KEYS.forEach { key ->
                val isSecret = key == "MS365_CLIENT_SECRET"
                OutlinedTextField(
                    value = settings[key].orEmpty(),
                    onValueChange = { settings = settings + (key to it) },
                    label = { Text(key) },
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    singleLine = !isSecret,
                )
            }
            androidx.compose.material.Button(
                enabled = !saving,
                onClick = {
                    scope.launch {
                        saving = true
                        error = null
                        success = null
                        val toSave =
                            settings.filter { (k, v) ->
                                v.isNotBlank() && !(k == "MS365_CLIENT_SECRET" && v == MASKED_SECRET)
                            } + mapOf(
                                ClientServices.OPTIONS_KEY to ClientServices.serializeOptions(clientServiceOptions),
                            )
                        runCatching { api.updateAdminSettings(tok, toSave) }
                            .onSuccess { success = "Settings saved" }
                            .onFailure {
                                if (it !is kotlinx.coroutines.CancellationException) error = it.message ?: it.toString()
                            }
                        saving = false
                    }
                },
                modifier = Modifier.fillMaxWidth(),
            ) { Text(if (saving) "Saving…" else "Save settings") }
        }
    }
}

private const val EXCEL_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

@Composable
fun AdminReportsUi(api: WeirHereApi, accessToken: String?) {
    val scope = rememberCoroutineScope()
    val tok = accessToken?.trim().orEmpty()
    var month by remember { mutableStateOf(currentMonthYyyyMm()) }
    var providerId by remember { mutableStateOf("") }
    var providers by remember { mutableStateOf<List<ProviderDto>>(emptyList()) }
    var rows by remember { mutableStateOf<List<AdminReportRowDto>>(emptyList()) }
    var total by remember { mutableStateOf(0.0) }
    var loading by remember { mutableStateOf(false) }
    var exporting by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var providerMenuOpen by remember { mutableStateOf(false) }

    val saveFile =
        rememberFileSaver(
            onSaved = { error = null },
            onError = { error = it },
        )

    LaunchedEffect(tok) {
        if (tok.isEmpty()) return@LaunchedEffect
        runCatching { api.listProviders(tok) }
            .onSuccess { providers = it }
    }

    LaunchedEffect(tok, month, providerId) {
        if (tok.isEmpty() || !month.matches(Regex("^\\d{4}-\\d{2}$"))) return@LaunchedEffect
        loading = true
        error = null
        runCatching {
            api.getAdminReport(tok, month, providerId.takeIf { it.isNotBlank() })
        }.onSuccess {
            rows = it.rows
            total = it.total
        }.onFailure {
            if (it !is kotlinx.coroutines.CancellationException) {
                error = it.message ?: it.toString()
                rows = emptyList()
                total = 0.0
            }
        }
        loading = false
    }

    val grouped = remember(rows) { rows.groupBy { it.client } }
    val providerLabel =
        providers.find { it.id == providerId }?.name ?: "All Providers"

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(8.dp)) {
        Text("Monthly Reports", style = MaterialTheme.typography.h5, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(12.dp))

        Card(Modifier.fillMaxWidth().padding(bottom = 12.dp)) {
            Column(Modifier.padding(12.dp)) {
                Text("Filters", fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 8.dp))
                OutlinedTextField(
                    value = month,
                    onValueChange = { month = it },
                    label = { Text("Month (YYYY-MM)") },
                    modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                    singleLine = true,
                )
                Box {
                    OutlinedTextField(
                        value = providerLabel,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Provider (optional)") },
                        modifier = Modifier.fillMaxWidth().clickable { providerMenuOpen = true },
                    )
                    DropdownMenu(expanded = providerMenuOpen, onDismissRequest = { providerMenuOpen = false }) {
                        DropdownMenuItem(onClick = { providerId = ""; providerMenuOpen = false }) {
                            Text("All Providers")
                        }
                        providers.forEach { p ->
                            DropdownMenuItem(onClick = { providerId = p.id; providerMenuOpen = false }) {
                                Text(p.name)
                            }
                        }
                    }
                }
                Spacer(Modifier.height(8.dp))
                androidx.compose.material.Button(
                    enabled = !exporting && rows.isNotEmpty(),
                    onClick = {
                        scope.launch {
                            exporting = true
                            error = null
                            runCatching {
                                api.downloadAdminReportExcel(tok, month, providerId.takeIf { it.isNotBlank() })
                            }.onSuccess { bytes ->
                                saveFile("report-$month.xlsx", bytes, EXCEL_MIME)
                            }.onFailure {
                                if (it !is kotlinx.coroutines.CancellationException) {
                                    error = it.message ?: it.toString()
                                }
                            }
                            exporting = false
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text(if (exporting) "Exporting…" else "Export Excel")
                }
            }
        }

        error?.let { Text(it, color = MaterialTheme.colors.error, modifier = Modifier.padding(bottom = 8.dp)) }

        if (loading) {
            CircularProgressIndicator(Modifier.padding(24.dp))
        } else if (rows.isEmpty()) {
            Card(Modifier.fillMaxWidth().padding(vertical = 16.dp)) {
                Text(
                    "No data found for $month${if (providerId.isNotBlank()) " with the selected provider" else ""}.",
                    modifier = Modifier.padding(24.dp),
                    color = Color.Gray,
                )
            }
        } else {
            Card(
                Modifier.fillMaxWidth().padding(bottom = 12.dp),
                backgroundColor = Color(0xFF1a3a5c),
            ) {
                Row(
                    Modifier.fillMaxWidth().padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("TOTAL BILLED", style = MaterialTheme.typography.caption, color = Color.White.copy(alpha = 0.7f))
                        Text(formatDollarsAmount(total), style = MaterialTheme.typography.h6, color = Color.White, fontWeight = FontWeight.Bold)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("CLIENTS", style = MaterialTheme.typography.caption, color = Color.White.copy(alpha = 0.7f))
                        Text("${grouped.size}", style = MaterialTheme.typography.h6, color = Color.White, fontWeight = FontWeight.Bold)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("ASSIGNMENTS", style = MaterialTheme.typography.caption, color = Color.White.copy(alpha = 0.7f))
                        Text("${rows.size}", style = MaterialTheme.typography.h6, color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }

            grouped.forEach { (clientName, clientRows) ->
                val clientTotal = clientRows.sumOf { it.chargeAmount }
                Card(Modifier.fillMaxWidth().padding(bottom = 12.dp)) {
                    Column {
                        Row(
                            Modifier.fillMaxWidth().background(Color(0xFFf0f4ff)).padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Text(clientName, fontWeight = FontWeight.Bold)
                            Text(
                                "Total: ${formatDollarsAmount(clientTotal)}",
                                color = MaterialTheme.colors.primary,
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.body2,
                            )
                        }
                        clientRows.forEach { row ->
                            Column(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp)) {
                                Text("Provider: ${row.provider}", style = MaterialTheme.typography.body2, fontWeight = FontWeight.Medium)
                                Text("Service date: ${row.serviceDate}", style = MaterialTheme.typography.caption)
                                Text(
                                    row.description.ifBlank { "—" },
                                    style = MaterialTheme.typography.body2,
                                    maxLines = 2,
                                )
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Charge: ${formatDollarsAmount(row.chargeAmount)}", style = MaterialTheme.typography.body2)
                                    Text("Pay: ${formatDollarsAmount(row.providerPay)}", style = MaterialTheme.typography.body2)
                                    Text(
                                        if (row.invoiced) "Invoiced" else "Not invoiced",
                                        style = MaterialTheme.typography.caption,
                                        color = if (row.invoiced) MaterialTheme.colors.primary else Color.Gray,
                                    )
                                }
                            }
                            androidx.compose.material.Divider()
                        }
                    }
                }
            }
        }
    }
}
