
// Připojení k serveru pomocí Socket.IO
const socket = io();
var game = {
  gameId: null,
  gameName: null,
  playerName: null,
}

const params = new URLSearchParams(window.location.search);
// Získání hodnoty parametru "gameId" z URL
game.gameId = params.get('gameId');
if (game.gameId) joinGame(true)

// Obsluha události vytvoření nové hry
socket.on('gameCreated', (gameId) => {
  console.log('Game created:', gameId);
  // Zobrazení odkazu na připojení k hře
  const joinUrl = window.location.href + 'index.html?gameId=' + gameId;
  console.log('Join URL:', joinUrl);
  game.gameId = gameId
  console.log(game)
  document.getElementById("demo").innerHTML = `Created room ${game.gameName}(${game.gameId}) under name ${game.playerName}.`;

  // Zde můžete provést další manipulace s odkazem (např. zobrazení na stránce)
});

// Obsluha události připojení nového hráče k hře
socket.on('playerJoined', (playerName) => {
  console.log('Player joined:', playerName);
  // Zde můžete provést akce související s novým hráčem (např. aktualizace seznamu hráčů)
});

// Funkce pro vytvoření nové hry
function createGame() {
  const gameName = prompt('Enter game name:');
  const playerName = prompt('Enter your name:');
  if (confirm("Want to be X")) {
    symbol = 'X'
  } else {
    symbol = 'O'
  }
  socket.emit('createGame', gameName, playerName, symbol);
  game.gameName = gameName
  game.playerName = playerName
}

// Funkce pro připojení k existující hře
function joinGame(id) {
  if (!id) { game.gameId = prompt('Enter the game ID:'); }
  const playerName = prompt('Enter your name:');
  socket.emit('joinGame', game.gameId, playerName);
  game.playerName = playerName
  document.getElementById("demo").innerHTML = `Joined room ${game.gameName}(${game.gameId}) under name ${game.playerName}.`
  socket.on('full', (istrue) => {
    if (istrue) {
      console.log(`Game ${game.gameId} is full.`)
      document.getElementById("demo").innerHTML = `Room ${game.gameName}(${game.gameId}) is full.`
    }
  })
}