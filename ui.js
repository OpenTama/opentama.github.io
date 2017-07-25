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
var teamAssets = [
  new Image(),
  new Image(),
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
for(var i in teamAssets) {
  teamAssets[i].src = "assets/monsters/0.png";
}
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
var topHeight = 400;
var boardHeight = 500;
var barHeight = 75;
var renderQueue = [];
var animationList = [];
var scene = 0;
var teammateSelected;
var searchAssets = [
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image()
];

function redraw() {
  // TODO variable frame rate
  // Draw bottom buttons
  renderer.textBaseline = 'middle';
  renderer.textAlign = "center";
  renderer.font = (barHeight / 2) + "px Arial";
  renderer.fillStyle = "#333333";
  renderer.fillRect(0, boardHeight + topHeight, boardWidth, barHeight);
  renderer.fillStyle = "#444499";
  renderer.fillRect(barHeight * 0.05, boardHeight + topHeight + barHeight * 0.05, boardWidth / 2 - barHeight * 0.075, barHeight * 0.9);
  renderer.fillRect(boardWidth / 2 + barHeight * 0.025, boardHeight + topHeight + barHeight * 0.05, boardWidth / 2 - barHeight * 0.075, barHeight * 0.9);
  renderer.fillStyle = "#333333";
  renderer.fillText(scene == 2 || scene == 3 ? "YES" : "DUNGEON", boardWidth * 0.25, boardHeight + topHeight + barHeight / 2);
  renderer.fillText(scene == 2 || scene == 3 ? "NO" : "TEAM", boardWidth * 0.75, boardHeight + topHeight + barHeight / 2);
  renderer.clearRect(0, 0, boardWidth, boardHeight + topHeight);
  // Draw board
  if (scene == 0 || scene == 2 || scene == 3) {
    renderer.fillStyle = "#333333";
    renderer.fillRect(0, 0, boardWidth, topHeight);
    var toDraw = renderQueue.shift();
    // Queue is empty when orbs are being moved
    if (toDraw == undefined) {
      toDraw = getBoard();
    }
    for (var i = 0; i < getNumInCol(); i++) {
      for (var j = 0; j < getNumInRow(); j++) {
        // draw background
        renderer.drawImage(bgAssets[(i + j) % 2],
                           j * boardWidth / getNumInRow(),
                           i * boardHeight / getNumInCol() + topHeight,
                           boardWidth / getNumInRow(),
                           boardHeight / getNumInCol());
        // Orb id -1 means don't draw it
        if (toDraw[i][j].color >= 0 && toDraw[i][j].color < orbAssets.length) {
          if (getOrbSelected() != null && getOrbSelected().row == i && getOrbSelected().col == j) {
            renderer.globalAlpha = 0.5;
          }
          renderer.drawImage(orbAssets[toDraw[i][j].color],
                             boardWidth * j / getNumInRow(),
                             boardHeight * (i - toDraw[i][j].offset) / getNumInCol() + topHeight,
                             boardWidth / getNumInRow(),
                             boardHeight / getNumInCol());
          renderer.globalAlpha = 1;
        }
      }
    }
    if (getOrbSelected() != null) {
      renderer.drawImage(orbAssets[toDraw[getOrbSelected().row][getOrbSelected().col].color],
                         boardWidth * toDraw[getOrbSelected().row][getOrbSelected().col].trueX / getNumInRow(),
                         boardHeight * toDraw[getOrbSelected().row][getOrbSelected().col].trueY / getNumInCol() + topHeight,
                         boardWidth / getNumInRow(),
                         boardHeight / getNumInCol());
      if (getTimeLeft() < .5) {
        renderer.fillStyle = "#00FF00"
        renderer.fillRect(boardWidth * toDraw[getOrbSelected().row][getOrbSelected().col].trueX / getNumInRow(),
                          boardHeight * toDraw[getOrbSelected().row][getOrbSelected().col].trueY / getNumInCol() - boardHeight / 50 + topHeight,
                          boardWidth / getNumInRow() * getTimeLeft() * 2,
                          boardHeight / 50);
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
                           boardHeight * animation.i / getNumInCol() + topHeight,
                           boardWidth / getNumInRow(),
                           boardHeight / getNumInCol());
        renderer.globalAlpha = 1; 
        break;
      }
    }
    animationList = animationList.filter(function(animation) {
      return animation.timeLeft > 0;
    });
    // Draw team and HP bar
    renderer.fillStyle = "#CCCCCC";
    renderer.fillRect(boardWidth * 0.1, topHeight - boardWidth * 0.05, boardWidth * 0.88, boardWidth * 0.05);
    renderer.fillRect(boardWidth * 0.03, topHeight - boardWidth * 0.05, boardWidth * 0.05, boardWidth * 0.05);
    renderer.fillStyle = "#333333";
    renderer.fillRect(boardWidth * 0.11, topHeight - boardWidth * 0.04, boardWidth * 0.86, boardWidth * 0.03);
    renderer.fillStyle = "#DD4444";
    renderer.fillRect(boardWidth * 0.11, topHeight - boardWidth * 0.04, (boardWidth * 0.86) * getHp() / getMaxHp(), boardWidth * 0.03);
    renderer.fillStyle = "#000000";
    renderer.font = "bolder " + (boardWidth * 0.036) + "px Sans";
    renderer.textAlign = "right";
    renderer.fillText(getHp() + "/" + getMaxHp(), boardWidth * 0.97, topHeight - boardWidth * 0.012);
    renderer.fillStyle = "#00FF00";
    renderer.font = "bolder " + (boardWidth * 0.035) + "px Sans";
    renderer.fillText(getHp() + "/" + getMaxHp(), boardWidth * 0.97, topHeight - boardWidth * 0.012);
    renderer.drawImage(orbAssets[5], boardWidth * 0.03, topHeight - boardWidth * 0.05, boardWidth * 0.05, boardWidth * 0.05);
    renderer.drawImage(teamAssets[6], boardWidth * 0.025, topHeight - boardWidth * 0.2, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(teamAssets[7], boardWidth * 0.2,  topHeight - boardWidth * 0.2, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(teamAssets[8], boardWidth * 0.35,  topHeight - boardWidth * 0.2, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(teamAssets[9], boardWidth * 0.5,  topHeight - boardWidth * 0.2, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(teamAssets[10], boardWidth * 0.65,  topHeight - boardWidth * 0.2, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(teamAssets[11], boardWidth * 0.825,  topHeight - boardWidth * 0.2, boardWidth * 0.15, boardWidth * 0.15);
  }
  if (scene == 2 || scene == 3) {
    renderer.globalAlpha = 0.8;
    renderer.fillStyle = "#333333";
    renderer.fillRect(0, 0, boardWidth, boardHeight + topHeight);
    renderer.globalAlpha = 1;
    renderer.fillStyle = "#444499";
    renderer.fillRect(boardWidth * 0.2, (boardHeight + topHeight) * 0.4, boardWidth * 0.6, (boardHeight + topHeight) * 0.2);
    renderer.fillStyle = "#333333";
    renderer.fillText("LEAVE DUNGEON?", boardWidth / 2, (boardHeight + topHeight) / 2);
  }
  if (scene == 1) {
    renderer.fillStyle = "#333333";
    renderer.fillRect(0, 0, boardWidth, boardHeight + topHeight);
    renderer.fillStyle = "#444499";
    renderer.fillRect(0, 0, boardWidth, boardWidth * 0.625);
    renderer.textAlign = "left";
    renderer.fillStyle = "#333333";
    renderer.fillText("ASSISTS:", boardWidth * 0.025, boardWidth * 0.1);
    renderer.drawImage(teamAssets[0], boardWidth * 0.025, boardWidth * 0.15, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(teamAssets[1], boardWidth * 0.2, boardWidth * 0.15, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(teamAssets[2], boardWidth * 0.35, boardWidth * 0.15, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(teamAssets[3], boardWidth * 0.5, boardWidth * 0.15, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(teamAssets[4], boardWidth * 0.65, boardWidth * 0.15, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(teamAssets[5], boardWidth * 0.825, boardWidth * 0.15, boardWidth * 0.15, boardWidth * 0.15);
    renderer.fillText("TEAM:", boardWidth * 0.025, boardWidth * 0.4);
    renderer.drawImage(teamAssets[6], boardWidth * 0.025, boardWidth * 0.45, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(teamAssets[7], boardWidth * 0.2, boardWidth * 0.45, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(teamAssets[8], boardWidth * 0.35, boardWidth * 0.45, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(teamAssets[9], boardWidth * 0.5, boardWidth * 0.45, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(teamAssets[10], boardWidth * 0.65, boardWidth * 0.45, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(teamAssets[11], boardWidth * 0.825, boardWidth * 0.45, boardWidth * 0.15, boardWidth * 0.15);
  }
  if (scene == 4) {
    renderer.fillStyle = "#333333";
    renderer.fillRect(0, 0, boardWidth, boardHeight + topHeight);
    var searchResults = queryMonsters();
    for (var i = 0; i < Math.min(searchResults.length, searchAssets.length); i++) {
      searchAssets[i].src = "assets/monsters/" + searchResults[i] + ".png";
    }
    renderer.textAlign = "left";
    renderer.fillStyle = "#444499";
    renderer.fillText("RESULTS:", boardWidth * 0.045, boardWidth * 0.1);
    renderer.drawImage(searchAssets[0], boardWidth * 0.045, boardWidth * 0.15, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(searchAssets[1], boardWidth * 0.235, boardWidth * 0.15, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(searchAssets[2], boardWidth * 0.425, boardWidth * 0.15, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(searchAssets[3], boardWidth * 0.615, boardWidth * 0.15, boardWidth * 0.15, boardWidth * 0.15);
    renderer.drawImage(searchAssets[4], boardWidth * 0.805, boardWidth * 0.15, boardWidth * 0.15, boardWidth * 0.15);
    if (searchResults.length > searchAssets.length) {
      renderer.fillText("Additional results not displayed", boardWidth * 0.045, boardHeight + topHeight - boardWidth * 0.1);
    }
  }
};

function mouseHandler() {
  document.getElementById("board").addEventListener("mousedown", function(e) {
    if (e.pageY - this.offsetTop > boardHeight + topHeight) {
      if (e.pageX - this.offsetLeft > boardWidth / 2) {
        switch(scene) {
          case 0: scene = 2; break;
          case 1: scene = 1; break;
          case 2: scene = 0; break;
          case 3: scene = 0; break;
          case 4: scene = 1; break;
        }
      } else {
        switch(scene) {
          case 0: scene = 3; break;
          case 1: scene = 0; initBoard(); break;
          case 2: scene = 1; break;
          case 3: scene = 0; initBoard(); break;
          case 4: scene = 0; initBoard(); break;
        }
      }
    } else {
      switch(scene) {
      case 0:
        if (renderQueue.length != 0 || animationList.length != 0 || e.pageY - this.offsetTop - topHeight < 0) {
          break;
        }
        var row = (e.pageY - this.offsetTop - topHeight) * 1.0 * getNumInCol() / boardHeight - .5;
        var col = (e.pageX - this.offsetLeft) * 1.0 * getNumInRow() / boardWidth - .5;
        boardMouseDown(row, col);
        break;
      case 1:
        var x = (e.pageX - this.offsetLeft) / boardWidth;
        var y = (e.pageY - this.offsetTop) / boardWidth;
        if ((x > 0.025 && x < 0.175 || x > 0.2 && x < 0.8 || x > 0.825 && x < 0.975) &&
            (y > 0.15 && y < 0.3 || y > 0.45 && y < 0.6)) {
          if (x > 0.825) {
            x -= 0.025;
          }
          if (x > 0.2) {
            x -= 0.025;
          }
          x -= 0.025;
          if (y > 0.45) {
            y -= 0.15;
          }
          y -= 0.15;
          teammateSelected = Math.floor(x / 0.15) + Math.floor(y / 0.15) * 6;
          scene = 4;
          break;
        }
      case 4:
        var x = (e.pageX - this.offsetLeft) / boardWidth - 0.045;
        var y = (e.pageY - this.offsetTop) / boardWidth - 0.15;
        if (y > 0 && y < 0.15 && x % 0.19 < 0.15 && x > 0 && x < 0.91) {
          teamAssets[teammateSelected] = searchAssets[Math.floor(x / 0.19)];
          scene = 1;
        }
        break;
      }
    }
  });

  document.getElementById("board").addEventListener("mouseup", function(e) {
    switch(scene) {
    case 0:
      if (renderQueue.length != 0 || animationList.length != 0) {
        break;
      }
      var row = Math.max(Math.min(e.pageY - this.offsetTop - topHeight, boardHeight - 1), 1) * 1.0 * getNumInCol() / boardHeight - .5;
      var col = (e.pageX - this.offsetLeft) * 1.0 * getNumInRow() / boardWidth - .5;
      boardMouseUp(row, col);
    }
  });

  document.getElementById("board").addEventListener("mousemove", function(e) {
    switch(scene) {
    case 0:
      if (renderQueue.length != 0 || animationList.length != 0) {
        break;
      }
      var row = Math.max(Math.min(e.pageY - this.offsetTop - topHeight, boardHeight - 1), 1) * 1.0 * getNumInCol() / boardHeight - .5;
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
