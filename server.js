const express = require('express')
const http = require('http')
const path = require('path')
const socketIo = require('socket.io')
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'test')));

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const games = {};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Obsluha události vytvoření nové hry
  socket.on('createGame', (gameName, playerName, symbol) => {
    const gameId = generateGameId();
    socket.join(gameId);
    games[gameId] = { player1: [playerName, symbol], player2: [], name: gameName };
    socket.emit('gameCreated', gameId);
    console.log(gameId, games[gameId]);
  });

  // Obsluha události připojení k existující hře
  socket.on('joinGame', (gameId, playerName) => {
    if (games[gameId] && !games[gameId].player2[0]) {
      games[gameId].player2.push(playerName);
      socket.join(gameId);
      io.to(gameId).emit('playerJoined', playerName);
      console.log(games[gameId])
    } else {
      console.log(`Game ${gameId} full.`)
      socket.emit('full', true)
    }
  });

  // Obsluha události odpojení klienta
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Funkce pro generování náhodného ID hry
function generateGameId() {
  return Math.random().toString(36).substr(2, 9);
}


