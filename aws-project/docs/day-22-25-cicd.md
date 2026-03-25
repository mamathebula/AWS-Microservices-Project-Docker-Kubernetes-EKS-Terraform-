# Days 22-25: CI/CD with GitHub Actions

## What You'll Learn
- What CI/CD is
- How GitHub Actions works
- Automate Docker build, push, and Kubernetes deploy

## Concepts

### What is CI/CD?
```
CI (Continuous Integration)          CD (Continuous Deployment)
┌──────────────────────┐            ┌──────────────────────┐
│ Push code to GitHub  │            │ Deploy to Kubernetes │
│         ↓            │            │         ↓            │
│ Run tests            │            │ Update pods          │
│         ↓            │            │         ↓            │
│ Build Docker image   │            │ Verify health        │
│         ↓            │            │                      │
│ Push to ECR          │            │                      │
└──────────────────────┘            └──────────────────────┘
```

### GitHub Actions Basics
- **Workflow**: A YAML file that defines automation
- **Trigger**: What starts the workflow (push, PR, manual)
- **Job**: A set of steps that run on a runner
- **Step**: A single action (checkout code, build, deploy)

## Day 22: Set Up GitHub Repo
```bash
cd aws-project
git init
git add .
git commit -m "Initial commit: microservices project"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/aws-microservices.git
git push -u origin main
```

## Day 23-24: GitHub Actions Pipeline

### Add AWS credentials to GitHub Secrets
Go to your repo → Settings → Secrets and variables → Actions → New repository secret:
- `AWS_ACCESS_KEY_ID` — your AWS access key
- `AWS_SECRET_ACCESS_KEY` — your AWS secret key
- `AWS_ACCOUNT_ID` — your AWS account ID

### The workflow file
Look at `.github/workflows/deploy.yml` — it:
1. Triggers on push to main branch
2. Logs into ECR
3. Builds Docker images
4. Pushes to ECR
5. Updates Kubernetes deployments

## Day 25: Test the Pipeline
```bash
# Make a small change
echo "// updated" >> services/backend/index.js

# Push to trigger the pipeline
git add .
git commit -m "Test CI/CD pipeline"
git push
```

Go to GitHub → Actions tab to watch the pipeline run.

## Checklist
- [ ] GitHub repo created
- [ ] AWS secrets configured
- [ ] Pipeline triggers on push
- [ ] Docker images built and pushed
- [ ] Kubernetes deployments updated
