package com.weirhere.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.Card
import androidx.compose.material.CircularProgressIndicator
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.material.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.weirhere.model.AssignmentDto
import com.weirhere.network.WeirHereApi
import kotlinx.coroutines.launch

@Composable
fun ProviderUi(
    api: WeirHereApi,
    accessToken: String?,
    userEmail: String? = null,
    onRefresh: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    val tok = accessToken?.trim().orEmpty()
    var assignments by remember { mutableStateOf<List<AssignmentDto>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var actionId by remember { mutableStateOf<String?>(null) }

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

    if (tok.isEmpty()) {
        Text("Sign in using the profile icon to view your assignments.")
        return
    }

    Column(Modifier.fillMaxSize()) {
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
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
                        actionLoading = actionId == assignment.id,
                        onArrive = {
                            val id = assignment.id.orEmpty()
                            if (id.isEmpty()) return@ProviderAssignmentCard
                            scope.launch {
                                actionId = id
                                runCatching { api.providerAssignmentAction(tok, id, "arrive") }
                                    .onSuccess { updated ->
                                        assignments = assignments.map { if (it.id == updated.id) updated else it }
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
                            if (id.isEmpty()) return@ProviderAssignmentCard
                            scope.launch {
                                actionId = id
                                runCatching { api.providerAssignmentAction(tok, id, "checkout") }
                                    .onSuccess { updated ->
                                        assignments = assignments.map { if (it.id == updated.id) updated else it }
                                    }
                                    .onFailure {
                                        if (it !is kotlinx.coroutines.CancellationException) {
                                            error = it.message ?: it.toString()
                                        }
                                    }
                                actionId = null
                            }
                        },
                        modifier = Modifier.background(cardBackground(index)),
                    )
                }
            }
        }
    }
}

@Composable
private fun ProviderAssignmentCard(
    assignment: AssignmentDto,
    actionLoading: Boolean,
    onArrive: () -> Unit,
    onCheckout: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val status = assignment.status.ifBlank { "assigned" }
    Card(
        Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .then(modifier),
    ) {
        Column(Modifier.padding(12.dp)) {
            Text(
                assignment.clientId?.name ?: "Unknown client",
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.h6,
            )
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
                Text(it, style = MaterialTheme.typography.body2)
            }
            if (assignment.description.isNotBlank()) {
                Text(assignment.description, style = MaterialTheme.typography.body2)
            }
            Text(
                "Pay: ${formatDollars(assignment.providerPayCents)}",
                style = MaterialTheme.typography.body2,
            )
            Spacer(Modifier.height(8.dp))
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
        }
    }
}
