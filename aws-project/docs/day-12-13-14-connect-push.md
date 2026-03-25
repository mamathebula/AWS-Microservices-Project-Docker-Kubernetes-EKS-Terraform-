# Days 12-14: Connect kubectl & Push Images to ECR

## Day 12: Configure kubectl

### What is kubectl?
`kubectl` is the command-line tool for Kubernetes. It's how you talk to your cluster.

### Install kubectl
```bash
# macOS
brew install kubectl

# Verify
kubectl version --client
```

### Connect to EKS
After `terraform apply`, run the output command:
```bash
aws eks update-kubeconfig --region us-east-1 --name microservices-eks
```

### Verify connection
```bash
# Should show your cluster info
kubectl cluster-info

# Should show your worker nodes
kubectl get nodes
```

## Day 13: Explore Kubernetes

### Basic kubectl commands
```bash
# Get all resources in default namespace
kubectl get all

# Get nodes (the EC2 instances)
kubectl get nodes

# Get pods (running containers)
kubectl get pods

# Get services
kubectl get services

# Get namespaces
kubectl get namespaces

# Describe a resource (detailed info)
kubectl describe node <node-name>
```

### Namespaces
Namespaces are like folders — they organize resources:
```bash
# Create a namespace for our project
kubectl create namespace microservices

# Set it as default
kubectl config set-context --current --namespace=microservices
```

## Day 14: Push Docker Images to ECR

### Step 1: Get your AWS account ID
```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo $AWS_ACCOUNT_ID
```

### Step 2: Login to ECR
```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com
```

### Step 3: Build images
```bash
cd aws-project

# Build backend
docker build -t backend-api:latest ./services/backend

# Build events
docker build -t events-service:latest ./services/events
```

### Step 4: Tag images for ECR
```bash
# Tag backend
docker tag backend-api:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/microservices/backend-api:latest

# Tag events
docker tag events-service:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/microservices/events-service:latest
```

### Step 5: Push to ECR
```bash
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/microservices/backend-api:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/microservices/events-service:latest
```

### Step 6: Verify
```bash
# List images in ECR
aws ecr list-images --repository-name microservices/backend-api
aws ecr list-images --repository-name microservices/events-service
```

## Checklist
- [ ] kubectl installed
- [ ] Connected to EKS cluster
- [ ] Can run `kubectl get nodes`
- [ ] Created microservices namespace
- [ ] Docker images pushed to ECR
- [ ] Verified images in ECR
