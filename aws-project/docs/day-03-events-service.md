# Day 3: Create the Events Service

## What You'll Learn
- How to create a second microservice
- How microservices communicate via HTTP
- Why services should be independent

## Concepts

### Microservice Communication
Services talk to each other over HTTP (REST APIs). Each service:
- Has its own port
- Has its own codebase
- Can be deployed independently
- Can be written in different languages (we use Node.js for both)

```
User → Backend API (port 3001) → Events Service (port 3002)
```

### Why Separate Services?
- **Independent scaling** — if events get heavy traffic, scale just that service
- **Independent deployment** — update events without touching backend
- **Fault isolation** — if events crashes, backend still works (graceful degradation)

## Step-by-Step

### 1. Initialize the events service
```bash
cd aws-project/services/events
npm init -y
npm install express
```

### 2. The events service (already created for you)
Look at `services/events/index.js` — it has:
- `GET /health` — health check
- `GET /events` — returns list of events
- `POST /events` — create a new event

### 3. Run both services
Terminal 1:
```bash
cd aws-project/services/backend
node index.js
# Running on port 3001
```

Terminal 2:
```bash
cd aws-project/services/events
node index.js
# Running on port 3002
```

### 4. Test the communication
```bash
# Test events service directly
curl http://localhost:3002/events

# Test backend calling events service
curl http://localhost:3001/api/events

# Create a new event
curl -X POST http://localhost:3002/events \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Event", "description": "Learning Docker"}'

# Verify it was created
curl http://localhost:3002/events
```

## How the Communication Works
1. You call `GET /api/events` on the backend (port 3001)
2. Backend makes an HTTP request to `http://localhost:3002/events`
3. Events service responds with data
4. Backend wraps it and sends it back to you

This is the foundation of microservice architecture.

## Checklist
- [ ] Events service created
- [ ] Both services run simultaneously
- [ ] Events service responds on port 3002
- [ ] Backend successfully calls events service
- [ ] Can create events via POST
