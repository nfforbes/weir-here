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
        versionCode = 2
        versionName = "2.0"
        manifestPlaceholders["auth0Domain"] = "n4consulting.us.auth0.com"
        manifestPlaceholders["auth0Scheme"] = "weirhere"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlin {
        jvmToolchain(17)
    }
}
