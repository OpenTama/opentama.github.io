var renderer;
var numInRow = 6;
var numInCol = 5;
var gameRules = {
  skyfall:  true,
  moveTime: 4,
  minOrbs: 3,
}
var boardWidth = 600;
var boardHeight = 500;
var board = [];
var renderQueue = [];
var animationList = [];
var timeLeft = 0;
var orbSelected = null;
var animationRunning = false;
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
var bgAssets = [new Image(), new Image()];
var plusAsset = new Image();
var lockAsset = new Image();
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

function rollOrb() {
  // TODO: adjusted skyfall rate
  // Reserch skyfall rates, if 15% dark is 15/100 says dark orb spawns, or 1.15 weight on dark
  // Also account for tricolor, no-RCV and similar skyfalls 
  return {
    color:   Math.floor(Math.random() * 6),
    enhanced: false,
    locked: false,
    blind1: false, // Regular blind, slide orbs to reveal
    blind2: 0, // Duration blind, cannot see orbs until timer is over
    matched: false,
    trueX:   null,
    trueY:   null,
    offset:  0
  };
}

function refreshBoard() {
  board = [];
  for(var i = 0; i < numInCol; i++) {
  board[i] = [];
    for(var j = 0; j < numInRow; j++) {
      // TODO: actual skyfall stuff, no available combos
      board[i][j] = rollOrb();
    }
  }
};

function redraw() {
  // TODO variable frame rate
  var toDraw = renderQueue.shift();
  // Queue is empty when orbs are being moved
  if (typeof(toDraw) == "undefined") {
    animationRunning = false;
    toDraw = board;
  }
  renderer.clearRect(0, 0, boardWidth, boardHeight);
  for (var i = 0; i < numInCol; i++) {
    for (var j = 0; j < numInRow; j++) {
      // draw background
      renderer.drawImage(bgAssets[(i + j) % 2],
                         j * boardWidth / numInRow,
                         i * boardHeight / numInCol,
                         boardWidth / numInRow,
                         boardHeight / numInCol);
      // Orb id -1 means don't draw it
      if (toDraw[i][j].color >= 0 && toDraw[i][j].color < orbAssets.length) {
        if (orbSelected != null && orbSelected.row == i && orbSelected.col == j) {
	  renderer.globalAlpha = 0.5; // The selected orb should be transparent
        }   
        var orbImage = orbAssets[toDraw[i][j].color];
        if (toDraw[i][j].blind2 > 0){ // Duration blind overrides normal blind
          orbImage = blindAssets[toDraw[i][j].color]; // TODO: Create specific textures for duration blind
        } else if (toDraw[i][j].blind1){
          orbImage = blindAssets[toDraw[i][j].color]; 
        } 
        renderer.drawImage(orbImage,
                           boardWidth * j / numInRow,
                           boardHeight * (i - toDraw[i][j].offset) / numInCol,
                           boardWidth / numInRow,
                           boardHeight / numInCol);
        if (toDraw[i][j].enhanced){
          renderer.drawImage(plusAsset,
                             boardWidth * j / numInRow,
                             boardHeight * (i - toDraw[i][j].offset) / numInCol,
                             boardWidth / numInRow,
                             boardHeight / numInCol);
        }
        if (toDraw[i][j].locked){
          renderer.drawImage(lockAsset,
                             boardWidth * j / numInRow,
                             boardHeight * (i - toDraw[i][j].offset) / numInCol,
                             boardWidth / numInRow,
                             boardHeight / numInCol);
        }
        renderer.globalAlpha = 1;
      }
    }
  }
  if (orbSelected != null) {
    renderer.drawImage(orbAssets[toDraw[orbSelected.row][orbSelected.col].color],
                       toDraw[orbSelected.row][orbSelected.col].trueX,
                       toDraw[orbSelected.row][orbSelected.col].trueY,
                       boardWidth / numInRow,
                       boardHeight / numInCol);
    if (toDraw[orbSelected.row][orbSelected.col].enhanced){
      renderer.drawImage(plusAsset,
                         toDraw[orbSelected.row][orbSelected.col].trueX,
                         toDraw[orbSelected.row][orbSelected.col].trueY,
                         boardWidth / numInRow,
                         boardHeight / numInCol);
    }
    if (toDraw[orbSelected.row][orbSelected.col].locked){
      renderer.drawImage(lockAsset,
                         toDraw[orbSelected.row][orbSelected.col].trueX,
                         toDraw[orbSelected.row][orbSelected.col].trueY,
                         boardWidth / numInRow,
                         boardHeight / numInCol);
    }
    if (timeLeft < .5) {
      renderer.fillStyle = "#00FF00"
      renderer.fillRect(toDraw[orbSelected.row][orbSelected.col].trueX,
                        toDraw[orbSelected.row][orbSelected.col].trueY - boardHeight / 50,
                        boardWidth / numInRow * timeLeft * 2,
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
                         boardWidth * animation.j / numInRow,
                         boardHeight * animation.i / numInCol,
                         boardWidth / numInRow,
                         boardHeight / numInCol);
      renderer.globalAlpha = 1; 
      break;
    }
  }
  animationList = animationList.filter(function(animation) {
    return animation.timeLeft > 0;
  });
};

function cascade(skyfall) {
  for(var n = 0; n < numInCol; n++) {
    var hasCascade = false;
    for(var j = 0; j < numInRow; j++) {
      // must loop from bottom to top
      for(var i = numInCol-1; i > 0; i--) {
        if(board[i][j].color == -1 && board[i-1][j].color != -1) {
          board[i][j].color = board[i-1][j].color;
          board[i][j].enhanced = board[i-1][j].enhanced;
          board[i][j].locked = board[i-1][j].locked;
          board[i][j].blind1 = board[i-1][j].blind1;
          board[i][j].blind2 = board[i-1][j].blind2;
          board[i-1][j].color = -1;
          board[i][j].offset = 1;
          hasCascade = true;
        }
      }
      if(board[0][j].color == -1 && skyfall) {
        board[0][j] = rollOrb();
        board[0][j].offset = 1;
        hasCascade = true;
      }
    }
    if (!hasCascade) {
      break;
    }
    animationList.push({timeLeft: 3, type: "pause"});
    for (var x = 0; x < 3; x++) {
      for(var i = 0; i < numInCol; i++) {
        for(var j = 0; j < numInRow; j++) {
          board[i][j].offset = Math.max(board[i][j].offset - .34, 0);
        }
      }
      renderQueue.push(JSON.parse(JSON.stringify(board)));
    }
  }
  if (gameRules.skyfall || !skyfall) {
    getMatches();
  }
}

function getMatches() {
  timeLeft = 0;
  animationRunning = true;
  // keep track of what combo an orb is part of
  var boardMask = [];
  for (var i = 0; i < numInCol; i++) {
    boardMask[i] = [];
    for (var j = 0; j < numInRow; j++) {
      boardMask[i][j] = { matched: false, comboId: 0 };
    }
  }

  var combos = 0; // Not yet how many combos, but how many groups of three
  // TODO: support no-match-3 - how about orb unbinds?
  // TODO: support unable to match attribute effect
  // Animation goes left to right, then bottom to top
  for (var i = numInCol - 1; i >= 0; i--) {
    for (var j = 0; j < numInRow; j++) {
      // color is -1 after cascade when skyfall is disabled
      if (board[i][j].color == -1) {
        continue;
      }
      // check vertical combos, but not in bottom 2 rows
      if (i < numInCol - 2) {
        if (board[i][j].color == board[i+1][j].color && board[i][j].color == board[i+2][j].color) {
          boardMask[i][j].matched = true;
          boardMask[i][j].comboId = combos;
          boardMask[i+1][j].matched = true;
          boardMask[i+1][j].comboId = combos;
          boardMask[i+2][j].matched = true;
          boardMask[i+2][j].comboId = combos;
          combos += 1;
        }
      }
      // check horizontal combos, but not in right 2 cols
      if (j < numInRow - 2) {
        if (board[i][j].color == board[i][j+1].color && board[i][j].color == board[i][j+2].color) {
          boardMask[i][j].matched = true;
          boardMask[i][j].comboId = combos;
          boardMask[i][j+1].matched = true;
          boardMask[i][j+1].comboId = combos;
          boardMask[i][j+2].matched = true;
          boardMask[i][j+2].comboId = combos;
          combos += 1;
        }
      }
    }
  }
  // Method to merge two overlapping combos
  function combine(id1, id2) {
    if (id1 != id2) {
      for (var i = 0; i < numInCol; i++) {
        for (var j = 0; j < numInRow; j++) {
          if (boardMask[i][j].comboId == id2) boardMask[i][j].comboId = id1;
        }
      }
    }
  }
  for (var i = numInCol - 1; i >= 0; i--) {
    for (var j = 0; j < numInRow; j++) {
      if (boardMask[i][j].matched) {
        // Check each adjacent orb to see if it is matched and of the same color
        if (i > 0 && board[i][j].color == board[i-1][j].color && boardMask[i-1][j].matched) {
          combine(boardMask[i][j].comboId, boardMask[i-1][j].comboId);
        }
        if (j > 0 && board[i][j].color == board[i][j-1].color && boardMask[i][j-1].matched) {
          combine(boardMask[i][j].comboId, boardMask[i][j-1].comboId);
        }
        if (i < numInCol - 1 && board[i][j].color == board[i+1][j].color && boardMask[i+1][j].matched) {
          combine(boardMask[i][j].comboId, boardMask[i+1][j].comboId);
        }
        if (j < numInRow - 1 && board[i][j].color == board[i][j+1].color && boardMask[i][j+1].matched) {
          combine(boardMask[i][j].comboId, boardMask[i][j+1].comboId);
        }
      }
    }
  }
  // Add each remaining combo id to this list
  var comboIds = new Set([]);
  for (var i = 0; i < numInCol; i++) {
    for (var j = 0; j < numInRow; j++) {
      if (boardMask[i][j].matched) {
        comboIds.add(boardMask[i][j].comboId);
      }
    }
  }
  comboList = [];
  // TODO: animate iff used on team
  // TODO: Support bombs
  // Remove matched orbs, check combo stats
  var idsInOrder = Array.from(comboIds).sort(function(a, b){return a-b});
  for (let comboId of idsInOrder) {
    var comboStats = {
      att:     -1,
      orbs:    0,
      enhance: 0,
      cross:   false,
      tpa:     false,
      row:     false,
      col:     false,
      o51e:    false
    };
    for (var i = 0; i < numInCol; i++) {
      // check whether this row is solid
      var isRow = true;
      for (var j = 0; j < numInRow; j++) {
        if (boardMask[i][j].matched && boardMask[i][j].comboId == comboId) {
          comboStats.att = board[i][j].color;
          // get whether it is part of a cross. Still need to check that size == 5 later
          if (i > 0 && i < numInCol - 1 && j > 0 && j < numInRow - 1) {
            if (board[i+1][j].color == board[i][j].color &&
                board[i-1][j].color == board[i][j].color &&
                board[i][j+1].color == board[i][j].color &&
                board[i][j-1].color == board[i][j].color) {
                comboStats.cross = true;
            }
          }
          if (board[i][j].enhanced) {
            comboStats.enhance += 1;
          }
          comboStats.orbs += 1;
          animationList.push({timeLeft: 10,
                              type:     "erase",
                              color:    board[i][j].color, // TODO: Add support for blinds, locks and enhance here
                              i:        i,
                              j:        j});
        } else {
          isRow = false;
        }
      }
      if (isRow) {
        comboStats.row = true;
      }
    }
    for (var j = 0; j < numInRow; j++) {
      // check whether this row is solid
      var isCol = true;
      for (var i = 0; i < numInCol; i++) {
        if (!boardMask[i][j].matched || boardMask[i][j].comboId != comboId) {
          isCol = false;
        }
      }
      if (isCol) {
        comboStats.col = true;
      }
    }
    if (comboStats.orbs == 4) {
      comboStats.tpa = true;
    }
    if (comboStats.orbs != 5) {
      comboStats.cross = false;
    }
    if (comboStats.orbs == 5 && comboStats.enhance > 0){
      comboStats.o51e = true;
    }
    // TODO add minOrbs functionality here, remove combo if less
    for (var i = 0; i < numInCol; i++) {
      for (var j = 0; j < numInRow; j++) {
        if (boardMask[i][j].matched && boardMask[i][j].comboId == comboId) {
          board[i][j].color = -1;
        }
      }
    }
    // Animate combo
    animationList.push({timeLeft: 10, type: "pause"});
    for (var i = 0; i < 10; i++) {
      renderQueue.push(JSON.parse(JSON.stringify(board)));
    }
    comboList[comboList.length] = comboStats;
    useCombo(comboStats);
  }
  if(comboList.length == 0) {
    if (!gameRules.skyfall) {
      for (var i = 0; i < 10; i++) {
        renderQueue.push(JSON.parse(JSON.stringify(board)));
      }
      cascade(true);
    }
    endCombos();
  } else {
    cascade(gameRules.skyfall);
  }
}

function mouseHandler() {
  var timeMoveStarted = new Date();
  // TODO: orb rotation
  var moved = false;
  document.getElementById("board").addEventListener("mousedown", function(e) {
    if (animationRunning) {
      return;
    }
    var col = Math.floor((e.pageX - this.offsetLeft)*1.0/boardWidth*numInRow);
    var row = Math.floor((e.pageY - this.offsetTop)*1.0/boardHeight*numInCol);
    orbSelected = { row: row, col: col };
    board[orbSelected.row][orbSelected.col].trueX = e.pageX - this.offsetLeft - boardWidth / numInRow / 2;
    board[orbSelected.row][orbSelected.col].trueY = e.pageY - this.offsetTop - boardHeight / numInCol / 2;
    moved = false;
  });
  document.getElementById("board").addEventListener("mouseup", function(e) {
    if (animationRunning || orbSelected == null) {
      return;
    }
    board[orbSelected.row][orbSelected.col].trueX = null;
    board[orbSelected.row][orbSelected.col].trueY = null;
    orbSelected = null;
    if (moved == true) {
      moved = false;
      getMatches();
    }
  });
  document.getElementById("board").addEventListener("mousemove", function(e) {
    if (animationRunning || orbSelected == null) {
      return;
    }
    var col = (e.pageX - this.offsetLeft) * 1.0 * numInRow / boardWidth - .5;
    var row = (e.pageY - this.offsetTop) * 1.0 * numInCol / boardHeight - .5;
    if (Math.round(col) != orbSelected.col || Math.round(row) != orbSelected.row) {
      if (Math.sqrt(Math.pow(Math.round(col) - col, 2) + Math.pow(Math.round(row) - row, 2)) < .5) {
        var temp = board[Math.round(row)][Math.round(col)];
        board[Math.round(row)][Math.round(col)] = board[orbSelected.row][orbSelected.col];
        board[orbSelected.row][orbSelected.col] = temp;
        board[Math.round(row)][Math.round(col)].blind1 = false;
        board[orbSelected.row][orbSelected.col].blind1 = false;
        orbSelected = { row: Math.round(row), col: Math.round(col) };
        if (!moved) {
          moved = true;
          timeMoveStarted = new Date();
          gameRules = getGameRules();
        }
      }
    }
    board[orbSelected.row][orbSelected.col].trueX = e.pageX - this.offsetLeft - boardWidth / numInRow / 2;
    board[orbSelected.row][orbSelected.col].trueY = e.pageY - this.offsetTop - boardHeight / numInCol / 2;
  });
  setInterval(function() {
    if (moved) {
      timeLeft = (gameRules.moveTime - (new Date() - timeMoveStarted) / 1000.) / gameRules.moveTime;
      if (timeLeft <= 0) {
        board[orbSelected.row][orbSelected.col].trueX = null;
        board[orbSelected.row][orbSelected.col].trueY = null;
        orbSelected = null;
        moved = false;
        getMatches();
      }
    }
  }, 50);
}

function init() {
  renderer = document.getElementById("board").getContext("2d");
  refreshBoard();
  setInterval(redraw, 50);
  mouseHandler();
}
