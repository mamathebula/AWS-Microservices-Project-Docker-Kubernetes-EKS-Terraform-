# Days 17-19: Deploy to EKS, LoadBalancer & Public Access

## Day 17: Deploy to EKS

### Step 1: Create namespace
```bash
kubectl apply -f k8s/namespace.yaml
```

### Step 2: Deploy services
```bash
# Deploy events first (backend depends on it)
kubectl apply -f k8s/events-deployment.yaml

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml
```

### Step 3: Verify
```bash
# Check pods are running
kubectl get pods -n microservices

# Check services
kubectl get services -n microservices

# Check deployments
kubectl get deployments -n microservices

# Watch pods in real-time
kubectl get pods -n microservices -w
```

### Step 4: Check logs
```bash
# Get logs from a pod
kubectl logs -n microservices <pod-name>

# Follow logs (like tail -f)
kubectl logs -n microservices <pod-name> -f

# Get logs from all pods of a deployment
kubectl logs -n microservices -l app=backend-api
```

### Step 5: Debug if something's wrong
```bash
# Describe a pod (shows events, errors)
kubectl describe pod -n microservices <pod-name>

# Get into a running pod (like SSH)
kubectl exec -it -n microservices <pod-name> -- /bin/sh

# Check events
kubectl get events -n microservices --sort-by='.lastTimestamp'
```

## Day 18: Set Up LoadBalancer

### What is a LoadBalancer Service?
Changes the backend service from ClusterIP (internal) to LoadBalancer (public).
AWS automatically creates an ELB (Elastic Load Balancer).

### Apply the LoadBalancer manifest
```bash
kubectl apply -f k8s/loadbalancer.yaml
```

### Get the external URL
```bash
kubectl get service backend-lb -n microservices
# Wait for EXTERNAL-IP to appear (takes 2-3 minutes)
```

The EXTERNAL-IP will be something like:
`a1b2c3d4e5-1234567890.us-east-1.elb.amazonaws.com`

## Day 19: Test Public Access

### Test from anywhere
```bash
# Replace with your actual ELB URL
export LB_URL=$(kubectl get service backend-lb -n microservices -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Test health
curl http://$LB_URL:3001/health

# Test events
curl http://$LB_URL:3001/api/events

# Create an event
curl -X POST http://$LB_URL:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{"title": "Deployed to EKS!", "description": "Running on Kubernetes"}'
```

## Useful kubectl Commands Reference
```bash
# Scale deployment (change number of pods)
kubectl scale deployment backend-api -n microservices --replicas=3

# Restart deployment (rolling restart)
kubectl rollout restart deployment backend-api -n microservices

# Check rollout status
kubectl rollout status deployment backend-api -n microservices

# Undo last deployment
kubectl rollout undo deployment backend-api -n microservices

# Port forward (access pod locally without LoadBalancer)
kubectl port-forward -n microservices svc/backend-api 3001:3001
```

## Checklist
- [ ] Services deployed to EKS
- [ ] Pods are running and healthy
- [ ] LoadBalancer created
- [ ] Can access API via external URL
- [ ] Tested all endpoints publicly
