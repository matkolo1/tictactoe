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

// tictactoe setup
var grid = document.getElementById("grid");
const resetButton = document.getElementById("resetButton");
const turnShow = document.getElementById("turn");
var board = [];
var playerTurn = 0;
var playerTurnSymbol = "O";
var playerTurnSymbol2 = "X";
var size = 3;
var winSize = 3;
var turns = 0;
var startPlayer;


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
  document.getElementById('master').style.display = 'block';

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
  socket.emit("ready", game.gameId, master, game.playerName, document.getElementById('size').value, document.getElementById('winSize').value);
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

socket.on('noexist', (gameId) => {
  console.log(gameId, 'doesnt exist');
  document.getElementById("info").innerHTML = `Game ${gameId} doesn't exist.`;
});

 

socket.on("start", (games, siz, wSiz) => {startPlayer = game.playerName
  games = JSON.parse(games);
  console.log(game.gameName, game.gameId, "starting game");
  console.log(master, games)
  if (master) {
    game.enemyName = games.player2[0];
    if ((games.player1[1] == "O")) {
      game.start = 1;
      startPlayer = game.enemyName
    }
  } else {
    game.enemyName = games.player1[0];
    if ((games.player1[1] == "X")) {
      game.start = 1;
      startPlayer = game.enemyName
    }
  }
  size = siz
  winSize = wSiz
  document.getElementById("lobby").style.display = "none";
  document.getElementById("ready").style.display = "none";
  document.getElementById('master').style.display = 'none';
  document.getElementById("game").style.display = "flex";
  console.log(`gridTemplateColumns: repeat(${size}, 50px);`)
  document.getElementById("grid").style = `grid-template-columns: repeat(${size}, 50px);`;
  createGrid(grid);
  addClickListeners(grid);
});



// tic tac toe script

//changes simbols of players
function playerTurnFn() {
  if (playerTurn == 0) { playerTurnSymbol = "O"; playerTurnSymbol2 = "X"; }
  if (playerTurn == 1) { playerTurnSymbol = "X"; playerTurnSymbol2 = "O"; }
}

//create grid
function createGrid() {
  for (let i = 0; i < size; i++) {
    board.push([]);
    for (let j = 0; j < size; j++) {
      board[i].push((i + j + j) + 10);
      const cell = document.createElement("div");
      cell.classList.add("cell");

      cell.id = `cell-${i}-${j}`;

      document.getElementById("grid").appendChild(cell);
    }
  }
}

socket.on('play', (cellId) => {
  var cell = cellId.split('-')
  const cells = document.getElementsByClassName('cell');
  for (const c of cells) {
    if (c.id == `cell-${cell[1]}-${cell[2]}`) {

      c.classList.add("clicked");

      if (playerTurn == 0) {
        c.id = `${c.id}-0`;
        document.getElementById(c.id).innerHTML = "X";
        playerTurn = 1;
      } else if (playerTurn == 1) {
        c.id = `${c.id}-1`;
        document.getElementById(c.id).innerHTML = "O";
        playerTurn = 0;
      }
      playerTurnFn();
      document.getElementById("turn").innerHTML = `Player ${game.playerName} is playing.`;
      initializeBoard(c);
      checkWin(board, c);
      console.log(c.id, `cell-${cell[1]}-${cell[2]}`)
    }
  }
});

//checks if cell is clicked
function addClickListeners() {
  const cells = document.getElementsByClassName("cell");
  document.getElementById("turn").innerHTML = `Player ${startPlayer} is playing.`;
  for (const cell of cells) {
    cell.addEventListener("click", function () {
      console.log('clicked', cell.id)
      if (!this.classList.contains("clicked")) {
        if (playerTurn == game.start) {
          this.classList.add("clicked");

          if (playerTurn == 0) {
            cell.id = `${cell.id}-0`;
            document.getElementById(cell.id).innerHTML = "X";
            playerTurn = 1;
          } else if (playerTurn == 1) {
            cell.id = `${cell.id}-1`;
            document.getElementById(cell.id).innerHTML = "O";
            playerTurn = 0;
          }
          playerTurnFn();
          document.getElementById("turn").innerHTML = `Player ${game.enemyName} is playing.`;
          initializeBoard(cell);
          checkWin(board, cell);
          socket.emit('play', game.gameId, cell.id)
        }
      }
    });
  }
}

//writes moves to board
function initializeBoard(cell) {
  var posX = cell.id.split("-")[1];
  var posY = cell.id.split("-")[2];
  var player = cell.id.split("-")[3];

  board[posX][posY] = player;
}

//checks if someone wins
function checkWin(board, cell) {
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ];
  const cellRow = cell.id.split("-")[1];
  const cellCol = cell.id.split("-")[2];
  const cellPlay = cell.id.split("-")[3];
  var near = 0;

  for (var [x, y] of directions) {
    for (let i = 1; i < winSize; i++) {
      var plusRow = parseInt(cellRow) + parseInt(i * x);
      var plusCol = parseInt(cellCol) + parseInt(i * y);
      if ((plusRow < 0) || (plusCol < 0) || (plusRow >= size) || (plusCol >= size) || (board[plusRow][plusCol] !== cellPlay)) {
        break;
      } else {
        near++;
      }
    }
    for (let i = 1; i < winSize; i++) {
      var minusRow = parseInt(cellRow) - parseInt(i * x);
      var minusCol = parseInt(cellCol) - parseInt(i * y);
      if ((minusRow < 0) || (minusCol < 0) || (minusRow >= size) || (minusCol >= size) || (board[minusRow][minusCol] !== cellPlay)) {
        break;
      } else {
        near++;
      }

    }
    if (near >= (winSize - 1)) {
      if (playerTurn == game.start) document.getElementById("grid").innerHTML = `Player ${game.enemyName} Wins!!`;
      else document.getElementById("grid").innerHTML = `Player ${game.playerName} Wins!!`;
      var win = true;
    } else near = 0;
    if ((turns == (size ** 2) - 1) && !win) document.getElementById("grid").innerHTML = `Draw`;

  }
  turns++;
}