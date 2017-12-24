var pushBoard;
var pushDamage;
var pushRcv;
var pushHp;

(function() {

var orbAssets = [
  loadImage("assets/Orb-Fr.png"),
  loadImage("assets/Orb-Wt.png"),
  loadImage("assets/Orb-Wd.png"),
  loadImage("assets/Orb-Lt.png"),
  loadImage("assets/Orb-Dk.png"),
  loadImage("assets/Orb-Heal.png"),
  loadImage("assets/Orb-Jammer.png"),
  loadImage("assets/Orb-Poison.png"),
  loadImage("assets/Orb-MPoison.png"),
  loadImage("assets/Orb-Bomb.png"),
];
var blindAssets = [
  loadImage("assets/Shadow-Orb.png"),
  loadImage("assets/Shadow-Orb.png"),
  loadImage("assets/Shadow-Orb.png"),
  loadImage("assets/Shadow-Orb.png"),
  loadImage("assets/Shadow-Orb.png"),
  loadImage("assets/Shadow-Heal.png"),
  loadImage("assets/Shadow-Jammer.png"),
  loadImage("assets/Shadow-Poison.png"),
  loadImage("assets/Shadow-MPoison.png"),
  loadImage("assets/Shadow-Bomb.png"),
];
var plusAsset = loadImage("assets/Mod-Plus.png");
var lockAsset = loadImage("assets/Mod-Lock.png");
var teamAssets = [
  loadImage("assets/monsters/0.png"),
  loadImage("assets/monsters/0.png"),
  loadImage("assets/monsters/0.png"),
  loadImage("assets/monsters/0.png"),
  loadImage("assets/monsters/0.png"),
  loadImage("assets/monsters/0.png"),
];
var bgAssets = [
  loadImage("assets/bg0.png"),
  loadImage("assets/bg1.png")
];
var renderQueue = [];
var damageQueue = [];
var rcvQueue = [];
var hpQueue = [];

function redraw(renderer) {
  // Queue is empty when orbs are being moved
  toDraw = renderQueue.shift();
  if (toDraw == undefined) {
    toDraw = getBoard();
  }
  damage = damageQueue.shift();
  for (var i = 0; i < getNumInCol(); i++) {
    for (var j = 0; j < getNumInRow(); j++) {
      // draw background
      renderer.drawImage(bgAssets[(i + j) % 2],
                         j * getBoardWidth() / getNumInRow(),
                         i * getBoardHeight() / getNumInCol() + getTopHeight(),
                         getBoardWidth() / getNumInRow(),
                         getBoardHeight() / getNumInCol());
      // Orb id -1 means don't draw it
      if (toDraw[i][j].color >= 0 && toDraw[i][j].color < orbAssets.length) {
        if (getOrbSelected() != null && getOrbSelected().row == i && getOrbSelected().col == j) {
          renderer.globalAlpha = 0.5; // The selected orb should be transparent
        }
        drawOrb(renderer, toDraw[i][j], j, i, false);
        renderer.globalAlpha = 1;
      }
    }
  }
  // Draw selected orb and timer
  if (getOrbSelected() != null) {
    drawOrb(renderer, toDraw[getOrbSelected().row][getOrbSelected().col], null, null, true);
    if (getTimeLeft() < .5) {
      renderer.fillStyle = "#00FF00"
      renderer.fillRect(getBoardWidth() * toDraw[getOrbSelected().row][getOrbSelected().col].trueX / getNumInRow(),
                        getBoardHeight() * toDraw[getOrbSelected().row][getOrbSelected().col].trueY / getNumInCol() - getBoardHeight() / 50 + getTopHeight(),
                        getBoardWidth() / getNumInRow() * getTimeLeft() * 2,
                        getBoardHeight() / 50);
    }
  }
  renderer.fillStyle = "#444444";
  renderer.fillRect(0, 0, getBoardWidth(), getTopHeight());
  drawHpBar(renderer);
  drawTeam(renderer, getTopHeight() - getBoardWidth() * 0.2, false, true, damage);
}

function drawHpBar(renderer) {
  var rcv = rcvQueue.shift();
  var hp = hpQueue.shift();
  if (hp == undefined) {
    hp = getHp();
  }
  renderer.fillStyle = "#CCCCCC";
  renderer.fillRect(getBoardWidth() * 0.1, getTopHeight() - getBoardWidth() * 0.05, getBoardWidth() * 0.88, getBoardWidth() * 0.05);
  renderer.fillRect(getBoardWidth() * 0.03, getTopHeight() - getBoardWidth() * 0.05, getBoardWidth() * 0.05, getBoardWidth() * 0.05);
  renderer.fillStyle = "#444444";
  renderer.fillRect(getBoardWidth() * 0.11, getTopHeight() - getBoardWidth() * 0.04, getBoardWidth() * 0.86, getBoardWidth() * 0.03);
  renderer.fillStyle = "#DD4444";
  renderer.fillRect(getBoardWidth() * 0.11, getTopHeight() - getBoardWidth() * 0.04, getBoardWidth() * 0.86 * hp / getMaxHp(), getBoardWidth() * 0.03);
  if (rcv != undefined && rcv != 0) {
    renderer.fillStyle = "#FFBBBB";
    renderer.fillRect(getBoardWidth() * (0.11 + 0.86 * hp / getMaxHp()), getTopHeight() - getBoardWidth() * 0.04,
                      getBoardWidth() * 0.86 * Math.min(rcv, getMaxHp() - hp) / getMaxHp(), getBoardWidth() * 0.03);
    renderer.fillStyle = "#000000";
    renderer.font = "bolder " + (getBoardWidth() * 0.036) + "px Sans";
    renderer.textAlign = "center";
    renderer.fillText("+" + Math.floor(rcv), getBoardWidth() * 0.54, getTopHeight() - getBoardWidth() * 0.012);
    renderer.fillStyle = "#00FF00";
    renderer.font = "bolder " + (getBoardWidth() * 0.035) + "px Sans";
    renderer.fillText("+" + Math.floor(rcv), getBoardWidth() * 0.54, getTopHeight() - getBoardWidth() * 0.012);
  }
  renderer.fillStyle = "#000000";
  renderer.font = "bolder " + (getBoardWidth() * 0.036) + "px Sans";
  renderer.textAlign = "right";
  renderer.fillText(Math.floor(hp) + "/" + Math.floor(getMaxHp()), getBoardWidth() * 0.97, getTopHeight() - getBoardWidth() * 0.012);
  if (hp == getMaxHp()) {
    renderer.fillStyle = "#00FF00";
  } else if (hp >= getMaxHp() * 0.8) {
    renderer.fillStyle = "#2222FF";
  } else if (hp >= getMaxHp() * 0.5) {
    renderer.fillStyle = "#DDDD00";
  } else if (hp >= getMaxHp() * 0.2) {
    renderer.fillStyle = "#FF6600";
  } else {
    renderer.fillStyle = "#FF2222";
  }
  renderer.font = "bolder " + (getBoardWidth() * 0.035) + "px Sans";
  renderer.fillText(Math.floor(hp) + "/" + Math.floor(getMaxHp()), getBoardWidth() * 0.97, getTopHeight() - getBoardWidth() * 0.012);
  renderer.drawImage(orbAssets[5], getBoardWidth() * 0.03, getTopHeight() - getBoardWidth() * 0.05, getBoardWidth() * 0.05, getBoardWidth() * 0.05);
}

function drawOrb(renderer, orb, col, row, drawSelection) {
  var orbImage;
  var offset = 0;
  if (!drawSelection) {
    if (orb.blind2 > 0){ // Duration blind overrides normal blind
      orbImage = blindAssets[orb.color]; // TODO: Create specific textures for duration blind
    } else if (orb.blind1){
      orbImage = blindAssets[orb.color]; 
    } else {
      orbImage = orbAssets[orb.color];
    }
    offset = orb.offset;
  } else {
    orbImage = orbAssets[orb.color]
    col = orb.trueX;
    row = orb.trueY;
  }
  var x = col * getBoardWidth() / getNumInRow();
  var y = (row - offset) * getBoardHeight() / getNumInCol() + getTopHeight();
  renderer.drawImage(orbImage, x, y, getBoardWidth() / getNumInRow(), getBoardHeight() / getNumInCol());
  if (orb.enhanced) {
    renderer.drawImage(plusAsset, x, y, getBoardWidth() / getNumInRow(), getBoardHeight() / getNumInCol());
  }
  if (orb.locked) {
    renderer.drawImage(lockAsset, x, y, getBoardWidth() / getNumInRow(), getBoardHeight() / getNumInCol());
  }
}

function drawErase(renderer, animation) {
  renderer.globalAlpha = Math.max(2 * animation.timeLeft, 0);
  renderer.drawImage(orbAssets[animation.color],
                     getBoardWidth() * animation.j / getNumInRow(),
                     getBoardHeight() * animation.i / getNumInCol() + getTopHeight(),
                     getBoardWidth() / getNumInRow(),
                     getBoardHeight() / getNumInCol());
  renderer.globalAlpha = 1;
}
  
function confirmLeave(renderer) {
  redraw(renderer);
  renderer.globalAlpha = 0.8;
  renderer.fillStyle = "#444444";
  renderer.fillRect(0, 0, getBoardWidth(), getBoardHeight() + getTopHeight());
  renderer.globalAlpha = 1;
  renderer.fillStyle = "#6666bb";
  renderer.fillRect(getBoardWidth() * 0.2, (getBoardHeight() + getTopHeight()) * 0.4, getBoardWidth() * 0.6, (getBoardHeight() + getTopHeight()) * 0.2);
  renderer.fillStyle = "#444444";
  renderer.textAlign = "center";
  renderer.fillText("LEAVE DUNGEON?", getBoardWidth() / 2, (getBoardHeight() + getTopHeight()) / 2);
}

function mousedown(x, y) {
  if (y > getTopHeight()) {
    var row = (y - getTopHeight()) * getNumInCol() / getBoardHeight() - .5;
    var col = x * getNumInRow() / getBoardWidth() - .5;
    boardMouseDown(row, col);
  }
}

function mouseup(x, y) {
  var row = Math.max(Math.min(y - getTopHeight(), getBoardHeight() - 1), 1) * getNumInCol() / getBoardHeight() - .5;
  var col = x * getNumInRow() / getBoardWidth() - .5;
  boardMouseUp(row, col);
}

function mousemove(x, y) {
  var row = Math.max(Math.min(y - getTopHeight(), getBoardHeight() - 1), 1) * getNumInCol() / getBoardHeight() - .5;
  var col = x * getNumInRow() / getBoardWidth() - .5;
  boardMouseMove(row, col);
}
  
addScene("board", {
  redraw:    redraw,
  mousedown: mousedown,
  mousemove: mousemove,
  mouseup:   mouseup,
  left:      {text: "Dungeon", scene: "board/dungeon", action: function(){}},
  right:     {text: "Team", scene: "board/team", action: function(){}}
});

addScene("board/dungeon", {
  redraw:    confirmLeave,
  mousedown: function(e) {},
  mousemove: function(e) {},
  mouseup:   function(e) {},
  left:      {text: "Yes", scene: "board", action: initBoard},
  right:     {text: "No", scene: "board", action: function(){}},
});

addScene("board/team", {
  redraw:    confirmLeave,
  mousedown: function(e) {},
  mousemove: function(e) {},
  mouseup:   function(e) {},
  left:      {text: "Yes", scene: "team/dash", action: initBoard},
  right:     {text: "No", scene: "board", action: function(){}},
});

registerAnimation("erase", drawErase);

pushBoard = function(board) {
  renderQueue.push(JSON.parse(JSON.stringify(board)));
};

pushDamage = function(damage) {
  damageQueue.push(JSON.parse(JSON.stringify(damage)));
};

pushRcv = function(rcv) {
  rcvQueue.push(rcv);
};

pushHp = function(hp) {
  hpQueue.push(hp);
};

})()
