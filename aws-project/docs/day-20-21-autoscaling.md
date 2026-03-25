# Days 20-21: Autoscaling & Troubleshooting

## Day 20: Horizontal Pod Autoscaler (HPA)

### What is HPA?
HPA automatically scales the number of pods based on CPU/memory usage.
- Traffic goes up → more pods
- Traffic goes down → fewer pods

```
Low traffic:    [Pod 1] [Pod 2]
                    ↓ CPU > 70%
High traffic:   [Pod 1] [Pod 2] [Pod 3] [Pod 4]
                    ↓ CPU < 30%
Scale down:     [Pod 1] [Pod 2]
```

### Prerequisites
Install metrics server (needed for HPA to read CPU/memory):
```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### Apply HPA
```bash
kubectl apply -f k8s/hpa.yaml
```

### Monitor autoscaling
```bash
# Watch HPA status
kubectl get hpa -n microservices -w

# Check current metrics
kubectl top pods -n microservices
kubectl top nodes
```

### Load test (to trigger scaling)
```bash
# Simple load test with a loop
export LB_URL=$(kubectl get service backend-lb -n microservices -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Run this to generate load
for i in $(seq 1 1000); do
  curl -s http://$LB_URL:3001/health > /dev/null &
done
```

## Day 21: Troubleshooting Guide

### Pod won't start
```bash
# Check pod status
kubectl get pods -n microservices

# Common statuses:
# - Pending: No node has enough resources
# - ImagePullBackOff: Can't pull Docker image (check ECR URL)
# - CrashLoopBackOff: App crashes on startup (check logs)
# - ErrImagePull: Wrong image name or no ECR access

# Get details
kubectl describe pod <pod-name> -n microservices

# Check logs
kubectl logs <pod-name> -n microservices
```

### Service not reachable
```bash
# Check service exists
kubectl get svc -n microservices

# Check endpoints (should show pod IPs)
kubectl get endpoints -n microservices

# If endpoints are empty, labels don't match
# Compare: deployment selector labels vs service selector labels
```

### LoadBalancer stuck in "Pending"
```bash
# Check if your subnets have the right tags
# Public subnets need: kubernetes.io/role/elb = 1
# Check AWS console → EC2 → Load Balancers
```

### Common fixes
```bash
# Restart a deployment
kubectl rollout restart deployment backend-api -n microservices

# Delete and recreate a pod
kubectl delete pod <pod-name> -n microservices

# Force re-pull image
kubectl rollout restart deployment backend-api -n microservices

# Check resource usage
kubectl top pods -n microservices
kubectl top nodes
```

## Checklist
- [ ] HPA configured
- [ ] Metrics server installed
- [ ] Tested autoscaling with load
- [ ] Know how to troubleshoot common issues
- [ ] Can read pod logs and events
