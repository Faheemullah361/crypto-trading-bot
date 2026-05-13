FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/crypto-trading-app-1.0-SNAPSHOT.jar app.jar
EXPOSE 10000
ENV PORT=10000
ENTRYPOINT ["java", "-jar", "app.jar"]
