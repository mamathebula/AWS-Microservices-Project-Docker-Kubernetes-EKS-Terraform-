# Days 15-16: Kubernetes Deployments & Services

## What You'll Learn
- What a Kubernetes Deployment is
- What a Kubernetes Service is
- How to write YAML manifests
- How pods, deployments, and services relate

## Concepts

### The Kubernetes Object Hierarchy
```
Deployment (manages)
    └── ReplicaSet (ensures N pods running)
            └── Pod (runs container)
                    └── Container (your Docker image)
```

### What is a Deployment?
A Deployment tells Kubernetes: "I want 3 copies of this container running at all times."
If a pod crashes, the Deployment automatically creates a new one.

### What is a Service?
Pods are temporary — they get new IPs when they restart.
A Service gives pods a stable address that never changes.

```
                    ┌─────────┐
                    │ Service │ ← Stable IP/DNS
                    │ :3001   │
                    └────┬────┘
                         │ load balances across
              ┌──────────┼──────────┐
              ▼          ▼          ▼
         ┌────────┐ ┌────────┐ ┌────────┐
         │ Pod 1  │ │ Pod 2  │ │ Pod 3  │
         │backend │ │backend │ │backend │
         └────────┘ └────────┘ └────────┘
```

### Service Types
| Type | What it does |
|------|-------------|
| **ClusterIP** | Internal only — pods can reach it, outside can't |
| **NodePort** | Exposes on each node's IP at a static port |
| **LoadBalancer** | Creates an AWS load balancer (public access) |

### YAML Structure
Every Kubernetes resource has:
```yaml
apiVersion: apps/v1        # API version
kind: Deployment           # What type of resource
metadata:
  name: backend-api        # Name of this resource
  namespace: microservices # Which namespace
spec:                      # The specification (what you want)
  ...
```

## The Manifests
Look at the `k8s/` folder:
- `backend-deployment.yaml` — Deployment + Service for backend
- `events-deployment.yaml` — Deployment + Service for events
- `namespace.yaml` — Creates the namespace

## Key Parts Explained

### Deployment spec
```yaml
spec:
  replicas: 2              # Run 2 copies of this pod
  selector:
    matchLabels:
      app: backend-api     # This deployment manages pods with this label
  template:
    spec:
      containers:
      - name: backend-api
        image: <ECR_URL>   # Your Docker image from ECR
        ports:
        - containerPort: 3001
        resources:
          requests:         # Minimum resources guaranteed
            memory: "128Mi"
            cpu: "100m"     # 100 millicores = 0.1 CPU
          limits:           # Maximum resources allowed
            memory: "256Mi"
            cpu: "500m"
```

### Health Checks (Probes)
```yaml
livenessProbe:             # Is the container alive?
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 10  # Wait 10s before first check
  periodSeconds: 15        # Check every 15s

readinessProbe:            # Is the container ready for traffic?
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 5
  periodSeconds: 10
```

## Checklist
- [ ] Understand Deployments, Services, and Pods
- [ ] Reviewed all YAML manifests
- [ ] Understand health checks (probes)
- [ ] Understand resource requests/limits
