plugins {
    kotlin("jvm") version "1.9.25"
    `maven-publish`
}

group = "eduflow"
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
        create<MavenPublication>("coretypings") {
            from(components["kotlin"])
        }
    }
    repositories {
        mavenLocal()
    }
}