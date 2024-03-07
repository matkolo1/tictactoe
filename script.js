const grid = document.getElementById("grid");
const resetButton = document.getElementById("resetButton");
const turnShow = document.getElementById("turn");
var board = [];
var playerTurn = 0;
var playerTurnSymbol = "X";
var playerTurnSymbol2 = "O";
var size = 3;
var winSize = 3;
var turns = 0;


if (!localStorage.getItem("sizeState")) {size = 3;} else size = JSON.parse(localStorage.getItem("sizeState"));
grid.style.gridTemplateColumns = `repeat(${size}, 50px)`;
document.getElementById("winSize").value = size;
if (localStorage.getItem("winSizeStatus")) {winSize = JSON.parse(localStorage.getItem("winSizeStatus"));} else winSize = size;
initializeGrid(grid, "gridState");
addClickListeners(grid, "gridState");


//changes simbols of players
function playerTurnFn() {
  if (playerTurn == 0) playerTurnSymbol = "X";
  if (playerTurn == 1) playerTurnSymbol = "O";
}
function playerTurnFn2() {
  if (playerTurn == 0) playerTurnSymbol2 = "O";
  if (playerTurn == 1) playerTurnSymbol2 = "X";
}

//makes reset button
resetButton.addEventListener("click", function () {
  localStorage.removeItem("gridState");
  localStorage.removeItem("turnState");
  location.reload();
});
document.body.appendChild(resetButton);

//checks if there is a grid
function initializeGrid(grid, localStorageKey) {
  if (!localStorage.getItem(localStorageKey)) {
    createGrid(grid);
  } else {
    restoreGrid(grid, localStorageKey);
  }
}

//create grid
function createGrid(grid) {
  for (let i = 0; i < size; i++) {
    board.push([]);
    for (let j = 0; j < size; j++) {
      board[i].push((i + j + j) + 10);
      const cell = createCell();

      cell.id = `cell-${i}-${j}`;

      grid.appendChild(cell);
    }
  }
}

//create cell
function createCell() {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  return cell;
}

//take grid from local storage
function restoreGrid(grid, localStorageKey) {
  const gridState = JSON.parse(localStorage.getItem(localStorageKey));
  grid.innerHTML = gridState.html;
  const turnState = JSON.parse(localStorage.getItem("turnState"));
  playerTurn = turnState;
}

//checks if cell is clicked
function addClickListeners(grid, localStorageKey) {
  const cells = grid.getElementsByClassName("cell");
  turnShow.innerHTML = `Player ${playerTurnSymbol} is playing.`;
  for (const cell of cells) {
    cell.addEventListener("click", function () {
      if (!this.classList.contains("clicked")) {
        this.classList.add("clicked");
        const cellPosition = cell.id;

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
        playerTurnFn2();
        turnShow.innerHTML = `Player ${playerTurnSymbol} is playing.`;
        initializeBoard(cell);
        saveGridState(grid, localStorageKey);
        localStorage.setItem("turnState", JSON.stringify(playerTurn));
        checkWin(board, cell);
      }
    });
  }
}

//save grid state
function saveGridState(grid, localStorageKey) {
  const cells = grid.getElementsByClassName("cell");
  let html = "";
  for (const cell of cells) {
    html += cell.outerHTML;
  }
  localStorage.setItem(localStorageKey, JSON.stringify({ html }));
}

//set size of grid
function setSize() {
  size = document.getElementById("size").value;
  localStorage.setItem("sizeState", JSON.stringify(size));
  localStorage.removeItem("gridState");
  localStorage.removeItem("winSizeState");
  location.reload();
}

//set count of cells to win
function setWinSize() {
  winSize = document.getElementById("winSize").value;
  document.getElementById("winSize").style.backgroundColor = "green";
  localStorage.setItem("winSizeState", JSON.stringify(winSize));
}
function winSizeColor() {
  document.getElementById("winSize").style.backgroundColor = "#0f1523";
  document.getElementById("winSize").max = size;
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
      }else {
        near++;
      }
    }
    for (let i = 1; i < winSize; i++) {
      var minusRow = parseInt(cellRow) - parseInt(i * x);
      var minusCol = parseInt(cellCol) - parseInt(i * y);
      if ((minusRow < 0) || (minusCol < 0) || (minusRow >= size) || (minusCol >= size) || (board[minusRow][minusCol] !== cellPlay)) {
        break;
      }else{
        near++;
      }
      
    }
    if (near >= (winSize - 1)) {
      document.getElementById("grid").innerHTML = `Player ${playerTurnSymbol2} Wins!!`; 
      var win = true;
    }else near = 0; 
    if ((turns == (size ** 2) - 1) && !win) document.getElementById("grid").innerHTML = `Draw`;
    
  }
  turns++;
}

//create bubbles for background
for (let i = 0; i < 50; i++) {
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.style.width = Math.floor(Math.random() * 30) + 10 + "px";
  bubble.style.height = bubble.style.width;
  bubble.style.left = Math.random() * 100 + "%";
  bubble.style.top = Math.random() * 100 + "%";
  document.querySelector(".bubbles").appendChild(bubble);
}

if (size > 6) document.getElementById("body").style.overflowY = "scroll";