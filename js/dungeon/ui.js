(function() {

function draw(renderer) {
  drawBoard(renderer);
}

function confirmLeave(renderer) {
  drawBoard(renderer);
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

addScene("dungeon", {
  redraw:    draw,
  mousedown: boardUIMouseDown,
  mousemove: boardUIMouseMove,
  mouseup:   boardUIMouseUp,
  left:      {text: "Dungeon", scene: "dungeon/dungeon", action: function(){}},
  right:     {text: "Team", scene: "dungeon/team", action: function(){}}
});

addScene("dungeon/dungeon", {
  redraw:    confirmLeave,
  mousedown: function(e) {},
  mousemove: function(e) {},
  mouseup:   function(e) {},
  left:      {text: "Yes", scene: "board", action: initBoard},
  right:     {text: "No", scene: "dungeon", action: function(){}},
});

addScene("dungeon/team", {
  redraw:    confirmLeave,
  mousedown: function(e) {},
  mousemove: function(e) {},
  mouseup:   function(e) {},
  left:      {text: "Yes", scene: "team/dash", action: initBoard},
  right:     {text: "No", scene: "dungeon", action: function(){}},
});

})()
