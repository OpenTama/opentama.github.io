var useCombo;
var endCombos;
var getGameRules;
var queryMonsters;
var getHp;
var getMaxHp;
var getTeam;

(function(){

teamCombos = [];
team = [
  getMonsters()[0],
  getMonsters()[0],
  getMonsters()[0],
  getMonsters()[0],
  getMonsters()[0],
  getMonsters()[0],
  getMonsters()[0],
  getMonsters()[0],
  getMonsters()[0],
  getMonsters()[0],
  getMonsters()[0],
  getMonsters()[0]
];

useCombo = function(comboStats) {
  teamCombos.push(comboStats);
  // TODO
}

endCombos = function() {
  // TODO
}

getGameRules = function() {
  skyfall = true;
  board7x6 = false;
  moveTime = 4;
  minMatch = 3;
  for (var component of team[6].lskill.concat(team[11].lskill)) {
    switch (component.type) {
      case "time extension":
        moveTime += component.time;
        break;
      case "no skyfall":
        skyfall = false;
        break;
      case "7x6":
        board7x6 = true;
        break;
      case "no match n":
        minMatch = Math.max(component.orbs + 1, minMatch);
    }
  }
  return {
    skyfall:  skyfall,
    moveTime: moveTime,
    board7x6: board7x6,
    minMatch: minMatch,
  }
}

queryMonsters = function(constraint) {  
  return getMonsters().filter(function(monster) {
    return (monster.att[0] == constraint.att1 || monster.att[0] == null && constraint.att1 == 5 || constraint.att1 == 6) &&
           (monster.att[1] == constraint.att2 || monster.att[1] == null && constraint.att2 == 5 || constraint.att2 == 6) &&
           (constraint.type == 12 || monster.type.includes([0, 1, 2, 3, 4, 5, 6, 7, 8, 12, 14, 15][constraint.type])) &&
           (constraint.rarity == 0 || monster.rarity == constraint.rarity);
  });
};

getHp = function() { return 10; };
getMaxHp = function() { return 100; };
getTeam = function() { return team; };

})()
