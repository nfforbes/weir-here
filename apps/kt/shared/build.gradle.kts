import java.util.Properties

plugins {
    kotlin("multiplatform")
    kotlin("plugin.serialization")
    id("com.android.library")
    id("org.jetbrains.compose")
}

val ktorVersion = "2.3.12"

val localProps =
    Properties().apply {
        val f = rootProject.rootDir.resolve("local.properties")
        if (f.exists()) f.inputStream().use { load(it) }
    }

fun quoted(s: String): String =
    '"' + s.replace("\\", "\\\\").replace("\"", "\\\"") + '"'

val apiUrl = (localProps["weir_here.api.url"] as String?) ?: "http://10.0.2.2:3000"
val auth0Domain = (localProps["weir_here.auth0.domain"] as String?) ?: ""
val auth0ClientId = (localProps["weir_here.auth0.clientId"] as String?) ?: ""
val auth0Audience = (localProps["weir_here.auth0.audience"] as String?) ?: ""

kotlin {
    androidTarget()

    listOf(
        iosX64(),
        iosArm64(),
        iosSimulatorArm64(),
    ).forEach { iosTarget ->
        iosTarget.binaries.framework {
            baseName = "shared"
            isStatic = true
        }
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation(compose.runtime)
                implementation(compose.foundation)
                implementation(compose.material)
                implementation(compose.ui)
                @OptIn(org.jetbrains.compose.ExperimentalComposeLibrary::class)
                implementation(compose.components.resources)

                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2")

                implementation("io.ktor:ktor-client-core:$ktorVersion")
                implementation("io.ktor:ktor-client-content-negotiation:$ktorVersion")
                implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")

                implementation("com.russhwolf:multiplatform-settings-no-arg:1.1.1")
                implementation("com.russhwolf:multiplatform-settings:1.1.1")
            }
        }

        val androidMain by getting {
            dependencies {
                api("androidx.activity:activity-compose:1.8.2")
                api("androidx.appcompat:appcompat:1.6.1")
                api("androidx.core:core-ktx:1.13.1")

                implementation("io.ktor:ktor-client-android:$ktorVersion")

                implementation("com.auth0.android:auth0:2.10.2")
            }
        }

        val iosArm64Main by getting
        val iosSimulatorArm64Main by getting
        val iosX64Main by getting

        val iosMain by creating {
            dependsOn(commonMain)
            dependencies {
                implementation("io.ktor:ktor-client-darwin:$ktorVersion")
            }

            iosX64Main.dependsOn(this)
            iosArm64Main.dependsOn(this)
            iosSimulatorArm64Main.dependsOn(this)
        }
    }
}

android {
    compileSdk = (findProperty("android.compileSdk") as String).toInt()
    namespace = "com.weirhere.shared"

    sourceSets["main"].manifest.srcFile("src/androidMain/AndroidManifest.xml")
    sourceSets["main"].res.srcDirs("src/androidMain/res")
    sourceSets["main"].resources.srcDirs("src/commonMain/resources")

    defaultConfig {
        minSdk = (findProperty("android.minSdk") as String).toInt()

        buildConfigField("String", "WEIR_HERE_API_URL", quoted(apiUrl))
        buildConfigField("String", "AUTH0_DOMAIN", quoted(auth0Domain))
        buildConfigField("String", "AUTH0_CLIENT_ID", quoted(auth0ClientId))
        buildConfigField("String", "AUTH0_AUDIENCE", quoted(auth0Audience))
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlin {
        jvmToolchain(17)
    }
}
