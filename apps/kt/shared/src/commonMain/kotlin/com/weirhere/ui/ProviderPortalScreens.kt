package com.weirhere.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.AlertDialog
import androidx.compose.material.Button
import androidx.compose.material.Card
import androidx.compose.material.CircularProgressIndicator
import androidx.compose.material.MaterialTheme
import androidx.compose.material.OutlinedTextField
import androidx.compose.material.Text
import androidx.compose.material.TextButton
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Person
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.lazy.items
import com.weirhere.data.JamaicaParishes
import com.weirhere.maps.rememberMapsOpener
import com.weirhere.model.AssignmentDto
import com.weirhere.model.PhoneNumberDto
import com.weirhere.model.ProviderAddressDetailsDto
import com.weirhere.model.ProviderProfileDto
import com.weirhere.model.ProviderProfileUpdatePayload
import com.weirhere.network.WeirHereApi
import kotlinx.coroutines.launch

@Composable
fun ProviderUi(
    api: WeirHereApi,
    accessToken: String?,
    userEmail: String? = null,
    onRefresh: () -> Unit,
    onBackToHome: (() -> Unit)? = null,
) {
    var currentView by remember { mutableStateOf("MENU") }

    if (accessToken?.trim().orEmpty().isEmpty()) {
        Text("Sign in using the profile icon to view the provider portal.")
        return
    }

    when (currentView) {
        "MENU" -> ProviderPortalMenu(
            onAssignments = { currentView = "ASSIGNMENTS" },
            onProfile = { currentView = "PROFILE" },
            onBackToHome = onBackToHome,
        )
        "ASSIGNMENTS" -> Column(Modifier.fillMaxSize()) {
            BackNavButton(label = "Back to Provider", onClick = { currentView = "MENU" })
            ProviderAssignmentsContent(api, accessToken, userEmail, onRefresh)
        }
        "PROFILE" -> Column(Modifier.fillMaxSize()) {
            BackNavButton(label = "Back to Provider", onClick = { currentView = "MENU" })
            ProviderProfileContent(api, accessToken)
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ProviderPortalMenu(
    onAssignments: () -> Unit,
    onProfile: () -> Unit,
    onBackToHome: (() -> Unit)? = null,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        if (onBackToHome != null) {
            BackNavButton(label = "Back", onClick = onBackToHome)
        }
        Spacer(Modifier.height(8.dp))
        Text(
            "Provider",
            style = MaterialTheme.typography.h5,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1A237E),
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
        )
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(28.dp),
            backgroundColor = Color.White,
            elevation = 4.dp,
        ) {
            Column(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 18.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(20.dp, Alignment.CenterHorizontally),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.fillMaxWidth(),
                    maxItemsInEachRow = 3,
                ) {
                    SquircleNavButton(
                        label = "Assignments",
                        icon = Icons.Filled.List,
                        gradient = listOf(Color(0xFF4FC3F7), Color(0xFF0277BD)),
                        onClick = onAssignments,
                    )
                    SquircleNavButton(
                        label = "My Profile",
                        icon = Icons.Filled.Person,
                        gradient = listOf(Color(0xFF81C784), Color(0xFF2E7D32)),
                        onClick = onProfile,
                    )
                }
            }
        }
    }
}

@Composable
private fun ProviderAssignmentsContent(
    api: WeirHereApi,
    accessToken: String?,
    userEmail: String?,
    onRefresh: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    val tok = accessToken?.trim().orEmpty()
    var assignments by remember { mutableStateOf<List<AssignmentDto>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var actionId by remember { mutableStateOf<String?>(null) }
    var selectedAssignment by remember { mutableStateOf<AssignmentDto?>(null) }

    fun reload() {
        if (tok.isEmpty()) return
        scope.launch {
            loading = true
            error = null
            runCatching { api.listProviderAssignments(tok) }
                .onSuccess { assignments = it }
                .onFailure {
                    if (it !is kotlinx.coroutines.CancellationException) {
                        error = it.message ?: it.toString()
                    }
                }
            loading = false
        }
    }

    LaunchedEffect(tok) { reload() }

    selectedAssignment?.let { assignment ->
        ProviderAssignmentDetailDialog(
            assignment = assignment,
            actionLoading = actionId == assignment.id,
            onDismiss = { selectedAssignment = null },
            onArrive = {
                val id = assignment.id.orEmpty()
                if (id.isEmpty()) return@ProviderAssignmentDetailDialog
                scope.launch {
                    actionId = id
                    runCatching { api.providerAssignmentAction(tok, id, "arrive") }
                        .onSuccess { updated ->
                            assignments = assignments.map { if (it.id == updated.id) updated else it }
                            selectedAssignment = updated
                        }
                        .onFailure {
                            if (it !is kotlinx.coroutines.CancellationException) {
                                error = it.message ?: it.toString()
                            }
                        }
                    actionId = null
                }
            },
            onCheckout = {
                val id = assignment.id.orEmpty()
                if (id.isEmpty()) return@ProviderAssignmentDetailDialog
                scope.launch {
                    actionId = id
                    runCatching { api.providerAssignmentAction(tok, id, "checkout") }
                        .onSuccess { updated ->
                            assignments = assignments.map { if (it.id == updated.id) updated else it }
                            selectedAssignment = updated
                        }
                        .onFailure {
                            if (it !is kotlinx.coroutines.CancellationException) {
                                error = it.message ?: it.toString()
                            }
                        }
                    actionId = null
                }
            },
        )
    }

    if (tok.isEmpty()) {
        Text("Sign in using the profile icon to view your assignments.")
        return
    }

    Column(Modifier.fillMaxSize()) {
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("My Assignments", style = MaterialTheme.typography.h5, fontWeight = FontWeight.Bold)
            TextButton(onClick = { reload(); onRefresh() }) { Text("Refresh") }
        }

        error?.let { msg ->
            Column(Modifier.padding(vertical = 8.dp)) {
                Text(msg, color = MaterialTheme.colors.error)
                userEmail?.takeIf { it.isNotBlank() }?.let { email ->
                    Text(
                        "Signed in as: $email",
                        style = MaterialTheme.typography.caption,
                        color = Color.Gray,
                        modifier = Modifier.padding(top = 4.dp),
                    )
                }
            }
        }

        if (loading) {
            CircularProgressIndicator(Modifier.padding(16.dp))
        } else if (assignments.isEmpty() && error == null) {
            Text("No assignments found.", color = Color.Gray, modifier = Modifier.padding(16.dp))
        } else {
            LazyColumn(Modifier.weight(1f)) {
                itemsIndexed(assignments, key = { _, a -> a.id.orEmpty() }) { index, assignment ->
                    ProviderAssignmentCard(
                        assignment = assignment,
                        onOpen = { selectedAssignment = assignment },
                        modifier = Modifier.background(cardBackground(index)),
                    )
                }
            }
        }
    }
}

@Composable
private fun ProviderProfileContent(api: WeirHereApi, accessToken: String?) {
    val scope = rememberCoroutineScope()
    val tok = accessToken?.trim().orEmpty()
    var profile by remember { mutableStateOf<ProviderProfileDto?>(null) }
    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var success by remember { mutableStateOf<String?>(null) }

    fun reload() {
        scope.launch {
            loading = true
            error = null
            runCatching { api.getProviderProfile(tok) }
                .onSuccess { profile = it }
                .onFailure {
                    if (it !is kotlinx.coroutines.CancellationException) {
                        error = it.message ?: it.toString()
                    }
                }
            loading = false
        }
    }

    LaunchedEffect(tok) { reload() }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(vertical = 8.dp),
    ) {
        Text("My Profile", style = MaterialTheme.typography.h5, fontWeight = FontWeight.Bold)
        error?.let { Text(it, color = MaterialTheme.colors.error, modifier = Modifier.padding(vertical = 8.dp)) }
        success?.let { Text(it, color = Color(0xFF2E7D32), modifier = Modifier.padding(vertical = 8.dp)) }

        if (loading) {
            CircularProgressIndicator(Modifier.padding(16.dp))
            return@Column
        }

        val current = profile ?: return@Column
        var name by remember(current) { mutableStateOf(current.name) }
        var addressDetails by remember(current) {
            mutableStateOf(JamaicaParishes.hydrateAddressDetails(current.addressDetails, current.address))
        }
        var preferredParishes by remember(current) {
            mutableStateOf(
                JamaicaParishes.normalizePreferred(
                    current.addressDetails.parish,
                    current.preferredParishes,
                ),
            )
        }
        var phones by remember(current) { mutableStateOf(current.phoneNumbers) }

        OutlinedTextField(name, { name = it }, label = { Text("Name") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(current.email, {}, label = { Text("Email") }, modifier = Modifier.fillMaxWidth(), enabled = false)
        Spacer(Modifier.height(8.dp))
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
        Spacer(Modifier.height(12.dp))
        Button(
            enabled = !saving && name.isNotBlank(),
            onClick = {
                scope.launch {
                    saving = true
                    error = null
                    success = null
                    val payload = ProviderProfileUpdatePayload(
                        name = name.trim(),
                        addressDetails = addressDetails,
                        preferredParishes = JamaicaParishes.normalizePreferred(
                            addressDetails.parish,
                            preferredParishes,
                        ),
                        phoneNumbers = phones,
                    )
                    runCatching { api.updateProviderProfile(tok, payload) }
                        .onSuccess {
                            profile = it
                            success = "Profile updated."
                        }
                        .onFailure {
                            if (it !is kotlinx.coroutines.CancellationException) {
                                error = it.message ?: it.toString()
                            }
                        }
                    saving = false
                }
            },
        ) {
            Text(if (saving) "Saving…" else "Save Changes")
        }
    }
}

@Composable
private fun ProviderAssignmentCard(
    assignment: AssignmentDto,
    onOpen: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val status = assignment.status.ifBlank { "assigned" }
    Card(
        Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clickable(onClick = onOpen)
            .then(modifier),
    ) {
        Column(Modifier.padding(12.dp)) {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    assignment.clientId?.name ?: "Unknown client",
                    fontWeight = FontWeight.Bold,
                    style = MaterialTheme.typography.h6,
                    modifier = Modifier.weight(1f),
                )
                Text(
                    "View",
                    color = MaterialTheme.colors.primary,
                    style = MaterialTheme.typography.caption,
                    fontWeight = FontWeight.SemiBold,
                )
            }
            Text(
                assignment.serviceDate.replace('T', ' ').substringBefore('.'),
                style = MaterialTheme.typography.body2,
                color = Color.Gray,
            )
            Text(
                status.replaceFirstChar { it.uppercase() },
                color = when (status) {
                    "completed" -> Color(0xFF2E7D32)
                    "arrived" -> Color(0xFFF57C00)
                    else -> MaterialTheme.colors.primary
                },
                fontWeight = FontWeight.SemiBold,
                style = MaterialTheme.typography.caption,
                modifier = Modifier.padding(vertical = 4.dp),
            )
            assignment.clientId?.address?.takeIf { it.isNotBlank() }?.let {
                Text(it, style = MaterialTheme.typography.body2, color = Color(0xFF616161))
            }
            if (assignment.description.isNotBlank()) {
                Text(
                    assignment.description,
                    style = MaterialTheme.typography.body2,
                    maxLines = 2,
                )
            }
            Text(
                "Pay: ${formatDollars(assignment.providerPayCents)}",
                style = MaterialTheme.typography.body2,
            )
        }
    }
}

@Composable
private fun ProviderAssignmentDetailDialog(
    assignment: AssignmentDto,
    actionLoading: Boolean,
    onDismiss: () -> Unit,
    onArrive: () -> Unit,
    onCheckout: () -> Unit,
) {
    val mapsOpener = rememberMapsOpener()
    val status = assignment.status.ifBlank { "assigned" }
    val address = assignment.clientId?.address?.trim().orEmpty()

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(assignment.clientId?.name ?: "Assignment details", fontWeight = FontWeight.Bold)
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    "Date: ${assignment.serviceDate.replace('T', ' ').substringBefore('.')}",
                    style = MaterialTheme.typography.body2,
                )
                Text(
                    "Status: ${status.replaceFirstChar { it.uppercase() }}",
                    style = MaterialTheme.typography.body2,
                    color = when (status) {
                        "completed" -> Color(0xFF2E7D32)
                        "arrived" -> Color(0xFFF57C00)
                        else -> MaterialTheme.colors.primary
                    },
                    fontWeight = FontWeight.SemiBold,
                )
                Text(
                    "Address: ${address.ifBlank { "No address provided" }}",
                    style = MaterialTheme.typography.body1,
                )
                if (assignment.description.isNotBlank()) {
                    Text("Description: ${assignment.description}", style = MaterialTheme.typography.body2)
                }
                Text(
                    "Pay: ${formatDollars(assignment.providerPayCents)}",
                    style = MaterialTheme.typography.body2,
                )
                if (address.isNotBlank()) {
                    Spacer(Modifier.height(4.dp))
                    Button(
                        onClick = { mapsOpener.openAddress(address) },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Open in Google Maps")
                    }
                }
            }
        },
        confirmButton = {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (status == "assigned") {
                    TextButton(onClick = onArrive, enabled = !actionLoading) {
                        Text(if (actionLoading) "…" else "Mark arrived")
                    }
                }
                if (status == "arrived") {
                    TextButton(onClick = onCheckout, enabled = !actionLoading) {
                        Text(if (actionLoading) "…" else "Check out")
                    }
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Close") }
        },
    )
}
