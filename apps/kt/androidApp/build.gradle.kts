import java.util.Properties

plugins {
    kotlin("multiplatform")
    id("com.android.application")
    id("org.jetbrains.compose")
}

val localProps = Properties().apply {
    val f = rootProject.rootDir.resolve("local.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}
val auth0Domain = (localProps["weir_here.auth0.domain"] as String?) ?: "example.auth0.com"

fun propOrEnv(name: String): String? =
    (findProperty(name) as String?)?.takeIf { it.isNotBlank() }
        ?: System.getenv(name)?.takeIf { it.isNotBlank() }

val releaseVersionCode =
    propOrEnv("VERSION_CODE")?.toIntOrNull()
        ?: 4
val releaseVersionName =
    propOrEnv("VERSION_NAME")
        ?: "4.0"

val keystorePath = propOrEnv("ANDROID_KEYSTORE_PATH")
val keystorePassword = propOrEnv("ANDROID_KEYSTORE_PASSWORD")
val keyAlias = propOrEnv("ANDROID_KEY_ALIAS")
val keyPassword = propOrEnv("ANDROID_KEY_PASSWORD")
val hasReleaseSigning =
    !keystorePath.isNullOrBlank() &&
        !keystorePassword.isNullOrBlank() &&
        !keyAlias.isNullOrBlank() &&
        !keyPassword.isNullOrBlank()

kotlin {
    androidTarget()
    sourceSets {
        val androidMain by getting {
            dependencies {
                implementation(project(":shared"))
            }
        }
    }
}

android {
    compileSdk = (findProperty("android.compileSdk") as String).toInt()
    namespace = "com.weirhere"

    sourceSets["main"].manifest.srcFile("src/androidMain/AndroidManifest.xml")

    defaultConfig {
        applicationId = "com.weirhere.mobile"
        minSdk = (findProperty("android.minSdk") as String).toInt()
        targetSdk = (findProperty("android.targetSdk") as String).toInt()
        versionCode = releaseVersionCode
        versionName = releaseVersionName
        manifestPlaceholders["auth0Domain"] = "n4consulting.us.auth0.com"
        manifestPlaceholders["auth0Scheme"] = "weirhere"
    }

    signingConfigs {
        if (hasReleaseSigning) {
            create("release") {
                storeFile = file(keystorePath!!)
                storePassword = keystorePassword
                this.keyAlias = keyAlias
                this.keyPassword = keyPassword
            }
        }
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            if (hasReleaseSigning) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlin {
        jvmToolchain(17)
    }
}
