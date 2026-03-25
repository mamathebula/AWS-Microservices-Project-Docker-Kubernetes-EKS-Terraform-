# Days 26-28: Monitoring, Logging & Final Testing

## Day 26: Install Prometheus & Grafana

### What are they?
- **Prometheus**: Collects metrics (CPU, memory, request count, etc.)
- **Grafana**: Visualizes metrics in dashboards

### Install using Helm (Kubernetes package manager)
```bash
# Install Helm
brew install helm

# Add the prometheus-community chart repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus + Grafana stack
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.adminPassword=admin123
```

### Access Grafana
```bash
# Port forward Grafana to your machine
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
```
Open http://localhost:3000
- Username: admin
- Password: admin123

### Pre-built Dashboards
Grafana comes with dashboards for:
- Kubernetes cluster overview
- Node metrics (CPU, memory, disk)
- Pod metrics
- Network traffic

## Day 27: Configure CloudWatch Logs

### Install CloudWatch agent
```bash
# Create CloudWatch namespace
kubectl create namespace amazon-cloudwatch

# Install Fluent Bit (log forwarder)
kubectl apply -f https://raw.githubusercontent.com/aws-samples/amazon-cloudwatch-container-insights/latest/k8s-deployment-manifest-templates/deployment-mode/daemonSet/container-insights-monitoring/fluent-bit/fluent-bit.yaml
```

### View logs in AWS Console
1. Go to AWS Console → CloudWatch → Log Groups
2. Look for `/aws/containerinsights/<cluster-name>/application`
3. You'll see logs from all your pods

### Application-level logging
Your services already log to stdout (console.log), which Fluent Bit picks up automatically.

## Day 28: Final Testing & Documentation

### End-to-end test
```bash
export LB_URL=$(kubectl get service backend-lb -n microservices -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# 1. Health check
curl http://$LB_URL:3001/health

# 2. Get events
curl http://$LB_URL:3001/api/events

# 3. Create event
curl -X POST http://$LB_URL:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{"title": "Final Test", "description": "Everything works!"}'

# 4. Verify event was created
curl http://$LB_URL:3001/api/events

# 5. Check pod count
kubectl get pods -n microservices

# 6. Check HPA
kubectl get hpa -n microservices

# 7. Check node health
kubectl get nodes
```

### Architecture summary for interviews
```
GitHub Push → GitHub Actions → Build Docker → Push to ECR
                                                    ↓
Internet → NLB → Backend API (EKS) → Events Service (EKS)
                      ↑                      ↑
                  HPA scales             HPA scales
                      ↑                      ↑
              Prometheus monitors    CloudWatch logs
```

### Cost cleanup (IMPORTANT!)
```bash
# Delete Kubernetes resources
kubectl delete namespace microservices
kubectl delete namespace monitoring

# Destroy Terraform resources
cd terraform
terraform destroy

# This removes: EKS cluster, node group, VPC, NAT Gateway, ECR repos
# Confirm with "yes" when prompted
```

## Interview Preparation

### Questions you should be able to answer:
1. **Why microservices?** — Independent scaling, deployment, and fault isolation
2. **Why Docker?** — Consistent environments, portable, lightweight
3. **Why Kubernetes?** — Auto-healing, scaling, rolling updates, service discovery
4. **Why Terraform?** — Infrastructure as Code, reproducible, version controlled
5. **How do services communicate?** — HTTP via Kubernetes Services (DNS-based)
6. **How does scaling work?** — HPA monitors CPU, adds/removes pods automatically
7. **What happens if a pod crashes?** — Deployment controller creates a new one
8. **How do you deploy updates?** — Push to main → GitHub Actions → Build → Push → Deploy
9. **How do you monitor?** — Prometheus for metrics, Grafana for dashboards, CloudWatch for logs
10. **What's in your VPC?** — Public subnets (LB), private subnets (nodes), NAT Gateway, IGW

### 5-Minute Demo Script
1. Show the architecture diagram (30s)
2. Show GitHub Actions pipeline running (30s)
3. Hit the health endpoint live (30s)
4. Create an event via API (30s)
5. Show Grafana dashboard (30s)
6. Show `kubectl get pods` and HPA (30s)
7. Show Terraform code structure (30s)
8. Explain scaling strategy (30s)
9. Q&A (1min)

## Checklist
- [ ] Prometheus & Grafana installed
- [ ] Can view dashboards
- [ ] CloudWatch logs configured
- [ ] End-to-end test passes
- [ ] Can explain architecture
- [ ] Demo prepared
- [ ] Resources destroyed to save costs
