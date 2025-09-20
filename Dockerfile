# Dockerfile for Sallie JVM app
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY build/libs/Sallie-all.jar Sallie.jar
ENTRYPOINT ["java", "-jar", "Sallie.jar"]
# For environment variables, use Docker secrets or pass via --env-file
