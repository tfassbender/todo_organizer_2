plugins {
    id("java")
    id("io.quarkus") version "3.8.1"
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(enforcedPlatform("io.quarkus:quarkus-bom:3.8.1"))
    implementation("io.quarkus:quarkus-resteasy-reactive")
    implementation("io.quarkus:quarkus-resteasy-reactive-jackson")
    implementation("jakarta.ws.rs:jakarta.ws.rs-api:3.1.0")
    implementation("com.vladsch.flexmark:flexmark-all:0.64.0") // markdown to html transformation

    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}