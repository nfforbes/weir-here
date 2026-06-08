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
import androidx.compose.foundation.layout.Row
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
                message = "Bootstrap failed: ${it.message ?: it}"
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
                "USERS"   -> AdminUsersUi(api = api, accessToken = accessToken)
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
            TextButton(onClick = onLogout) {
                Text("Logout")
            }
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
    var search by remember { mutableStateOf("") }

    // Edit dialog state
    var editTarget by remember { mutableStateOf<com.weirhere.model.AdminUserDto?>(null) }
    var editIsAdmin by remember { mutableStateOf(false) }
    var editIsUser by remember { mutableStateOf(false) }
    var saving by remember { mutableStateOf(false) }

    // Delete dialog state
    var deleteTarget by remember { mutableStateOf<com.weirhere.model.AdminUserDto?>(null) }

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

    if (loading) {
        CircularProgressIndicator(Modifier.padding(24.dp))
        return
    }

    error?.let {
        Text("Error: $it", color = MaterialTheme.colors.error)
        TextButton(onClick = { reload() }) { Text("Retry") }
        return
    }

    val filtered = remember(users, search) {
        if (search.isBlank()) users
        else {
            val q = search.trim().lowercase()
            users.filter {
                it.email.lowercase().contains(q) ||
                it.name.lowercase().contains(q)
            }
        }
    }

    // Edit dialog
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
                            enabled = !saving
                        )
                        Text("User")
                    }
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        androidx.compose.material.Checkbox(
                            checked = editIsAdmin,
                            onCheckedChange = { editIsAdmin = it },
                            enabled = !saving
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
                            if (editIsAdmin) add("administrator")
                        }
                        if (personas.isEmpty()) { error = "Select at least one role."; return@Button }
                        scope.launch {
                            saving = true
                            runCatching { api.updateUserPersonas(tok, target.id, personas) }
                                .onSuccess { editTarget = null; reload() }
                                .onFailure {
                                    if (it is kotlinx.coroutines.CancellationException) throw it
                                    error = it.message ?: it.toString()
                                }
                            saving = false
                        }
                    },
                    enabled = !saving
                ) { Text("Save") }
            },
            dismissButton = {
                TextButton(onClick = { if (!saving) editTarget = null }) { Text("Cancel") }
            }
        )
    }

    // Delete dialog
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
                                .onSuccess { deleteTarget = null; reload() }
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
                        contentColor = Color.White
                    )
                ) { Text("Delete") }
            },
            dismissButton = {
                TextButton(onClick = { if (!saving) deleteTarget = null }) { Text("Cancel") }
            }
        )
    }

    // Search bar + refresh
    Row(
        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
        verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        OutlinedTextField(
            value = search,
            onValueChange = { search = it },
            label = { Text("Search name or email") },
            modifier = Modifier.weight(1f),
            singleLine = true
        )
        TextButton(onClick = { reload() }) { Text("Refresh") }
    }

    Text(
        "${filtered.size} user(s)",
        style = MaterialTheme.typography.caption,
        modifier = Modifier.padding(bottom = 4.dp)
    )

    LazyColumn(Modifier.fillMaxSize()) {
        itemsIndexed(filtered, key = { _, u -> u.id }) { index, user ->
            val bgColor = if (index % 2 == 0) MaterialTheme.colors.surface
                          else androidx.compose.ui.graphics.Color(0xFFEEEEEE)
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 3.dp),
                backgroundColor = bgColor,
                elevation = 1.dp
            ) {
                Column(Modifier.padding(horizontal = 12.dp, vertical = 8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
                    ) {
                        Column(Modifier.weight(1f)) {
                            Text(
                                user.name.ifBlank { "(no name)" },
                                fontWeight = FontWeight.SemiBold,
                                style = MaterialTheme.typography.body1
                            )
                            Text(
                                user.email,
                                style = MaterialTheme.typography.caption,
                                color = Color.Gray
                            )
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                user.personas.forEach { persona ->
                                    val label = if (persona == "administrator") "Admin" else "User"
                                    val chipColor = if (persona == "administrator")
                                        androidx.compose.ui.graphics.Color(0xFF2D1E5A)
                                    else MaterialTheme.colors.secondary
                                    Box(
                                        modifier = Modifier
                                            .background(chipColor, shape = RoundedCornerShape(4.dp))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(label, color = Color.White, style = MaterialTheme.typography.overline)
                                    }
                                }
                                if (user.emailVerified) {
                                    Box(
                                        modifier = Modifier
                                            .background(
                                                androidx.compose.ui.graphics.Color(0xFF388E3C),
                                                shape = RoundedCornerShape(4.dp)
                                            )
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text("Verified", color = Color.White, style = MaterialTheme.typography.overline)
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
                                }
                            ) { Text("Edit") }
                            TextButton(
                                onClick = { deleteTarget = user }
                            ) {
                                Text("Del", color = MaterialTheme.colors.error)
                            }
                        }
                    }
                }
            }
        }
    }
}
