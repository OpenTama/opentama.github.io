var initUi;
var pushBoard;
var pushAnimation;

(function() {

var orbAssets = [
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image()
];
var bgAssets = [new Image(), new Image()];
orbAssets[0].src = "assets/Orb-Fr.png";
orbAssets[1].src = "assets/Orb-Wt.png";
orbAssets[2].src = "assets/Orb-Wd.png";
orbAssets[3].src = "assets/Orb-Lt.png";
orbAssets[4].src = "assets/Orb-Dk.png";
orbAssets[5].src = "assets/Orb-Heal.png";
orbAssets[6].src = "assets/Orb-Jammer.png";
orbAssets[7].src = "assets/Orb-Poison.png";
orbAssets[8].src = "assets/Orb-MPoison.png";
orbAssets[9].src = "assets/Orb-Bomb.png";
bgAssets[0].src = "assets/bg0.png";
bgAssets[1].src = "assets/bg1.png";
var renderer;
var boardWidth = 600;
var boardHeight = 500;
var barHeight = 75;
var renderQueue = [];
var animationList = [];
var animationRunning = false;
var scene = 1;

function redraw() {
  // TODO variable frame rate
  // Draw bottom buttons
  renderer.textBaseline = 'middle';
  renderer.textAlign = "center";
  renderer.font = (barHeight / 2) + "px Arial";
  renderer.fillStyle = "#333333";
  renderer.fillRect(0, boardHeight, boardWidth, barHeight);
  renderer.fillStyle = "#444499";
  renderer.fillRect(barHeight * 0.05, boardHeight + barHeight * 0.05, boardWidth / 2 - barHeight * 0.075, barHeight * 0.9);
  renderer.fillRect(boardWidth / 2 + barHeight * 0.025, boardHeight + barHeight * 0.05, boardWidth / 2 - barHeight * 0.075, barHeight * 0.9);
  renderer.fillStyle = "#333333";
  renderer.fillText(scene == 2 || scene == 3 ? "YES" : "DUNGEON", boardWidth * 0.25, boardHeight + barHeight / 2);
  renderer.fillText(scene == 2 || scene == 3 ? "NO" : "TEAM", boardWidth * 0.75, boardHeight + barHeight / 2);
  renderer.clearRect(0, 0, boardWidth, boardHeight);
  // Draw board
  if (scene == 0 || scene == 2 || scene == 3) {
    var toDraw = renderQueue.shift();
    // Queue is empty when orbs are being moved
    if (typeof(toDraw) == "undefined") {
      animationRunning = false;
      toDraw = getBoard();
    }
    for (var i = 0; i < getNumInCol(); i++) {
      for (var j = 0; j < getNumInRow(); j++) {
        // draw background
        renderer.drawImage(bgAssets[(i + j) % 2],
                           j * boardWidth / getNumInRow(),
                           i * boardHeight / getNumInCol(),
                           boardWidth / getNumInRow(),
                           boardHeight / getNumInCol());
        // Orb id -1 means don't draw it
        if (toDraw[i][j].color >= 0 && toDraw[i][j].color < orbAssets.length) {
          if (getOrbSelected() != null && getOrbSelected().row == i && getOrbSelected().col == j) {
            renderer.globalAlpha = 0.5;
          }
          renderer.drawImage(orbAssets[toDraw[i][j].color],
                             boardWidth * j / getNumInRow(),
                             boardHeight * (i - toDraw[i][j].offset) / getNumInCol(),
                             boardWidth / getNumInRow(),
                             boardHeight / getNumInCol());
          renderer.globalAlpha = 1;
        }
      }
    }
    if (getOrbSelected() != null) {
      renderer.drawImage(orbAssets[toDraw[getOrbSelected().row][getOrbSelected().col].color],
                         boardWidth * toDraw[getOrbSelected().row][getOrbSelected().col].trueX / getNumInRow(),
                         boardHeight * toDraw[getOrbSelected().row][getOrbSelected().col].trueY / getNumInCol(),
                         boardWidth / getNumInRow(),
                         boardHeight / getNumInCol());
      if (getTimeLeft() < .5) {
        renderer.fillStyle = "#00FF00"
        renderer.fillRect(boardWidth * toDraw[getOrbSelected().row][getOrbSelected().col].trueX / getNumInRow(),
                          boardHeight * toDraw[getOrbSelected().row][getOrbSelected().col].trueY / getNumInCol() - boardHeight / 50,
                          boardWidth / getNumInRow() * getTimeLeft() * 2,
                          boardHeight / 50)
      }
    }
    for (var animation of animationList) {
      animation.timeLeft -= 1;
      if (animation.type == "pause") {
        break;
      }
      switch (animation.type) {
      case "erase":
        renderer.globalAlpha = animation.timeLeft / 10;
        renderer.drawImage(orbAssets[animation.color],
                           boardWidth * animation.j / getNumInRow(),
                           boardHeight * animation.i / getNumInCol(),
                           boardWidth / getNumInRow(),
                           boardHeight / getNumInCol());
        renderer.globalAlpha = 1; 
        break;
      }
    }
    animationList = animationList.filter(function(animation) {
      return animation.timeLeft > 0;
    });
  }
  if (scene == 2 || scene == 3) {
    renderer.globalAlpha = 0.8;
    renderer.fillStyle = "#333333";
    renderer.fillRect(0, 0, boardWidth, boardHeight);
    renderer.globalAlpha = 1;
    renderer.fillStyle = "#444499";
    renderer.fillRect(boardWidth * 0.2, boardHeight * 0.4, boardWidth * 0.6, boardHeight * 0.2);
    renderer.fillStyle = "#333333";
    renderer.fillText("LEAVE DUNGEON?", boardWidth / 2, boardHeight / 2);
  }
  if (scene == 1) {
    renderer.fillStyle = "#333333";
    renderer.fillRect(0, 0, boardWidth, boardHeight);
    renderer.fillStyle = "#444499";
    renderer.fillText("TODO: team selection", boardWidth / 2, boardHeight / 2);
  }
};

function mouseHandler() {
  document.getElementById("board").addEventListener("mousedown", function(e) {
    if (e.pageY - this.offsetTop > boardHeight) {
      if (e.pageX - this.offsetLeft > boardWidth / 2) {
        switch(scene) {
          case 0: scene = 2; break;
          case 1: scene = 1; break;
          case 2: scene = 0; break;
          case 3: scene = 0; break;
        }
      } else {
        switch(scene) {
          case 0: scene = 3; break;
          case 1: scene = 0; initBoard(); break;
          case 2: scene = 1; break;
          case 3: scene = 0; initBoard(); break;
        }
      }
    } else {
      switch(scene) {
      case 0:
        if (animationRunning) {
          break;
        }
        var row = (e.pageY - this.offsetTop) * 1.0 * getNumInCol() / boardHeight - .5;
        var col = (e.pageX - this.offsetLeft) * 1.0 * getNumInRow() / boardWidth - .5;
        boardMouseDown(row, col);
        break;
      }
    }
  });

  document.getElementById("board").addEventListener("mouseup", function(e) {
    switch(scene) {
    case 0:
      if (animationRunning) {
        break;
      }
      var row = Math.min(e.pageY - this.offsetTop, boardHeight) * 1.0 * getNumInCol() / boardHeight - .5;
      var col = (e.pageX - this.offsetLeft) * 1.0 * getNumInRow() / boardWidth - .5;
      boardMouseUp(row, col);
    }
  });

  document.getElementById("board").addEventListener("mousemove", function(e) {
    switch(scene) {
    case 0:
      if (animationRunning) {
        break;
      }
      var row = Math.min(e.pageY - this.offsetTop, boardHeight) * 1.0 * getNumInCol() / boardHeight - .5;
      var col = (e.pageX - this.offsetLeft) * 1.0 * getNumInRow() / boardWidth - .5;
      boardMouseMove(row, col);
    }
  });
};

initUi = function() {
  renderer = document.getElementById("board").getContext("2d");
  setInterval(redraw, 50);
  mouseHandler();
};

pushBoard = function(board) {
  renderQueue.push(JSON.parse(JSON.stringify(board)));
};

pushAnimation = function(animation) {
  animationList.push(animation);
};

})();
