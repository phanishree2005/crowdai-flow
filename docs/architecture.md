# Architecture Overview

This document describes the high-level architecture of CrowdFlow AI Enterprise.

## Core Components
- **API Gateway**: Envoy-based ingress.
- **Auth Service**: OAuth2 / OIDC compliant token issuer.
- **Telemetry Ingestion**: High-throughput Go service.
- **Routing Engine**: Rust-based dynamic A* pathfinding.
- **Analytics**: Flink-based sliding window aggregations.
