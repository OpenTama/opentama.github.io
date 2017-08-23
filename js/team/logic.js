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
  return {
    skyfall:  false,
    moveTime: 4,
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
