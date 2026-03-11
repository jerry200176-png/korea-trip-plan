require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // For MVP, allow all origins
    methods: ['GET', 'POST']
  }
});

// Basic route to check if server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Travel Collaboration API is running' });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a specific trip room
  socket.on('joinTrip', (tripId) => {
    socket.join(tripId);
    console.log(`User ${socket.id} joined trip ${tripId}`);
  });

  // Handle itinerary updates
  socket.on('UPDATE_ITINERARY', (data) => {
    const { tripId, item } = data;
    console.log(`Received update for trip ${tripId}:`, item);
    // Broadcast the update to everyone else in the trip room
    socket.to(tripId).emit('ITINERARY_UPDATED', item);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
