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
var blindAssets = [
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
var plusAsset = new Image();
var lockAsset = new Image();
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
var attAssets = [
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image()
];
var typeAssets = [
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
blindAssets[0].src = "assets/Shadow-Orb.png";
blindAssets[1].src = "assets/Shadow-Orb.png";
blindAssets[2].src = "assets/Shadow-Orb.png";
blindAssets[3].src = "assets/Shadow-Orb.png";
blindAssets[4].src = "assets/Shadow-Orb.png";
blindAssets[5].src = "assets/Shadow-Heal.png";
blindAssets[6].src = "assets/Shadow-Jammer.png";
blindAssets[7].src = "assets/Shadow-Poison.png";
blindAssets[8].src = "assets/Shadow-MPoison.png";
blindAssets[9].src = "assets/Shadow-Bomb.png";
bgAssets[0].src = "assets/bg0.png";
bgAssets[1].src = "assets/bg1.png";
plusAsset.src = "assets/Mod-Plus.png";
lockAsset.src = "assets/Mod-Lock.png";
attAssets[0].src = "http://puzzledragonx.com/en/img/allow/1.png";
attAssets[1].src = "http://puzzledragonx.com/en/img/allow/2.png";
attAssets[2].src = "http://puzzledragonx.com/en/img/allow/3.png";
attAssets[3].src = "http://puzzledragonx.com/en/img/allow/4.png";
attAssets[4].src = "http://puzzledragonx.com/en/img/allow/5.png";
attAssets[5].src = "http://puzzledragonx.com/en/img/skill/12.png";
attAssets[6].src = "http://puzzledragonx.com/en/img/allow/0.png";
typeAssets[0].src = "http://puzzledragonx.com/en/img/type/7.png";
typeAssets[1].src = "http://puzzledragonx.com/en/img/type/2.png";
typeAssets[2].src = "http://puzzledragonx.com/en/img/type/3.png";
typeAssets[3].src = "http://puzzledragonx.com/en/img/type/4.png";
typeAssets[4].src = "http://puzzledragonx.com/en/img/type/1.png";
typeAssets[5].src = "http://puzzledragonx.com/en/img/type/6.png";
typeAssets[6].src = "http://puzzledragonx.com/en/img/type/5.png";
typeAssets[7].src = "http://puzzledragonx.com/en/img/type/9.png";
typeAssets[8].src = "http://puzzledragonx.com/en/img/type/12.png";
typeAssets[9].src = "http://puzzledragonx.com/en/img/type/11.png";
typeAssets[10].src = "http://puzzledragonx.com/en/img/type/8.png";
typeAssets[11].src = "http://puzzledragonx.com/en/img/type/13.png";
typeAssets[12].src = "http://puzzledragonx.com/en/img/allow/0.png";

var renderer;
var boardWidth = 600;
var topHeight = 400;
var boardHeight = 500;
var barHeight = 75;
var renderQueue = [];
var animationList = [];
var scene = 0;
var teammateSelected;
var searchAssets = [];
for (var i = 0; i < 15; i++) {
  searchAssets.push(new Image());
}
var page = 0;
var monsterConstraints = {type: 12, att1: 6, att2: 6, rarity: 0};
var fallbackSrc = "\\"

function redraw() {
  // TODO variable frame rate
  // Draw bottom buttons
  renderer.globalAlpha = 1;
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
            renderer.globalAlpha = 0.5; // The selected orb should be transparent
          }
          var orbImage = orbAssets[toDraw[i][j].color];
          if (toDraw[i][j].blind2 > 0){ // Duration blind overrides normal blind
            orbImage = blindAssets[toDraw[i][j].color]; // TODO: Create specific textures for duration blind
          } else if (toDraw[i][j].blind1){
            orbImage = blindAssets[toDraw[i][j].color]; 
          } 
          renderer.drawImage(orbImage,
                             boardWidth * j / getNumInRow(),
                             boardHeight * (i - toDraw[i][j].offset) / getNumInCol() + topHeight,
                             boardWidth / getNumInRow(),
                             boardHeight / getNumInCol());
          if (toDraw[i][j].enhanced) {
            renderer.drawImage(plusAsset,
                               boardWidth * j / getNumInRow(),
                               boardHeight * (i - toDraw[i][j].offset) / getNumInCol() + topHeight,
                               boardWidth / getNumInRow(),
                               boardHeight / getNumInCol());
          }
          if (toDraw[i][j].locked) {
            renderer.drawImage(lockAsset,
                               boardWidth * j / getNumInRow(),
                               boardHeight * (i - toDraw[i][j].offset) / getNumInCol() + topHeight,
                               boardWidth / getNumInRow(),
                               boardHeight / getNumInCol());
          }
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
      if (toDraw[getOrbSelected().row][getOrbSelected().col].enhanced) {
        renderer.drawImage(plusAsset,
                           boardWidth * toDraw[getOrbSelected().row][getOrbSelected().col].trueX / getNumInRow(),
                           boardHeight * toDraw[getOrbSelected().row][getOrbSelected().col].trueY / getNumInCol() + topHeight,
                           boardWidth / getNumInRow(),
                           boardHeight / getNumInCol());
      }
      if (toDraw[getOrbSelected().row][getOrbSelected().col].locked) {
        renderer.drawImage(lockAsset,
                           boardWidth * toDraw[getOrbSelected().row][getOrbSelected().col].trueX / getNumInRow(),
                           boardHeight * toDraw[getOrbSelected().row][getOrbSelected().col].trueY / getNumInCol() + topHeight,
                           boardWidth / getNumInRow(),
                           boardHeight / getNumInCol());
      }
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
    renderer.textAlign = "center";
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
    var searchResults = queryMonsters(monsterConstraints);
    for (var i = 0; i < Math.min(searchResults.length - page * 15, searchAssets.length); i++) {
      var desiredSrc = "http://puzzledragonx.com/en/img/book/" + searchResults[i + page * 15].assetId + ".png"
      if (searchAssets[i].src != desiredSrc && searchAssets[i].src != fallbackSrc) {
        searchAssets[i].onerror = function() {
          this.onload = function() {
            fallbackSrc = this.src;
            this.onload = function() {};
          };
          this.src = "assets/monsters/fail.png";
        };
        searchAssets[i].src = desiredSrc;
      }
    }
    renderer.textAlign = "left";
    renderer.fillStyle = "#444499";
    renderer.fillText("RESULTS:", boardWidth * 0.045, boardWidth * 0.08 + topHeight);
    for (var i = 0; i < searchAssets.length; i++) {
      if (searchResults.length > i + page * 15) {
        renderer.drawImage(searchAssets[i], boardWidth * (0.19 * (i % 5) + 0.045), boardWidth * (0.19 * (Math.floor(i / 5)) + 0.15) + topHeight,
                           boardWidth * 0.15, boardWidth * 0.15);
      }
    }
    renderer.fillStyle = "#444499";
    renderer.fillText("Page " + (page + 1) + " of " + (Math.floor(searchResults.length / 15) + 1), boardWidth * 0.3, boardHeight + topHeight - boardWidth * 0.08);
    renderer.fillRect(boardWidth * 0.035, boardHeight + topHeight - boardWidth * 0.13, boardWidth * 0.23, boardWidth * 0.09)
    renderer.fillRect(boardWidth * 0.735, boardHeight + topHeight - boardWidth * 0.13, boardWidth * 0.23, boardWidth * 0.09)
    renderer.fillStyle = "#333333";
    renderer.fillText("<- Prev", boardWidth * 0.045, boardHeight + topHeight - boardWidth * 0.08)
    renderer.fillText("Next ->", boardWidth * 0.745, boardHeight + topHeight - boardWidth * 0.08)
    renderer.globalAlpha = 0.7;
    if (page == 0) {
      renderer.fillRect(boardWidth * 0.035, boardHeight + topHeight - boardWidth * 0.13, boardWidth * 0.23, boardWidth * 0.09)
    }
    if (page == Math.floor(searchResults.length / 15)) {
      renderer.fillRect(boardWidth * 0.735, boardHeight + topHeight - boardWidth * 0.13, boardWidth * 0.23, boardWidth * 0.09)
    }
    renderer.globalAlpha = 1;
    renderer.fillStyle = "#444499";
    renderer.fillRect(0, 0, boardWidth, topHeight);
    renderer.fillStyle = "#333333";
    renderer.textBaseline = "middle";
    renderer.fillText("Main Att", boardWidth * 0.045, boardWidth * 0.1);
    renderer.fillText("Sub Att", boardWidth * 0.045, boardWidth * 0.2);
    renderer.fillText("Type", boardWidth * 0.045, boardWidth * 0.35);
    renderer.fillText("Rarity", boardWidth * 0.045, boardWidth * 0.55);
    for (var i = 0; i < attAssets.length; i++) {
      renderer.drawImage(attAssets[i], boardWidth * (0.35 + 0.09 * i), boardWidth * 0.05, boardWidth * 0.09, boardWidth * 0.09);
      renderer.drawImage(attAssets[i], boardWidth * (0.35 + 0.09 * i), boardWidth * 0.15, boardWidth * 0.09, boardWidth * 0.09);
    }
    for (var i = 0; i < typeAssets.length; i++) {
      renderer.drawImage(typeAssets[i], boardWidth * (0.35 + 0.09 * (i % 7)), boardWidth * (i > 6 ? 0.39 : 0.3), boardWidth * 0.09, boardWidth * 0.09);
    }
    for (var i = 0; i < 11; i++) {
      if (monsterConstraints.rarity == i) {
        renderer.fillRect(boardWidth * (0.35 + 0.055 * i), boardWidth * 0.5, i == 10 ? boardWidth * 0.085 : boardWidth * 0.055, boardWidth * 0.09);
        renderer.fillStyle = "#444499";
      }
      renderer.fillText(i == 0 ? "?" : i, boardWidth * (0.36 + 0.055 * i), boardWidth * 0.55);
      renderer.fillStyle = "#333333";
    }
    renderer.globalAlpha = 0.5;
    renderer.fillRect(boardWidth * (0.35 + 0.09 * monsterConstraints.att1), boardWidth * 0.05, boardWidth * 0.09, boardWidth * 0.09);
    renderer.fillRect(boardWidth * (0.35 + 0.09 * monsterConstraints.att2), boardWidth * 0.15, boardWidth * 0.09, boardWidth * 0.09);
    renderer.fillRect(boardWidth * (0.35 + 0.09 * (monsterConstraints.type % 7)),
                      boardWidth * (monsterConstraints.type > 6 ? 0.39 : 0.3), boardWidth * 0.09, boardWidth * 0.09);
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
        }
        break;
      case 4:
        var x1 = (e.pageX - this.offsetLeft) / boardWidth - 0.35;
        var x2 = (e.pageX - this.offsetLeft) / boardWidth - 0.35;
        var x3 = (e.pageX - this.offsetLeft) / boardWidth - 0.35;
        var x4 = (e.pageX - this.offsetLeft) / boardWidth - 0.045;
        var x5 = (e.pageX - this.offsetLeft) / boardWidth;
        var y1 = (e.pageY - this.offsetTop) / boardWidth - 0.05;
        var y2 = (e.pageY - this.offsetTop) / boardWidth - 0.3;
        var y3 = (e.pageY - this.offsetTop) / boardWidth - 0.5;
        var y4 = (e.pageY - this.offsetTop - topHeight) / boardWidth - 0.15;
        var y5 = (e.pageY - this.offsetTop - topHeight - boardHeight) / boardWidth + 0.13;
        if (y4 > 0 && y4 % 0.19 < 0.15 && y4 < 0.53 && x4 % 0.19 < 0.15 && x4 > 0 && x4 < 0.91) {
          monsterChosen = queryMonsters(monsterConstraints)[Math.floor(x4 / 0.19) + Math.floor(y4 / 0.19) * 5 + page * 15];
          if (monsterChosen != undefined) {
            teamAssets[teammateSelected].src = searchAssets[Math.floor(x4 / 0.19) + Math.floor(y4 / 0.19) * 5].src;
            console.log(team[teammateSelected]);
            scene = 1;
          }
        }
        function resetSearchAssets () {
          for (var i = 0; i < searchAssets.length; i++) {
            searchAssets[i].src = "assets/monsters/0.png";
          }
        }
        if (y1 > 0 && y1 < 0.09 && x1 > 0 && x1 < 0.63) {
          monsterConstraints.att1 = Math.floor(x1 / 0.09);
          resetSearchAssets();
          page = 0;
        }
        if (y1 > 0.1 && y1 < 0.19 && x1 > 0 && x1 < 0.63) {
          monsterConstraints.att2 = Math.floor(x1 / 0.09);
          resetSearchAssets();
          page = 0;
        }
        if (y2 > 0 && y2 < 0.18 && x2 > 0 && x2 < 0.63) {
          monsterConstraints.type = Math.floor(x2 / 0.09) + Math.floor(y2 / 0.09) * 7;
          resetSearchAssets();
          page = 0;
        }
        if (y3 > 0 && y3 < 0.1 && x2 > 0 && x2 < 0.635) {
          monsterConstraints.rarity = Math.min(Math.floor(x3 / 0.055), 10);
          resetSearchAssets();
          page = 0;
        }
        if (y5 > 0 && y5 < 0.09 && x5 > 0.735 && x5 < 0.965 && page < Math.floor(queryMonsters(monsterConstraints).length / 15)) {
          page += 1;
          resetSearchAssets();
        }
        if (y5 > 0 && y5 < 0.09 && x5 > 0.035 && x5 < 0.265 && page > 0) {
          page -= 1;
          resetSearchAssets();
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
