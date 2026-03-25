const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// In-memory storage (in production, you'd use a database)
// This is fine for learning — keeps things simple
let events = [
  { id: 1, title: 'System Started', description: 'Events service initialized', createdAt: new Date().toISOString() }
];
let nextId = 2;

// Health check — same pattern as backend
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'events-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    eventCount: events.length
  });
});

// Get all events
app.get('/events', (req, res) => {
  res.json({
    service: 'events-service',
    count: events.length,
    events: events
  });
});

// Get single event by ID
app.get('/events/:id', (req, res) => {
  const event = events.find(e => e.id === parseInt(req.params.id));
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

// Create a new event
app.post('/events', (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newEvent = {
    id: nextId++,
    title,
    description: description || '',
    createdAt: new Date().toISOString()
  };

  events.push(newEvent);
  console.log(`Event created: ${newEvent.title}`);
  res.status(201).json(newEvent);
});

// Delete an event
app.delete('/events/:id', (req, res) => {
  const index = events.findIndex(e => e.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  events.splice(index, 1);
  res.json({ message: 'Event deleted' });
});

app.listen(PORT, () => {
  console.log(`Events service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
