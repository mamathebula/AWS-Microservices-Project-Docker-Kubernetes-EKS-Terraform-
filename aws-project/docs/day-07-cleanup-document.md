# Day 7: Clean Up and Document Architecture

## What You'll Learn
- How to document your architecture
- Docker cleanup commands
- Week 1 review

## Architecture Diagram
```
                    ┌──────────────────────────────────────┐
                    │         Docker Compose Network        │
                    │                                      │
┌──────────┐       │  ┌──────────┐      ┌──────────┐    │
│  Browser  │──────▶│  │ Frontend │      │  Events  │    │
│           │       │  │ (nginx)  │      │ Service  │    │
└──────────┘       │  │ :80/8080 │      │  :3002   │    │
                    │  └──────────┘      └────▲─────┘    │
                    │                         │          │
                    │  ┌──────────┐           │          │
                    │  │ Backend  │───────────┘          │
                    │  │   API    │                      │
                    │  │  :3001   │                      │
                    │  └──────────┘                      │
                    └──────────────────────────────────────┘
```

## What You Built This Week
1. **Backend API** — Express.js service with health check, info, and events proxy
2. **Events Service** — Express.js service with CRUD operations for events
3. **Frontend** — Simple HTML dashboard served by nginx
4. **Docker** — Each service has its own Dockerfile
5. **Docker Compose** — All services run together with one command

## Docker Cleanup Commands
```bash
# Stop all services
docker compose down

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove everything (containers, images, networks, volumes)
docker system prune -a

# Check disk usage
docker system df
```

## Week 1 Review Quiz (Test Yourself)
1. What's the difference between an image and a container?
2. Why do we copy package.json before copying the rest of the code?
3. How do services find each other in Docker Compose?
4. What does `depends_on` do?
5. Why use alpine-based images?

### Answers
1. Image = blueprint, Container = running instance
2. Docker layer caching — if package.json hasn't changed, npm install is cached
3. By service name — Docker Compose creates DNS entries
4. Controls startup order (but doesn't wait for the service to be "ready")
5. Smaller size (~170MB vs ~900MB), faster builds, less attack surface

## Checklist
- [ ] Can explain the architecture
- [ ] Know all Docker cleanup commands
- [ ] Answered the review quiz
- [ ] Ready for Week 2 (Terraform)
