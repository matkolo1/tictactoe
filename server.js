const express = require('express')
const http = require('http')
const path = require('path')
const socketIo = require('socket.io')
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

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
    games[gameId] = {
      player1: [playerName, symbol],
      player2: [], name: gameName,
      ready1: false,
      ready2: false,
      size: null,
      wSize: null,
      score: [0, 0]
    };
    socket.emit('gameCreated', gameId);
    console.log(`${playerName} created ${gameName}(${gameId}).`)
  });

  // Obsluha události připojení k existující hře
  socket.on('joinGame', (gameId, playerName) => {
    if (games[gameId] && !games[gameId].player2[0]) {
      games[gameId].player2.push(playerName);
      socket.join(gameId);
      io.to(gameId).emit('playerJoined', playerName, games[gameId].name);
      console.log(`${playerName} joined ${games[gameId].name}(${gameId}).`)
    } else if (games[gameId] !== undefined) {
      socket.emit('full', games[gameId].name)
      console.log(`${playerName} tryed joining full room ${games[gameId].name}(${gameId}).`)
    } else {
      socket.emit('noexist', gameId)
      console.log(`${playerName} tryed joining nonexisting room ${gameId}.`)
    }
  });

  socket.on('ready', (gameId, mas, playerName, size, winSize) => {
    if (mas) {
      games[gameId].ready1 = true;
      games[gameId]['size'] = JSON.parse(size);
      games[gameId]['wSize'] = JSON.parse(winSize);
      console.log(games[gameId])
    }
    else games[gameId].ready2 = true;
    io.to(gameId).emit('ready', mas, playerName);
    if (games[gameId].ready1 && games[gameId].ready2) {
      console.log(games[gameId].name, 'starting game')
      io.to(gameId).emit('start', JSON.stringify(games[gameId]))
    }
  })

  // Obsluha události odpojení klienta
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('play', (gameId, cellId) => {
    io.to(gameId).emit('play', cellId);
  })

  socket.on('win', (gameId, win, playerName) => {
    if (win) {
      if (playerName) {
        games[gameId].score[0]++;
        console.log(`Room ${games[gameId].name}(${gameId}) completed a game. \n ${games[gameId].player1[0]} won.`)
      } else {
        games[gameId].score[1]++
        console.log(`Room ${games[gameId].name}(${gameId}) completed a game. \n ${games[gameId].player2} won.`)
      }
    } else console.log(`Room ${games[gameId].name}(${gameId}) completed a game. \n Draw.`)

    io.to(gameId).emit('win', games[gameId].score)
  })

  socket.on('reset', (gameId) => {
    io.to(gameId).emit('reset');
    console.log(`Room ${games[gameId].name}(${gameId}) reseted.`)
  })
});

// Funkce pro generování náhodného ID hry
function generateGameId() {
  return Math.random().toString(36).substr(2, 9);
}
