# Day 5: Docker Compose — Run Multiple Services Together

## What You'll Learn
- What Docker Compose is and why it exists
- How to define multi-container applications
- How containers communicate with each other
- How to manage services as a group

## Concepts

### The Problem
Running two services manually:
```bash
# Terminal 1
docker run -p 3001:3001 backend-api:1.0
# Terminal 2
docker run -p 3002:3002 events-service:1.0
```
This is annoying. What if you have 10 services? Docker Compose solves this.

### What is Docker Compose?
A tool to define and run multi-container applications using a YAML file.
One command starts everything: `docker compose up`

### How Services Find Each Other
In Docker Compose, each service gets a DNS name matching its service name.
So the `backend` service can reach the `events` service at `http://events:3002`.

```
┌─────────────────────────────────┐
│     Docker Compose Network      │
│                                 │
│  ┌──────────┐  ┌──────────┐   │
│  │ backend  │──│  events  │   │
│  │ :3001    │  │  :3002   │   │
│  └──────────┘  └──────────┘   │
└─────────────────────────────────┘
         ↕              ↕
    localhost:3001  localhost:3002
    (your machine)
```

## Step-by-Step

### 1. Review docker-compose.yml (already created)
The file is at `aws-project/docker-compose.yml`

### 2. Start all services
```bash
cd aws-project
docker compose up --build
```
- `--build` forces a rebuild of images
- You'll see logs from both services interleaved

### 3. Run in background (detached mode)
```bash
docker compose up --build -d
```
- `-d` runs in the background
- Use `docker compose logs -f` to follow logs

### 4. Test everything
```bash
# Backend health
curl http://localhost:3001/health

# Events health
curl http://localhost:3002/health

# Backend calling events (inter-service communication!)
curl http://localhost:3001/api/events

# Create an event
curl -X POST http://localhost:3002/events \
  -H "Content-Type: application/json" \
  -d '{"title": "Docker Compose Works!", "description": "Services talking to each other"}'
```

### 5. Useful Docker Compose commands
```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# View logs for one service
docker compose logs -f backend

# Restart a service
docker compose restart backend

# See running services
docker compose ps

# Rebuild and restart
docker compose up --build -d
```

## Understanding the docker-compose.yml
```yaml
services:
  backend:                    # Service name (also its DNS name)
    build: ./services/backend # Where to find the Dockerfile
    ports:
      - "3001:3001"          # Map host:container ports
    environment:
      - EVENTS_SERVICE_URL=http://events:3002  # How backend finds events
    depends_on:
      - events               # Start events before backend
```

Key insight: `EVENTS_SERVICE_URL=http://events:3002`
- `events` is the service name in docker-compose.yml
- Docker Compose creates a network where services can find each other by name
- This replaces `localhost` when services are in containers

## Checklist
- [ ] docker-compose.yml understood
- [ ] `docker compose up --build` works
- [ ] Both services start and are healthy
- [ ] Backend can call events service
- [ ] Can create/read events through the API
