# Day 1: Install Docker & Docker Compose

## What You'll Learn
- What Docker is and why we use it
- How to install Docker on your machine
- How to verify everything works

## Concepts

### What is Docker?
Docker lets you package your application + all its dependencies into a single unit called a **container**.

Without Docker:
- "It works on my machine" problems
- Different Node.js versions, missing libraries
- Hard to replicate environments

With Docker:
- Same environment everywhere (your laptop, server, cloud)
- Easy to share and deploy
- Isolated from your system

### Key Terms
| Term | Meaning |
|------|---------|
| **Image** | A blueprint for your app (like a recipe) |
| **Container** | A running instance of an image (like the cooked meal) |
| **Dockerfile** | Instructions to build an image |
| **Docker Hub** | Public registry to share images |
| **Volume** | Persistent storage for containers |

## Step-by-Step Installation

### macOS
1. Go to https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Mac
3. Open the `.dmg` file and drag Docker to Applications
4. Launch Docker Desktop
5. Wait for the whale icon in the menu bar to stop animating

### Verify Installation
Open your terminal and run:

```bash
# Check Docker version
docker --version
# Expected: Docker version 24.x.x or higher

# Check Docker Compose version
docker compose version
# Expected: Docker Compose version v2.x.x

# Run a test container
docker run hello-world
```

If you see "Hello from Docker!" — you're good to go.

### Understanding What Just Happened
When you ran `docker run hello-world`:
1. Docker looked for the `hello-world` image locally
2. Didn't find it, so it pulled it from Docker Hub
3. Created a container from that image
4. Ran the container, which printed the message
5. Container exited

### Useful Commands to Know
```bash
# List running containers
docker ps

# List ALL containers (including stopped)
docker ps -a

# List downloaded images
docker images

# Remove a container
docker rm <container_id>

# Remove an image
docker rmi <image_name>

# Stop all running containers
docker stop $(docker ps -q)
```

## Homework
- Run `docker run -it ubuntu bash` — this drops you into an Ubuntu container
- Type `ls`, `cat /etc/os-release` to explore
- Type `exit` to leave
- This shows you that a container is like a mini computer

## Checklist
- [ ] Docker Desktop installed
- [ ] `docker --version` works
- [ ] `docker compose version` works
- [ ] `docker run hello-world` works
- [ ] Explored an Ubuntu container
