let field = [];
let humanMovesFirst = null;
let humanAvatar = null;
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
      if (fieldPointAt(j, i).value === ' ') {
        fieldPointAt(j, i).value = getComputerAvatar();
        render();
        return;
      }
    }
  }
}

async function humanMove(position) {
  if (field[position].value !== ' ' || computerThinks || hasWinner()) {
    return;
  }
  field[position].value = humanAvatar;
  render();


  if (!hasWinner()) {
    await computerMove();
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
  field = [];
  for (let i = 0; i < fieldSize * fieldSize; i++) {
    field.push({value: ' ', isWinning: false});
  }
}

async function startGame() {
  if (!hasWinner()) {
    humanMovesFirst = Boolean(Math.round(Math.random()));
  }

  humanAvatar = getHumanAvatarValue();
  showMessage('Let the war begin!');

  if (computerThinks) {
    stopComputerThinking();
  }

  emptyField();
  render();

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
    const line = indices.map(j => fieldPointAt(j, i)).filter(Boolean);
    const column = indices.map(j => fieldPointAt(i, j)).filter(Boolean);
    const diagonalTopForth = indices.map(j => fieldPointAt(i + j, j)).filter(Boolean);
    const diagonalTopBack = indices.map(j => fieldPointAt(fieldSize - 1 - i - j, j)).filter(Boolean);
    const diagonalBottomForth = indices.map(j => fieldPointAt(j, i + j)).filter(Boolean);
    const diagonalBottomBack = indices.map(j => fieldPointAt(fieldSize - 1 - j, i + j)).filter(Boolean);
    const directions = [
      line,
      column,
      diagonalTopForth,
      diagonalTopBack,
      diagonalBottomForth,
      diagonalBottomBack
    ];

    const direction = directions
      .map(direction=> ({indices: combinations.map(combination => direction.map(i=> i.value).join('').indexOf(combination)), direction}))
      .find(({indices: [zerosIndex, crossesIndex]})=> crossesIndex > -1 || zerosIndex > -1);

    console.log(directions, direction);

    if (direction) {
      const [zerosIndex, crossesIndex] = direction.indices;
      const nonNegativeIndex = zerosIndex > -1 ? zerosIndex : crossesIndex;
      // Mark all points as winning
      direction.direction
        .slice(nonNegativeIndex, nonNegativeIndex + winningSize)
        .forEach(point=> point.isWinning = true);
      render();

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
    if (cell.value !== ' ') {
      boardCell.classList.add('value_' + cell.value);
    }

    if (cell.isWinning) {
      boardCell.classList.add('winning');
    }

    board.appendChild(boardCell);
  });

  const computerCellClassList = document.querySelector('#sidebar .cell.computer').classList;
  const humanCellClassList = document.querySelector('#sidebar .cell.human').classList;

  board.classList[computerThinks ? 'add' : 'remove']('thinking');
  board.classList[humanAvatar ? 'remove' : 'add']('disabled');

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
