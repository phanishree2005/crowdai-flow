# Build Stage
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app
COPY pom.xml .
# Download dependencies for caching
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# Runtime Stage
FROM flink:1.18-java17

# Copy the fat jar to the Flink job directory
COPY --from=builder /app/target/analytics-1.0-SNAPSHOT.jar /opt/flink/usrlib/analytics.jar

# Flink's entrypoint will handle running the cluster or job
# Command can be overridden by docker-compose to specify jobmanager/taskmanager
