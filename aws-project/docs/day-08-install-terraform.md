# Day 8: Install Terraform & Learn Basics

## What You'll Learn
- What Terraform is and why we use it
- How to install Terraform
- Basic Terraform commands
- Your first Terraform file

## Concepts

### What is Terraform?
Terraform is an Infrastructure as Code (IaC) tool. Instead of clicking around
in the AWS console to create resources, you write code that describes what you want.

**Without Terraform:**
- Click "Create VPC" in AWS console
- Click "Create Subnet"
- Click "Create EKS Cluster"
- Forget what you did 3 months later
- Can't replicate in another account

**With Terraform:**
- Write code describing your infrastructure
- Run `terraform apply` — everything gets created
- Code is version controlled (Git)
- Anyone can see exactly what exists
- Replicate in any account with one command

### Key Terms
| Term | Meaning |
|------|---------|
| **Provider** | Plugin that talks to a cloud (AWS, Azure, GCP) |
| **Resource** | A thing you want to create (VPC, subnet, cluster) |
| **State** | Terraform's record of what it created |
| **Plan** | Preview of what Terraform will do |
| **Apply** | Actually create/modify the resources |
| **Destroy** | Delete everything Terraform created |

### Terraform Workflow
```
Write .tf files → terraform init → terraform plan → terraform apply
                      ↓                  ↓               ↓
              Download plugins    Preview changes    Create resources
```

## Installation

### macOS
```bash
# Using Homebrew
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Verify
terraform --version
```

### Also Install AWS CLI
```bash
brew install awscli

# Configure with your AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (e.g., us-east-1), Output format (json)
```

## Your First Terraform File
Create a test to understand the basics:

```bash
mkdir /tmp/terraform-test
cd /tmp/terraform-test
```

Create `main.tf`:
```hcl
# This tells Terraform we're using AWS
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS provider
provider "aws" {
  region = "us-east-1"
}

# Create a simple S3 bucket to test
resource "aws_s3_bucket" "test" {
  bucket = "my-terraform-test-bucket-unique-name-12345"
}
```

### Try the commands (DON'T apply yet — just learn the flow):
```bash
# Download provider plugins
terraform init

# Preview what will be created
terraform plan

# Create the resources (only if you want to test with real AWS)
# terraform apply

# Delete everything
# terraform destroy
```

## Basic Commands Reference
```bash
terraform init      # Initialize — download providers
terraform plan      # Preview changes
terraform apply     # Apply changes (create/modify resources)
terraform destroy   # Delete all resources
terraform fmt       # Format your .tf files
terraform validate  # Check for syntax errors
terraform state list # List resources Terraform manages
```

## Checklist
- [ ] Terraform installed
- [ ] AWS CLI installed and configured
- [ ] Understand init → plan → apply workflow
- [ ] Created a test .tf file
- [ ] Ran `terraform init` and `terraform plan`
