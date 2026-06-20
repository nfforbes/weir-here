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
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.Image
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Add
import androidx.compose.ui.unit.sp
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.russhwolf.settings.Settings
import com.weirhere.auth.PlatformLoginButton
import com.weirhere.auth.PlatformLogoutButton
import com.weirhere.data.SessionStore
import com.weirhere.model.AdminUserDto
import com.weirhere.model.JobJson
import com.weirhere.model.JobUpsertPayload
import com.weirhere.model.ScreeningQuestionDto
import com.weirhere.model.SalaryRangeDto
import com.weirhere.network.WeirHereApi
import com.weirhere.network.ApiUnauthorizedException
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
    var publicJobsPage by remember { mutableStateOf(1) }

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
            .onSuccess { userBootstrap ->
                if (userBootstrap != null) {
                    personas = userBootstrap.personas
                    emailVerified = userBootstrap.emailVerified
                    bootEmail = userBootstrap.email
                    if (hasAdministrator(userBootstrap.personas) && tab == Tab.PROFILE) {
                        tab = Tab.ADMIN
                    }
                }
            }
            .onFailure {
                if (it is kotlinx.coroutines.CancellationException) throw it
                if (it is ApiUnauthorizedException) {
                    SessionStore.setAccess(null)
                    personas = emptyList()
                    bootEmail = null
                    message = "Session expired. Please sign in again."
                } else {
                    message = "Bootstrap failed: ${it.message ?: it}"
                }
            }
    }

    fun reloadPublic() {
        scope.launch {
            loadingJobs = true
            runCatching { api.listJobs(page = publicJobsPage, limit = 10) }
                .onSuccess { jobs = it.jobs }
                .onFailure {
                    if (it is kotlinx.coroutines.CancellationException) throw it
                    message = it.message ?: it.toString()
                }
            loadingJobs = false
        }
    }

    fun reloadMine() {
        val tok = accessToken?.trim().orEmpty()
        if (tok.isEmpty()) return
        scope.launch {
            runCatching { api.listMyJobs("Bearer ${tok}") }
                .onSuccess { myJobs = it.jobs }
                .onFailure {
                    if (it is kotlinx.coroutines.CancellationException) throw it
                    message = it.message ?: it.toString()
                }
        }
    }

    LaunchedEffect(publicJobsPage) {
        reloadPublic()
    }

    LaunchedEffect(Unit) {
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

    val customColors = androidx.compose.material.lightColors(
        primary = androidx.compose.ui.graphics.Color.Black, // Black background for menus
        onPrimary = androidx.compose.ui.graphics.Color(0xFFCFAF5B) // Custom Gold text/icons
    )
    MaterialTheme(colors = customColors) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { 
                        Text(
                            "Weir Here", 
                            modifier = Modifier.fillMaxWidth(), 
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        ) 
                    },
                    actions = {
                        androidx.compose.material.IconButton(onClick = { tab = Tab.PROFILE }) {
                            androidx.compose.material.Icon(
                                imageVector = Icons.Filled.Person,
                                contentDescription = "Login"
                            )
                        }
                    }
                )
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
                    Tab.JOBS -> JobListUi(
                        loading = loadingJobs, 
                        jobs = jobs,
                        page = publicJobsPage,
                        onPageChange = { publicJobsPage = it },
                        accessToken = accessToken,
                        onLoginRequest = { tab = Tab.PROFILE },
                        onApplyRequest = { job ->
                            val tok = accessToken?.trim().orEmpty()
                            if (tok.isEmpty()) return@JobListUi
                            scope.launch {
                                runCatching { 
                                    api.applyToJob(
                                        tok, 
                                        com.weirhere.model.ApplicationPayload(job.id ?: job.slug)
                                    ) 
                                }
                                .onSuccess { message = "Application submitted successfully!" }
                                .onFailure {
                                    if (it is kotlinx.coroutines.CancellationException) throw it
                                    message = "Failed to apply: ${it.message ?: it.toString()}"
                                }
                            }
                        }
                    )

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

                    Tab.PROFILE -> ProfileUi(
                        personas = personas,
                        email = bootEmail,
                        emailVerified = emailVerified,
                        onLogout = {
                            val tok = accessToken?.trim().orEmpty()
                            scope.launch {
                                SessionStore.setAccess(null)
                                message = "Logged out"
                                tab = Tab.JOBS
                            }
                        },
                        onBack = { tab = Tab.JOBS }
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
    page: Int,
    onPageChange: (Int) -> Unit,
    accessToken: String?,
    onLoginRequest: () -> Unit,
    onApplyRequest: (JobJson) -> Unit
) {
    var selectedJobId by remember { mutableStateOf<String?>(null) }

    val selectedJob = jobs.find { (it.id ?: it.slug) == selectedJobId }
    if (selectedJobId != null && selectedJob != null) {
        Column(Modifier.fillMaxSize()) {
            TextButton(onClick = { selectedJobId = null }) {
                Text("← Back to Jobs")
            }
            JobDetailsUi(selectedJob, accessToken, onLoginRequest, onApplyRequest)
        }
        return
    }

    if (loading) {
        CircularProgressIndicator(Modifier.padding(24.dp))
    }
    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 16.dp),
    ) {
        itemsIndexed(jobs, key = { _, it -> "${it.slug}-${it.id}" }) { index, it ->
            val jobId = it.id ?: it.slug
            val isSelected = selectedJobId == jobId
            val bgColor = if (isSelected) {
                MaterialTheme.colors.primary.copy(alpha = 0.3f)
            } else if (index % 2 == 0) {
                MaterialTheme.colors.surface
            } else {
                androidx.compose.ui.graphics.Color(0xFFEEEEEE)
            }

            Card(
                Modifier
                    .padding(vertical = 4.dp)
                    .clickable { selectedJobId = jobId },
                backgroundColor = bgColor
            ) {
                Column(Modifier.padding(12.dp)) {
                    Text(it.title, style = MaterialTheme.typography.h6)
                    Text("${it.location} · ${it.employmentType}")
                    Text(it.description, maxLines = 3)
                }
            }
        }
        item {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
            ) {
                TextButton(
                    onClick = { onPageChange(page - 1) },
                    enabled = page > 1
                ) {
                    Text("Previous")
                }
                Text("Page $page")
                TextButton(
                    onClick = { onPageChange(page + 1) },
                    enabled = jobs.size == 10
                ) {
                    Text("Next")
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
        itemsIndexed(myJobs, key = { _, it -> "${it.slug}-${it.id}" }) { index, it ->
            val jobId = it.id ?: it.slug
            val targetId = editTarget?.id ?: editTarget?.slug
            val isSelected = targetId != null && targetId == jobId
            val bgColor = if (isSelected) {
                MaterialTheme.colors.primary.copy(alpha = 0.3f)
            } else if (index % 2 == 0) {
                MaterialTheme.colors.surface
            } else {
                androidx.compose.ui.graphics.Color(0xFFEEEEEE)
            }

            Card(
                Modifier
                    .padding(vertical = 4.dp)
                    .clickable(enabled = admin) {
                        if (admin) editTarget = it
                    },
                backgroundColor = bgColor
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
                "Jobs" to "JOBS",
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
                "JOBS" -> AdminJobsUi(api = api, accessToken = accessToken)
                "POST_JOB" -> PostJobUi(api = api, accessToken = accessToken)
                "USERS"   -> AdminUsersUi(api = api, accessToken = accessToken)
                "PROVIDERS" -> AdminProvidersUi(api = api, accessToken = accessToken)
                "CLIENTS" -> AdminClientsUi(api = api, accessToken = accessToken)
                "ASSIGNMENTS" -> AdminAssignmentsUi(api = api, accessToken = accessToken)
                "CONFIGURATION" -> AdminConfigurationUi(api = api, accessToken = accessToken)
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
    onBack: () -> Unit,
) {
    val isLoggedIn = email != null

    Column(
        Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState()),
        horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
        ) {
            androidx.compose.material.Icon(
                imageVector = Icons.Filled.ArrowBack,
                contentDescription = "Back",
                modifier = Modifier.size(28.dp).clickable { onBack() }
            )
            Text("Profile", style = MaterialTheme.typography.h6, fontWeight = FontWeight.Bold)
            if (isLoggedIn) {
                androidx.compose.material.Icon(
                    imageVector = Icons.Filled.Edit,
                    contentDescription = "Edit",
                    modifier = Modifier.size(28.dp).clickable { /* no op */ }
                )
            } else {
                Spacer(modifier = Modifier.size(28.dp))
            }
        }
        Spacer(Modifier.height(24.dp))

        // Avatar
        Box(contentAlignment = androidx.compose.ui.Alignment.BottomEnd) {
            androidx.compose.material.Icon(
                imageVector = Icons.Filled.AccountCircle,
                contentDescription = "Avatar",
                modifier = Modifier.size(120.dp),
                tint = if (isLoggedIn) Color.Black else Color.LightGray
            )
            if (isLoggedIn) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .padding(4.dp)
                        .background(Color.White, shape = CircleShape)
                        .border(1.dp, Color.LightGray, shape = CircleShape),
                    contentAlignment = androidx.compose.ui.Alignment.Center
                ) {
                    androidx.compose.material.Icon(
                        imageVector = Icons.Filled.Edit,
                        contentDescription = "Edit Avatar",
                        modifier = Modifier.size(16.dp),
                        tint = Color.Black
                    )
                }
            }
        }
        
        Spacer(Modifier.height(24.dp))

        // Tabs (General / Location)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(40.dp)
                .background(Color(0xFFF0F0F0), shape = RoundedCornerShape(8.dp))
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .background(Color(0xFF2D1E5A), shape = RoundedCornerShape(8.dp)),
                contentAlignment = androidx.compose.ui.Alignment.Center
            ) {
                Text("General", color = Color.White, fontWeight = FontWeight.Bold)
            }
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight(),
                contentAlignment = androidx.compose.ui.Alignment.Center
            ) {
                Text("Location", color = Color.Gray, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(Modifier.height(24.dp))

        // Fields
        ProfileField("Name", if (isLoggedIn) "John Doe" else "", isLoggedIn)
        ProfileField("Email", if (isLoggedIn) email ?: "" else "", isLoggedIn, trailingIcon = Icons.Filled.Email)
        ProfileField("Roll Number", if (isLoggedIn) "202XXXXXX" else "", isLoggedIn)
        ProfileField("Date of Birth", if (isLoggedIn) "23/05/19XX" else "", isLoggedIn, trailingIcon = Icons.Filled.ArrowDropDown)
        ProfileField("Aadhaar Number", if (isLoggedIn) "3802 0999 XXXX" else "", isLoggedIn)

        Spacer(Modifier.height(24.dp))

        if (isLoggedIn) {
            androidx.compose.material.Button(
                onClick = { /* Save changes no-op */ },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = androidx.compose.material.ButtonDefaults.buttonColors(backgroundColor = Color(0xFF2D1E5A)),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Save changes", color = Color.White, fontSize = 16.sp)
            }
            Spacer(Modifier.height(16.dp))
            PlatformLogoutButton(label = "Logout", onLogout = onLogout)
        } else {
            Text("Logged out", color = Color.Gray, style = MaterialTheme.typography.subtitle1)
            Spacer(Modifier.height(16.dp))
            PlatformLoginButton(
                label = "Login with Auth0",
                onAccessToken = { SessionStore.setAccess(it) },
                onError = { err -> println("login err: $err") },
            )
        }
    }
}

@Composable
fun ProfileField(label: String, value: String, enabled: Boolean, trailingIcon: androidx.compose.ui.graphics.vector.ImageVector? = null) {
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
        Text(label, style = MaterialTheme.typography.subtitle2, fontWeight = FontWeight.Bold, color = if (enabled) Color.Black else Color.Gray)
        Spacer(Modifier.height(4.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(if (enabled) Color(0xFFF5F5F5) else Color(0xFFE0E0E0), shape = RoundedCornerShape(4.dp))
                .border(1.dp, Color(0xFFE0E0E0), shape = RoundedCornerShape(4.dp))
                .padding(12.dp),
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(value.ifEmpty { if (enabled) "XXXXXXXXXXXXXX" else "" }, color = if (enabled) Color.Gray else Color.LightGray)
            if (trailingIcon != null) {
                androidx.compose.material.Icon(imageVector = trailingIcon, contentDescription = null, tint = Color.Gray)
            }
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

@Composable
private fun JobDetailsUi(
    job: JobJson,
    accessToken: String?,
    onLoginRequest: () -> Unit,
    onApplyRequest: (JobJson) -> Unit
) {
    Column(Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
        Text(job.title, style = MaterialTheme.typography.h4)
        Text("${job.location} · ${job.employmentType}", style = MaterialTheme.typography.subtitle1)
        Spacer(Modifier.height(16.dp))
        Text("Description", style = MaterialTheme.typography.h6)
        Text(job.description)
        Spacer(Modifier.height(8.dp))
        Text("Responsibilities", style = MaterialTheme.typography.h6)
        Text(job.responsibilities)
        Spacer(Modifier.height(8.dp))
        Text("Requirements", style = MaterialTheme.typography.h6)
        Text(job.requirements)
        Spacer(Modifier.height(8.dp))
        Text("How to Apply", style = MaterialTheme.typography.h6)
        Text(job.howToApply)
        Spacer(Modifier.height(16.dp))

        if (accessToken.isNullOrBlank()) {
            androidx.compose.material.Button(onClick = onLoginRequest) {
                Text("Log in to Apply")
            }
        } else {
            androidx.compose.material.Button(onClick = { onApplyRequest(job) }) {
                Text("Apply Now")
            }
        }

        Spacer(Modifier.height(32.dp))
    }
}

@Composable
private fun AdminUsersUi(api: WeirHereApi, accessToken: String?) {
    val scope = rememberCoroutineScope()
    val tok = accessToken?.trim().orEmpty()

    var users by remember { mutableStateOf<List<com.weirhere.model.AdminUserDto>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var success by remember { mutableStateOf<String?>(null) }
    var search by remember { mutableStateOf("") }
    var page by remember { mutableStateOf(0) }
    val rowsPerPage = 10

    var editTarget by remember { mutableStateOf<com.weirhere.model.AdminUserDto?>(null) }
    var editIsAdmin by remember { mutableStateOf(false) }
    var editIsUser by remember { mutableStateOf(false) }
    var editIsProvider by remember { mutableStateOf(false) }
    var saving by remember { mutableStateOf(false) }

    var deleteTarget by remember { mutableStateOf<com.weirhere.model.AdminUserDto?>(null) }

    var inviteOpen by remember { mutableStateOf(false) }
    var inviteEmail by remember { mutableStateOf("") }
    var inviteUser by remember { mutableStateOf(true) }
    var inviteProvider by remember { mutableStateOf(false) }
    var inviteAdmin by remember { mutableStateOf(false) }

    fun reload() {
        scope.launch {
            loading = true
            error = null
            runCatching { api.listAdminUsers(tok) }
                .onSuccess { users = it.users }
                .onFailure {
                    if (it is kotlinx.coroutines.CancellationException) throw it
                    error = it.message ?: it.toString()
                }
            loading = false
        }
    }

    LaunchedEffect(tok) { reload() }

    LaunchedEffect(search) { page = 0 }

    if (loading) {
        CircularProgressIndicator(Modifier.padding(24.dp))
        return
    }

    val filtered = remember(users, search) {
        if (search.isBlank()) users
        else {
            val q = search.trim().lowercase()
            users.filter {
                it.email.lowercase().contains(q) ||
                    it.name.lowercase().contains(q) ||
                    it.auth0Id.lowercase().contains(q)
            }
        }
    }

    val pageCount = remember(filtered.size, rowsPerPage) {
        if (filtered.isEmpty()) 1 else ((filtered.size - 1) / rowsPerPage) + 1
    }
    val safePage = page.coerceIn(0, (pageCount - 1).coerceAtLeast(0))
    if (safePage != page) page = safePage

    val paginated = remember(filtered, page, rowsPerPage) {
        val start = page * rowsPerPage
        filtered.drop(start).take(rowsPerPage)
    }

    fun personaChipLabel(persona: String): String =
        when (persona) {
            "administrator" -> "Admin"
            "provider" -> "Provider"
            else -> "User"
        }

    fun personaChipColor(persona: String): Color =
        when (persona) {
            "administrator" -> Color(0xFF2D1E5A)
            "provider" -> Color(0xFF1565C0)
            else -> Color(0xFF757575)
        }

    editTarget?.let { target ->
        androidx.compose.material.AlertDialog(
            onDismissRequest = { if (!saving) editTarget = null },
            title = { Text("Edit Roles") },
            text = {
                Column {
                    Text(target.name, fontWeight = FontWeight.Bold)
                    Text(target.email, style = MaterialTheme.typography.body2)
                    Spacer(Modifier.height(12.dp))
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        androidx.compose.material.Checkbox(
                            checked = editIsUser,
                            onCheckedChange = { editIsUser = it },
                            enabled = !saving,
                        )
                        Text("User")
                    }
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        androidx.compose.material.Checkbox(
                            checked = editIsProvider,
                            onCheckedChange = { editIsProvider = it },
                            enabled = !saving,
                        )
                        Text("Provider")
                    }
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        androidx.compose.material.Checkbox(
                            checked = editIsAdmin,
                            onCheckedChange = { editIsAdmin = it },
                            enabled = !saving,
                        )
                        Text("Administrator")
                    }
                }
            },
            confirmButton = {
                androidx.compose.material.Button(
                    onClick = {
                        val personas = buildList<String> {
                            if (editIsUser) add("user")
                            if (editIsProvider) add("provider")
                            if (editIsAdmin) add("administrator")
                        }
                        if (personas.isEmpty()) {
                            error = "Select at least one role."
                            return@Button
                        }
                        scope.launch {
                            saving = true
                            runCatching { api.updateUserPersonas(tok, target.id, personas) }
                                .onSuccess {
                                    editTarget = null
                                    success = "Saved roles."
                                    reload()
                                }
                                .onFailure {
                                    if (it is kotlinx.coroutines.CancellationException) throw it
                                    error = it.message ?: it.toString()
                                }
                            saving = false
                        }
                    },
                    enabled = !saving,
                ) { Text("Save") }
            },
            dismissButton = {
                TextButton(onClick = { if (!saving) editTarget = null }) { Text("Cancel") }
            },
        )
    }

    if (inviteOpen) {
        androidx.compose.material.AlertDialog(
            onDismissRequest = { if (!saving) inviteOpen = false },
            title = { Text("Invite User") },
            text = {
                Column {
                    OutlinedTextField(
                        value = inviteEmail,
                        onValueChange = { inviteEmail = it },
                        label = { Text("Email") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                    )
                    Spacer(Modifier.height(8.dp))
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        androidx.compose.material.Checkbox(
                            checked = inviteUser,
                            onCheckedChange = { inviteUser = it },
                            enabled = !saving,
                        )
                        Text("User")
                    }
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        androidx.compose.material.Checkbox(
                            checked = inviteProvider,
                            onCheckedChange = { inviteProvider = it },
                            enabled = !saving,
                        )
                        Text("Provider")
                    }
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        androidx.compose.material.Checkbox(
                            checked = inviteAdmin,
                            onCheckedChange = { inviteAdmin = it },
                            enabled = !saving,
                        )
                        Text("Administrator")
                    }
                }
            },
            confirmButton = {
                androidx.compose.material.Button(
                    onClick = {
                        if (inviteEmail.isBlank()) {
                            error = "Email is required"
                            return@Button
                        }
                        val roles = buildList<String> {
                            if (inviteUser) add("user")
                            if (inviteProvider) add("provider")
                            if (inviteAdmin) add("administrator")
                        }
                        if (roles.isEmpty()) {
                            error = "Select at least one role."
                            return@Button
                        }
                        scope.launch {
                            saving = true
                            runCatching { api.inviteAdminUser(tok, inviteEmail, roles) }
                                .onSuccess {
                                    inviteOpen = false
                                    inviteEmail = ""
                                    inviteUser = true
                                    inviteProvider = false
                                    inviteAdmin = false
                                    success = "Invite sent successfully."
                                }
                                .onFailure {
                                    if (it is kotlinx.coroutines.CancellationException) throw it
                                    error = it.message ?: it.toString()
                                }
                            saving = false
                        }
                    },
                    enabled = !saving,
                ) { Text("Send Invite") }
            },
            dismissButton = {
                TextButton(onClick = { if (!saving) inviteOpen = false }) { Text("Cancel") }
            },
        )
    }

    deleteTarget?.let { target ->
        androidx.compose.material.AlertDialog(
            onDismissRequest = { if (!saving) deleteTarget = null },
            title = { Text("Remove user?") },
            text = { Text("Delete ${target.name} (${target.email}) from the app database?") },
            confirmButton = {
                androidx.compose.material.Button(
                    onClick = {
                        scope.launch {
                            saving = true
                            runCatching { api.deleteAdminUser(tok, target.id) }
                                .onSuccess {
                                    deleteTarget = null
                                    success = "User removed."
                                    reload()
                                }
                                .onFailure {
                                    if (it is kotlinx.coroutines.CancellationException) throw it
                                    error = it.message ?: it.toString()
                                }
                            saving = false
                        }
                    },
                    enabled = !saving,
                    colors = androidx.compose.material.ButtonDefaults.buttonColors(
                        backgroundColor = MaterialTheme.colors.error,
                        contentColor = Color.White,
                    ),
                ) { Text("Delete") }
            },
            dismissButton = {
                TextButton(onClick = { if (!saving) deleteTarget = null }) { Text("Cancel") }
            },
        )
    }

    Column(Modifier.fillMaxSize()) {
        error?.let {
            Text("Error: $it", color = MaterialTheme.colors.error, modifier = Modifier.padding(bottom = 4.dp))
            TextButton(onClick = { error = null; reload() }) { Text("Retry") }
        }

        success?.let {
            Card(Modifier.padding(bottom = 8.dp)) {
                Row(
                    Modifier.fillMaxWidth().padding(8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                ) {
                    Text(it, color = Color(0xFF388E3C))
                    TextButton(onClick = { success = null }) { Text("Dismiss") }
                }
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            OutlinedTextField(
                value = search,
                onValueChange = { search = it },
                label = { Text("Search name, email, or Auth0 id") },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
            TextButton(onClick = { inviteOpen = true }) { Text("Invite") }
            TextButton(onClick = { reload() }) { Text("Refresh") }
        }

        Text(
            "${filtered.size} user(s) · page ${page + 1} of $pageCount",
            style = MaterialTheme.typography.caption,
            modifier = Modifier.padding(bottom = 4.dp),
        )

        LazyColumn(Modifier.weight(1f)) {
            itemsIndexed(paginated, key = { _, u -> u.id }) { index, user ->
                val bgColor =
                    if (index % 2 == 0) MaterialTheme.colors.surface
                    else Color(0xFFEEEEEE)
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 3.dp),
                    backgroundColor = bgColor,
                    elevation = 1.dp,
                ) {
                    Column(Modifier.padding(horizontal = 12.dp, vertical = 8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                        ) {
                            Column(Modifier.weight(1f)) {
                                Text(
                                    user.name.ifBlank { "(no name)" },
                                    fontWeight = FontWeight.SemiBold,
                                    style = MaterialTheme.typography.body1,
                                )
                                Text(
                                    user.email,
                                    style = MaterialTheme.typography.caption,
                                    color = Color.Gray,
                                )
                                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    user.personas.forEach { persona ->
                                        Box(
                                            modifier = Modifier
                                                .background(
                                                    personaChipColor(persona),
                                                    shape = RoundedCornerShape(4.dp),
                                                )
                                                .padding(horizontal = 6.dp, vertical = 2.dp),
                                        ) {
                                            Text(
                                                personaChipLabel(persona),
                                                color = Color.White,
                                                style = MaterialTheme.typography.overline,
                                            )
                                        }
                                    }
                                    if (user.emailVerified) {
                                        Box(
                                            modifier = Modifier
                                                .background(
                                                    Color(0xFF388E3C),
                                                    shape = RoundedCornerShape(4.dp),
                                                )
                                                .padding(horizontal = 6.dp, vertical = 2.dp),
                                        ) {
                                            Text(
                                                "Verified",
                                                color = Color.White,
                                                style = MaterialTheme.typography.overline,
                                            )
                                        }
                                    }
                                }
                            }
                            Row {
                                TextButton(
                                    onClick = {
                                        editTarget = user
                                        editIsAdmin = user.personas.contains("administrator")
                                        editIsUser = user.personas.contains("user")
                                        editIsProvider = user.personas.contains("provider")
                                    },
                                ) { Text("Edit") }
                                TextButton(onClick = { deleteTarget = user }) {
                                    Text("Del", color = MaterialTheme.colors.error)
                                }
                            }
                        }
                    }
                }
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
        ) {
            TextButton(onClick = { page = (page - 1).coerceAtLeast(0) }, enabled = page > 0) {
                Text("Previous")
            }
            Text("${page + 1} / $pageCount")
            TextButton(
                onClick = { page = (page + 1).coerceAtMost(pageCount - 1) },
                enabled = page < pageCount - 1,
            ) {
                Text("Next")
            }
        }
    }
}

@Composable
private fun AdminJobsUi(api: WeirHereApi, accessToken: String?) {
    val scope = rememberCoroutineScope()
    val tok = accessToken?.trim().orEmpty()

    var jobs by remember { mutableStateOf<List<JobJson>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var page by remember { mutableStateOf(1) }
    var total by remember { mutableStateOf(0) }
    var selectedJob by remember { mutableStateOf<JobJson?>(null) }

    fun reload(pageNum: Int) {
        scope.launch {
            loading = true
            error = null
            runCatching { api.listJobs(tok, page = pageNum, limit = 10) }
                .onSuccess { 
                    jobs = it.jobs
                    total = it.total
                    page = it.page
                }
                .onFailure {
                    if (it is kotlinx.coroutines.CancellationException) throw it
                    error = it.message ?: it.toString()
                }
            loading = false
        }
    }

    LaunchedEffect(tok) { reload(1) }

    if (selectedJob != null) {
        Column(Modifier.fillMaxSize()) {
            TextButton(onClick = { selectedJob = null }, modifier = Modifier.padding(bottom = 8.dp)) {
                Text("← Back to Jobs")
            }
            AdminJobDetailUi(api = api, accessToken = tok, job = selectedJob!!)
        }
        return
    }

    if (loading) {
        CircularProgressIndicator(Modifier.padding(24.dp))
        return
    }

    error?.let {
        Text("Error: $it", color = MaterialTheme.colors.error)
        TextButton(onClick = { reload(page) }) { Text("Retry") }
        return
    }

    Column(Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
        ) {
            Text("All Jobs", style = MaterialTheme.typography.h6)
            TextButton(onClick = { reload(page) }) { Text("Refresh") }
        }

        if (jobs.isEmpty()) {
            Text("No jobs found.")
        } else {
            LazyColumn(Modifier.weight(1f)) {
                items(jobs, key = { it.id.orEmpty() }) { job ->
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).clickable { selectedJob = job },
                        elevation = 2.dp
                    ) {
                        Column(Modifier.padding(16.dp)) {
                            Text(job.title, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.subtitle1)
                            Text("${job.location} • ${job.employmentType}", style = MaterialTheme.typography.body2, color = Color.Gray)
                        }
                    }
                }
            }

            // Pagination Controls
            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
            ) {
                androidx.compose.material.Button(
                    onClick = { reload(page - 1) },
                    enabled = page > 1 && !loading
                ) { Text("Previous") }
                
                Text("Page $page")
                
                val hasMore = (page * 10) < total
                androidx.compose.material.Button(
                    onClick = { reload(page + 1) },
                    enabled = hasMore && !loading
                ) { Text("Next") }
            }
        }
    }
}

@Composable
private fun AdminJobDetailUi(api: WeirHereApi, accessToken: String, job: JobJson) {
    val scope = rememberCoroutineScope()
    var applications by remember { mutableStateOf<List<com.weirhere.model.ApplicationDto>>(emptyList()) }
    var reviewsByApp by remember { mutableStateOf<Map<String, List<com.weirhere.model.ReviewDto>>>(emptyMap()) }
    var loadingApps by remember { mutableStateOf(true) }
    var expandedAppId by remember { mutableStateOf<String?>(null) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(job.id) {
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

    LaunchedEffect(expandedAppId) {
        val appId = expandedAppId
        if (appId != null && !reviewsByApp.containsKey(appId)) {
            runCatching { api.listReviews(accessToken, appId) }
                .onSuccess { resp ->
                    reviewsByApp = reviewsByApp + (appId to resp.reviews)
                }
        }
    }

    Column(Modifier.fillMaxSize()) {
        Card(modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp), elevation = 2.dp) {
            Column(Modifier.padding(16.dp)) {
                Text(job.title, style = MaterialTheme.typography.h5, fontWeight = FontWeight.Bold)
                Text("${job.location} • ${job.employmentType}", color = Color.Gray)
                Spacer(Modifier.height(8.dp))
                Text("Total Applicants: ${applications.size}")
            }
        }

        if (loadingApps) {
            CircularProgressIndicator(Modifier.padding(16.dp))
        } else if (error != null) {
            Text("Error loading applications: $error", color = MaterialTheme.colors.error, modifier = Modifier.padding(16.dp))
        } else if (applications.isEmpty()) {
            Text("No applications yet for this job.", modifier = Modifier.padding(16.dp))
        } else {
            LazyColumn(Modifier.fillMaxSize()) {
                items(applications, key = { it.id.orEmpty() }) { app ->
                    val isExpanded = expandedAppId == app.id
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp).clickable { 
                            expandedAppId = if (isExpanded) null else app.id 
                        },
                        elevation = 1.dp
                    ) {
                        Column(Modifier.padding(16.dp)) {
                            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                Column {
                                    Text(app.applicantName, fontWeight = FontWeight.Bold)
                                    Text(app.applicantEmail, style = MaterialTheme.typography.body2, color = Color.Gray)
                                }
                                Box(
                                    modifier = Modifier.background(androidx.compose.ui.graphics.Color(0xFFE3F2FD), RoundedCornerShape(4.dp)).padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(app.status, color = androidx.compose.ui.graphics.Color(0xFF1565C0), style = MaterialTheme.typography.caption)
                                }
                            }
                            
                            if (isExpanded) {
                                Spacer(Modifier.height(16.dp))
                                Text("Screening Answers", fontWeight = FontWeight.SemiBold)
                                if (app.answers.isEmpty()) {
                                    Text("No screening answers.", style = MaterialTheme.typography.body2, color = Color.Gray)
                                } else {
                                    app.answers.forEach { ans ->
                                        val qText = job.screeningQuestions.find { it.id == ans.questionId }?.question ?: ans.questionId
                                        Text("Q: $qText", style = MaterialTheme.typography.caption, fontWeight = FontWeight.Medium, modifier = Modifier.padding(top = 4.dp))
                                        Text("A: ${ans.answer}", style = MaterialTheme.typography.body2)
                                    }
                                }

                                Spacer(Modifier.height(16.dp))
                                Text("Reviews", fontWeight = FontWeight.SemiBold)
                                val reviews = reviewsByApp[app.id.orEmpty()]
                                if (reviews == null) {
                                    CircularProgressIndicator(Modifier.size(20.dp).padding(top = 8.dp))
                                } else if (reviews.isEmpty()) {
                                    Text("No reviews yet.", style = MaterialTheme.typography.body2, color = Color.Gray)
                                } else {
                                    reviews.forEach { rev ->
                                        Column(Modifier.padding(top = 4.dp).background(Color(0xFFFAFAFA)).padding(8.dp).fillMaxWidth()) {
                                            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                                Text("Rating: ${rev.rating}/10", style = MaterialTheme.typography.body2, fontWeight = FontWeight.Medium)
                                                if (rev.eliminated) {
                                                    Text("Eliminated", style = MaterialTheme.typography.body2, color = MaterialTheme.colors.error)
                                                }
                                            }
                                            if (rev.notes.isNotBlank()) {
                                                Text(rev.notes, style = MaterialTheme.typography.caption)
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
}

@Composable
private fun AdminProvidersUi(api: WeirHereApi, accessToken: String?) {
    val scope = rememberCoroutineScope()
    val tok = accessToken?.trim().orEmpty()
    var providers by remember { mutableStateOf<List<com.weirhere.model.ProviderDto>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var showAdd by remember { mutableStateOf(false) }

    fun reload() {
        if (tok.isEmpty()) return
        scope.launch {
            loading = true
            error = null
            runCatching { api.listProviders(tok) }
                .onSuccess { providers = it }
                .onFailure {
                    if (it is kotlinx.coroutines.CancellationException) throw it
                    error = it.message ?: it.toString()
                }
            loading = false
        }
    }

    LaunchedEffect(tok) { reload() }

    Column(Modifier.fillMaxSize()) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
            Text("Providers", style = MaterialTheme.typography.h5, fontWeight = FontWeight.Bold)
            androidx.compose.material.IconButton(onClick = { showAdd = true }) {
                androidx.compose.material.Icon(Icons.Filled.Add, "Add Provider")
            }
        }

        if (error != null) {
            Text("Error: $error", color = MaterialTheme.colors.error)
            TextButton(onClick = { reload() }) { Text("Retry") }
        }

        if (showAdd) {
            var name by remember { mutableStateOf("") }
            var email by remember { mutableStateOf("") }
            var address by remember { mutableStateOf("") }
            var phoneNumbers by remember { mutableStateOf<List<com.weirhere.model.PhoneNumberDto>>(emptyList()) }
            var saving by remember { mutableStateOf(false) }

            Card(Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Add Provider", style = MaterialTheme.typography.h6)
                    OutlinedTextField(name, { name = it }, label = { Text("Name *") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(email, { email = it }, label = { Text("Email *") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(address, { address = it }, label = { Text("Address") }, modifier = Modifier.fillMaxWidth(), minLines = 2)

                    Spacer(Modifier.height(8.dp))
                    Text("Phone Numbers", fontWeight = FontWeight.SemiBold)
                    phoneNumbers.forEachIndexed { idx, p ->
                        Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                            Text(p.number, modifier = Modifier.weight(1f))
                            Text(p.number, modifier = Modifier.weight(1f))
                            if (p.isBest) Text("(Best)", color = MaterialTheme.colors.primary, style = MaterialTheme.typography.caption)
                            androidx.compose.material.TextButton(onClick = { phoneNumbers = phoneNumbers.filterIndexed { i, _ -> i != idx } }) {
                                androidx.compose.material.Text("X", color = MaterialTheme.colors.error, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                    var newPhone by remember { mutableStateOf("") }
                    var newPhoneIsBest by remember { mutableStateOf(false) }
                    Row(Modifier.fillMaxWidth(), verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        OutlinedTextField(newPhone, { newPhone = it }, label = { Text("New Phone") }, modifier = Modifier.weight(1f))
                        Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                            androidx.compose.material.Checkbox(checked = newPhoneIsBest, onCheckedChange = { newPhoneIsBest = it })
                            Text("Best", style = MaterialTheme.typography.caption)
                        }
                        androidx.compose.material.TextButton(onClick = {
                            if (newPhone.isNotBlank()) {
                                phoneNumbers = phoneNumbers + com.weirhere.model.PhoneNumberDto(newPhone, newPhoneIsBest)
                                newPhone = ""
                                newPhoneIsBest = false
                            }
                        }) { Text("Add") }
                    }

                    Row(Modifier.padding(top = 8.dp)) {
                        androidx.compose.material.Button(
                            onClick = {
                                scope.launch {
                                    saving = true
                                    runCatching { api.createProvider(tok, com.weirhere.model.ProviderUpsertPayload(name = name, email = email, address = address, phoneNumbers = phoneNumbers)) }
                                        .onSuccess { 
                                            showAdd = false
                                            reload()
                                        }
                                        .onFailure {
                                            if (it !is kotlinx.coroutines.CancellationException) {
                                                error = it.message ?: it.toString()
                                            }
                                        }
                                    saving = false
                                }
                            },
                            enabled = !saving && name.isNotBlank() && email.isNotBlank()
                        ) { Text("Create") }
                        TextButton(onClick = { showAdd = false }) { Text("Cancel") }
                    }
                }
            }
        }

        if (loading) {
            CircularProgressIndicator(Modifier.padding(16.dp))
        } else {
            LazyColumn {
                items(providers) { prov ->
                    Card(Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                        Column(Modifier.padding(12.dp)) {
                            Text(prov.name, fontWeight = FontWeight.Bold)
                            if (!prov.email.isNullOrBlank()) Text(prov.email, style = MaterialTheme.typography.body2, color = MaterialTheme.colors.primary)
                            if (prov.address.isNotBlank()) Text(prov.address, style = MaterialTheme.typography.body2)
                            if (prov.phoneNumbers.isNotEmpty()) {
                                Text("Phones: " + prov.phoneNumbers.joinToString { if (it.isBest) "${it.number} (Best)" else it.number }, style = MaterialTheme.typography.body2)
                            }
                            if (prov.qualifications.isNotEmpty()) {
                                Text(prov.qualifications.joinToString { 
                                    if (!it.description.isNullOrBlank()) "${it.description} (${it.fileName})" else it.fileName 
                                }, style = MaterialTheme.typography.body2)
                            }
                            TextButton(onClick = {
                                scope.launch {
                                    runCatching { api.deleteProvider(tok, prov.id.orEmpty()) }
                                        .onSuccess { reload() }
                                }
                            }) { Text("Delete", color = MaterialTheme.colors.error) }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun AdminClientsUi(api: WeirHereApi, accessToken: String?) {
    val scope = rememberCoroutineScope()
    val tok = accessToken?.trim().orEmpty()
    var clients by remember { mutableStateOf<List<com.weirhere.model.ClientDto>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var showAdd by remember { mutableStateOf(false) }

    fun reload() {
        if (tok.isEmpty()) return
        scope.launch {
            loading = true
            error = null
            runCatching { api.listClients(tok) }
                .onSuccess { clients = it }
                .onFailure {
                    if (it is kotlinx.coroutines.CancellationException) throw it
                    error = it.message ?: it.toString()
                }
            loading = false
        }
    }

    LaunchedEffect(tok) { reload() }

    Column(Modifier.fillMaxSize()) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
            Text("Clients", style = MaterialTheme.typography.h5, fontWeight = FontWeight.Bold)
            androidx.compose.material.IconButton(onClick = { showAdd = true }) {
                androidx.compose.material.Icon(Icons.Filled.Add, "Add Client")
            }
        }

        if (error != null) {
            Text("Error: $error", color = MaterialTheme.colors.error)
            TextButton(onClick = { reload() }) { Text("Retry") }
        }

        if (showAdd) {
            var name by remember { mutableStateOf("") }
            var address by remember { mutableStateOf("") }
            var phoneNumbers by remember { mutableStateOf<List<com.weirhere.model.PhoneNumberDto>>(emptyList()) }
            var saving by remember { mutableStateOf(false) }

            Card(Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Add Client", style = MaterialTheme.typography.h6)
                    OutlinedTextField(name, { name = it }, label = { Text("Name") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(address, { address = it }, label = { Text("Address") }, modifier = Modifier.fillMaxWidth())

                    Spacer(Modifier.height(8.dp))
                    Text("Phone Numbers", fontWeight = FontWeight.SemiBold)
                    phoneNumbers.forEachIndexed { idx, p ->
                        Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                            Text(p.number, modifier = Modifier.weight(1f))
                            if (p.isBest) Text("(Best)", color = MaterialTheme.colors.primary, style = MaterialTheme.typography.caption)
                            androidx.compose.material.TextButton(onClick = { phoneNumbers = phoneNumbers.filterIndexed { i, _ -> i != idx } }) {
                                androidx.compose.material.Text("X", color = MaterialTheme.colors.error, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                    var newPhone by remember { mutableStateOf("") }
                    var newPhoneIsBest by remember { mutableStateOf(false) }
                    Row(Modifier.fillMaxWidth(), verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        OutlinedTextField(newPhone, { newPhone = it }, label = { Text("New Phone") }, modifier = Modifier.weight(1f))
                        Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                            androidx.compose.material.Checkbox(checked = newPhoneIsBest, onCheckedChange = { newPhoneIsBest = it })
                            Text("Best", style = MaterialTheme.typography.caption)
                        }
                        androidx.compose.material.TextButton(onClick = {
                            if (newPhone.isNotBlank()) {
                                phoneNumbers = phoneNumbers + com.weirhere.model.PhoneNumberDto(newPhone, newPhoneIsBest)
                                newPhone = ""
                                newPhoneIsBest = false
                            }
                        }) { Text("Add") }
                    }

                    Row(Modifier.padding(top = 8.dp)) {
                        androidx.compose.material.Button(
                            onClick = {
                                scope.launch {
                                    saving = true
                                    runCatching { api.createClient(tok, com.weirhere.model.ClientUpsertPayload(name = name, address = address, phoneNumbers = phoneNumbers)) }
                                        .onSuccess { 
                                            showAdd = false
                                            reload()
                                        }
                                        .onFailure {
                                            if (it !is kotlinx.coroutines.CancellationException) {
                                                error = it.message ?: it.toString()
                                            }
                                        }
                                    saving = false
                                }
                            },
                            enabled = !saving && name.isNotBlank() && address.isNotBlank()
                        ) { Text("Create") }
                        TextButton(onClick = { showAdd = false }) { Text("Cancel") }
                    }
                }
            }
        }

        if (loading) {
            CircularProgressIndicator(Modifier.padding(16.dp))
        } else {
            LazyColumn {
                items(clients) { cli ->
                    Card(Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                        Column(Modifier.padding(12.dp)) {
                            Text(cli.name, fontWeight = FontWeight.Bold)
                            Text(cli.address, style = MaterialTheme.typography.body2)
                            if (cli.phoneNumbers.isNotEmpty()) {
                                Text("Phones: " + cli.phoneNumbers.joinToString { if (it.isBest) "${it.number} (Best)" else it.number }, style = MaterialTheme.typography.body2)
                            }
                            TextButton(onClick = {
                                scope.launch {
                                    runCatching { api.deleteClient(tok, cli.id.orEmpty()) }
                                        .onSuccess { reload() }
                                }
                            }) { Text("Delete", color = MaterialTheme.colors.error) }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun AdminAssignmentsUi(api: WeirHereApi, accessToken: String?) {
    val scope = rememberCoroutineScope()
    val tok = accessToken?.trim().orEmpty()
    var assignments by remember { mutableStateOf<List<com.weirhere.model.AssignmentDto>>(emptyList()) }
    var clients by remember { mutableStateOf<List<com.weirhere.model.ClientDto>>(emptyList()) }
    var providers by remember { mutableStateOf<List<com.weirhere.model.ProviderDto>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var showAdd by remember { mutableStateOf(false) }

    fun reload() {
        if (tok.isEmpty()) return
        scope.launch {
            loading = true
            error = null
            runCatching { 
                val asgs = api.listAssignments(tok)
                val cls = api.listClients(tok)
                val prvs = api.listProviders(tok)
                assignments = asgs
                clients = cls
                providers = prvs
            }.onFailure {
                if (it is kotlinx.coroutines.CancellationException) throw it
                error = it.message ?: it.toString()
            }
            loading = false
        }
    }

    LaunchedEffect(tok) { reload() }

    Column(Modifier.fillMaxSize()) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
            Text("Assignments", style = MaterialTheme.typography.h5, fontWeight = FontWeight.Bold)
            androidx.compose.material.IconButton(onClick = { showAdd = true }) {
                androidx.compose.material.Icon(Icons.Filled.Add, "Add Assignment")
            }
        }

        if (error != null) {
            Text("Error: $error", color = MaterialTheme.colors.error)
            TextButton(onClick = { reload() }) { Text("Retry") }
        }

        if (showAdd) {
            var selectedClientId by remember { mutableStateOf("") }
            var selectedProviderId by remember { mutableStateOf("") }
            var desc by remember { mutableStateOf("") }
            var clientChargeStr by remember { mutableStateOf("0") }
            var providerPayStr by remember { mutableStateOf("0") }
            var providerHourlyRateStr by remember { mutableStateOf("0") }
            var serviceDate by remember { mutableStateOf("") }
            var saving by remember { mutableStateOf(false) }

            Card(Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Add Assignment", style = MaterialTheme.typography.h6)
                    
                    Text("Client ID (copy from clients)", style = MaterialTheme.typography.caption)
                    OutlinedTextField(selectedClientId, { selectedClientId = it }, label = { Text("Client ID") }, modifier = Modifier.fillMaxWidth())
                    
                    Text("Provider ID (copy from providers)", style = MaterialTheme.typography.caption)
                    OutlinedTextField(selectedProviderId, { selectedProviderId = it }, label = { Text("Provider ID") }, modifier = Modifier.fillMaxWidth())

                    OutlinedTextField(desc, { desc = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(clientChargeStr, { clientChargeStr = it }, label = { Text("Client Charge (Cents)") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(providerPayStr, { providerPayStr = it }, label = { Text("Provider Pay (Cents)") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(providerHourlyRateStr, { providerHourlyRateStr = it }, label = { Text("Provider Hourly Rate (Cents)") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(serviceDate, { serviceDate = it }, label = { Text("Service Date (YYYY-MM-DD)") }, modifier = Modifier.fillMaxWidth())
                    
                    Row(Modifier.padding(top = 8.dp)) {
                        androidx.compose.material.Button(
                            onClick = {
                                scope.launch {
                                    saving = true
                                    val payload = com.weirhere.model.AssignmentUpsertPayload(
                                        clientId = selectedClientId.trim(),
                                        providerId = selectedProviderId.trim(),
                                        clientChargeCents = clientChargeStr.toIntOrNull() ?: 0,
                                        providerPayCents = providerPayStr.toIntOrNull() ?: 0,
                                        providerHourlyRateCents = providerHourlyRateStr.toIntOrNull() ?: 0,
                                        description = desc,
                                        serviceDate = serviceDate.trim().ifEmpty { "2026-01-01T00:00:00Z" }
                                    )
                                    runCatching { api.createAssignment(tok, payload) }
                                        .onSuccess { 
                                            showAdd = false
                                            reload()
                                        }
                                        .onFailure {
                                            if (it !is kotlinx.coroutines.CancellationException) {
                                                error = it.message ?: it.toString()
                                            }
                                        }
                                    saving = false
                                }
                            },
                            enabled = !saving && selectedClientId.isNotBlank() && selectedProviderId.isNotBlank()
                        ) { Text("Create") }
                        TextButton(onClick = { showAdd = false }) { Text("Cancel") }
                    }
                }
            }
        }

        if (loading) {
            CircularProgressIndicator(Modifier.padding(16.dp))
        } else {
            LazyColumn {
                items(assignments) { asg ->
                    Card(Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                        Column(Modifier.padding(12.dp)) {
                            Text("Client: ${asg.clientId?.name ?: "Unknown"}", fontWeight = FontWeight.Bold)
                            Text("Provider: ${asg.providerId?.name ?: "Unknown"}", fontWeight = FontWeight.SemiBold)
                            Text("Service Date: ${asg.serviceDate}", style = MaterialTheme.typography.body2)
                            Text("Desc: ${asg.description}", style = MaterialTheme.typography.body2)
                            Text("Hourly Rate: ${asg.providerHourlyRateCents / 100.0}", style = MaterialTheme.typography.body2)
                            TextButton(onClick = {
                                scope.launch {
                                    runCatching { api.deleteAssignment(tok, asg.id.orEmpty()) }
                                        .onSuccess { reload() }
                                }
                            }) { Text("Delete", color = MaterialTheme.colors.error) }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun AdminConfigurationUi(api: WeirHereApi, accessToken: String?) {
    val scope = rememberCoroutineScope()
    val tok = accessToken?.trim().orEmpty()
    var values by remember { mutableStateOf(com.weirhere.model.ConfigValuesDto()) }
    var loading by remember { mutableStateOf(true) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var success by remember { mutableStateOf<String?>(null) }

    fun reload() {
        if (tok.isEmpty()) return
        scope.launch {
            loading = true
            error = null
            runCatching { api.getConfiguration(tok) }
                .onSuccess { values = it }
                .onFailure {
                    if (it is kotlinx.coroutines.CancellationException) throw it
                    error = it.message ?: it.toString()
                }
            loading = false
        }
    }

    LaunchedEffect(tok) { reload() }

    Column(Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
        Text("Configuration", style = MaterialTheme.typography.h5, fontWeight = FontWeight.Bold, modifier = Modifier.padding(bottom = 16.dp))

        if (error != null) {
            Text("Error: $error", color = MaterialTheme.colors.error, modifier = Modifier.padding(bottom = 8.dp))
        }
        if (success != null) {
            Text(success.orEmpty(), color = MaterialTheme.colors.primary, modifier = Modifier.padding(bottom = 8.dp))
        }

        if (loading) {
            CircularProgressIndicator(Modifier.align(androidx.compose.ui.Alignment.CenterHorizontally))
        } else {
            Card(Modifier.fillMaxWidth().padding(bottom = 16.dp)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Google Drive Integration", style = MaterialTheme.typography.h6, modifier = Modifier.padding(bottom = 8.dp))
                    Text("Configure OAuth2 credentials to enable document uploads.", style = MaterialTheme.typography.body2, color = MaterialTheme.colors.onSurface.copy(alpha = 0.7f), modifier = Modifier.padding(bottom = 16.dp))

                    OutlinedTextField(
                        value = values.gdrive_client_id,
                        onValueChange = { values = values.copy(gdrive_client_id = it) },
                        label = { Text("OAuth Client ID") },
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                    )

                    OutlinedTextField(
                        value = values.gdrive_client_secret,
                        onValueChange = { values = values.copy(gdrive_client_secret = it) },
                        label = { Text("OAuth Client Secret") },
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                    )

                    OutlinedTextField(
                        value = values.gdrive_refresh_token,
                        onValueChange = { values = values.copy(gdrive_refresh_token = it) },
                        label = { Text("OAuth Refresh Token") },
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                    )

                    OutlinedTextField(
                        value = values.gdrive_folder_id,
                        onValueChange = { values = values.copy(gdrive_folder_id = it) },
                        label = { Text("Target Folder ID (optional)") },
                        modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
                    )
                }
            }

            androidx.compose.material.Button(
                onClick = {
                    scope.launch {
                        saving = true
                        error = null
                        success = null
                        runCatching { api.updateConfiguration(tok, values) }
                            .onSuccess { success = "Configuration saved successfully" }
                            .onFailure {
                                if (it !is kotlinx.coroutines.CancellationException) {
                                    error = it.message ?: it.toString()
                                }
                            }
                        saving = false
                    }
                },
                enabled = !saving,
                modifier = Modifier.fillMaxWidth()
            ) {
                if (saving) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp), color = MaterialTheme.colors.onPrimary)
                } else {
                    Text("Save Configuration")
                }
            }
        }
    }
}

