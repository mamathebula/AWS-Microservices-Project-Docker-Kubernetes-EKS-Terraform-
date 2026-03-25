# Day 11: Provision EKS Cluster

## What You'll Learn
- What EKS is
- How Kubernetes runs on AWS
- Terraform for EKS

## Concepts

### What is EKS?
EKS = Elastic Kubernetes Service. It's managed Kubernetes on AWS.
AWS handles the control plane (the brain), you manage the worker nodes (the muscle).

```
┌─────────────────────────────────────────┐
│              EKS Cluster                 │
│                                         │
│  ┌─────────────────┐                   │
│  │  Control Plane   │ ← AWS manages    │
│  │  (API Server,    │   this for you   │
│  │   etcd, etc.)    │                   │
│  └────────┬────────┘                   │
│           │                             │
│  ┌────────▼────────┐                   │
│  │  Worker Nodes    │ ← You manage     │
│  │  (EC2 instances  │   these          │
│  │   running pods)  │                   │
│  └─────────────────┘                   │
└─────────────────────────────────────────┘
```

### EKS Components
| Component | What it does |
|-----------|-------------|
| **Control Plane** | The brain — API server, scheduler, etcd |
| **Worker Nodes** | EC2 instances that run your containers |
| **Node Group** | A group of worker nodes (auto-scaling) |
| **IAM Roles** | Permissions for EKS to manage AWS resources |

### Cost Warning
EKS control plane: ~$0.10/hr (~$73/month)
Worker nodes: depends on instance type (t3.medium ~$0.0416/hr)
NAT Gateway: ~$0.045/hr

**Tip:** Destroy resources when not studying to save money!

## The Terraform Code
Look at `terraform/eks.tf` — it creates:
1. IAM role for EKS cluster
2. IAM role for worker nodes
3. EKS cluster
4. Node group with auto-scaling

## Step-by-Step
```bash
cd aws-project/terraform
terraform plan
terraform apply
# EKS cluster takes 10-15 minutes to create
```

## Checklist
- [ ] Understand EKS architecture
- [ ] Reviewed eks.tf
- [ ] Understand IAM roles for EKS
- [ ] (Optional) Created EKS cluster
