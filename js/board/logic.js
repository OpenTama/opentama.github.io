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

var numInRow = 6;
var numInCol = 5;
var gameRules = {
  skyfall:  true,
  moveTime: 4,
  minOrbs: 3,
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
  board = [];
  for(var i = 0; i < numInCol; i++) {
  board[i] = [];
    for(var j = 0; j < numInRow; j++) {
      // TODO: actual skyfall stuff, no available combos
      board[i][j] = rollOrb();
    }
  }
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
    pushAnimation({timeLeft: 3, type: "pause"});
    for (var x = 0; x < 3; x++) {
      for(var i = 0; i < numInCol; i++) {
        for(var j = 0; j < numInRow; j++) {
          board[i][j].offset = Math.max(board[i][j].offset - .34, 0);
        }
      }
      pushBoard(board);
    }
  }
  pushAnimation({timeLeft: 8, type: "pause"});
  for (var i = 0; i < 8; i++) {
    pushBoard(board);
  }
  if (gameRules.skyfall || !skyfall) {
    getMatches();
  }
};

function getMatches() {
  timeLeft = 0;
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
          pushAnimation({timeLeft: 10,
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
    pushAnimation({timeLeft: 10, type: "pause"});
    for (var i = 0; i < 10; i++) {
      pushBoard(board);
    }
    comboList[comboList.length] = comboStats;
    useCombo(comboStats);
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

getNumInRow = function() { return numInRow; };
getNumInCol = function() { return numInCol; };

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
