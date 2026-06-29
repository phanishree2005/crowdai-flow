# CrowdFlow AI Enterprise

## Executive Summary
CrowdFlow AI Enterprise is a production-grade, globally scalable crowd intelligence platform. It ingests high-throughput telemetry from 50,000+ edge devices, leverages real-time computer vision feeds, performs spatial-temporal forecasting, and uses AI-assisted copilot agents for operational decision support.

## High-Level Architecture
The platform utilizes a modern event-driven architecture based on CQRS and Event Sourcing.
- **Ingestion**: Go-based microservices writing to Kafka.
- **Routing**: Rust-based dynamic graph analytics.
- **Analytics**: Apache Flink for real-time windowing.
- **ML/CV**: PyTorch & OpenCV for edge and central inference.

## ASCII Dataflow
```text
[Edge Devices] --> (API Gateway / Envoy) --> [Telemetry Ingest (Go)] --> (Kafka) 
                                                                             |--> [Flink Analytics]
                                                                             |--> [Routing Engine (Rust)]
                                                                             |--> [AI Copilot / Qdrant]
```

## Repository Layout
```text
.
├── api/            # Protobuf and OpenAPI specs
├── deploy/         # Kubernetes, Helm, Terraform
├── docs/           # Architecture, runbooks, threat models
├── observability/  # Prometheus, Grafana, Jaeger config
├── scripts/        # CI/CD and utility scripts
└── src/            # Microservices (Go, Rust, Python)
```

## Technology Stack
- **Languages**: Go, Rust, Python, TypeScript
- **Infrastructure**: Kubernetes, Terraform, Helm
- **Data & Streaming**: Kafka, Redis, TimescaleDB
- **MLOps**: PyTorch, Triton, LangGraph, Qdrant

## Design Principles
- **Hexagonal Architecture**: strict separation of domain from IO.
- **Fail Fast**: circuit breaking on all external calls.
- **Observability First**: 100% trace coverage via OpenTelemetry.

## Quick Start
1. `make bootstrap`
2. `make up` (starts Kafka, Redis, Telemetry)

## Local Development
We provide a comprehensive `.devcontainer` and Docker Compose override structure. See `docs/operations.md`.

## CI/CD Workflow
Powered by GitHub Actions, featuring automated linting (golangci-lint, clippy), Trivy vulnerability scanning, semantic release, and ArgoCD GitOps deployment.

## Observability
Integrated OpenTelemetry tracing, Prometheus metrics, and Grafana dashboards.

## Security Model
Strict mTLS via Istio, OAuth2/OIDC authentication, and ABAC authorization.

## Scaling Strategy
Stateless services scale horizontally via HPA. Kafka scales via partition expansion.

## Deployment Guide
See `docs/deployment.md`.

## Performance Targets
- **Telemetry P99**: < 20ms
- **Routing P99**: < 5ms
- **Concurrency**: 50,000+ devices

## Architecture Decision Records Index
- [0001 - Record Architecture Decisions](docs/adr/0001-record-architecture-decisions.md)

## Troubleshooting
See `docs/runbooks.md`.

## FAQ
**Q: How do I add a new protobuf schema?**
A: Place it in `api/proto/` and run `make proto`.
