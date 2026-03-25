# Day 9: Create VPC Using Terraform

## What You'll Learn
- What a VPC is and why you need one
- Public vs Private subnets
- How to write Terraform for networking

## Concepts

### What is a VPC?
VPC = Virtual Private Cloud. It's your own private network in AWS.
Think of it as your own building — you control who gets in and out.

```
┌─────────────────── VPC (10.0.0.0/16) ───────────────────┐
│                                                           │
│  ┌─── Public Subnet ───┐   ┌─── Public Subnet ───┐     │
│  │    10.0.1.0/24       │   │    10.0.2.0/24       │     │
│  │  (Load Balancers)    │   │  (Load Balancers)    │     │
│  │    AZ: us-east-1a    │   │    AZ: us-east-1b    │     │
│  └──────────────────────┘   └──────────────────────┘     │
│                                                           │
│  ┌── Private Subnet ───┐   ┌── Private Subnet ───┐     │
│  │    10.0.3.0/24       │   │    10.0.4.0/24       │     │
│  │  (EKS Worker Nodes)  │   │  (EKS Worker Nodes)  │     │
│  │    AZ: us-east-1a    │   │    AZ: us-east-1b    │     │
│  └──────────────────────┘   └──────────────────────┘     │
└───────────────────────────────────────────────────────────┘
```

### Public vs Private Subnets
- **Public subnet**: Has a route to the internet (Internet Gateway)
  - Used for: Load balancers, bastion hosts
- **Private subnet**: No direct internet access
  - Used for: Application servers, databases
  - Can reach internet via NAT Gateway (for updates, etc.)

### Why 2 Availability Zones?
AWS requires EKS to have subnets in at least 2 AZs for high availability.
If one data center goes down, your app keeps running in the other.

## The Terraform Code
Look at `terraform/vpc.tf` — it creates:
1. VPC with CIDR 10.0.0.0/16
2. 2 public subnets (different AZs)
3. 2 private subnets (different AZs)
4. Internet Gateway (for public subnets)
5. NAT Gateway (for private subnets to reach internet)
6. Route tables

## Step-by-Step
```bash
cd aws-project/terraform

# Initialize Terraform
terraform init

# Preview what will be created
terraform plan

# Create the VPC (this costs money for NAT Gateway ~$0.045/hr)
# Only run this when you're ready
terraform apply
```

## Understanding CIDR Notation
```
10.0.0.0/16 = 65,536 IP addresses (the VPC)
10.0.1.0/24 = 256 IP addresses (a subnet)
```
The `/16` and `/24` are the subnet mask — smaller number = more IPs.

## Checklist
- [ ] Understand VPC, subnets, and AZs
- [ ] Reviewed the Terraform VPC code
- [ ] Ran `terraform init`
- [ ] Ran `terraform plan` to preview
- [ ] (Optional) Applied to create real resources
