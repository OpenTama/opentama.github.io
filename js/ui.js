var initUi;
var addScene;
var setScene;
var getBoardWidth;
var getBoardHeight;
var getTopHeight;
var loadImage;
var getFallbackSrc;
var pushAnimation;
var registerAnimation;
var animationRunning;
var deltaT = 0.021;

(function() {

var renderer;
var boardWidth = 600;
var topHeight = 400;
var boardHeight = 500;
var barHeight = 75;
var scenes = [];
var animations = [];
var scene = "team/dash";
var fallbackSrc = "\\"
var animationList = [];

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
  renderer.fillText(scenes[scene].left.text, boardWidth * 0.25, boardHeight + topHeight + barHeight / 2);
  renderer.fillText(scenes[scene].right.text, boardWidth * 0.75, boardHeight + topHeight + barHeight / 2);
  renderer.clearRect(0, 0, boardWidth, boardHeight + topHeight);
  // Draw the rest
  scenes[scene].redraw(renderer);
  if (animationList.length > 0) {
    for (var animation of animationList) {
      animation.timeLeft -= deltaT;
      if (animation.type == "pause") {
        break;
      }
      animations[animation.type](renderer, animation);
    }
    animationList = animationList.filter(function(animation) {
      return animation.timeLeft > 0;
    });
  }
};

function mouseHandler() {
  document.getElementById("board").addEventListener("mousedown", function(e) {
    if (e.pageY - this.offsetTop > boardHeight + topHeight) {
      if (e.pageX - this.offsetLeft > boardWidth / 2) {
        scenes[scene].right.action();
        scene = scenes[scene].right.scene;
      } else {
        scenes[scene].left.action();
        scene = scenes[scene].left.scene;
      }
    } else {
      if (animationList.length == 0) {
        scenes[scene].mousedown(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
      }
    }
  });

  document.getElementById("board").addEventListener("mouseup", function(e) {
    if (animationList.length == 0) {
      scenes[scene].mouseup(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    }
  });

  document.getElementById("board").addEventListener("mousemove", function(e) {
    if (animationList.length == 0) {
      scenes[scene].mousemove(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    }
  });
};

addScene = function(name, scene) {
  scenes[name] = scene;
};

setScene = function(name) {
  scene = name;
};

getBoardWidth = function() { return boardWidth; };
getBoardHeight = function() { return boardHeight; };
getTopHeight = function() { return topHeight; };
getFallbackSrc = function() { return fallbackSrc; };

loadImage = function(src) {
  var retval = new Image();
  retval.onerror = function() {
    this.onload = function() {
      fallbackSrc = this.src;
      this.onload = function() {};
    };
    this.src = "assets/monsters/fail.png";
  };
  retval.src = src;
  return retval;
};

pushAnimation = function(animation) {
  animationList.push(animation);
};

registerAnimation = function(name, animation) {
  animations[name] = animation;
};

animationRunning = function() {
  return animationList.length > 0;
}

initUi = function() {
  renderer = document.getElementById("board").getContext("2d");
  setInterval(redraw, deltaT * 1000);
  mouseHandler();
};

})();
