(function() {

var attAssets = [
  loadImage("http://puzzledragonx.com/en/img/allow/1.png"),
  loadImage("http://puzzledragonx.com/en/img/allow/2.png"),
  loadImage("http://puzzledragonx.com/en/img/allow/3.png"),
  loadImage("http://puzzledragonx.com/en/img/allow/4.png"),
  loadImage("http://puzzledragonx.com/en/img/allow/5.png"),
  loadImage("http://puzzledragonx.com/en/img/skill/12.png"),
  loadImage("http://puzzledragonx.com/en/img/allow/0.png"),
];
var typeAssets = [
  loadImage("http://puzzledragonx.com/en/img/type/7.png"),
  loadImage("http://puzzledragonx.com/en/img/type/2.png"),
  loadImage("http://puzzledragonx.com/en/img/type/3.png"),
  loadImage("http://puzzledragonx.com/en/img/type/4.png"),
  loadImage("http://puzzledragonx.com/en/img/type/1.png"),
  loadImage("http://puzzledragonx.com/en/img/type/6.png"),
  loadImage("http://puzzledragonx.com/en/img/type/5.png"),
  loadImage("http://puzzledragonx.com/en/img/type/9.png"),
  loadImage("http://puzzledragonx.com/en/img/type/12.png"),
  loadImage("http://puzzledragonx.com/en/img/type/11.png"),
  loadImage("http://puzzledragonx.com/en/img/type/8.png"),
  loadImage("http://puzzledragonx.com/en/img/type/13.png"),
  loadImage("http://puzzledragonx.com/en/img/allow/0.png"),
];
var searchAssets = [];
for (var i = 0; i < 15; i++) {
  searchAssets.push(loadImage("assets/monsters/0.png"));
}
var page = 0;
var monsterConstraints = {type: 12, att1: 6, att2: 6, rarity: 0};

function redraw(renderer) {
  var searchResults = queryMonsters(monsterConstraints);
  renderer.fillStyle = "#333333";
  renderer.fillRect(0, 0, getBoardWidth(), getBoardHeight() + getTopHeight());
  renderer.fillStyle = "#444499";
  renderer.fillRect(0, 0, getBoardWidth(), getTopHeight());
  drawResults(renderer, searchResults);
  renderer.fillStyle = "#333333";
  renderer.textBaseline = "middle";
  renderer.fillText("Main Att", getBoardWidth() * 0.045, getBoardWidth() * 0.1);
  renderer.fillText("Sub Att", getBoardWidth() * 0.045, getBoardWidth() * 0.2);
  renderer.fillText("Type", getBoardWidth() * 0.045, getBoardWidth() * 0.35);
  renderer.fillText("Rarity", getBoardWidth() * 0.045, getBoardWidth() * 0.55);
  for (var i = 0; i < attAssets.length; i++) {
    renderer.drawImage(attAssets[i], getBoardWidth() * (0.35 + 0.09 * i), getBoardWidth() * 0.05, getBoardWidth() * 0.09, getBoardWidth() * 0.09);
    renderer.drawImage(attAssets[i], getBoardWidth() * (0.35 + 0.09 * i), getBoardWidth() * 0.15, getBoardWidth() * 0.09, getBoardWidth() * 0.09);
  }
  for (var i = 0; i < typeAssets.length; i++) {
    renderer.drawImage(typeAssets[i], getBoardWidth() * (0.35 + 0.09 * (i % 7)), getBoardWidth() * (i > 6 ? 0.39 : 0.3),
                       getBoardWidth() * 0.09, getBoardWidth() * 0.09);
  }
  for (var i = 0; i < 11; i++) {
    if (monsterConstraints.rarity == i) {
      renderer.fillRect(getBoardWidth() * (0.35 + 0.055 * i), getBoardWidth() * 0.5,
                        i == 10 ? getBoardWidth() * 0.085 : getBoardWidth() * 0.055, getBoardWidth() * 0.09);
      renderer.fillStyle = "#444499";
    }
    renderer.fillText(i == 0 ? "?" : i, getBoardWidth() * (0.36 + 0.055 * i), getBoardWidth() * 0.55);
    renderer.fillStyle = "#333333";
  }
  renderer.globalAlpha = 0.5;
  renderer.fillRect(getBoardWidth() * (0.35 + 0.09 * monsterConstraints.att1), getBoardWidth() * 0.05, getBoardWidth() * 0.09, getBoardWidth() * 0.09);
  renderer.fillRect(getBoardWidth() * (0.35 + 0.09 * monsterConstraints.att2), getBoardWidth() * 0.15, getBoardWidth() * 0.09, getBoardWidth() * 0.09);
  renderer.fillRect(getBoardWidth() * (0.35 + 0.09 * (monsterConstraints.type % 7)),
                    getBoardWidth() * (monsterConstraints.type > 6 ? 0.39 : 0.3), getBoardWidth() * 0.09, getBoardWidth() * 0.09);
};

function drawResults(renderer, results) {
  for (var i = 0; i < Math.min(results.length - page * 15, searchAssets.length); i++) {
    if (searchAssets[i].src == getFallbackSrc()) {
      console.log("Duplicate monster found",results[i + page * 15]);
      getMonsters().splice(getMonsters().indexOf(results[i + page * 15]), 1);
    }
    var desiredSrc = "http://puzzledragonx.com/en/img/book/" + results[i + page * 15].assetId + ".png"
    if (searchAssets[i].src != desiredSrc) {
      searchAssets[i].src = desiredSrc;
    }
    renderer.drawImage(searchAssets[i], getBoardWidth() * (0.19 * (i % 5) + 0.045), getBoardWidth() * (0.19 * (Math.floor(i / 5)) + 0.15) + getTopHeight(),
                       getBoardWidth() * 0.15, getBoardWidth() * 0.15);
  }
  renderer.textAlign = "left";
  renderer.fillStyle = "#444499";
  renderer.fillText("RESULTS:", getBoardWidth() * 0.045, getBoardWidth() * 0.08 + getTopHeight());
  renderer.fillStyle = "#444499";
  renderer.fillText("Page " + (page + 1) + " of " + (Math.floor(results.length / 15) + 1),
                    getBoardWidth() * 0.3, getBoardHeight() + getTopHeight() - getBoardWidth() * 0.08);
  renderer.fillRect(getBoardWidth() * 0.035, getBoardHeight() + getTopHeight() - getBoardWidth() * 0.13, getBoardWidth() * 0.23, getBoardWidth() * 0.09)
  renderer.fillRect(getBoardWidth() * 0.735, getBoardHeight() + getTopHeight() - getBoardWidth() * 0.13, getBoardWidth() * 0.23, getBoardWidth() * 0.09)
  renderer.fillStyle = "#333333";
  renderer.fillText("<- Prev", getBoardWidth() * 0.045, getBoardHeight() + getTopHeight() - getBoardWidth() * 0.08)
  renderer.fillText("Next ->", getBoardWidth() * 0.745, getBoardHeight() + getTopHeight() - getBoardWidth() * 0.08)
  renderer.globalAlpha = 0.7;
  if (page == 0) {
    renderer.fillRect(getBoardWidth() * 0.035, getBoardHeight() + getTopHeight() - getBoardWidth() * 0.13, getBoardWidth() * 0.23, getBoardWidth() * 0.09)
  }
  if (page == Math.floor(results.length / 15)) {
    renderer.fillRect(getBoardWidth() * 0.735, getBoardHeight() + getTopHeight() - getBoardWidth() * 0.13, getBoardWidth() * 0.23, getBoardWidth() * 0.09)
  }
  renderer.globalAlpha = 1;
}

function mousedown(x, y) {
  var x1 = x / getBoardWidth() - 0.35;
  var x2 = x / getBoardWidth() - 0.35;
  var x3 = x / getBoardWidth() - 0.35;
  var x4 = x / getBoardWidth() - 0.045;
  var x5 = x / getBoardWidth();
  var y1 = y / getBoardWidth() - 0.05;
  var y2 = y / getBoardWidth() - 0.3;
  var y3 = y / getBoardWidth() - 0.5;
  var y4 = (y - getTopHeight()) / getBoardWidth() - 0.15;
  var y5 = (y - getTopHeight() - getBoardHeight()) / getBoardWidth() + 0.13;
  if (y4 > 0 && y4 % 0.19 < 0.15 && y4 < 0.53 && x4 % 0.19 < 0.15 && x4 > 0 && x4 < 0.91) {
    monsterChosen = queryMonsters(monsterConstraints)[Math.floor(x4 / 0.19) + Math.floor(y4 / 0.19) * 5 + page * 15];
    if (monsterChosen != undefined) {
      getTeam()[getTeammateSelected()] = monsterChosen;
      setScene("team/dash");
    }
  }
  if (y1 > 0 && y1 < 0.09 && x1 > 0 && x1 < 0.63) {
    monsterConstraints.att1 = Math.floor(x1 / 0.09);
    page = 0;
  }
  if (y1 > 0.1 && y1 < 0.19 && x1 > 0 && x1 < 0.63) {
    monsterConstraints.att2 = Math.floor(x1 / 0.09);
    page = 0;
  }
  if (y2 > 0 && y2 < 0.18 && x2 > 0 && x2 < 0.63) {
    monsterConstraints.type = Math.floor(x2 / 0.09) + Math.floor(y2 / 0.09) * 7;
    page = 0;
  }
  if (y3 > 0 && y3 < 0.1 && x2 > 0 && x2 < 0.635) {
    monsterConstraints.rarity = Math.min(Math.floor(x3 / 0.055), 10);
    page = 0;
  }
  if (y5 > 0 && y5 < 0.09 && x5 > 0.735 && x5 < 0.965 && page < Math.floor(queryMonsters(monsterConstraints).length / 15)) {
    page += 1;
  }
  if (y5 > 0 && y5 < 0.09 && x5 > 0.035 && x5 < 0.265 && page > 0) {
    page -= 1;
  }
};

addScene("team/select", {
  redraw:    redraw,
  mousedown: mousedown,
  mousemove: function(e) {},
  mouseup:   function(e) {},
  left:      {text: "Dungeon", scene: "board", action: initBoard},
  right:     {text: "Team", scene: "team/dash", action: function(){}},
});

})()
