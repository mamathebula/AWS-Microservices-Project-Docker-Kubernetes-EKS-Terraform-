# Interview Preparation Guide
## Docker, Kubernetes & AWS — Questions, Answers & Demo

---

## SECTION 1: DOCKER QUESTIONS

### Q: What is Docker and why do we use it?
**Answer:** Docker packages applications with all their dependencies into containers. This solves the "works on my machine" problem. Every environment — dev, staging, production — runs the exact same container. It also makes deployment faster because you ship a pre-built image instead of installing dependencies on each server.

### Q: What's the difference between an image and a container?
**Answer:** An image is a blueprint — it's read-only and contains your code, dependencies, and OS. A container is a running instance of an image. You can run multiple containers from the same image. Think of it like a class (image) vs an object (container).

### Q: Explain your Dockerfile. Why is it structured that way?
**Answer:**
```dockerfile
FROM node:18-alpine     # Small base image (170MB vs 900MB)
WORKDIR /app
COPY package*.json ./   # Copy deps list first
RUN npm ci              # Install deps (this layer gets cached)
COPY . .                # Copy code last (changes most often)
EXPOSE 3001
USER node               # Don't run as root (security)
CMD ["node", "index.js"]
```
The key insight is **layer caching**. Docker caches each instruction as a layer. By copying `package.json` before the code, the `npm install` layer is cached unless dependencies change. This makes rebuilds much faster — typically seconds instead of minutes.

### Q: What is Docker Compose and when would you use it?
**Answer:** Docker Compose lets you define and run multi-container applications with a single YAML file. Instead of running `docker run` for each service, you run `docker compose up` and everything starts together. It also creates a network so services can find each other by name. I use it for local development where I need multiple services running together.

### Q: How do containers communicate in Docker Compose?
**Answer:** Docker Compose creates a bridge network automatically. Each service gets a DNS entry matching its service name. So if I have a service called `events`, my backend can reach it at `http://events:3002`. No hardcoded IPs needed.

### Q: What's the difference between CMD and ENTRYPOINT?
**Answer:** CMD sets the default command that can be overridden at runtime. ENTRYPOINT sets a command that always runs — arguments passed at runtime are appended to it. In practice, I use CMD for most services because it's simpler and more flexible.

### Q: How do you keep Docker images small?
**Answer:**
- Use alpine-based images (5MB base vs 100MB+)
- Multi-stage builds for compiled languages
- `.dockerignore` to exclude node_modules, .git, etc.
- Combine RUN commands to reduce layers
- Only install production dependencies (`npm ci --only=production`)

---

## SECTION 2: KUBERNETES QUESTIONS

### Q: What is Kubernetes and why not just use Docker?
**Answer:** Docker runs containers on a single machine. Kubernetes orchestrates containers across multiple machines. It handles:
- **Auto-healing**: if a container crashes, K8s restarts it
- **Scaling**: automatically add/remove containers based on load
- **Rolling updates**: deploy new versions with zero downtime
- **Service discovery**: containers find each other automatically
- **Load balancing**: distributes traffic across containers

Docker is great for running containers. Kubernetes is great for managing containers at scale.

### Q: Explain the relationship between Pod, Deployment, and Service.
**Answer:**
```
Deployment → manages → ReplicaSet → manages → Pods → runs → Containers
Service → provides stable network address → routes to Pods
```
- **Pod**: Smallest unit. Wraps one or more containers. Temporary — gets a new IP each time.
- **Deployment**: Declares "I want N replicas of this pod." Handles rolling updates and rollbacks.
- **Service**: Gives pods a stable DNS name and IP. Load balances across pods. Pods come and go, but the Service address stays the same.

### Q: What are the different Service types?
**Answer:**
| Type | Use Case |
|------|----------|
| **ClusterIP** | Internal communication between services. Default type. |
| **NodePort** | Exposes service on each node's IP at a static port (30000-32767). |
| **LoadBalancer** | Creates a cloud load balancer (e.g., AWS NLB/ALB). For public access. |
| **ExternalName** | Maps to an external DNS name. Rarely used. |

In my project, I use ClusterIP for service-to-service communication and LoadBalancer for the public-facing backend API.

### Q: What are liveness and readiness probes?
**Answer:**
- **Liveness probe**: "Is this container alive?" If it fails, Kubernetes restarts the container. Catches deadlocks and hung processes.
- **Readiness probe**: "Is this container ready to receive traffic?" If it fails, Kubernetes stops sending traffic to it but doesn't restart it. Useful during startup or when a dependency is down.

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 10  # Wait before first check
  periodSeconds: 15        # Check every 15 seconds
  failureThreshold: 3      # Restart after 3 failures
```

### Q: How does Horizontal Pod Autoscaler (HPA) work?
**Answer:** HPA monitors metrics (CPU, memory, or custom metrics) and automatically adjusts the number of pod replicas.

```
CPU < 30% → scale down (remove pods)
CPU 30-70% → no change
CPU > 70% → scale up (add pods)
```

It checks metrics every 15 seconds by default. There's a cooldown period to prevent flapping. In my project, I set min=2, max=6 replicas with a 70% CPU target.

### Q: How do you do a zero-downtime deployment?
**Answer:** Kubernetes Deployments use a **rolling update** strategy by default:
1. Create new pods with the updated image
2. Wait for new pods to pass readiness checks
3. Gradually shift traffic from old to new pods
4. Terminate old pods

At no point are zero pods running. You can configure `maxSurge` (how many extra pods during update) and `maxUnavailable` (how many pods can be down).

### Q: What happens if a pod crashes?
**Answer:** The Deployment controller detects the pod is gone and creates a new one to maintain the desired replica count. If the pod keeps crashing (CrashLoopBackOff), Kubernetes applies exponential backoff — waiting longer between each restart attempt (10s, 20s, 40s, up to 5 minutes).

### Q: How do services discover each other in Kubernetes?
**Answer:** Kubernetes has built-in DNS. When you create a Service called `events-service` in namespace `microservices`, it gets a DNS entry:
- `events-service` (same namespace)
- `events-service.microservices` (cross-namespace)
- `events-service.microservices.svc.cluster.local` (fully qualified)

My backend uses `http://events-service:3002` to reach the events service.

### Q: What is a Namespace and why use them?
**Answer:** Namespaces are virtual clusters within a physical cluster. They provide:
- **Isolation**: separate environments (dev, staging, prod) in one cluster
- **Resource quotas**: limit CPU/memory per namespace
- **Access control**: restrict who can access what
- **Organization**: group related resources together

### Q: How do you troubleshoot a pod that won't start?
**Answer:** I follow this sequence:
```bash
# 1. Check pod status
kubectl get pods -n microservices

# 2. Look at events (most common issues show here)
kubectl describe pod <name> -n microservices

# 3. Check logs
kubectl logs <name> -n microservices

# 4. Common statuses:
# Pending → not enough resources on nodes
# ImagePullBackOff → wrong image name or no ECR access
# CrashLoopBackOff → app crashes on startup (check logs)
# OOMKilled → ran out of memory (increase limits)
```

---

## SECTION 3: TERRAFORM QUESTIONS

### Q: What is Terraform and why use it over the AWS Console?
**Answer:** Terraform is Infrastructure as Code. Instead of clicking in the console, you write code that describes your infrastructure. Benefits:
- **Reproducible**: run the same code in any account/region
- **Version controlled**: track changes in Git, review in PRs
- **Documented**: the code IS the documentation
- **Automated**: no manual steps, no human error
- **Destroyable**: `terraform destroy` cleans up everything

### Q: Explain the Terraform workflow.
**Answer:**
```
terraform init    → Download provider plugins
terraform plan    → Preview what will change (dry run)
terraform apply   → Create/modify resources
terraform destroy → Delete everything
```
`plan` is critical — always review before applying. In CI/CD, plan runs on PR, apply runs on merge to main.

### Q: What is Terraform state and why is it important?
**Answer:** State is Terraform's record of what it created. It maps your `.tf` files to real AWS resources. Without state, Terraform wouldn't know what exists and would try to create duplicates.

For teams, state should be stored remotely (S3 bucket) with locking (DynamoDB) so two people don't apply at the same time.

### Q: Explain your Terraform structure.
**Answer:**
```
terraform/
├── main.tf        # Provider config, backend
├── variables.tf   # Input variables (region, env, etc.)
├── vpc.tf         # VPC, subnets, gateways, route tables
├── ecr.tf         # Container registries
├── eks.tf         # EKS cluster, node groups, IAM roles
└── outputs.tf     # Values to display after apply
```
Each file handles one concern. Variables make it reusable across environments.

### Q: Why did you use public and private subnets?
**Answer:** Security best practice:
- **Public subnets**: Only for resources that MUST face the internet (load balancers)
- **Private subnets**: For everything else (EKS worker nodes, databases)

Worker nodes in private subnets can't be reached directly from the internet. They access the internet through a NAT Gateway for pulling images and updates.

---

## SECTION 4: AWS & ARCHITECTURE QUESTIONS

### Q: Walk me through your architecture.
**Answer:**
```
Developer pushes code to GitHub
    ↓
GitHub Actions triggers:
    → Builds Docker images
    → Pushes to ECR
    → Deploys to EKS
    ↓
Traffic flow:
    Internet → NLB (Load Balancer)
        → Backend API pods (private subnet)
            → Events Service pods (private subnet)
    ↓
Monitoring:
    Prometheus scrapes metrics → Grafana dashboards
    Fluent Bit forwards logs → CloudWatch
    ↓
Scaling:
    HPA monitors CPU → scales pods automatically
    Node group auto-scaling → adds EC2 instances if needed
```

### Q: How does your system handle failure?
**Answer:**
1. **Pod failure**: Deployment controller creates a new pod automatically
2. **Node failure**: Pods are rescheduled to healthy nodes
3. **AZ failure**: Resources span 2 AZs, traffic shifts to the healthy AZ
4. **Service failure**: Backend returns graceful error if events service is down (503 with message)
5. **Bad deployment**: Rolling update stops if new pods fail health checks. Can rollback with `kubectl rollout undo`

### Q: How would you scale this for more traffic?
**Answer:**
- **Horizontal**: HPA adds more pods (already configured)
- **Vertical**: Increase pod resource limits
- **Node scaling**: EKS node group auto-scales from 1-4 nodes
- **Database**: Add RDS/DynamoDB with read replicas
- **Caching**: Add Redis/ElastiCache for frequently accessed data
- **CDN**: CloudFront for static assets
- **Queue**: SQS for async processing to handle traffic spikes

### Q: What would you add for production readiness?
**Answer:**
- HTTPS with ACM certificate + ALB Ingress Controller
- Secrets management (AWS Secrets Manager or K8s Secrets)
- Database (RDS or DynamoDB) instead of in-memory storage
- Network policies to restrict pod-to-pod communication
- Pod disruption budgets for safe node maintenance
- Centralized logging with structured JSON logs
- Alerting rules in Prometheus (PagerDuty/Slack integration)
- Terraform remote state with S3 + DynamoDB locking
- Multiple environments (dev/staging/prod) with separate namespaces or clusters

### Q: What's the cost of running this?
**Answer:**
| Resource | Cost/month (approx) |
|----------|-------------------|
| EKS control plane | $73 |
| 2x t3.medium nodes | $60 |
| NAT Gateway | $32 + data |
| NLB | $16 + data |
| ECR storage | ~$1 |
| **Total** | **~$182/month** |

To save costs: use spot instances for non-critical workloads, destroy dev environments when not in use, right-size instances based on actual usage.

---

## SECTION 5: CI/CD QUESTIONS

### Q: Explain your CI/CD pipeline.
**Answer:**
```
Push to main → GitHub Actions triggers:
  1. Checkout code
  2. Configure AWS credentials
  3. Login to ECR
  4. Build Docker images (tagged with git SHA)
  5. Push images to ECR
  6. Update kubeconfig for EKS
  7. Apply Kubernetes manifests
  8. Restart deployments (pull new images)
  9. Verify rollout status
```
Each image is tagged with the git commit SHA for traceability. We also push a `latest` tag for convenience.

### Q: How do you handle secrets in CI/CD?
**Answer:** AWS credentials are stored as GitHub Secrets — encrypted and never exposed in logs. In Kubernetes, sensitive values go in K8s Secrets or AWS Secrets Manager. Never hardcode secrets in code or YAML files.

### Q: How would you add testing to the pipeline?
**Answer:** Add a test step before the build:
```yaml
- name: Run tests
  run: |
    cd services/backend && npm test
    cd ../events && npm test
```
I'd also add integration tests that run after deployment to verify the services work together in the cluster.

---

## SECTION 6: 5-MINUTE DEMO SCRIPT

### Slide 1: Architecture (30s)
"This is a microservices system with two services — a backend API and an events service — running on EKS. Traffic comes through a Network Load Balancer, hits the backend, which calls the events service internally."

### Live Demo: CI/CD (30s)
"When I push to main, GitHub Actions automatically builds Docker images, pushes to ECR, and deploys to Kubernetes. Here's a recent pipeline run."

### Live Demo: API (30s)
```bash
curl http://<LB_URL>:3001/health
curl http://<LB_URL>:3001/api/events
```
"The health endpoint shows the service is running. The events endpoint shows inter-service communication working."

### Live Demo: Kubernetes (30s)
```bash
kubectl get pods -n microservices
kubectl get hpa -n microservices
```
"We have 2 replicas of each service. HPA is configured to scale up to 6 pods based on CPU usage."

### Live Demo: Monitoring (30s)
"Grafana shows real-time metrics — CPU, memory, request rates. CloudWatch captures all application logs."

### Infrastructure (30s)
"Everything is provisioned with Terraform — VPC with public/private subnets across 2 AZs, ECR for images, EKS cluster with auto-scaling node groups."

### Scaling & Resilience (30s)
"If I kill a pod, Kubernetes recreates it automatically. If traffic spikes, HPA adds more pods. The system spans 2 availability zones for high availability."

### Wrap Up (30s)
"This demonstrates containerization with Docker, orchestration with Kubernetes, infrastructure as code with Terraform, and automated CI/CD with GitHub Actions. Happy to dive deeper into any area."

---

## QUICK REFERENCE: Commands to Know

```bash
# Docker
docker build -t name:tag .
docker run -p 3001:3001 name:tag
docker compose up --build -d
docker compose down

# Kubernetes
kubectl get pods/services/deployments -n microservices
kubectl describe pod <name> -n microservices
kubectl logs <name> -n microservices
kubectl scale deployment <name> --replicas=3 -n microservices
kubectl rollout restart deployment <name> -n microservices
kubectl rollout undo deployment <name> -n microservices
kubectl top pods -n microservices

# Terraform
terraform init
terraform plan
terraform apply
terraform destroy
terraform state list
```


---

## SECTION 7: DAY-BY-DAY PROJECT SUMMARY

Use this to explain your journey and what you learned each day. Interviewers love hearing about the process, not just the result.

### WEEK 1: DOCKER & MICROSERVICES

**Day 1 — Installed Docker & Docker Compose**
- Installed Docker Desktop, verified with `docker run hello-world`
- Learned: images vs containers, Docker Hub, basic commands (`docker ps`, `docker images`)
- Interview angle: "I started by understanding the fundamentals — what containers are and how they differ from VMs"

**Day 2 — Created Backend API Service**
- Built a Node.js/Express API with `/health` and `/api/info` endpoints
- Learned: Express routing, JSON responses, why health endpoints matter
- Interview angle: "Every production service needs a health endpoint — Kubernetes and load balancers depend on it"

**Day 3 — Created Events Microservice**
- Built a second service with CRUD operations (GET, POST, DELETE)
- Connected backend to events service via HTTP
- Learned: microservice communication, independent services, graceful error handling
- Interview angle: "I designed services to be independent — if the events service goes down, the backend returns a 503 instead of crashing"

**Day 4 — Wrote Dockerfiles**
- Created production-ready Dockerfiles for both services
- Used alpine images, layer caching, non-root user
- Learned: Dockerfile instructions, `.dockerignore`, build optimization
- Interview angle: "I optimized the Dockerfile for caching — copying package.json first means npm install is cached unless dependencies change"

**Day 5 — Docker Compose**
- Created `docker-compose.yml` to run both services together
- Services communicate by name via Docker's internal DNS
- Learned: multi-container orchestration, networking, environment variables
- Interview angle: "Docker Compose showed me how service discovery works — the backend reaches events at `http://events:3002` instead of hardcoded IPs"

**Day 6 — Added Frontend Dashboard**
- Built an HTML/JS dashboard served by nginx
- Shows health status, lists events, creates new events
- Learned: full-stack flow, nginx as a static file server
- Interview angle: "This gave me a visual way to verify the entire microservices flow end-to-end"

**Day 7 — Cleanup & Documentation**
- Documented the architecture with diagrams
- Learned Docker cleanup commands (`docker system prune`)
- Reviewed Week 1 concepts
- Interview angle: "I documented everything as I went — architecture diagrams, decisions, and trade-offs"

---

### WEEK 2: TERRAFORM (INFRASTRUCTURE)

**Day 8 — Installed Terraform & Learned Basics**
- Installed Terraform and AWS CLI
- Learned: `init → plan → apply → destroy` workflow
- Wrote first `.tf` file
- Interview angle: "Terraform lets me version-control infrastructure — I can recreate the entire environment from code"

**Day 9 — Created VPC with Terraform**
- Provisioned VPC with public and private subnets across 2 AZs
- Created Internet Gateway, NAT Gateway, route tables
- Learned: CIDR notation, public vs private subnets, high availability
- Interview angle: "Worker nodes run in private subnets for security. Only the load balancer sits in public subnets. NAT Gateway lets private nodes pull images from ECR"

**Day 10 — Created ECR Repositories**
- Provisioned ECR repos for both services
- Added lifecycle policies to keep only last 10 images
- Learned: container registries, image scanning, cost management
- Interview angle: "ECR is private by default and integrates natively with EKS — no extra auth configuration needed"

**Day 11 — Provisioned EKS Cluster**
- Created EKS cluster with IAM roles for control plane and worker nodes
- Learned: EKS architecture, control plane vs worker nodes, IAM roles
- Interview angle: "AWS manages the Kubernetes control plane — I focus on deploying applications, not managing etcd and the API server"

**Day 12 — Added Node Group & Connected kubectl**
- Created managed node group with auto-scaling (min 1, max 4 nodes)
- Installed kubectl and connected to the cluster
- Learned: node groups, instance types, `aws eks update-kubeconfig`
- Interview angle: "I chose t3.medium instances for cost efficiency during development, but the node group can scale to 4 nodes under load"

**Day 13 — Explored Kubernetes**
- Ran basic kubectl commands, created namespace
- Learned: namespaces, resource exploration, cluster navigation
- Interview angle: "Namespaces let me isolate environments — I could run dev and staging in the same cluster"

**Day 14 — Pushed Docker Images to ECR**
- Tagged and pushed both service images to ECR
- Learned: ECR login, image tagging, push workflow
- Interview angle: "Each image is tagged with the git commit SHA for traceability — I can always trace a running container back to the exact code"

---

### WEEK 3: KUBERNETES

**Day 15 — Created Kubernetes Deployment YAMLs**
- Wrote Deployment manifests with replicas, resource limits, health probes
- Learned: Deployment → ReplicaSet → Pod hierarchy, YAML structure
- Interview angle: "I set resource requests and limits on every pod — requests guarantee minimum resources, limits prevent one pod from starving others"

**Day 16 — Created Kubernetes Services (ClusterIP)**
- Wrote Service manifests for internal communication
- Learned: ClusterIP, selectors, labels, service discovery
- Interview angle: "Services give pods a stable DNS name. The backend reaches events at `http://events-service:3002` regardless of which pods are running"

**Day 17 — Deployed to EKS**
- Applied manifests: namespace, deployments, services
- Verified pods running, checked logs
- Learned: `kubectl apply`, `kubectl logs`, `kubectl describe`
- Interview angle: "Deployment was straightforward — `kubectl apply -f` and Kubernetes handles the rest. I verified with health checks and logs"

**Day 18 — Set Up LoadBalancer**
- Created LoadBalancer service, AWS provisioned an NLB automatically
- Learned: LoadBalancer service type, AWS NLB integration
- Interview angle: "Kubernetes talks to AWS to create a Network Load Balancer automatically — I just change the service type from ClusterIP to LoadBalancer"

**Day 19 — Tested Public Access**
- Tested all endpoints via the NLB URL from outside the cluster
- Verified end-to-end flow: internet → NLB → backend → events
- Learned: external access, DNS resolution, end-to-end testing
- Interview angle: "I tested the full flow — health checks, inter-service communication, and CRUD operations — all through the public load balancer"

**Day 20 — Implemented Autoscaling (HPA)**
- Installed metrics server, created HPA for both services
- Configured: min 2, max 6 replicas, 70% CPU target
- Learned: HPA, metrics server, scaling policies
- Interview angle: "HPA scales pods based on CPU utilization. I set a 70% threshold — below that we scale down, above we scale up. Min 2 pods ensures high availability"

**Day 21 — Troubleshooting & Refinement**
- Practiced debugging: pod failures, image pull errors, service connectivity
- Learned: `kubectl describe`, events, common error patterns
- Interview angle: "I follow a systematic approach: check pod status, describe for events, check logs. Most issues are image pull errors or resource constraints"

---

### WEEK 4: CI/CD & MONITORING

**Day 22 — Set Up GitHub Repository**
- Initialized Git repo, pushed all code to GitHub
- Organized project structure
- Interview angle: "Everything is in Git — application code, Dockerfiles, Kubernetes manifests, and Terraform. The repo is the single source of truth"

**Day 23 — Created GitHub Actions Pipeline**
- Wrote workflow YAML triggered on push to main
- Configured AWS credentials as GitHub Secrets
- Learned: GitHub Actions syntax, triggers, secrets management
- Interview angle: "Secrets are stored encrypted in GitHub — never in code. The pipeline uses OIDC or access keys to authenticate with AWS"

**Day 24 — Automated Docker Build & Push**
- Pipeline builds both images and pushes to ECR
- Images tagged with git SHA for traceability
- Learned: ECR login action, multi-image builds, tagging strategy
- Interview angle: "Every image is tagged with the commit SHA so I can trace any running container back to the exact code version"

**Day 25 — Automated Kubernetes Deployment**
- Pipeline applies K8s manifests and restarts deployments
- Verifies rollout status before marking success
- Learned: kubectl in CI/CD, rollout verification, deployment automation
- Interview angle: "The pipeline waits for rollout to complete — if new pods fail health checks, the deployment is marked as failed and old pods keep running"

**Day 26 — Installed Prometheus & Grafana**
- Deployed monitoring stack via Helm
- Accessed Grafana dashboards for cluster and pod metrics
- Learned: Helm charts, Prometheus metrics, Grafana visualization
- Interview angle: "Prometheus scrapes metrics from all pods every 15 seconds. Grafana gives me dashboards for CPU, memory, request rates, and error rates"

**Day 27 — Configured CloudWatch Logs**
- Deployed Fluent Bit as a DaemonSet for log forwarding
- Application logs automatically sent to CloudWatch
- Learned: log aggregation, Fluent Bit, CloudWatch Log Groups
- Interview angle: "Fluent Bit runs on every node and forwards container stdout/stderr to CloudWatch. I can search logs across all pods in one place"

**Day 28 — Final Testing & Documentation**
- End-to-end testing of all components
- Documented architecture, decisions, and trade-offs
- Prepared demo script
- Cleaned up resources to save costs
- Interview angle: "I tested the full lifecycle — push code, pipeline runs, images built, deployed to K8s, verified via load balancer, monitored in Grafana"

---

## HOW TO TELL YOUR STORY IN AN INTERVIEW

### The 2-Minute Summary
"I built a microservices system from scratch over 4 weeks. Week 1, I created two Node.js services and containerized them with Docker. Week 2, I used Terraform to provision the AWS infrastructure — VPC, ECR, and an EKS cluster. Week 3, I deployed to Kubernetes with health checks, services, a load balancer, and autoscaling. Week 4, I automated everything with a GitHub Actions CI/CD pipeline and added monitoring with Prometheus, Grafana, and CloudWatch. The system auto-scales based on CPU, auto-heals crashed pods, and deploys with zero downtime."

### Key Decisions to Highlight
1. **Private subnets for worker nodes** — security best practice
2. **Health endpoints on every service** — enables K8s auto-healing
3. **Layer caching in Dockerfiles** — faster builds
4. **HPA with min 2 replicas** — always highly available
5. **Git SHA image tags** — full traceability
6. **Graceful degradation** — backend handles events service being down
7. **Infrastructure as Code** — entire environment reproducible from Git
