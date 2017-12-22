var useCombo;
var endCombos;
var getGameRules;
var queryMonsters;
var getHp;
var getMaxHp;
var getTeam;
var getDamage;

(function(){

var teamCombos = [];
var team = [
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

var baseDamage = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var damage = baseDamage;

useCombo = function(comboStats) {
  teamCombos.push(comboStats);
  orbMultiplier = 1 + (comboStats.orbs - 3) * 0.25;
  comboMultiplier = 1 + (teamCombos.length - 1) * 0.25;
  for (var i = 0; i < 6; i++) {
    baseDamage[i] += (team[i+6].att[0] == comboStats.att) * team[i+6].atk * orbMultiplier;
    baseDamage[i+6] += (team[i+6].att[1] == comboStats.att) * team[i+6].atk * orbMultiplier /
                       (team[i+6].att[0] == team[i+6].att[1] ? 10 : 3);
  }
  damage = baseDamage.map(function(x){ return x * comboMultiplier; });
  // TODO draw value
  // TODO everything
}

endCombos = function() {
  // TODO
  baseDamage = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  damage = baseDamage;
  teamCombos = [];
}

getGameRules = function() {
  skyfall = true;
  numInRow = 6;
  numInCol = 5;
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
        numInRow = 7;
        numInCol = 6;
        break;
      case "no match n":
        minMatch = Math.max(component.orbs + 1, minMatch);
    }
  }
  for (var component of team[6].lskill.concat(team[11].lskill)) {
    if (component.type == "4 seconds") {
      moveTime = 4;
    }
  }
  return {
    skyfall:  skyfall,
    moveTime: moveTime,
    numInRow: numInRow,
    numInCol: numInCol,
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

getMaxHp = function() {
  maxHp = 0;
  for (i = 6; i < 12; i++) {
    maxHp += team[i].hp;
    // TODO Assist HP
  }
  return maxHp;
};

getHp = function() { return 10; };
getTeam = function() { return team; };
getDamage = function() { return damage; }

})()
