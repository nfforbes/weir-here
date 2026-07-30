package com.weirhere.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.Card
import androidx.compose.material.Icon
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBox
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Face
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Star
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.weirhere.auth.PlatformLogoutButton
import org.jetbrains.compose.resources.ExperimentalResourceApi
import org.jetbrains.compose.resources.painterResource

data class LandingSolution(
    val id: String,
    val label: String,
    val title: String,
    val description: String,
    val imageResource: String,
    val icon: ImageVector,
    val gradient: List<Color>,
)

val LANDING_SOLUTIONS: List<LandingSolution> = listOf(
    LandingSolution(
        id = "staffing",
        label = "Staffing",
        title = "Staffing Solutions",
        description = "Efficiency meets excellence. We bridge the talent gap for healthcare institutions and private employers across Jamaica, delivering reliable staffing with unmatched speed.",
        imageResource = "solution_staffing.jpeg",
        icon = Icons.Filled.Build,
        gradient = listOf(Color(0xFF64B5F6), Color(0xFF1976D2)),
    ),
    LandingSolution(
        id = "medical",
        label = "Medical",
        title = "Medical Professionals",
        description = "Licensed physicians across various specialties to support short-term coverage, long-term assignments, and facility staffing needs. Skilled medical staff for hospitals, clinics, and healthcare facilities.",
        imageResource = "solution_medical.jpeg",
        icon = Icons.Filled.Favorite,
        gradient = listOf(Color(0xFFEF5350), Color(0xFFC62828)),
    ),
    LandingSolution(
        id = "physicians",
        label = "Physicians",
        title = "Physicians & Advanced Practice",
        description = "Access a network of physicians, nurse practitioners, physician assistants, and other advanced practice providers. We support hospitals, health systems, and practices with qualified clinicians for locum tenens, permanent, and contract-to-hire roles.",
        imageResource = "solution_physicians.jpeg",
        icon = Icons.Filled.AccountBox,
        gradient = listOf(Color(0xFF7E57C2), Color(0xFF4527A0)),
    ),
    LandingSolution(
        id = "rn",
        label = "RNs",
        title = "Registered Nurses",
        description = "Highly trained and certified nursing professionals available for hospitals, clinics, home-care settings, and specialty units across Jamaica.",
        imageResource = "solution_rn.jpeg",
        icon = Icons.Filled.Person,
        gradient = listOf(Color(0xFF4FC3F7), Color(0xFF0288D1)),
    ),
    LandingSolution(
        id = "lpn",
        label = "LPNs",
        title = "Licensed Practical Nurses",
        description = "We provide qualified Licensed Practical Nurses (LPNs) for hospitals, nursing homes, assisted living facilities, and outpatient clinics. Our LPNs are credential-verified and ready to support your patient care needs.",
        imageResource = "solution_lpn.jpeg",
        icon = Icons.Filled.AccountCircle,
        gradient = listOf(Color(0xFF81C784), Color(0xFF2E7D32)),
    ),
    LandingSolution(
        id = "geriatric",
        label = "Geriatric",
        title = "Geriatric Nurses",
        description = "We provide qualified geriatric nurses for senior care facilities, nursing homes, and assisted living communities. Our nurses are trained to deliver compassionate, person-centered care for older adults.",
        imageResource = "solution_geriatric.png",
        icon = Icons.Filled.Face,
        gradient = listOf(Color(0xFFFFB74D), Color(0xFFEF6C00)),
    ),
    LandingSolution(
        id = "babysitting",
        label = "Babysitting",
        title = "Babysitting Services",
        description = "Finding a trustworthy partner for your child's care shouldn't be stressful. We connect Jamaican families with vetted, compassionate, and highly qualified childcare professionals.",
        imageResource = "solution_babysitting.jpeg",
        icon = Icons.Filled.Star,
        gradient = listOf(Color(0xFFF48FB1), Color(0xFFC2185B)),
    ),
    LandingSolution(
        id = "domestic",
        label = "Domestic Care",
        title = "Domestic Care",
        description = "Quality care begins at home. We provide specialized support for seniors and families, ensuring your loved ones are cared for with dignity, patience, and professional expertise.",
        imageResource = "solution_domestic.jpeg",
        icon = Icons.Filled.Home,
        gradient = listOf(Color(0xFF4DB6AC), Color(0xFF00695C)),
    ),
    LandingSolution(
        id = "housekeeping",
        label = "Housekeeping",
        title = "Housekeeping",
        description = "Maintain a clean and comfortable environment with our professional housekeeping services. We provide vetted, reliable staff dedicated to ensuring your residential or commercial space is spotless.",
        imageResource = "solution_housekeeping.jpeg",
        icon = Icons.Filled.Place,
        gradient = listOf(Color(0xFFFFD54F), Color(0xFFF9A825)),
    ),
    LandingSolution(
        id = "tutoring",
        label = "Tutoring",
        title = "Tutoring",
        description = "Empower your academic journey with tutors who care. Whether you're preparing for national exams or need specialized subject support, our expert educators are here to help you excel.",
        imageResource = "solution_tutoring.jpeg",
        icon = Icons.Filled.Info,
        gradient = listOf(Color(0xFF9575CD), Color(0xFF512DA8)),
    ),
)

@OptIn(ExperimentalLayoutApi::class, ExperimentalResourceApi::class)
@Composable
fun LandingScreen(
    userName: String?,
    isLoggedIn: Boolean,
    showAdminPortal: Boolean,
    showProviderPortal: Boolean,
    onJobs: () -> Unit,
    onPayNow: () -> Unit,
    onLogin: () -> Unit,
    onLogout: () -> Unit,
    onAdminPortal: () -> Unit,
    onProviderPortal: () -> Unit,
    onSolution: (LandingSolution) -> Unit,
) {
    val uriHandler = LocalUriHandler.current
    val background = Color(0xFFF3F5F8)
    val displayName = userName?.trim()?.takeIf { it.isNotEmpty() }?.substringBefore(' ') ?: "there"
    val hasPortals = showAdminPortal || showProviderPortal

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(background)
            .statusBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Box(modifier = Modifier.fillMaxWidth()) {
            Image(
                painter = painterResource("weir_here_logo.png"),
                contentDescription = "Weir Here",
                modifier = Modifier
                    .align(Alignment.Center)
                    .fillMaxWidth(0.72f)
                    .height(96.dp),
                contentScale = ContentScale.Fit,
            )
            if (isLoggedIn) {
                Box(modifier = Modifier.align(Alignment.TopEnd)) {
                    PlatformLogoutButton(label = "Logout", onLogout = onLogout, iconOnly = true)
                }
            }
        }

        Spacer(Modifier.height(12.dp))

        if (isLoggedIn) {
            Text(
                "Hi $displayName",
                style = MaterialTheme.typography.h5,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1A237E),
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )
        } else {
            SquircleNavButton(
                label = "Login",
                icon = Icons.Filled.Lock,
                gradient = listOf(Color(0xFF64B5F6), Color(0xFF1565C0)),
                onClick = onLogin,
            )
        }

        Spacer(Modifier.height(20.dp))

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
                Text(
                    "Quick Navigation",
                    style = MaterialTheme.typography.h6,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1A237E),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 14.dp),
                )
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(20.dp, Alignment.CenterHorizontally),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.fillMaxWidth(),
                    maxItemsInEachRow = 3,
                ) {
                    SquircleNavButton(
                        label = "Jobs",
                        icon = Icons.Filled.Build,
                        gradient = listOf(Color(0xFF81C784), Color(0xFF2E7D32)),
                        onClick = onJobs,
                    )
                    SquircleNavButton(
                        label = "Pay Now",
                        icon = Icons.Filled.ShoppingCart,
                        gradient = listOf(Color(0xFFFFB74D), Color(0xFFEF6C00)),
                        onClick = onPayNow,
                    )
                    SquircleNavButton(
                        label = "WhatsApp",
                        icon = Icons.Filled.Phone,
                        gradient = listOf(Color(0xFF69F0AE), Color(0xFF25D366)),
                        onClick = {
                            uriHandler.openUri("https://wa.me/18765619970")
                        },
                    )
                }
            }
        }

        if (isLoggedIn && hasPortals) {
            Spacer(Modifier.height(18.dp))
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
                    Text(
                        "Portals",
                        style = MaterialTheme.typography.h6,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1A237E),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 14.dp),
                    )
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(20.dp, Alignment.CenterHorizontally),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.fillMaxWidth(),
                        maxItemsInEachRow = 3,
                    ) {
                        if (showAdminPortal) {
                            SquircleNavButton(
                                label = "Admin",
                                icon = Icons.Filled.Settings,
                                gradient = listOf(Color(0xFF90A4AE), Color(0xFF37474F)),
                                onClick = onAdminPortal,
                            )
                        }
                        if (showProviderPortal) {
                            SquircleNavButton(
                                label = "Provider",
                                icon = Icons.Filled.Favorite,
                                gradient = listOf(Color(0xFF4FC3F7), Color(0xFF0277BD)),
                                onClick = onProviderPortal,
                            )
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(18.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(28.dp),
            backgroundColor = Color.White,
            elevation = 4.dp,
        ) {
            Column(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 18.dp),
            ) {
                Text(
                    "Solutions",
                    style = MaterialTheme.typography.h6,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1A237E),
                    modifier = Modifier.padding(bottom = 14.dp),
                )
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(14.dp, Alignment.CenterHorizontally),
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                    modifier = Modifier.fillMaxWidth(),
                    maxItemsInEachRow = 4,
                ) {
                    LANDING_SOLUTIONS.forEach { solution ->
                        SquircleNavButton(
                            label = solution.label,
                            icon = solution.icon,
                            gradient = solution.gradient,
                            onClick = { onSolution(solution) },
                            size = 68.dp,
                            iconSize = 30.dp,
                        )
                    }
                }
            }
        }

        Spacer(Modifier.height(24.dp))
    }
}

@OptIn(ExperimentalResourceApi::class)
@Composable
fun SolutionPageScreen(
    solution: LandingSolution,
    onBack: () -> Unit,
) {
    val background = Color(0xFFF3F5F8)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(background)
            .statusBarsPadding(),
    ) {
        BackNavButton(
            label = "Back",
            onClick = onBack,
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 8.dp),
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                elevation = 3.dp,
                backgroundColor = Color.White,
            ) {
                Column {
                    Image(
                        painter = painterResource(solution.imageResource),
                        contentDescription = solution.title,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(220.dp)
                            .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)),
                        contentScale = ContentScale.Crop,
                    )
                    Column(Modifier.padding(20.dp)) {
                        RowIconTitle(solution)
                        Spacer(Modifier.height(12.dp))
                        Text(
                            solution.description,
                            style = MaterialTheme.typography.body1,
                            color = Color(0xFF37474F),
                            lineHeight = 22.sp,
                        )
                    }
                }
            }
            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun RowIconTitle(solution: LandingSolution) {
    Column {
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(Brush.verticalGradient(solution.gradient)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = solution.icon,
                contentDescription = null,
                tint = Color.White,
                modifier = Modifier.size(24.dp),
            )
        }
        Spacer(Modifier.height(12.dp))
        Text(
            solution.title,
            style = MaterialTheme.typography.h5,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1A237E),
        )
    }
}

@Composable
fun SquircleNavButton(
    label: String,
    icon: ImageVector,
    gradient: List<Color>,
    onClick: () -> Unit,
    size: androidx.compose.ui.unit.Dp = 76.dp,
    iconSize: androidx.compose.ui.unit.Dp = 34.dp,
    enabled: Boolean = true,
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.width(size + 8.dp),
    ) {
        Box(
            modifier = Modifier
                .size(size)
                .shadow(6.dp, RoundedCornerShape(22.dp), clip = false)
                .clip(RoundedCornerShape(22.dp))
                .background(Brush.verticalGradient(gradient))
                .then(
                    if (enabled) Modifier.clickable(onClick = onClick) else Modifier,
                ),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = Color.White,
                modifier = Modifier.size(iconSize),
            )
        }
        Spacer(Modifier.height(8.dp))
        Text(
            text = label,
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp,
            color = Color(0xFF212121),
            textAlign = TextAlign.Center,
            maxLines = 2,
            lineHeight = 14.sp,
        )
    }
}
