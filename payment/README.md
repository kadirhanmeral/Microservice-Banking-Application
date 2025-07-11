# Payment Service

A microservice for handling payment operations in a banking system.

## Features

- Process payments
- Payment status tracking
- Payment audit logging
- Integration with Account Service
- RabbitMQ message queue integration
- Eureka service discovery
- Swagger API documentation

## Prerequisites

- Java 17
- Maven
- MySQL
- RabbitMQ
- Eureka Server

## Configuration

The service can be configured through `application.yml`. Key configurations include:

- Database connection
- RabbitMQ settings
- Eureka client settings
- Security settings

## Running the Service

1. Start the required services (MySQL, RabbitMQ, Eureka)
2. Build the project:
   ```bash
   mvn clean install
   ```
3. Run the service:
   ```bash
   mvn spring-boot:run
   ```

## API Documentation

Once the service is running, you can access the Swagger UI at:
```
http://localhost:8080/swagger-ui.html
```

## Security

The service uses Spring Security with basic authentication. Default credentials:
- Username: admin
- Password: admin (should be changed in production)

## Monitoring

Actuator endpoints are available at:
```
http://localhost:8080/actuator
```

## Development

### Project Structure

```
src/main/java/com/bank/payment/
├── config/         # Configuration classes
├── controller/     # REST controllers
├── dto/           # Data Transfer Objects
├── exception/     # Custom exceptions
├── model/         # Entity classes
├── repository/    # JPA repositories
├── service/       # Business logic
└── messaging/     # Message queue handlers
```

### Adding New Features

1. Create necessary DTOs
2. Add entity classes if needed
3. Create repository interfaces
4. Implement service layer
5. Add controller endpoints
6. Add appropriate exception handling
7. Update documentation

## Testing

Run tests using:
```bash
mvn test
``` 