# Day 2: Create the Backend Service

## What You'll Learn
- How to create a simple Node.js API
- What a health endpoint is and why every service needs one
- How to test your API locally

## Concepts

### What is a Microservice?
A microservice is a small, independent application that does ONE thing well.
Instead of one giant app, you break it into smaller pieces that talk to each other.

### Why a /health Endpoint?
Every production service needs a health check endpoint:
- Kubernetes uses it to know if your app is alive
- Load balancers use it to route traffic
- Monitoring tools use it to alert you

## Step-by-Step

### 1. Initialize the project
```bash
cd aws-project/services/backend
npm init -y
npm install express
```

### 2. Create the server (already created for you)
Look at `services/backend/index.js` — it has:
- `GET /health` — returns service status
- `GET /api/info` — returns service info
- Error handling middleware

### 3. Run it locally
```bash
cd aws-project/services/backend
node index.js
```

### 4. Test it
Open another terminal:
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test info endpoint
curl http://localhost:3001/api/info
```

Expected response from /health:
```json
{
  "status": "healthy",
  "service": "backend-api",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 5.123
}
```

### Understanding the Code
```javascript
// This creates a web server
const app = express();

// This defines a route — when someone visits /health, run this function
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// This starts the server on port 3001
app.listen(3001);
```

## Key Takeaways
- Express is a minimal web framework for Node.js
- Routes map URLs to functions
- JSON is the standard format for API responses
- Health endpoints are critical for production systems

## Checklist
- [ ] Backend service created
- [ ] `npm install` completed
- [ ] Server runs on port 3001
- [ ] `/health` returns JSON response
- [ ] `/api/info` returns service info
