// server.js
const http = require('http');
const socketIo = require('socket.io');

// Import your modularized combat actions
const combatActions = require('./combatActions');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Socket.IO server running. Connect with a Socket.IO client.\n');
});

const io = socketIo(server); // Initialize Socket.IO

const PORT = process.env.PORT || 3000;

// Socket.IO Connection Handling
io.on('connection', (socket) => {
    console.log(`\nUser connected: ${socket.id}`);

    // When the client emits 'choose_alone', call the modularized function
    socket.on('choose_alone', () => {
        console.log(`Client ${socket.id} chose 'alone'.`);
        // Pass the actual io instance and socket.id to the modular function
        combatActions.alone(io, socket.id);
    });

    // When the client emits 'choose_party', call the modularized function
    socket.on('choose_party', () => {
        console.log(`Client ${socket.id} chose 'party'.`);
        // Pass the actual io instance and socket.id to the modular function
        combatActions.party(io, socket.id);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Use a Socket.IO client (like a simple script or browser console) to connect and test.');
});