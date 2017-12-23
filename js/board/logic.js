var getNumInRow;
var getNumInCol;
var getBoard;
var initBoard;
var boardMouseDown;
var boardMouseUp;
var boardMouseMove;
var getTimeLeft;
var getOrbSelected;

(function() {
// TODO break up long functions here

var gameRules = {
  skyfall:  true,
  moveTime: 4,
  minOrbs:  3,
  numInRow: 6,
  numInCol: 5,
};
var board = [];
var timeLeft = 0;
var timeMoveStarted = new Date();
var moved = false;
var orbSelected = null;

function rollOrb() {
  // TODO: adjusted skyfall rate
  // Reserch skyfall rates, if 15% dark is 15/100 says dark orb spawns, or 1.15 weight on dark
  // Also account for tricolor, no-RCV and similar skyfalls 
  // TODO cloud blind
  return {
    color:    Math.floor(Math.random() * 6),
    enhanced: false,
    locked:   false,
    blind1:   false, // Regular blind, slide orbs to reveal
    blind2:   0, // Duration blind, cannot see orbs until timer is over
    matched:  false,
    trueX:    null,
    trueY:    null,
    offset:   0
  };
};

function refreshBoard() {
  gameRules = getGameRules();
  board = [];
  for(var i = 0; i < gameRules.numInCol; i++) {
  board[i] = [];
    for(var j = 0; j < gameRules.numInRow; j++) {
      // TODO: actual skyfall stuff, no available combos
      board[i][j] = rollOrb();
    }
  }
};

function cascade(skyfall) {
  for(var n = 0; n < gameRules.numInCol; n++) {
    var hasCascade = false;
    for(var j = 0; j < gameRules.numInRow; j++) {
      // must loop from bottom to top
      for(var i = gameRules.numInCol-1; i > 0; i--) {
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
    pushAnimation({timeLeft: 0.25, type: "pause"});
    for (var x = 0; x < 0.25 / deltaT; x++) {
      for(var i = 0; i < gameRules.numInCol; i++) {
        for(var j = 0; j < gameRules.numInRow; j++) {
          board[i][j].offset = Math.max(board[i][j].offset - 4 * deltaT, 0);
        }
      }
      pushBoard(board);
      pushDamage(getDamage());
      pushRcv(getRcv());
      pushHp(getHp());
    }
  }
  if (gameRules.skyfall || !skyfall) {
    getMatches();
  }
};

function getMatches() {
  timeLeft = 0;
  // keep track of what combo an orb is part of
  var boardMask = [];
  for (var i = 0; i < gameRules.numInCol; i++) {
    boardMask[i] = [];
    for (var j = 0; j < gameRules.numInRow; j++) {
      boardMask[i][j] = { matched: false, comboId: 0 };
    }
  }

  var combos = 0; // Not yet how many combos, but how many groups of three
  // TODO: support unable to match attribute effect
  // Animation goes left to right, then bottom to top
  for (var i = gameRules.numInCol - 1; i >= 0; i--) {
    for (var j = 0; j < gameRules.numInRow; j++) {
      // color is -1 after cascade when skyfall is disabled
      if (board[i][j].color == -1) {
        continue;
      }
      // check vertical combos, but not in bottom 2 rows
      if (i < gameRules.numInCol - 2) {
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
      if (j < gameRules.numInRow - 2) {
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
      for (var i = 0; i < gameRules.numInCol; i++) {
        for (var j = 0; j < gameRules.numInRow; j++) {
          if (boardMask[i][j].comboId == id2) boardMask[i][j].comboId = id1;
        }
      }
    }
  }
  for (var i = gameRules.numInCol - 1; i >= 0; i--) {
    for (var j = 0; j < gameRules.numInRow; j++) {
      if (boardMask[i][j].matched) {
        // Check each adjacent orb to see if it is matched and of the same color
        if (i > 0 && board[i][j].color == board[i-1][j].color && boardMask[i-1][j].matched) {
          combine(boardMask[i][j].comboId, boardMask[i-1][j].comboId);
        }
        if (j > 0 && board[i][j].color == board[i][j-1].color && boardMask[i][j-1].matched) {
          combine(boardMask[i][j].comboId, boardMask[i][j-1].comboId);
        }
        if (i < gameRules.numInCol - 1 && board[i][j].color == board[i+1][j].color && boardMask[i+1][j].matched) {
          combine(boardMask[i][j].comboId, boardMask[i+1][j].comboId);
        }
        if (j < gameRules.numInRow - 1 && board[i][j].color == board[i][j+1].color && boardMask[i][j+1].matched) {
          combine(boardMask[i][j].comboId, boardMask[i][j+1].comboId);
        }
      }
    }
  }
  // Add each remaining combo id to this list
  var comboIds = new Set([]);
  for (var i = 0; i < gameRules.numInCol; i++) {
    for (var j = 0; j < gameRules.numInRow; j++) {
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
      o51e:    false,
      box:     false, // TODO
    };
    for (var i = 0; i < gameRules.numInCol; i++) {
      // check whether this row is solid
      var isRow = true;
      for (var j = 0; j < gameRules.numInRow; j++) {
        if (boardMask[i][j].matched && boardMask[i][j].comboId == comboId) {
          comboStats.att = board[i][j].color;
          // get whether it is part of a cross. Still need to check that size == 5 later
          if (i > 0 && i < gameRules.numInCol - 1 && j > 0 && j < gameRules.numInRow - 1) {
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
        } else {
          isRow = false;
        }
      }
      if (isRow) {
        comboStats.row = true;
      }
    }
    for (var j = 0; j < gameRules.numInRow; j++) {
      // check whether this row is solid
      var isCol = true;
      for (var i = 0; i < gameRules.numInCol; i++) {
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
    if (comboStats.orbs >= gameRules.minMatch) {
      for (var i = 0; i < gameRules.numInCol; i++) {
        for (var j = 0; j < gameRules.numInRow; j++) {
          if (boardMask[i][j].matched && boardMask[i][j].comboId == comboId) {
            pushAnimation({timeLeft: 0.5,
                           type:     "erase",
                           color:    board[i][j].color, // TODO: Add support for blinds, locks and enhance here
                           i:        i,
                           j:        j});
            board[i][j].color = -1;
          }
        }
      }
      comboList[comboList.length] = comboStats;
      useCombo(comboStats);
      pushAnimation({timeLeft: 0.5, type: "pause"});
      for (var i = 0; i < 0.5 / deltaT; i++) {
        pushBoard(board);
        pushDamage(getDamage());
        pushRcv(getRcv());
        pushHp(getHp());
      }
    }
  }
  if(comboList.length == 0) {
    endCombos();
    if (!gameRules.skyfall) {
      cascade(true);
    }
  } else {
    cascade(gameRules.skyfall);
  }
};

boardMouseDown = function(row, col) {
  orbSelected = { row: Math.round(row), col: Math.round(col) };
  board[orbSelected.row][orbSelected.col].trueX = col;
  board[orbSelected.row][orbSelected.col].trueY = row;
  moved = false;
  gameRules = getGameRules();
};

boardMouseUp = function() {
  if (orbSelected != null) {
    board[orbSelected.row][orbSelected.col].trueX = null;
    board[orbSelected.row][orbSelected.col].trueY = null;
    orbSelected = null;
    if (moved == true) {
      moved = false;
      getMatches();
    }
  }
};

boardMouseMove = function(row, col) {
  if (orbSelected != null) {
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
        }
      }
    }
    board[orbSelected.row][orbSelected.col].trueX = col;
    board[orbSelected.row][orbSelected.col].trueY = row;
  }
};

setInterval(function() {
  // TODO Valten orbs
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
}, deltaT * 1000);

getNumInRow = function() { return gameRules.numInRow; };
getNumInCol = function() { return gameRules.numInCol; };

getBoard = function() {
  return JSON.parse(JSON.stringify(board));
};

initBoard = function() {
  refreshBoard();
};

getTimeLeft = function() {
  return timeLeft;
};

getOrbSelected = function() {
  return orbSelected;
};

})();
