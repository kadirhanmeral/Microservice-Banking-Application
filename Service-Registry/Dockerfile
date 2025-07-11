FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY target/*.jar app.jar

COPY opentelemetry-javaagent.jar ./libs/opentelemetry-javaagent-2.11.0.jar

EXPOSE 8761

ENV JAVA_TOOL_OPTIONS="-javaagent:/app/libs/opentelemetry-javaagent-2.11.0.jar"

ENTRYPOINT ["java", "-jar", "app.jar"]