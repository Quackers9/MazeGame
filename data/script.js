let context;
let canvas;
let maze;
let mazeHeight;
let mazeWidth;
let playerIcon;
let startTimer;

class PlayerIcon {
  constructor() {
    this.column = 0;
    this.row = 0;
  }
}

class MazeCell {
  constructor(column, row) {
    this.column = column;
    this.row = row;

    this.rightWall = true;
    this.topWall = true;
    this.bottomWall = true;
    this.leftWall = true;
    this.visited = false;
  }
}

class Maze {
  constructor(columns, rows, cellSize) {
    this.backgroundColor = "#ffffff";
    this.endColor = "#00ff00";
    this.mazeColor = "#000000";
    this.playerColor = "#ff0000";
    this.rows = rows;
    this.columns = columns;
    this.cellSize = cellSize;

    this.cells = [];

    this.isGameStarted = false;

    this.totalSeconds = 0;

    this.generateMaze()
  }

  /**
  * @desc generates the parameters required for the redraw function to render the maze
  * @return multiple parameters to be used in the redraw function
  */
  generateMaze() {
    mazeHeight = this.rows * this.cellSize;
    mazeWidth = this.columns * this.cellSize;

    canvas.height = mazeHeight;
    canvas.width = mazeWidth;
    canvas.style.height = mazeHeight;
    canvas.style.width = mazeWidth;
    
    playerIcon.column = 0;
    playerIcon.row = 0;

    for (let column = 0; column < this.columns; column++) {
      this.cells[column] = [];
      for (let row = 0; row < this.rows; row++) {
        this.cells[column][row] = new MazeCell(column, row);
      }
    }

    let randomColumn = Math.floor(Math.random() * this.columns);
    let randomRow = Math.floor(Math.random() * this.rows);

    let stack = [];
    stack.push(this.cells[randomColumn][randomRow]);

    let currentCell;
    let nextCell;
    let directory;
    let foundNeighbor;

    while (this.hasUntouched(this.cells)) {
      currentCell = stack[stack.length - 1];
      currentCell.visited = true;
      if (this.hasUntouchedNeighbor(currentCell)) {
        nextCell = null;
        foundNeighbor = false;
        do {
          directory = Math.floor(Math.random() * 4);
          switch (directory) {
            case 0:
              if (currentCell.column !== (this.columns - 1) && !this.cells[currentCell.column + 1][currentCell.row].visited) {
                currentCell.rightWall = false;
                nextCell = this.cells[currentCell.column + 1][currentCell.row];
                nextCell.leftWall = false;
                foundNeighbor = true;
              }
              break;
            case 1:
              if (currentCell.row !== 0 && !this.cells[currentCell.column][currentCell.row - 1].visited) {
                currentCell.topWall = false;
                nextCell = this.cells[currentCell.column][currentCell.row - 1];
                nextCell.bottomWall = false;
                foundNeighbor = true;
              }
              break;
            case 2:
              if (currentCell.row !== (this.rows - 1) && !this.cells[currentCell.column][currentCell.row + 1].visited) {
                currentCell.bottomWall = false;
                nextCell = this.cells[currentCell.column][currentCell.row + 1];
                nextCell.topWall = false;
                foundNeighbor = true;
              }
              break;
            case 3:
              if (currentCell.column !== 0 && !this.cells[currentCell.column - 1][currentCell.row].visited) {
                currentCell.leftWall = false;
                nextCell = this.cells[currentCell.column - 1][currentCell.row];
                nextCell.rightWall = false;
                foundNeighbor = true;
              }
              break;
          }
          if (foundNeighbor) {
            stack.push(nextCell);
          }
        } while (!foundNeighbor)
      } else {
        currentCell = stack.pop();
      }
    }
    this.redraw();
  }

  /**
  * @desc checks which cells have .visted = true
  * @param array cells - the list of cells and their column:row positions
  * @return bool - returns true if cell is untouched and false if not untouched. Used in the generateMaze function
  */
  hasUntouched() {
    for (let column = 0; column < this.columns; column++) {
      for (let row = 0; row < this.rows; row++) {
        if (!this.cells[column][row].visited) {
          return true;
        }
      }
    }
    return false;
  }

  /**
  * @desc check if a maze cell has an untouched neighbor
  * @param object mazeCell
  * @return bool - true if mazeCell has untouched neighbor, false if not
  */
  hasUntouchedNeighbor(mazeCell) {
    return (
        (mazeCell.column !== 0                  && !this.cells[mazeCell.column - 1][mazeCell.row].visited) ||
        (mazeCell.column !== (this.columns - 1) && !this.cells[mazeCell.column + 1][mazeCell.row].visited) ||
        (mazeCell.row    !== 0                  && !this.cells[mazeCell.column][mazeCell.row - 1].visited) ||
        (mazeCell.row    !== (this.rows - 1)    && !this.cells[mazeCell.column][mazeCell.row + 1].visited)
      );
  }

  /**
  * @desc function to draw the maze to the HTML canvas element
  * @return context object attributes to be used to render the canvas
  */
  redraw() {
    context.fillStyle = this.backgroundColor;
    context.fillRect(0, 0, mazeHeight, mazeWidth);

    context.fillStyle = this.endColor;
    context.fillRect((this.columns - 1) * this.cellSize, (this.rows - 1) * this.cellSize, this.cellSize, this.cellSize);

    context.strokeStyle = this.mazeColor;
    context.strokeRect(0, 0, mazeHeight, mazeWidth);

    for (let column = 0; column < this.columns; column++) {
      for (let row = 0; row < this.rows; row++) {
        if (this.cells[column][row].rightWall) {
          context.beginPath();
          context.moveTo((column + 1) * this.cellSize, row * this.cellSize);
          context.lineTo((column + 1) * this.cellSize, (row + 1) * this.cellSize);
          context.stroke();
        }
        if (this.cells[column][row].topWall) {
          context.beginPath();
          context.moveTo(column * this.cellSize, row * this.cellSize);
          context.lineTo((column + 1) * this.cellSize, row * this.cellSize);
          context.stroke();
        }
        if (this.cells[column][row].bottomWall) {
          context.beginPath();
          context.moveTo(column * this.cellSize, (row + 1) * this.cellSize);
          context.lineTo((column + 1) * this.cellSize, (row + 1) * this.cellSize);
          context.stroke();
        }
        if (this.cells[column][row].leftWall) {
          context.beginPath();
          context.moveTo(column * this.cellSize, row * this.cellSize);
          context.lineTo(column * this.cellSize, (row + 1) * this.cellSize);
          context.stroke();
        }
      }
    }
    context.fillStyle = this.playerColor;
    context.fillRect((playerIcon.column * this.cellSize) + 2, (playerIcon.row * this.cellSize) + 2, this.cellSize - 4, this.cellSize - 4);
  }

  /**
  * @desc function to check if playerIcon is positioned on the end of maze cell
  */
  checkIfCompleted = () => {
    if ((playerIcon.column === (this.columns - 1)) && (playerIcon.row === (this.rows - 1))) {
      this.isGameStarted = false;

      // Stops the timer from counting up
      clearInterval(startTimer);

      totalSecondsString = formatTimeToString();
      // Displays a banner to tell the user they have completed the maze
      document.getElementById("completeBannerLabel").innerHTML = "You have completed the maze in " + totalSecondsString;
      document.getElementById("completeBanner").style.display = "flex";
      document.getElementById("timer").style.display = "none";

      // Displays the results from the game to the list
      saveTimeToList(mazeSize, totalSecondsString);
    }
    else {
      return false;
    }
  }
}

/**
* @desc reuseable function to set playerIcon back to the default starting position
* @return bool values for playerIcon.column and playerIcon.row to be used in the redraw function
*/
playerIconToStart = () => {
  playerIcon.column = 0;
  playerIcon.row = 0;

  // Redraws the maze using the newly assign positions for the playerIcon
  maze.redraw();
}

/**
* @desc function to check if input is within the intended range
* @return parameters for the Maze class to be used in the generateMaze function
*/
onGenerateMazeClick = () => {
  // Gets the value from the mazeSize HTML input field
  mazeSizeValue = document.getElementById("mazeSize").value;

  minMaxSizeWarning = document.getElementById("minMaxSizeWarning");

  if (mazeSizeValue > 30) {
    minMaxSizeWarning.innerHTML = "Maximium maze size is 30";
  }
  else if (mazeSizeValue < 5) {
    minMaxSizeWarning.innerHTML = "Minimium maze size is 5";
  }
  else {
    mazeSize = mazeSizeValue;
    maze.columns = mazeSizeValue;
    maze.rows = mazeSizeValue;
    minMaxSizeWarning.innerHTML = "";
    maze.generateMaze();
    onResetButtonClick();
  }
}

/**
* @desc function to start the maze game and timer
* @return bool maze.isGameStarted - as true
*/
onStartButtonClick = () => {
  maze.isGameStarted = true;

  startTimer = setInterval(startTimerCount, 1000);
  document.getElementById("startButton").disabled = true;
  document.getElementById("resetButton").disabled = false;
}

/**
* @desc function to reset the maze, timer and playerIcon
*/
onResetButtonClick = () => {
  maze.isGameStarted = false;
  maze.totalSeconds = 0;

  playerIconToStart();

  clearInterval(startTimer);
  document.getElementById("timer").innerHTML = maze.totalSeconds + " Seconds";
  document.getElementById("startButton").disabled = false;
  document.getElementById("resetButton").disabled = true;
  document.getElementById("completeBanner").style.display = "none";
  document.getElementById("timer").style.display = "block";
}

/**
* @desc function to calculate and display the count-up timer
* @return string - displays the number of seconds on the timer to the user
*/
startTimerCount = () => {
  maze.totalSeconds++;

  totalSecondsString = formatTimeToString();
  document.getElementById("timer").innerHTML = totalSecondsString;
}

/**
* @desc function to correctly format the number of seconds with the singular or plural word
* @return string - "1 Second" if the totalSeconds is 1 or the number of secodnds + "seconds" if not 1
*/
formatTimeToString = () => {
  if (maze.totalSeconds === 1) {
    return maze.totalSeconds + " Second";
  } else {
    return maze.totalSeconds + " Seconds";
  }
}

/**
* @desc function to save the string of results from the maze game the user just finished to the previous games list
* @param integer mazeSize, string totalSecondsString - the messages to be displayed
* @return string - displays the listItem to the list of previous games
*/
saveTimeToList = (mazeSize, totalSecondsString) => {
  listItem = document.createElement("LI");
  listItem.innerHTML = "Maze size: " + mazeSize + " - Time taken: " + totalSecondsString;
  document.getElementById("listContainer").appendChild(listItem);
  document.getElementById("timerListDescription").style.display = "none";
}

/**
* @desc function that moves the playerIcon up/down/left/right depending on which key is pressed
* @param event keyDown - when keyboard input is detected
* @return integer playerIcon.row or playerIcon.column - used to re-render the playerIcon in the redraw function
*/
onKeyDown = (event) => {
  if (maze.isGameStarted === true) {
    switch (event.keyCode) {
      case 37:
        if (!maze.cells[playerIcon.column][playerIcon.row].leftWall) {
          playerIcon.column = playerIcon.column - 1;
        }
        break;
      case 39:
        if (!maze.cells[playerIcon.column][playerIcon.row].rightWall) {
          playerIcon.column = playerIcon.column + 1;
        }
        break;
      case 38:
        if (!maze.cells[playerIcon.column][playerIcon.row].topWall) {
          playerIcon.row = playerIcon.row - 1;
        }
        break;
      case 40:
        if (!maze.cells[playerIcon.column][playerIcon.row].bottomWall) {
          playerIcon.row = playerIcon.row + 1;
        }
        break;
      default:
        break;
    }
    maze.redraw();
    maze.checkIfCompleted();
  }
  else if (maze.isGameStarted === false) {
    return false;
  }
}

/**
* @desc function to generate the inital maze and set initial values
* @return object PlayerIcon, object Maze - classes
*/
onLoad = () => {
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  playerIcon = new PlayerIcon();
  maze = new Maze(20, 20, 25);

  document.addEventListener("keydown", onKeyDown);
  document.getElementById("resetButton").disabled = true;
  document.getElementById("completeBanner").style.display = "none";
  document.getElementById("timerListDescription").style.display = "block";
}
