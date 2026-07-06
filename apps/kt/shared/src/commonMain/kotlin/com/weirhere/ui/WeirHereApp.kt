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
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
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
import com.weirhere.platform.isScreenshotMode
import com.weirhere.platform.screenshotLaunchTab
import com.weirhere.rbac.hasAdministrator
import com.weirhere.rbac.canAccessProviderPortal
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.jetbrains.compose.resources.ExperimentalResourceApi
import org.jetbrains.compose.resources.painterResource

private enum class Tab { JOBS, PAYMENT, ADMIN, PROVIDER, PROFILE }

private fun jobRouteId(job: JobJson): String? {
    val id = job.id?.trim().orEmpty()
    if (id.isNotEmpty()) return id
    val slug = job.slug.trim()
    return slug.takeIf { it.isNotEmpty() }
}

@Composable
fun WeirHereApp() {
    val scope = rememberCoroutineScope()
    val screenshotMode = remember { isScreenshotMode() }
    val screenshotTab = remember { screenshotLaunchTab() }
    DisposableEffect(Unit) {
        SessionStore.initWith(Settings())
        onDispose {}
    }

    val api = remember { WeirHereApi() }

    var tab by remember {
        mutableStateOf(
            when (screenshotTab) {
                "payment", "payment-banking" -> Tab.PAYMENT
                "profile" -> Tab.PROFILE
                else -> Tab.JOBS
            },
        )
    }
    var jobs by remember {
        mutableStateOf(if (screenshotMode) screenshotMockJobs else emptyList())
    }
    var loadingJobs by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }
    var personas by remember { mutableStateOf<List<String>>(emptyList()) }
    var emailVerified by remember { mutableStateOf(false) }
    var bootEmail by remember { mutableStateOf<String?>(null) }
    var bootName by remember { mutableStateOf<String?>(null) }
    var bootUpdatedAt by remember { mutableStateOf<String?>(null) }
    var showSplash by remember { mutableStateOf(!screenshotMode) }
    var publicJobsPage by remember { mutableStateOf(1) }
    var applyJob by remember { mutableStateOf<JobJson?>(null) }
    var showAlreadyApplied by remember { mutableStateOf(false) }
    var returnToJobsAfterLogin by remember { mutableStateOf(false) }

    var accessToken by remember { mutableStateOf<String?>(SessionStore.readSync()) }
    val bootstrapLoading = !accessToken.isNullOrBlank() && bootEmail == null

    LaunchedEffect(Unit) {
        SessionStore.accessToken.collect { accessToken = it }
    }

    LaunchedEffect(accessToken) {
        val tok = accessToken?.trim().orEmpty()
        if (tok.isEmpty()) {
            personas = emptyList()
            bootEmail = null
            bootName = null
            bootUpdatedAt = null
            returnToJobsAfterLogin = false
            return@LaunchedEffect
        }
        runCatching { api.bootstrap("Bearer ${tok}") }
            .onSuccess { userBootstrap ->
                if (userBootstrap != null) {
                    personas = userBootstrap.personas
                    emailVerified = userBootstrap.emailVerified
                    bootEmail = userBootstrap.email
                    bootName = userBootstrap.name
                    bootUpdatedAt = userBootstrap.updatedAt
                    if (hasAdministrator(userBootstrap.personas) && tab == Tab.PROFILE) {
                        tab = Tab.ADMIN
                    } else if (returnToJobsAfterLogin && tab == Tab.PROFILE) {
                        tab = Tab.JOBS
                        returnToJobsAfterLogin = false
                    }
                }
            }
            .onFailure {
                if (it is kotlinx.coroutines.CancellationException) throw it
                if (it is ApiUnauthorizedException) {
                    SessionStore.setAccess(null)
                    personas = emptyList()
                    bootEmail = null
                    bootName = null
                    bootUpdatedAt = null
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

    LaunchedEffect(publicJobsPage) {
        if (!screenshotMode) {
            reloadPublic()
        }
    }

    LaunchedEffect(Unit) {
        if (!screenshotMode) {
            delay(2500)
            showSplash = false
        }
    }

    LaunchedEffect(personas, tab) {
        if (tab == Tab.PROVIDER && !canAccessProviderPortal(personas)) {
            tab = Tab.JOBS
        }
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
                    modifier = Modifier.statusBarsPadding(),
                    backgroundColor = MaterialTheme.colors.primary,
                    title = {
                        Box(
                            Modifier.fillMaxWidth(),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text("Weir Here", textAlign = TextAlign.Center)
                        }
                    },
                    navigationIcon = {
                        Spacer(Modifier.width(48.dp))
                    },
                    actions = {
                        androidx.compose.material.IconButton(onClick = { tab = Tab.PROFILE }) {
                            androidx.compose.material.Icon(
                                imageVector = Icons.Filled.Person,
                                contentDescription = "Profile",
                            )
                        }
                    },
                )
            },
            bottomBar = {
                BottomNavigation(Modifier.navigationBarsPadding()) {
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
                        selected = tab == Tab.PAYMENT,
                        onClick = { tab = Tab.PAYMENT },
                        label = { Text("Payment") },
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
                        selected = tab == Tab.PROVIDER,
                        onClick = { tab = Tab.PROVIDER },
                        label = { Text("Provider") },
                        enabled = canAccessProviderPortal(personas),
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
                    Tab.JOBS ->
                        Box(Modifier.weight(1f).fillMaxWidth()) {
                            JobListUi(
                                loading = loadingJobs,
                                jobs = jobs,
                                page = publicJobsPage,
                                onPageChange = { publicJobsPage = it },
                                accessToken = accessToken,
                                onLoginRequest = {
                                    returnToJobsAfterLogin = true
                                    tab = Tab.PROFILE
                                },
                                onApplyRequest = { job -> applyJob = job },
                            )
                        }

                    Tab.PAYMENT ->
                        PaymentUi(
                            modifier = Modifier.weight(1f).fillMaxWidth(),
                            initialView =
                                if (screenshotTab == "payment-banking") {
                                    "BANKING"
                                } else {
                                    "MENU"
                                },
                        )

                    Tab.ADMIN ->
                        Box(Modifier.weight(1f).fillMaxWidth()) {
                            if (hasAdministrator(personas)) {
                                AdminDashboardUi(api = api, accessToken = accessToken)
                            } else {
                                Text("Only administrators can access the admin dashboard.")
                            }
                        }

                    Tab.PROVIDER ->
                        Box(Modifier.weight(1f).fillMaxWidth()) {
                            if (canAccessProviderPortal(personas)) {
                                ProviderUi(
                                    api = api,
                                    accessToken = accessToken,
                                    userEmail = bootEmail,
                                    onRefresh = {},
                                )
                            } else {
                                Text("Only providers can access the provider portal.")
                            }
                        }

                    Tab.PROFILE ->
                        Box(Modifier.weight(1f).fillMaxWidth()) {
                            ProfileUi(
                                bootstrapLoading = bootstrapLoading,
                                name = bootName,
                                email = bootEmail,
                                lastLogin = formatLastLogin(bootUpdatedAt, SessionStore.lastLoginAt()),
                                onLoginError = { message = it },
                                onLogout = {
                                    scope.launch {
                                        SessionStore.setAccess(null)
                                        message = "Logged out"
                                        tab = Tab.JOBS
                                    }
                                },
                                onBack = { tab = Tab.JOBS },
                            )
                        }
                }

                applyJob?.let { job ->
                    ApplyJobDialog(
                        job = job,
                        api = api,
                        accessToken = accessToken?.trim().orEmpty(),
                        onDismiss = { applyJob = null },
                        onSuccess = { message = "Application submitted successfully!" },
                        onAlreadyApplied = { showAlreadyApplied = true },
                        onError = { message = it },
                    )
                }

                if (showAlreadyApplied) {
                    androidx.compose.material.AlertDialog(
                        onDismissRequest = { showAlreadyApplied = false },
                        title = { Text("Already applied") },
                        text = { Text("You have already applied for this job.") },
                        confirmButton = {
                            TextButton(onClick = { showAlreadyApplied = false }) { Text("OK") }
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
            BackNavButton(
                label = "Back to Jobs",
                onClick = { selectedJobId = null },
            )
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
                    Text("${it.location} Â· ${it.employmentType}")
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
private fun AdminDashboardUi(api: WeirHereApi, accessToken: String?) {
    val bearer = accessToken?.trim().orEmpty()
    if (bearer.isEmpty()) {
        Text("Sign in using the profile icon before accessing the admin dashboard.")
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
            BackNavButton(
                label = "Back to Menu",
                onClick = { currentView = "MENU" },
                modifier = Modifier.padding(bottom = 8.dp),
            )
            when (currentView) {
                "JOBS" -> AdminJobsUi(api = api, accessToken = accessToken)
                "POST_JOB" -> PostJobUi(api = api, accessToken = accessToken)
                "USERS"   -> AdminUsersUi(api = api, accessToken = accessToken)
                "PROVIDERS" -> AdminProvidersUi(api = api, accessToken = accessToken)
                "CLIENTS" -> AdminClientsUi(api = api, accessToken = accessToken)
                "ASSIGNMENTS" -> AdminAssignmentsUi(api = api, accessToken = accessToken)
                "REPORTS" -> AdminReportsUi(api = api, accessToken = accessToken)
                "SETTINGS" -> AdminSettingsUi(api = api, accessToken = accessToken)
                "TESTIMONIALS" -> AdminTestimonialsUi(api = api, accessToken = accessToken)
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
        Text("Sign in using the profile icon before posting.")
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
internal fun EditJobScreen(
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
    bootstrapLoading: Boolean,
    name: String?,
    email: String?,
    lastLogin: String,
    onLoginError: (String) -> Unit,
    onLogout: () -> Unit,
    onBack: () -> Unit,
) {
    val isLoggedIn = email != null

    if (!isLoggedIn) {
        Box(
            Modifier.fillMaxSize().padding(16.dp),
            contentAlignment = androidx.compose.ui.Alignment.Center,
        ) {
            if (bootstrapLoading) {
                Column(horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally) {
                    CircularProgressIndicator()
                    Spacer(Modifier.height(12.dp))
                    Text("Signing in…", style = MaterialTheme.typography.body1)
                }
            } else {
                PlatformLoginButton(
                    label = "Login",
                    onAccessToken = { SessionStore.setAccess(it) },
                    onError = onLoginError,
                )
            }
        }
        return
    }

    Column(
        Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState()),
        horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally,
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
        ) {
            androidx.compose.material.Icon(
                imageVector = Icons.Filled.ArrowBack,
                contentDescription = "Back",
                modifier = Modifier.size(28.dp).clickable { onBack() },
            )
            Text("Profile", style = MaterialTheme.typography.h6, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.size(28.dp))
        }
        Spacer(Modifier.height(24.dp))

        androidx.compose.material.Icon(
            imageVector = Icons.Filled.AccountCircle,
            contentDescription = "Avatar",
            modifier = Modifier.size(120.dp),
            tint = Color.Black,
        )

        Spacer(Modifier.height(24.dp))
        ProfileField("Name", name?.ifBlank { "â€”" } ?: "â€”", enabled = true)
        ProfileField("Email", email ?: "", enabled = true, trailingIcon = Icons.Filled.Email)
        ProfileField("Last login", lastLogin, enabled = true)

        Spacer(Modifier.height(24.dp))
        PlatformLogoutButton(label = "Logout", onLogout = onLogout)
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
internal fun JobUpsertForm(
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
            Text(if (working) "â€¦" else submitLabel)
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
        Text("${job.location} Â· ${job.employmentType}", style = MaterialTheme.typography.subtitle1)
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
            "${filtered.size} user(s) Â· page ${page + 1} of $pageCount",
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
            BackNavButton(
                label = "Back to Jobs",
                onClick = { selectedJob = null },
                modifier = Modifier.padding(bottom = 8.dp),
            )
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
                            Text("${job.location} â€¢ ${job.employmentType}", style = MaterialTheme.typography.body2, color = Color.Gray)
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
