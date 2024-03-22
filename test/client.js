// Připojení k serveru pomocí Socket.IO
const socket = io();
var game = {
  gameId: null,
  gameName: null,
  playerName: null,
  enemyName: null,
  start: 0,
};
var master = true;
var ready = false;

const params = new URLSearchParams(window.location.search);
// Získání hodnoty parametru "gameId" z URL
game.gameId = params.get("gameId");
if (game.gameId) joinGame(true);

// Obsluha události vytvoření nové hry
socket.on("gameCreated", (gameId) => {
  console.log("Game created:", gameId);
  // Zobrazení odkazu na připojení k hře
  var url = window.location.href.split("index")[0];
  const joinUrl = url + "index.html?gameId=" + gameId;
  console.log("Join URL:", joinUrl);
  game.gameId = gameId;
  document.getElementById("info").innerHTML = `Created room ${game.gameName}(${game.gameId}) under name ${game.playerName}.`;

  // Zde můžete provést další manipulace s odkazem (např. zobrazení na stránce)
});

// Obsluha události připojení nového hráče k hře
socket.on("playerJoined", (playerName, gameName) => {
  console.log("Player joined:", playerName, gameName);
  game.gameName = gameName;
  document.getElementById("info").innerHTML = `Joined room ${game.gameName}(${game.gameId}) under name ${game.playerName}.`;
  document.getElementById("ready").style.display = "block";

  // Zde můžete provést akce související s novým hráčem (např. aktualizace seznamu hráčů)
});

// Funkce pro vytvoření nové hry
function createGame() {
  const gameName = prompt("Enter game name:");
  const playerName = prompt("Enter your name:");
  if (confirm("Want to be X")) {
    symbol = "X";
  } else {
    symbol = "O";
  }
  socket.emit("createGame", gameName, playerName, symbol);
  game.gameName = gameName;
  game.playerName = playerName;
}

// Funkce pro připojení k existující hře
function joinGame(id) {
  if (!id) {
    game.gameId = prompt("Enter the game ID:");
  }
  const playerName = prompt("Enter your name:");
  socket.emit("joinGame", game.gameId, playerName);
  game.playerName = playerName;
  master = false;
}

function readd() {
  socket.emit("ready", game.gameId, master, game.playerName);
  ready = true;
}

socket.on("ready", (mas, playerName) => {
  console.log(`Player ${playerName}(${mas}) is ready`);
});

socket.on("full", (gameName) => {
  console.log(`Game ${gameName}(${game.gameId}) is full.`);
  game.gameName = gameName;
  document.getElementById("info").innerHTML = `Room ${game.gameName}(${game.gameId}) is full.`;
});

socket.on("start", (games) => {
  games = JSON.parse(games);
  console.log(game.gameName, game.gameId, "starting game");
  if (master) {
    game.enemyName = games.player2[0];
    if ((games.player1[1] = "O")) game.start = 1;
  } else {
    game.enemyName = games.player1[0];
    if ((games.player1[1] = "X")) game.start = 1;
  }
  document.getElementById("lobby").style.display = "none";
  document.getElementById("ready").style.display = "none";
  document.getElementById("game").style.display = "flex";
});
