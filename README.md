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


**Day 1 — Install Docker**
- Situation: Need to containerize applications but have no Docker environment set up
- Task: Install Docker Desktop and Docker Compose, verify they work
- Action: Downloaded Docker Desktop, ran `docker run hello-world`, explored an Ubuntu container
- Result: Fully working Docker environment ready for building images

**Day 2 — Create Backend Service**
- Situation: Need a main API service as the entry point for the microservices system
- Task: Build a Node.js/Express API with a health check endpoint
- Action: Created Express server with `/health` and `/api/info` routes, tested with curl
- Result: Working backend API on port 3001 that returns JSON health status

**Day 3 — Create Events Service**
- Situation: Need a second microservice to demonstrate inter-service communication
- Task: Build an events service with CRUD operations and connect it to the backend
- Action: Created events service with GET/POST/DELETE endpoints, backend calls events via HTTP
- Result: Two independent services communicating over HTTP — backend proxies requests to events service

**Day 4 — Write Dockerfiles**
- Situation: Services run locally but need to be packaged as portable containers
- Task: Write production-ready Dockerfiles for both services
- Action: Used alpine base images, layer caching (package.json first), non-root user, .dockerignore
- Result: Two optimized Docker images (~170MB each) that build fast due to layer caching

**Day 5 — Docker Compose**
- Situation: Running two containers manually with separate `docker run` commands is tedious
- Task: Define a single file to run both services together with networking
- Action: Created docker-compose.yml with service definitions, environment variables, and depends_on
- Result: One command (`docker compose up`) starts everything, services find each other by name

**Day 6 — Add Frontend**
- Situation: No visual way to verify the microservices are working together
- Task: Build a simple dashboard to interact with the APIs
- Action: Created HTML/JS frontend served by nginx, calls backend and events APIs
- Result: Browser-based dashboard showing health status, event list, and event creation form

**Day 7 — Cleanup & Document**
- Situation: Week 1 complete but no documentation of architecture or decisions
- Task: Document the architecture and review all concepts learned
- Action: Drew architecture diagrams, documented service communication, ran Docker cleanup
- Result: Clear architecture documentation and solid understanding of Docker fundamentals

**Day 8 — Install Terraform**
- Situation: Need to provision AWS infrastructure but clicking in the console isn't reproducible
- Task: Install Terraform and learn the basic workflow
- Action: Installed Terraform + AWS CLI, wrote first .tf file, ran `terraform init` and `terraform plan`
- Result: Working Terraform setup with understanding of init → plan → apply → destroy workflow

**Day 9 — Create VPC**
- Situation: Need a secure network in AWS to host the EKS cluster
- Task: Provision a VPC with public and private subnets across 2 availability zones
- Action: Wrote Terraform for VPC, 4 subnets, Internet Gateway, NAT Gateway, route tables
- Result: Production-grade network with public subnets for load balancers and private subnets for worker nodes

**Day 10 — Create ECR Repositories**
- Situation: Docker images need a private registry in AWS for EKS to pull from
- Task: Create ECR repositories for both services with lifecycle policies
- Action: Wrote Terraform for 2 ECR repos with image scanning and 10-image retention policy
- Result: Private container registries ready to receive Docker images, with automatic cleanup of old images

**Day 11 — Provision EKS Cluster**
- Situation: Need a Kubernetes cluster to run the containerized services
- Task: Create an EKS cluster with proper IAM roles
- Action: Wrote Terraform for EKS cluster, IAM roles for control plane and worker nodes
- Result: Managed Kubernetes cluster running in AWS with proper security permissions

**Day 12 — Add Node Group**
- Situation: EKS cluster exists but has no worker nodes to run pods
- Task: Create a managed node group with auto-scaling
- Action: Configured node group with t3.medium instances, min 1 / max 4 scaling
- Result: 2 EC2 worker nodes running in private subnets, ready to schedule pods

**Day 13 — Configure kubectl**
- Situation: Cluster is running but no way to interact with it from local machine
- Task: Install kubectl and connect to the EKS cluster
- Action: Installed kubectl, ran `aws eks update-kubeconfig`, created microservices namespace
- Result: Can manage the cluster from terminal — `kubectl get nodes` shows healthy nodes

**Day 14 — Push Images to ECR**
- Situation: Docker images are local but EKS needs to pull them from ECR
- Task: Tag and push both service images to ECR
- Action: Logged into ECR, tagged images with ECR URL, pushed both images
- Result: Both images available in ECR, verified with `aws ecr list-images`

**Day 15 — Kubernetes Deployments**
- Situation: Images are in ECR but nothing is running on the cluster yet
- Task: Write Deployment manifests with replicas, resource limits, and health probes
- Action: Created YAML with 2 replicas, CPU/memory limits, liveness and readiness probes
- Result: Deployment manifests ready that tell K8s exactly how to run each service

**Day 16 — Kubernetes Services**
- Situation: Pods will have random IPs — need stable addresses for communication
- Task: Create ClusterIP Services for internal service discovery
- Action: Wrote Service manifests with selectors matching deployment labels
- Result: Backend can reach events at `http://events-service:3002` regardless of pod IPs

**Day 17 — Deploy to EKS**
- Situation: Manifests are written but not applied to the cluster
- Task: Deploy both services to EKS and verify they're running
- Action: Applied namespace, deployments, and services with `kubectl apply`, checked logs
- Result: 4 pods running (2 per service), all passing health checks

**Day 18 — Set Up LoadBalancer**
- Situation: Services are running but only accessible inside the cluster
- Task: Expose the backend API to the internet via a load balancer
- Action: Created LoadBalancer service, AWS automatically provisioned an NLB
- Result: Public URL available — anyone on the internet can hit the backend API

**Day 19 — Test Public Access**
- Situation: Load balancer is up but haven't verified end-to-end flow from outside
- Task: Test all API endpoints through the public NLB URL
- Action: Tested health, events listing, event creation via curl from local machine
- Result: Full flow working: internet → NLB → backend → events service → response

**Day 20 — Implement Autoscaling**
- Situation: Fixed 2 replicas can't handle traffic spikes or scale down during quiet periods
- Task: Configure HPA to automatically scale pods based on CPU usage
- Action: Installed metrics server, created HPA with min 2 / max 6 / 70% CPU target
- Result: Pods automatically scale up under load and scale down when traffic drops

**Day 21 — Troubleshoot & Refine**
- Situation: Need to be confident debugging issues in production
- Task: Practice common troubleshooting scenarios
- Action: Simulated pod failures, image pull errors, resource constraints — used describe, logs, events
- Result: Systematic debugging approach: status → describe → logs → events

**Day 22 — Set Up GitHub Repo**
- Situation: All code is local with no version control or collaboration capability
- Task: Initialize Git repo and push to GitHub
- Action: Created repo, organized project structure, pushed all code
- Result: Single source of truth in Git — code, infrastructure, manifests, and docs

**Day 23 — Create GitHub Actions Pipeline**
- Situation: Deployments are manual — need automation triggered by code changes
- Task: Write a CI/CD workflow that triggers on push to main
- Action: Created workflow YAML, configured AWS credentials as GitHub Secrets
- Result: Pipeline automatically triggers when code is pushed to main branch

**Day 24 — Automate Docker Build & Push**
- Situation: Pipeline triggers but doesn't build or push images yet
- Task: Add steps to build Docker images and push to ECR
- Action: Added ECR login, build, tag (with git SHA), and push steps for both services
- Result: Every push to main automatically builds fresh images and stores them in ECR

**Day 25 — Automate Kubernetes Deployment**
- Situation: Images are pushed but cluster still runs old versions
- Task: Add steps to deploy to EKS and verify rollout
- Action: Added kubectl apply, rollout restart, and rollout status verification
- Result: Full CI/CD — push code → build → push → deploy → verify. Zero manual steps

**Day 26 — Install Prometheus & Grafana**
- Situation: Services are running but no visibility into performance or resource usage
- Task: Set up metrics collection and visualization
- Action: Installed kube-prometheus-stack via Helm, accessed Grafana dashboards
- Result: Real-time dashboards showing CPU, memory, request rates for all pods and nodes

**Day 27 — Configure CloudWatch Logs**
- Situation: Pod logs are scattered across nodes — need centralized logging
- Task: Forward all container logs to CloudWatch
- Action: Deployed Fluent Bit as a DaemonSet, configured CloudWatch log groups
- Result: All application logs searchable in one place — CloudWatch Log Groups

**Day 28 — Final Testing & Documentation**
- Situation: Everything is built but needs end-to-end validation and documentation
- Task: Run full system test, document architecture, prepare demo, clean up resources
- Action: Tested all endpoints, verified autoscaling, checked monitoring, documented everything, ran `terraform destroy`
- Result: Production-grade microservices system fully tested, documented, and demo-ready. Resources destroyed to save costs.

### How to Follow
Read the guides in `docs/` folder in order: day-01, day-02, etc.
Each day builds on the previous one.
