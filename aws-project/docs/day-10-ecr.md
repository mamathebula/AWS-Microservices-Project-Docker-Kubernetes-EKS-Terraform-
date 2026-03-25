# Day 10: Create ECR Repositories

## What You'll Learn
- What ECR is (Elastic Container Registry)
- How to store Docker images in AWS
- Terraform for ECR

## Concepts

### What is ECR?
ECR = Elastic Container Registry. It's like Docker Hub but private and in your AWS account.

```
Your Machine                    AWS
┌──────────┐   docker push    ┌──────────┐   kubectl    ┌──────────┐
│  Docker   │ ──────────────▶ │   ECR    │ ──────────▶ │   EKS    │
│  Image    │                 │  (store) │              │  (run)   │
└──────────┘                  └──────────┘              └──────────┘
```

### Why ECR over Docker Hub?
- Private by default (your images aren't public)
- Integrated with AWS (EKS can pull images easily)
- No rate limits like Docker Hub
- Image scanning for vulnerabilities

## The Terraform Code
Look at `terraform/ecr.tf` — it creates:
1. ECR repository for backend-api
2. ECR repository for events-service
3. Lifecycle policy to keep only last 10 images (saves cost)

## Step-by-Step
```bash
cd aws-project/terraform
terraform plan    # Preview
terraform apply   # Create ECR repos
```

## Push Images to ECR (Preview — we'll do this on Day 14)
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag your image
docker tag backend-api:1.0 <account-id>.dkr.ecr.us-east-1.amazonaws.com/microservices/backend-api:1.0

# Push
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/microservices/backend-api:1.0
```

## Checklist
- [ ] Understand what ECR is
- [ ] Reviewed ecr.tf
- [ ] ECR repositories created (or planned)
