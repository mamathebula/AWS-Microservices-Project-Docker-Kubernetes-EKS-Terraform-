# Day 6: Add a Simple Frontend (Optional)

## What You'll Learn
- How a frontend connects to backend services
- How to serve static files in Docker
- Full-stack microservices flow

## The Frontend
A simple HTML page that:
- Shows backend health status
- Lists events from the events service
- Lets you create new events

The frontend is at `services/frontend/index.html`

## Step-by-Step

### 1. Review the frontend code
It's a single HTML file with vanilla JavaScript — no frameworks needed.
It calls your backend API using `fetch()`.

### 2. Add frontend to docker-compose
The frontend is served by nginx (a fast web server).
It's already added to `docker-compose.yml` as a comment — uncomment it.

Or add this to your docker-compose.yml:
```yaml
  frontend:
    build: ./services/frontend
    ports:
      - "8080:80"
    depends_on:
      - backend
```

### 3. Start everything
```bash
docker compose up --build -d
```

### 4. Open in browser
Go to http://localhost:8080

You should see:
- Backend health status (green if healthy)
- List of events
- Form to create new events

## How It All Connects
```
Browser (localhost:8080)
    ↓
Nginx serves HTML/CSS/JS
    ↓
JavaScript calls backend API (localhost:3001)
    ↓
Backend calls events service (events:3002)
    ↓
Response flows back up
```

## Checklist
- [ ] Frontend files created
- [ ] Nginx Dockerfile works
- [ ] Frontend loads in browser
- [ ] Can see health status
- [ ] Can create and view events
