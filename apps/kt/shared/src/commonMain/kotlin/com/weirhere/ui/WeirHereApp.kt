package com.weirhere.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.Image
import androidx.compose.material.BottomNavigation
import androidx.compose.material.BottomNavigationItem
import androidx.compose.material.Card
import androidx.compose.material.CircularProgressIndicator
import androidx.compose.material.MaterialTheme
import androidx.compose.material.OutlinedTextField
import androidx.compose.material.Scaffold
import androidx.compose.material.Text
import androidx.compose.material.TextButton
import androidx.compose.material.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import com.russhwolf.settings.Settings
import com.weirhere.auth.PlatformLoginButton
import com.weirhere.data.SessionStore
import com.weirhere.model.JobJson
import com.weirhere.model.JobUpsertPayload
import com.weirhere.model.ScreeningQuestionDto
import com.weirhere.model.SalaryRangeDto
import com.weirhere.network.WeirHereApi
import com.weirhere.rbac.hasAdministrator
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.jetbrains.compose.resources.ExperimentalResourceApi
import org.jetbrains.compose.resources.painterResource

private enum class Tab { JOBS, MY, ADMIN, PROFILE }

private fun jobRouteId(job: JobJson): String? {
    val id = job.id?.trim().orEmpty()
    if (id.isNotEmpty()) return id
    val slug = job.slug.trim()
    return slug.takeIf { it.isNotEmpty() }
}

@Composable
fun WeirHereApp() {
    val scope = rememberCoroutineScope()
    DisposableEffect(Unit) {
        SessionStore.initWith(Settings())
        onDispose {}
    }

    val api = remember { WeirHereApi() }

    var tab by remember { mutableStateOf(Tab.JOBS) }
    var jobs by remember { mutableStateOf<List<JobJson>>(emptyList()) }
    var myJobs by remember { mutableStateOf<List<JobJson>>(emptyList()) }
    var loadingJobs by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var personas by remember { mutableStateOf<List<String>>(emptyList()) }
    var emailVerified by remember { mutableStateOf(false) }
    var bootEmail by remember { mutableStateOf<String?>(null) }
    var showSplash by remember { mutableStateOf(true) }

    var accessToken by remember { mutableStateOf<String?>(SessionStore.readSync()) }

    LaunchedEffect(Unit) {
        SessionStore.accessToken.collect { accessToken = it }
    }

    LaunchedEffect(accessToken) {
        val tok = accessToken?.trim().orEmpty()
        if (tok.isEmpty()) {
            personas = emptyList()
            bootEmail = null
            return@LaunchedEffect
        }
        runCatching { api.bootstrap("Bearer ${tok}") }
            .onSuccess {
                personas = it.personas
                emailVerified = it.emailVerified
                bootEmail = it.email
                if (hasAdministrator(it.personas) && tab == Tab.PROFILE) {
                    tab = Tab.ADMIN
                }
            }
            .onFailure {
                message = "Bootstrap failed: ${it.message ?: it}"
            }
    }

    fun reloadPublic() {
        scope.launch {
            loadingJobs = true
            runCatching { api.listJobs(page = 1, limit = 50) }
                .onSuccess { jobs = it.jobs }
                .onFailure { message = it.message ?: it.toString() }
            loadingJobs = false
        }
    }

    fun reloadMine() {
        val tok = accessToken?.trim().orEmpty()
        if (tok.isEmpty()) return
        scope.launch {
            runCatching { api.listMyJobs("Bearer ${tok}") }
                .onSuccess { myJobs = it.jobs }
                .onFailure { message = it.message ?: it.toString() }
        }
    }

    LaunchedEffect(Unit) {
        reloadPublic()
        delay(2500)
        showSplash = false
    }

    LaunchedEffect(accessToken, tab) {
        if (tab == Tab.MY) reloadMine()
    }

    if (showSplash) {
        @OptIn(ExperimentalResourceApi::class)
        Image(
            painter = painterResource("splash_bg.png"),
            contentDescription = "Splash background",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )
        return
    }

    MaterialTheme {
        Scaffold(
            topBar = {
                TopAppBar(title = { Text("Weir Here Jobs") })
            },
            bottomBar = {
                BottomNavigation {
                    BottomNavigationItem(
                        selected = tab == Tab.JOBS,
                        onClick = {
                            tab = Tab.JOBS
                            reloadPublic()
                        },
                        label = { Text("Browse") },
                        icon = {},
                    )
                    BottomNavigationItem(
                        selected = tab == Tab.MY,
                        onClick = { tab = Tab.MY },
                        label = { Text("Mine") },
                        icon = {},
                    )
                    BottomNavigationItem(
                        selected = tab == Tab.ADMIN,
                        onClick = { tab = Tab.ADMIN },
                        label = { Text("Admin") },
                        enabled = hasAdministrator(personas),
                        icon = {},
                    )
                    BottomNavigationItem(
                        selected = tab == Tab.PROFILE,
                        onClick = { tab = Tab.PROFILE },
                        label = { Text("Profile") },
                        icon = {},
                    )
                }
            },
        ) { padding ->
            Column(
                Modifier
                    .padding(padding)
                    .fillMaxSize()
                    .padding(12.dp),
            ) {
                message?.let {
                    Card(Modifier.padding(bottom = 8.dp)) {
                        Text(it, Modifier.padding(8.dp))
                    }
                    TextButton(onClick = { message = null }) {
                        Text("Dismiss")
                    }
                }

                when (tab) {
                    Tab.JOBS -> JobListUi(loadingJobs, jobs)

                    Tab.MY ->
                        MineUi(
                            personas = personas,
                            accessToken = accessToken,
                            myJobs = myJobs,
                            onRefresh = { reloadMine() },
                            api = api,
                        )

                    Tab.ADMIN ->
                        if (hasAdministrator(personas)) {
                            AdminDashboardUi(api = api, accessToken = accessToken)
                        } else {
                            Text("Only administrators can access the admin dashboard.")
                        }

                    Tab.PROFILE ->
                        ProfileUi(
                            personas = personas,
                            email = bootEmail,
                            emailVerified = emailVerified,
                            onLogout = {
                                SessionStore.setAccess(null)
                                personas = emptyList()
                                bootEmail = null
                            },
                        )
                }
            }
        }
    }
}

@Composable
private fun JobListUi(
    loading: Boolean,
    jobs: List<JobJson>,
) {
    if (loading) {
        CircularProgressIndicator(Modifier.padding(24.dp))
    }
    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 16.dp),
    ) {
        items(jobs, key = { "${it.slug}-${it.id}" }) {
            Card(Modifier.padding(vertical = 4.dp)) {
                Column(Modifier.padding(12.dp)) {
                    Text(it.title, style = MaterialTheme.typography.h6)
                    Text("${it.location} · ${it.employmentType}")
                    Text(it.description, maxLines = 3)
                }
            }
        }
    }
}

@Composable
private fun MineUi(
    personas: List<String>,
    accessToken: String?,
    myJobs: List<JobJson>,
    onRefresh: () -> Unit,
    api: WeirHereApi,
) {
    var editTarget by remember { mutableStateOf<JobJson?>(null) }
    val tok = accessToken?.trim().orEmpty()
    val admin = remember(personas) { hasAdministrator(personas) }

    if (tok.isEmpty()) {
        Text("Sign in from the Profile tab to see jobs you posted.")
        return
    }

    TextButton(onClick = onRefresh) { Text("Refresh") }

    editTarget?.let { job ->
        EditJobScreen(
            job = job,
            api = api,
            bearerToken = tok,
            onDismiss = { editTarget = null },
            onSaved = {
                editTarget = null
                onRefresh()
            },
        )
        Spacer(Modifier.height(8.dp))
    }

    LazyColumn {
        items(myJobs, key = { "${it.slug}-${it.id}" }) {
            Card(
                Modifier
                    .padding(vertical = 4.dp)
                    .clickable(enabled = admin) {
                        if (admin) editTarget = it
                    },
            ) {
                Column(Modifier.padding(12.dp)) {
                    Text(it.title, style = MaterialTheme.typography.h6)
                    Text(
                        buildString {
                            append("Poster: ${it.postedBy}")
                            if (admin) append(" · tap to edit")
                        },
                    )
                }
            }
        }
        item {
            if (!admin) {
                Text(
                    "(If you are not admin, Mine shows only postings you authored.)",
                    Modifier.padding(top = 8.dp),
                    style = MaterialTheme.typography.body2,
                )
            }
        }
    }
}

@Composable
private fun AdminDashboardUi(api: WeirHereApi, accessToken: String?) {
    val bearer = accessToken?.trim().orEmpty()
    if (bearer.isEmpty()) {
        Text("Sign in from Profile before accessing the admin dashboard.")
        return
    }

    var currentView by remember { mutableStateOf("MENU") }

    if (currentView == "MENU") {
        LazyColumn(Modifier.fillMaxSize()) {
            item {
                Text("Admin Dashboard", style = MaterialTheme.typography.h5, modifier = Modifier.padding(bottom = 16.dp))
            }
            val options = listOf(
                "My Jobs" to "MY_JOBS",
                "Providers" to "PROVIDERS",
                "Clients" to "CLIENTS",
                "Assignments" to "ASSIGNMENTS",
                "Reports" to "REPORTS",
                "Configuration" to "CONFIGURATION",
                "Users" to "USERS",
                "Settings" to "SETTINGS",
                "Testimonials" to "TESTIMONIALS"
            )
            items(options) { (label, viewId) ->
                Card(
                    Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .clickable { currentView = viewId }
                ) {
                    Text(label, Modifier.padding(16.dp), style = MaterialTheme.typography.subtitle1)
                }
            }
        }
    } else {
        Column(Modifier.fillMaxSize()) {
            TextButton(onClick = { currentView = "MENU" }, modifier = Modifier.padding(bottom = 8.dp)) {
                Text("← Back to Menu")
            }
            when (currentView) {
                "MY_JOBS" -> PostJobUi(api = api, accessToken = accessToken)
                else -> {
                    Text("$currentView Dashboard")
                    Spacer(Modifier.height(8.dp))
                    Text("This section is under construction.", color = MaterialTheme.colors.secondary)
                }
            }
        }
    }
}

@Composable
private fun PostJobUi(
    api: WeirHereApi,
    accessToken: String?,
) {
    val bearer = accessToken?.trim().orEmpty()
    if (bearer.isEmpty()) {
        Text("Sign in from Profile before posting.")
        return
    }

    JobUpsertForm(
        heading = "New job",
        initial = null,
        submitLabel = "Create job",
    ) { payload ->
        api.createJob("Bearer ${bearer}", payload)
    }
}

@Composable
private fun EditJobScreen(
    job: JobJson,
    api: WeirHereApi,
    bearerToken: String,
    onDismiss: () -> Unit,
    onSaved: () -> Unit,
) {
    val routeId =
        remember(job) { jobRouteId(job) }

    Column(Modifier.padding(4.dp)) {
        Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
            Text(
                "Edit posting",
                style = MaterialTheme.typography.subtitle1,
                modifier = Modifier.padding(start = 8.dp),
            )
        }

        if (routeId.isNullOrEmpty()) {
            Text("Cannot edit: missing job id/slug.")
            return
        }

        JobUpsertForm(
            heading = job.title,
            initial = job,
            submitLabel = "Save changes",
        ) { payload ->
            api.updateJob("Bearer ${bearerToken}", routeId!!, payload)
            onSaved()
        }
    }
}

@Composable
private fun ProfileUi(
    personas: List<String>,
    email: String?,
    emailVerified: Boolean,
    onLogout: () -> Unit,
) {
    Column {
        Text(
            email?.let { "$it (${if (emailVerified) "verified" else "unverified"})" }
                ?: "(not logged in)",
        )
        Spacer(Modifier.height(8.dp))
        Text("Personas: ${personas.joinToString()}")

        Spacer(Modifier.height(16.dp))

        PlatformLoginButton(
            label = "Login with Auth0",
            onAccessToken = { SessionStore.setAccess(it) },
            onError = { err -> println("login err: $err") },
        )

        Spacer(Modifier.height(16.dp))

        TextButton(onClick = onLogout) {
            Text("Logout")
        }
    }
}

@Composable
private fun JobUpsertForm(
    heading: String,
    initial: JobJson?,
    submitLabel: String,
    /** Called on the main dispatcher from a button click; suspend for network. */
    onSubmit: suspend (JobUpsertPayload) -> Unit,
) {
    val scope = rememberCoroutineScope()
    var titleV by remember(heading, initial?.id, initial?.slug) {
        mutableStateOf(initial?.title ?: "")
    }
    var location by remember(initial) {
        mutableStateOf(initial?.location ?: "")
    }
    var emp by remember(initial) {
        mutableStateOf(initial?.employmentType ?: "full-time")
    }
    var desc by remember(initial) {
        mutableStateOf(initial?.description ?: "")
    }
    var resp by remember(initial) {
        mutableStateOf(initial?.responsibilities ?: "")
    }
    var req by remember(initial) {
        mutableStateOf(initial?.requirements ?: "")
    }
    var how by remember(initial) {
        mutableStateOf(initial?.howToApply ?: "")
    }
    var expires by remember(initial) {
        mutableStateOf(
            initial?.expiresAt?.takeIf { it.isNotBlank() }
                ?: "2099-12-31T00:00:00.000Z",
        )
    }
    var salMin by remember(initial) {
        mutableStateOf((initial?.salaryRange?.min ?: 0.0).toString())
    }
    var salMax by remember(initial) {
        mutableStateOf((initial?.salaryRange?.max ?: 0.0).toString())
    }
    var cats by remember(initial) {
        mutableStateOf(initial?.categories?.joinToString(", ") ?: "")
    }
    var error by remember { mutableStateOf<String?>(null) }
    var working by remember { mutableStateOf(false) }

    Text(heading, style = MaterialTheme.typography.h6)
    Spacer(Modifier.height(8.dp))

    Column {
        OutlinedTextField(titleV, { titleV = it }, label = { Text("Title") })
        OutlinedTextField(location, { location = it }, label = { Text("Location") })
        OutlinedTextField(emp, { emp = it }, label = { Text("Employment type") })
        OutlinedTextField(desc, { desc = it }, label = { Text("Description") }, minLines = 3)
        OutlinedTextField(resp, { resp = it }, label = { Text("Responsibilities") }, minLines = 2)
        OutlinedTextField(req, { req = it }, label = { Text("Requirements") }, minLines = 2)
        OutlinedTextField(how, { how = it }, label = { Text("How to apply") }, minLines = 2)
        OutlinedTextField(expires, { expires = it }, label = { Text("Expires at (ISO)") })
        Row(Modifier.fillMaxWidth()) {
            OutlinedTextField(
                salMin,
                { salMin = it },
                modifier = Modifier.weight(1f),
                label = { Text("Salary min") },
                singleLine = true,
            )
            Spacer(Modifier.width(8.dp))
            OutlinedTextField(
                salMax,
                { salMax = it },
                modifier = Modifier.weight(1f),
                label = { Text("Salary max") },
                singleLine = true,
            )
        }
        OutlinedTextField(cats, { cats = it }, label = { Text("Categories (comma)") })

        error?.let {
            Text(
                it,
                color = MaterialTheme.colors.error,
                modifier = Modifier.padding(vertical = 4.dp),
            )
        }

        TextButton(
            onClick = {
                scope.launch {
                    error = null
                    working = true
                    try {
                        val sr =
                            SalaryRangeDto(
                                min = salMin.toDoubleOrNull() ?: 0.0,
                                max = salMax.toDoubleOrNull() ?: 0.0,
                                currency = initial?.salaryRange?.currency ?: "JMD",
                            )
                        val payload =
                            JobUpsertPayload(
                                title = titleV.trim(),
                                location = location.trim(),
                                employmentType = emp.trim(),
                                description = desc,
                                responsibilities = resp,
                                requirements = req,
                                howToApply = how,
                                salaryRange = sr,
                                categories =
                                    cats.split(',')
                                        .map { s -> s.trim() }
                                        .filter { x -> x.isNotEmpty() },
                                tags = initial?.tags ?: emptyList(),
                                expiresAt = expires.trim(),
                                screeningQuestions =
                                    initial?.screeningQuestions ?: emptyList<ScreeningQuestionDto>(),
                                skills = initial?.skills ?: emptyList(),
                                benefits = initial?.benefits ?: emptyList(),
                                reviewerEmails = initial?.reviewerEmails ?: emptyList(),
                            )
                        runCatching { onSubmit(payload) }
                            .onFailure { e ->
                                error = e.message ?: e.toString()
                            }
                    } finally {
                        working = false
                    }
                }
            },
            enabled = !working,
        ) {
            Text(if (working) "…" else submitLabel)
        }
    }
}
