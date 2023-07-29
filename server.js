const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatterBot';

// Add a room object to keep track of active rooms and their users
const rooms = {};

// Run when a client connects
io.on('connection', socket => {
  // Get the username and room from the URL query parameters
  const urlParams = new URLSearchParams(socket.handshake.query);
  const username = urlParams.get('username');
  const room = urlParams.get('room');

  // Join user to chat
  socket.join(room);

  
  // Add the user to the room's users list
  if (!rooms[room]) {
    rooms[room] = [];
  }
  rooms[room].push(username);

  // Emit updated room and users list to the client
  io.to(room).emit('roomUsers', {
    room: room,
    users: rooms[room]
  });

  
  // Welcome a new user
  socket.emit('message', formatMessage(botName, `Welcome to the chat, ${username}!`));

  // Broadcast a message when a user connects
  socket.broadcast.to(room).emit('message', formatMessage(botName, `${username} has joined the chat`));

  // Runs when a user disconnects
  socket.on('disconnect', () => {
    io.to(room).emit('message', formatMessage(botName, `${username} has left the chat`));
  });

 // Remove the user from the room's users list
 rooms[room] = rooms[room].filter(user => user !== username);

 // Emit updated room and users list to the client
 io.to(room).emit('roomUsers', {
   room: room,
   users: rooms[room]
 });
  
  // Listen for chat message
  socket.on('chatMessage', msg => {
    io.to(room).emit('message', formatMessage(username, msg));
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
