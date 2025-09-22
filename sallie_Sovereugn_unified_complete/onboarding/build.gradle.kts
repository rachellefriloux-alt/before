plugins {
  kotlin("jvm") version "2.2.0"
}

val kotestVersion = "5.8.0"

dependencies {
  implementation(kotlin("stdlib"))
  testImplementation("org.jetbrains.kotlin:kotlin-test")
  testImplementation("io.kotest:kotest-runner-junit5:$kotestVersion")
tasks.test {
  // Kotest requires JUnit Platform for running tests; this is correct even if only Kotest is used.
  useJUnitPlatform()
  testLogging {
    events("passed", "skipped", "failed")
  }
}
  }
}
