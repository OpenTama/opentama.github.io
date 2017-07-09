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
var renderQueue = [];
var animationList = [];
var animationRunning = false;

function redraw() {
  // TODO variable frame rate
  var toDraw = renderQueue.shift();
  // Queue is empty when orbs are being moved
  if (typeof(toDraw) == "undefined") {
    animationRunning = false;
    toDraw = getBoard();
  }
  renderer.clearRect(0, 0, boardWidth, boardHeight);
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
};

function mouseHandler() {
  document.getElementById("board").addEventListener("mousedown", function(e) {
    if (animationRunning) {
      return;
    }
    var row = (e.pageY - this.offsetTop) * 1.0 * getNumInCol() / boardHeight - .5;
    var col = (e.pageX - this.offsetLeft) * 1.0 * getNumInRow() / boardWidth - .5;
    boardMouseDown(row, col);
  });

  document.getElementById("board").addEventListener("mouseup", function(e) {
    if (animationRunning) {
      return;
    }
    var row = (e.pageY - this.offsetTop) * 1.0 * getNumInCol() / boardHeight - .5;
    var col = (e.pageX - this.offsetLeft) * 1.0 * getNumInRow() / boardWidth - .5;
    boardMouseUp(row, col);
  });

  document.getElementById("board").addEventListener("mousemove", function(e) {
    if (animationRunning) {
      return;
    }
    var row = (e.pageY - this.offsetTop) * 1.0 * getNumInCol() / boardHeight - .5;
    var col = (e.pageX - this.offsetLeft) * 1.0 * getNumInRow() / boardWidth - .5;
    boardMouseMove(row, col);
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
