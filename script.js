let field = [];
let humanMovesFirst = null;
let humanAvatar = 'x';
let computerThinks = null;
let stopComputerThinking = null;
const fieldSize = 15;
const winningSize = 5;

function getComputerAvatar() {
  let computerAvatar = 'x';
  if (humanAvatar === 'x') {
    computerAvatar = 'o';
  }

  return computerAvatar;
}

async function computerMove() {
  const delay = 500 + Math.random() * 2000;

  try {
    await new Promise(function(resolve, reject) {
      showMessage('Computer is thinking...');

      const resetThinking = ()=> {
        computerThinks = null;
        stopComputerThinking = null;
        render();
      };

      stopComputerThinking = ()=> {
        clearTimeout(computerThinks);
        resetThinking();
        reject();
      };

      computerThinks = setTimeout(() => {
        showMessage('Your turn!');
        resetThinking();
        resolve();
      }, delay);

      render();
    });
  } catch (e) {
    return;
  }

  for (let i = 0; i < fieldSize; i++) {
    for (let j = 0; j < fieldSize; j++) {
      if (field[i * fieldSize + j] === ' ') {
        field[i * fieldSize + j] = getComputerAvatar();
        return;
      }
    }
  }
}

async function humanMove(position) {
  if (field[position] !== ' ' || computerThinks || hasWinner()) {
    return;
  }
  field[position] = humanAvatar;
  render();


  if (!hasWinner()) {
    await computerMove();
    render();
  } else {
    showMessage('You won!');
    humanMovesFirst = true;
    return;
  }

  if (hasWinner()) {
    showMessage('Computer won!');
    humanMovesFirst = false;
  }
}

function emptyField() {
  field = Array(fieldSize * fieldSize).fill(' ');
}

async function startGame() {
  humanAvatar = getHumanAvatarValue();
  showMessage('Let the war begin!');

  if (computerThinks) {
    stopComputerThinking();
  }

  emptyField();
  render();

  if (humanMovesFirst === null) {
    humanMovesFirst = Boolean(Math.round(Math.random()));
  }
  showSidebar();

  if (!humanMovesFirst) {
    await computerMove();
  }

  render();
}

function range(start, end, step = 1) {
  const result = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

function fieldPointAt(x, y) {
  if (x < 0 || x >= fieldSize || y < 0 || y >= fieldSize) {
    return null;
  }

  return field[x + y * fieldSize];
}

function hasWinner() {
  const zeros = Array(winningSize).fill('o').join('');
  const crosses = Array(winningSize).fill('x').join('');
  const combinations = [zeros, crosses];
  const indices = range(0, fieldSize);

  for (let i = 0; i < fieldSize; i++) {
    const line = indices.map(j => fieldPointAt(j, i)).join('');
    const column = indices.map(j => fieldPointAt(i, j)).join('');
    const diagonalTopForth = indices.map(j => fieldPointAt(i + j, j)).join('');
    const diagonalTopBack = indices.map(j => fieldPointAt(fieldSize - 1 - i - j, j)).join('');
    const diagonalBottomForth = indices.map(j => fieldPointAt(j, i + j)).join('');
    const diagonalBottomBack = indices.map(j => fieldPointAt(fieldSize - 1 - j, i + j)).join('');
    const directions = [
      line,
      column,
      diagonalTopForth,
      diagonalTopBack,
      diagonalBottomForth,
      diagonalBottomBack
    ];

    if (combinations.some(combination =>
      directions.some(direction=> direction.indexOf(combination) !== -1))
    ) {
      return true;
    }
  }

  return false;
}

function showMessage(text) {
  document.getElementById('message').innerText = text;
}

function showSidebar() {
  document.getElementById('sidebar').classList.add('visible');
}

function getHumanAvatarValue() {
  return document.querySelector('input[type="radio"][name="avatar"]:checked').value;
}

function initField() {
  document.getElementById('board').addEventListener('click', async (event)=> {
    if (!event.target.classList || !event.target.classList.contains('cell')) {
      return;
    }

    const index = Array.from(event.target.parentNode.children).indexOf(event.target);
    humanMove(index);
  });
}

function render() {
  const board = document.getElementById('board');

  board.innerHTML = '';

  field.forEach((cell)=> {
    const boardCell = document.createElement('div');
    boardCell.classList.add('cell');
    if (cell !== ' ') {
      boardCell.classList.add('value_' + cell);
    }

    board.appendChild(boardCell);
  });

  const computerCellClassList = document.querySelector('#sidebar .cell.computer').classList;
  const humanCellClassList = document.querySelector('#sidebar .cell.human').classList;

  document.getElementById('board').classList[computerThinks ? 'add' : 'remove']('thinking');

  computerCellClassList[computerThinks ? 'add' : 'remove']('selected');
  computerCellClassList.remove('value_o', 'value_x');
  computerCellClassList.add(humanAvatar === 'o' ? 'value_x' : 'value_o');

  humanCellClassList[computerThinks ? 'remove' : 'add']('selected');
  humanCellClassList.remove('value_o', 'value_x');
  humanCellClassList.add(humanAvatar === 'x' ? 'value_x' : 'value_o');

  document.getElementById('sidebar')
    .classList[humanMovesFirst ? 'remove' : 'add']('computer-first');
}

initField();
emptyField();
render();
