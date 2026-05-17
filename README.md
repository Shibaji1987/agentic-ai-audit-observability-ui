# Agentic AI Audit Observability UI

Enterprise Angular UI for the Agentic AI audit observability platform. This repository is intentionally separate from the Spring Boot backend service.

## Development Server

Run `npm start` for a dev server and open `http://localhost:4200/`.

API calls under `/audit`, `/knowledge`, and `/ai` are proxied to the Spring Boot backend at `http://localhost:8080` through `proxy.conf.json`.

## Backend Dependency

Start the backend separately from the `spring-ai-service` project:

```powershell
cd C:\Users\User\Downloads\spring-ai-service
mvn spring-boot:run
```

## Build

Run `npm run build` to build the project. The build artifacts are written to `dist/agentic-ai-audit-observability-ui`.

## Tests

Run `npm test` to execute the unit tests via Karma.
