# AWS Microservices Project
## Docker + Kubernetes (EKS) + Terraform

A production-like microservices system built step-by-step over 4 weeks.

### Architecture
```
┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│   Backend   │
│  (optional)  │     │  (API)      │
└─────────────┘     └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Events    │
                    │  Service    │
                    └─────────────┘
```

### Tech Stack
- **Docker** — containerize services
- **Terraform** — provision AWS infrastructure
- **Kubernetes (EKS)** — orchestrate containers
- **GitHub Actions** — CI/CD pipeline
- **Prometheus/Grafana** — monitoring

### Project Structure
```
aws-project/
├── services/
│   ├── backend/          # Main API service
│   └── events/           # Events microservice
├── terraform/            # Infrastructure as Code
├── k8s/                  # Kubernetes manifests
├── .github/workflows/    # CI/CD pipelines
└── docs/                 # Day-by-day guides
```

### How to Follow
Read the guides in `docs/` folder in order: day-01, day-02, etc.
Each day builds on the previous one.
