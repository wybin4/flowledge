plugins {
    kotlin("jvm") version "1.9.25"
    `maven-publish`
}

group = "flowledge"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation(kotlin("stdlib"))
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

publishing {
    publications {
        create<MavenPublication>("common") {
            from(components["kotlin"])
        }
    }
    repositories {
        mavenLocal()
    }
}

dependencies {
    implementation("org.slf4j:slf4j-api:2.0.7")
    implementation("ch.qos.logback:logback-classic:1.4.14")
}
