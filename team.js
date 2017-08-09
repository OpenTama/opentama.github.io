monsters = [];
teamCombos = [];
team = [
  monsters[0],
  monsters[0],
  monsters[0],
  monsters[0],
  monsters[0],
  monsters[0],
  monsters[0],
  monsters[0],
  monsters[0],
  monsters[0],
  monsters[0],
  monsters[0]
]

function useCombo(comboStats) {
  teamCombos.push(comboStats);
  // TODO: unbind
}

function endCombos() {
  // TODO
}

function getGameRules() {
  return {
    skyfall:  false,
    moveTime: 4,
  }
}

function queryMonsters(constraint) {
  
  return monsters.filter(function(monster) {
    return (monster.att[0] == constraint.att1 || monster.att[0] == null && constraint.att1 == 5 || constraint.att1 == 6) &&
           (monster.att[1] == constraint.att2 || monster.att[1] == null && constraint.att2 == 5 || constraint.att2 == 6) &&
           (constraint.type == 12 || monster.type.includes([0, 1, 2, 3, 4, 5, 6, 7, 8, 12, 14, 15][constraint.type])) &&
           (constraint.rarity == 0 || monster.rarity == constraint.rarity);
  });
}

function getHp() {
  return 10;
}

function getMaxHp() {
  return 100;
}

function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }
    return true;
}
