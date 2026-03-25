const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON request bodies
app.use(express.json());

// Health check endpoint — Kubernetes and load balancers use this
// to know if your service is alive and ready to receive traffic
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'backend-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Info endpoint — returns basic service information
app.get('/api/info', (req, res) => {
  res.json({
    service: 'backend-api',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Events proxy — calls the events service
// This shows how microservices communicate with each other
app.get('/api/events', async (req, res) => {
  try {
    // EVENTS_SERVICE_URL will be set via environment variable
    // In Docker Compose, services can reach each other by service name
    const eventsUrl = process.env.EVENTS_SERVICE_URL || 'http://localhost:3002';
    const response = await fetch(`${eventsUrl}/events`);
    const data = await response.json();
    res.json({ source: 'backend-api', events: data });
  } catch (error) {
    res.status(503).json({
      error: 'Events service unavailable',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
