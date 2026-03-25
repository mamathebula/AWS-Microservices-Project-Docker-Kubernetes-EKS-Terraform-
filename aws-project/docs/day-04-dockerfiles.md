# Day 4: Write Dockerfiles

## What You'll Learn
- What a Dockerfile is and how it works
- How to write a Dockerfile for Node.js
- How to build Docker images
- Best practices for production Dockerfiles

## Concepts

### What is a Dockerfile?
A Dockerfile is a text file with instructions to build a Docker image.
Think of it as a recipe:

```
FROM node:18-alpine    ← Start with a base image (like starting with flour)
WORKDIR /app           ← Set the working directory
COPY package*.json ./  ← Copy dependency list
RUN npm install        ← Install dependencies
COPY . .               ← Copy your code
EXPOSE 3001            ← Document which port the app uses
CMD ["node", "index.js"] ← Command to run when container starts
```

### Dockerfile Instructions Explained
| Instruction | What it does |
|-------------|-------------|
| `FROM` | Base image to start from (like choosing an OS) |
| `WORKDIR` | Sets the directory inside the container |
| `COPY` | Copies files from your machine into the container |
| `RUN` | Executes a command during build (install deps, etc.) |
| `EXPOSE` | Documents which port the app listens on |
| `CMD` | The command that runs when the container starts |
| `ENV` | Sets environment variables |

### Why alpine?
`node:18-alpine` uses Alpine Linux — a tiny Linux distro (~5MB).
- `node:18` = ~900MB
- `node:18-alpine` = ~170MB
Smaller images = faster builds, faster deploys, less attack surface.

## Step-by-Step

### 1. Build the backend image
```bash
cd aws-project/services/backend
docker build -t backend-api:1.0 .
```

What happens:
1. Docker reads the Dockerfile
2. Executes each instruction as a "layer"
3. Caches layers (so rebuilds are fast)
4. Tags the final image as `backend-api:1.0`

### 2. Build the events image
```bash
cd aws-project/services/events
docker build -t events-service:1.0 .
```

### 3. Verify images were created
```bash
docker images
```
You should see both images listed.

### 4. Run a container from your image
```bash
# Run backend
docker run -p 3001:3001 backend-api:1.0

# In another terminal, test it
curl http://localhost:3001/health
```

### 5. Understanding -p (port mapping)
```
-p 3001:3001
    ↑      ↑
    |      └── Container port (inside Docker)
    └── Host port (your machine)
```
This maps port 3001 on your machine to port 3001 inside the container.

### .dockerignore
Like `.gitignore` but for Docker. Prevents unnecessary files from being copied:
```
node_modules
npm-debug.log
.git
.env
```

## Best Practices
1. **Copy package.json first, then npm install, then copy code** — this caches the npm install layer
2. **Use alpine images** — smaller and more secure
3. **Don't run as root** — use `USER node` for security
4. **Use .dockerignore** — keep images small

## Checklist
- [ ] Understand each Dockerfile instruction
- [ ] Backend image built successfully
- [ ] Events image built successfully
- [ ] Can run containers from images
- [ ] Tested with curl
