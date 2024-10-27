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

var games = {
  [Symbol.iterator]: function* () {
    for (let key in this) {
      yield [key, this[key]] // yield [key, value] pair
    }
  },
};



io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Obsluha události vytvoření nové hry
  socket.on('createGame', (gameName, playerName, symbol) => {
    const gameId = generateGameId();
    socket.join(gameId);
    games[gameId] = {
      player1: [playerName, symbol],
      player1Id: socket.id,
      player2: null,
      player2Id: null,
      name: gameName,
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
    if (games[gameId] && !games[gameId].player2) {
      games[gameId].player2 = playerName;
      games[gameId].player2Id = socket.id;
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

  socket.on('dis', (gameId, master) => {
    if (master) {
      games[gameId].player1[0] = games[gameId].player2
      games[gameId].player1Id = games[gameId].player2Id
    }
    socket.leave(gameId);
    games[gameId].player2 = null;
    games[gameId].score = [0, 0];
    games[gameId].player2Id = null;
    games[gameId].ready1 = false;
    games[gameId].ready2 = false;
    games[gameId].size = null;
    games[gameId].wSize = null;
    io.to(gameId).emit('dis')
  })
  
  socket.on('disconnecting', () => {
    for (const game of games) {
      if (game[1].player1Id == socket.id || game[1].player2Id == socket.id) {
        let gameId = game[0]

        if (games[gameId].player1Id == socket.id) {
          games[gameId].player1[0] = games[gameId].player2
          games[gameId].player1Id = games[gameId].player2Id
        }
        socket.leave(gameId);
        games[gameId].player2 = null;
        games[gameId].score = [0, 0];
        games[gameId].player2Id = null;
        games[gameId].ready1 = false;
        games[gameId].ready2 = false;
        games[gameId].size = null;
        games[gameId].wSize = null;
        io.to(gameId).emit('dis')
      }
    };
  })

  // Obsluha události odpojení klienta
  socket.on('disconnect', () => {

    console.log('Client disconnected:', socket.id);
  });
});

// Funkce pro generování náhodného ID hry
function generateGameId() {
  return Math.random().toString(36).substr(2, 9);
}
