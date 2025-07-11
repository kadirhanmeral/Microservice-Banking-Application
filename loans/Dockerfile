FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

COPY target/*.jar app.jar

COPY opentelemetry-javaagent.jar ./libs/opentelemetry-javaagent-2.11.0.jar

EXPOSE 8080

ENV JAVA_TOOL_OPTIONS="-javaagent:/app/libs/opentelemetry-javaagent-2.11.0.jar"

ENTRYPOINT ["java", "-jar", "app.jar"]