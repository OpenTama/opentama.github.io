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
  drawTeam(renderer, getBoardWidth() * 0.15, true);
  renderer.fillText("TEAM:", getBoardWidth() * 0.025, getBoardWidth() * 0.4);
  drawTeam(renderer, getBoardWidth() * 0.45, false);
};

drawTeam = function(renderer, y, assists) {
  for (var i = assists ? 0 : 6; i < (assists ? 6 : 12); i++) {
    var desiredSrc = "http://puzzledragonx.com/en/img/book/" + team[i].assetId + ".png";
    if (teamAssets[i].src != desiredSrc) {
      teamAssets[i].src = desiredSrc;
    }
    renderer.drawImage(teamAssets[i], getBoardWidth() * ((i % 6) + 0.05) / 6, y, getBoardWidth() * 0.9 / 6, getBoardWidth() * 0.9 / 6);
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
  left:      {text: "Dungeon", scene: "board", action: function(){}},
  right:     {text: "Team", scene: "team/dash", action: function(){}},
});

})()
