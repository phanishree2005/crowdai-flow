# CrowdFlow AI Enterprise 🌐

> **State-of-the-art intelligent control plane for real-time crowd dynamics, predictive geospatial routing, and emergency orchestration.**

![CrowdFlow AI](https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1200)

## Overview

**CrowdFlow AI Enterprise** is a massive polyglot microservice architecture designed to handle 50,000+ simultaneous telemetry streams. It features a stunning, premium Glassmorphic frontend combining 2D WebGL maps with 3D React Three Fiber Digital Twins.

### Key Features
- 🗺️ **Macro Geospatial Engine**: Deck.gl Hexagon and Heatmap density layers rendering massive datasets in real-time.
- 🏢 **Micro Digital Twins**: Switch to a 3D building context powered by React Three Fiber for granular operations.
- 🧠 **LangGraph AI Copilot**: Ask questions directly to the system via an interactive chat interface.
- 📷 **Computer Vision**: Live mock YOLOv8 widgets displaying zone occupancy and confidence scores.
- 📈 **Predictive Analytics**: Recharts-powered density trend charts and time-slider prediction layers (+15m, +30m).

---

## 🏗️ Architecture

The system is a true Polyglot Monorepo, leveraging the best language for each specific domain:

- `src/web-dashboard` **(React + Vite + Deck.gl)**: The blazing-fast geospatial command center.
- `src/ops-dashboard` **(Next.js + tRPC)**: The internal operations control plane.
- `src/services/auth-service` **(Go)**: Edge ingestion and high-throughput JWT authentication.
- `src/services/routing-engine` **(Rust)**: Ultra-fast A* pathfinding and evacuation route calculations.
- `src/services/prediction-engine` **(Python + PyTorch)**: Deep learning inference for crowd density forecasting.
- `deploy/terraform/` **(HCL)**: Infrastructure-as-code for deploying the Kubernetes (EKS) cluster.

---

## 🚀 Getting Started

### 1. Run the Web Dashboard
Experience the primary visual control center.

```bash
cd src/web-dashboard
npm install
npm run dev
```
> Open `http://localhost:3001` (or the port specified by Vite).

### 2. Run the Ops Dashboard
Access the administrative operations panel.

```bash
cd src/ops-dashboard
npm install
npm run dev
```
> Open `http://localhost:3000`.

### 3. Spin up the Backend (Docker)
The entire backend stack is containerized. A `docker-compose` setup is planned to orchestrate the Go, Rust, and Python services along with Kafka/Redis.

---

## 🛡️ Emergency Protocols

In the event of critical congestion, the **Route Recommendation System** and **Evacuation Protocols** can be triggered directly from the Web Dashboard's alert panel. The Rust engine dynamically calculates the safest paths away from red zones.

---

*Built with ❤️ using Antigravity AI.*
