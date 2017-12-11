var getTeammateSelected;
var drawTeam;

(function() {

var teammateSelected;
var teamAssets = [];
for (var i = 0; i < 12; i++) {
  teamAssets.push(loadImage("assets/monsters/0.png"));
}

function redraw(renderer) {
  renderer.fillStyle = "#333333";
  renderer.fillRect(0, 0, getBoardWidth(), getBoardHeight() + getTopHeight());
  renderer.fillStyle = "#444499";
  renderer.fillRect(0, 0, getBoardWidth(), getBoardWidth() * 0.625);
  renderer.textAlign = "left";
  renderer.fillStyle = "#333333";
  renderer.fillText("ASSISTS:", getBoardWidth() * 0.025, getBoardWidth() * 0.1);
  drawTeam(renderer, getBoardWidth() * 0.15, true, false, null);
  renderer.fillText("TEAM:", getBoardWidth() * 0.025, getBoardWidth() * 0.4);
  drawTeam(renderer, getBoardWidth() * 0.45, false, false, null);
  renderer.fillStyle = "#444499";
  renderer.font = (getBoardWidth() * 0.03) + "px Sans";
  renderer.textAlign = "left";
  drawLSkill(renderer, getBoardWidth() * 0.025, getTopHeight() + getBoardHeight() * 0.4, getBoardWidth() * 0.05,
             getTeam()[6].lskill, getTeam()[11].lskill);
};

drawTeam = function(renderer, y, assists, skipEmpty, damage) {
  renderer.textAlign = "center";
  for (var i = assists ? 0 : 6; i < (assists ? 6 : 12); i++) {
    if (getTeam()[i].id == 0 && skipEmpty) {
      continue;
    }
    var desiredSrc = "http://puzzledragonx.com/en/img/book/" + getTeam()[i].assetId + ".png";
    if (teamAssets[i].src != desiredSrc) {
      teamAssets[i].src = desiredSrc;
    }
    renderer.drawImage(teamAssets[i], getBoardWidth() * ((i % 6) + 0.05) / 6, y, getBoardWidth() * 0.9 / 6, getBoardWidth() * 0.9 / 6);
    if (!assists && damage != null) {
      if (damage[i-6] != 0) {
        renderer.fillStyle = "#ffffff";
        renderer.font = "bolder " + (getBoardWidth() * 0.03) + "px Sans";
        renderer.fillText(Math.ceil(damage[i-6]), getBoardWidth() * ((i % 6) + 0.48) / 6, y + getBoardWidth() * 0.27 * 0.9 / 6);
        renderer.fillText(Math.ceil(damage[i-6]), getBoardWidth() * ((i % 6) + 0.52) / 6, y + getBoardWidth() * 0.23 * 0.9 / 6);
        renderer.fillStyle = "#000000";
        renderer.font = "bolder " + (getBoardWidth() * 0.03) + "px Sans";
        renderer.fillText(Math.ceil(damage[i-6]), getBoardWidth() * ((i % 6) + 0.49) / 6, y + getBoardWidth() * 0.26 * 0.9 / 6);
        renderer.fillText(Math.ceil(damage[i-6]), getBoardWidth() * ((i % 6) + 0.51) / 6, y + getBoardWidth() * 0.24 * 0.9 / 6);
        renderer.fillStyle = attColor(getTeam()[i].att[0]);
        renderer.font = "bolder " + (getBoardWidth() * 0.03) + "px Sans";
        renderer.fillText(Math.ceil(damage[i-6]), getBoardWidth() * ((i % 6) + 0.5) / 6, y + getBoardWidth() * 0.25 * 0.9 / 6);
      }
      if (damage[i] != 0) {
        renderer.fillStyle = "#ffffff";
        renderer.font = "bolder" + (getBoardWidth() * 0.03) + "px Sans";
        renderer.fillText(Math.ceil(damage[i]), getBoardWidth() * ((i % 6) + 0.48) / 6, y + getBoardWidth() * 0.77 * 0.9 / 6);
        renderer.fillText(Math.ceil(damage[i]), getBoardWidth() * ((i % 6) + 0.52) / 6, y + getBoardWidth() * 0.73 * 0.9 / 6);
        renderer.fillStyle = "#000000";
        renderer.font = "bolder" + (getBoardWidth() * 0.03) + "px Sans";
        renderer.fillText(Math.ceil(damage[i]), getBoardWidth() * ((i % 6) + 0.49) / 6, y + getBoardWidth() * 0.76 * 0.9 / 6);
        renderer.fillText(Math.ceil(damage[i]), getBoardWidth() * ((i % 6) + 0.51) / 6, y + getBoardWidth() * 0.74 * 0.9 / 6);
        renderer.fillStyle = attColor(getTeam()[i].att[1]);
        renderer.font = "bolder" + (getBoardWidth() * 0.03) + "px Sans";
        renderer.fillText(Math.ceil(damage[i]), getBoardWidth() * ((i % 6) + 0.5) / 6, y + getBoardWidth() * 0.75 * 0.9 / 6);
      }
    }
  }
}

function drawLSkill(renderer, x, y, dy, ls1, ls2) {
  function LSToText (ls) {
    return JSON.stringify(ls).match(/.{1,50}/g).join("\n    ");
  }
  strings = ls1.map(LSToText).concat([""]).concat(ls2.map(LSToText)).join("\n").split("\n");
  for (var i in strings) {
    renderer.fillText(strings[i], x, y + i * dy);
  }
}

function mousedown(x, y) {
  var col = x * 6 / getBoardWidth();
  if (col % 1 > 0.05 && col % 1 < 0.95) {
    if (y > 0.15 * getBoardWidth() && y < 0.3 * getBoardWidth()) {
      teammateSelected = Math.floor(col);
      setScene("team/select");
    } else if (y > 0.45 * getBoardWidth() && y < 0.6 * getBoardWidth()) {
      teammateSelected = Math.floor(col) + 6;
      setScene("team/select");
    }
  }
};

getTeammateSelected = function() { return teammateSelected; }

addScene("team/dash", {
  redraw:    redraw,
  mousedown: mousedown,
  mousemove: function(e) {},
  mouseup:   function(e) {},
  left:      {text: "Dungeon", scene: "board", action: initBoard},
  right:     {text: "Team", scene: "team/dash", action: function(){}},
});

})()
