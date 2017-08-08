monsters = [];
teamCombos = [];

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

function queryMonsters() {
  return [0, 1, 5, 9, 13, 17];
}

function getHp() {
  return 10;
}

function getMaxHp() {
  return 100;
}
