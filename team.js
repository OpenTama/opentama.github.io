monsters = [];
lskills = [];
askills = [];
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

// make sure it processes monster data after lskills and askills
fetch("https://www.padherder.com/api/active_skills").then(function(response) {
  return response.json();
}).then(function(data) {
  processASkills(data);
  fetch("https://www.padherder.com/api/leader_skills").then(function(response) {
    return response.json();
  }).then(function(data) {
    processLSkills(data);
    fetch("https://www.padherder.com/api/monsters").then(function(response) {
      return response.json();
    }).then(function(data) {
      processMonsters(data);
    }).catch(function() {
      alert("unable to read monsters");
    });
  }).catch(function() {
    alert("unable to read leaders");
  });
}).catch(function() {
  alert("unable to read actives");
});

function processLSkills(data) {
  var timeExtension = [
    /(?:^|\. )Increases time limit of orb movement by ([0-9.]+) seconds(?:\.$|(?=\. )|$)/,
    function (reMatch) { return {type: "time_extension", time: parseFloat(reMatch[1]) }; }
  ];

  var o51e = [
    /(?:^|\. )Matched attribute ATK x([0-9.]+) when matching exactly 5 connected orbs with at least 1 enhanced orb(?:\.$|(?=\. )|$)/,
    function (reMatch) { return {type: "5o1e", atk: parseFloat(reMatch[1]) }; }
  ];

  var base = [
    /(?:^|\. )((?:(?:(?:Fire|Water|Wood|Light|Dark|God|Devil|Dragon|Attacker|Physical|Balanced|Healer|Machine|Enhance Material|All)(?: & | attribute(?: & )?| type))+ cards )?)((?:(?:HP|ATK|RCV) x[0-9.]+(?:, )?)+)(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      var hpFind = /HP x([0-9.]+)/;
      var atkFind = /ATK x([0-9.]+)/;
      var rcvFind = /RCV x([0-9.]+)/;
      return {type:        "base",
              requirement: reMatch[1].split(/ & | attribute(?: & )?| type| cards /).filter(function(x) { return x != ""; }),
              hp:          hpFind.test(reMatch[2]) ? parseFloat(hpFind.exec(reMatch[2])[1]) : 1,
              atk:         atkFind.test(reMatch[2]) ? parseFloat(atkFind.exec(reMatch[2])[1]) : 1,
              rcv:         rcvFind.test(reMatch[2]) ? parseFloat(rcvFind.exec(reMatch[2])[1]) : 1};
    }
  ];

  var hprange = [
    /(?:^|\. )((?:(?:(?:Fire|Water|Wood|Light|Dark|God|Devil|Dragon|Attacker|Physical|Balanced|Healer|Machine|Enhance Material|All)(?: & | attribute(?: & )?| type))+ cards )?)((?:(?:ATK|RCV) x[0-9.]+(?:, )?|[0-9]+% all damage reduction)+) when HP is (full|(?:less|greater) than [0-9]+%)(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      var atkFind = /ATK x([0-9.]+)/;
      var rcvFind = /RCV x([0-9.]+)/;
      var shieldFind = /[0-9]+% all damage reduction/;
      var hptest = reMatch[3] == "full" ? function(x) { return x == 1.0; } :
                 /less/.test(reMatch[3]) ? function(x) { return x < /[0-9]+/.exec(reMatch[3])[1] / 100.0; } :
                 /greater/.test(reMatch[3]) ? function(x) { return x > /[0-9]+/.exec(reMatch[3])[1] / 100.0; } :
                 "This should never be reached";
      return {type:        "hprange",
              requirement: reMatch[1].split(/ & | attribute(?: & )?| type| cards /).filter(function(x) { return x != ""; }),
              atk:         atkFind.test(reMatch[2]) ? parseFloat(atkFind.exec(reMatch[2])[1]) : 1,
              rcv:         rcvFind.test(reMatch[2]) ? parseFloat(rcvFind.exec(reMatch[2])[1]) : 1,
              //shield:      shieldFind.test(reMatch[2]) ? parseFloat(sheildFind.exec(reMatch[2])[1]) / 100 : 0,
              test:        hptest};
    }
  ];

  var skillUse = [
    /(?:^|\. )((?:(?:(?:Fire|Water|Wood|Light|Dark|God|Devil|Dragon|Attacker|Physical|Balanced|Healer|Machine|Enhance Material|All)(?: & | attribute(?: & )?| type))+ cards )?)((?:(?:ATK|RCV) x[0-9.]+(?:, )?)+) on the turn a skill is used\. \( Multiple skills will not stack \)(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      var atkFind = /ATK x([0-9.]+)/;
      var rcvFind = /RCV x([0-9.]+)/;
      return {type:        "skil_use",
              requirement: reMatch[1].split(/ & | attribute(?: & )?| type| cards /).filter(function(x) { return x != ""; }),
              atk:         atkFind.test(reMatch[2]) ? parseFloat(atkFind.exec(reMatch[2])[1]) : 1,
              rcv:         rcvFind.test(reMatch[2]) ? parseFloat(rcvFind.exec(reMatch[2])[1]) : 1};
    }
  ];

  var blob = [
    /(?:^|\. )ATK x([0-9.]+) when simultaneously clearing ([0-9]+) connected (Fire|Water|Wood|Light|Dark|Heart) orbs(?:\. ATK x[0-9.]+ for each additional orb, up to ATK x([0-9.]+) at ([0-9]+) connected orb)?(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type:    "blob",
              att:     reMatch[3],
              minAtk:  parseFloat(reMatch[1]),
              maxAtk:  reMatch[4] == undefined ? parseFloat(reMatch[1]) : parseFloat(reMatch[4]),
              minOrbs: parseInt(reMatch[2]),
              maxOrbs: reMatch[5] == undefined ? parseFloat(reMatch[2]) : parseFloat(reMatch[5])};
    }
  ];

  var bicolor = [
    /(?:^|\. )All attribute cards ((?:(?:ATK|RCV) x[0-9.]+(?:, )?|[0-9]+% all damage reduction)+) when reaching (Fire|Water|Wood|Light|Dark|Heart) & (Fire|Water|Wood|Light|Dark|Heart) combos(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      var atkFind = /ATK x([0-9.]+)/;
      var rcvFind = /RCV x([0-9.]+)/;
      var shieldFind = /[0-9]+% all damage reduction/;
      return {type:   "color_count",
              minAtk: atkFind.test(reMatch[1]) ? parseFloat(atkFind.exec(reMatch[1])[1]) : 1,
              maxAtk: atkFind.test(reMatch[1]) ? parseFloat(atkFind.exec(reMatch[1])[1]) : 1,
              minRcv: rcvFind.test(reMatch[1]) ? parseFloat(rcvFind.exec(reMatch[1])[1]) : 1,
              maxRcv: rcvFind.test(reMatch[1]) ? parseFloat(rcvFind.exec(reMatch[1])[1]) : 1,
              //shield: shieldFind.test(reMatch[1]) ? parseFloat(sheildFind.exec(reMatch[1])[1]) / 100 : 0,
              minAtt: 2,
              maxAtt: 2,
              atts:   [reMatch[2], reMatch[3]]};
    }
  ];

  var tricolor = [
    /(?:^|\. )All attribute cards ((?:(?:ATK|RCV) x[0-9.]+(?:, )?)+) when attacking with (Fire|Water|Wood|Light|Dark|Heart), (Fire|Water|Wood|Light|Dark|Heart) & (Fire|Water|Wood|Light|Dark|Heart) orb types at the same time(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      var atkFind = /ATK x([0-9.]+)/;
      var rcvFind = /RCV x([0-9.]+)/;
      return {type:   "color_count",
              minAtk: atkFind.test(reMatch[1]) ? parseFloat(atkFind.exec(reMatch[1])[1]) : 1,
              maxAtk: atkFind.test(reMatch[1]) ? parseFloat(atkFind.exec(reMatch[1])[1]) : 1,
              minRcv: rcvFind.test(reMatch[1]) ? parseFloat(rcvFind.exec(reMatch[1])[1]) : 1,
              maxRcv: rcvFind.test(reMatch[1]) ? parseFloat(rcvFind.exec(reMatch[1])[1]) : 1,
              shield: 0,
              minAtt: 3,
              maxAtt: 3,
              atts:   [reMatch[2], reMatch[3], reMatch[4]]};
    }
  ];

  var teammate = [
    /(?:^|\. )All attribute cards ((?:(?:ATK|RCV) x[0-9.]+(?:, )?)+) when ([^.]+) in the same team(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      var atkFind = /ATK x([0-9.]+)/;
      var rcvFind = /RCV x([0-9.]+)/;
      return {type:      "teammate",
              atk:       atkFind.test(reMatch[1]) ? parseFloat(atkFind.exec(reMatch[1])[1]) : 1,
              rcv:       rcvFind.test(reMatch[1]) ? parseFloat(rcvFind.exec(reMatch[1])[1]) : 1,
              teammates: reMatch[2].split(/ , /)};
    }
  ];

  var rainbow1 = [
    /(?:^|\. )All attribute cards ATK x([0-9.]+) when attacking with ([0-9]+) of following orb types: ((?:(?:Fire|Water|Wood|Light|Dark|Heart)(?:, | & |))+)(?:\. ATK x[0-9.]+ for each additional orb type, up to ATK x([0-9.]+) for all ([0-9]+) matches)?(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type:   "color_count",
              minAtk: parseFloat(reMatch[1]),
              maxAtk: reMatch[4] == undefined ? parseFloat(reMatch[1]) : parseFloat(reMatch[4]),
              minRcv: 1,
              maxRcv: 1,
              shield: 0,
              minAtt: parseInt(reMatch[2]),
              maxAtt: reMatch[5] == undefined ? parseFloat(reMatch[2]) : parseFloat(reMatch[5]),
              atts:   reMatch[3].split(/, | & /)};
    }
  ];

  var resolve = [
    /(?:^|\. )While your HP is ([0-9]+)% or above, a single hit that normally kills you will instead leave you with 1 HP\. For the consecutive hits, this skill will only affect the first hit(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type: "resolve",
              hp:   parseFloat(reMatch[1]) / 100};
    }
  ];

  var noSkyfall = [
    /(?:^|\. )No skyfall matches(?:\.$|(?=\. )|$)/,
    function (reMatch) { return {type: "no_skyfall" }; }
  ];

  var combo1 = [
    /(?:^|\. )All attribute cards ATK x([0-9.]+) when reaching ([0-9]+) combos or above(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type:      "combo",
              minAtk:    parseFloat(reMatch[1]),
              maxAtk:    parseFloat(reMatch[1]),
              minCombos: parseInt(reMatch[2]),
              maxCombos: parseInt(reMatch[2])};
    }
  ];

  var combo2 = [
    /(?:^|\. )ATK x([0-9.]+) at ([0-9]+) combos\. ATK x[0-9.]+ for each additional combo, up to ATK x([0-9.]) at ([0-9]+) combos(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type:      "combo",
              minAtk:    parseFloat(reMatch[1]),
              maxAtk:    parseFloat(reMatch[3]),
              minCombos: parseInt(reMatch[2]),
              maxCombos: parseInt(reMatch[4])};
    }
  ];

  for (var skill of data) {
    readableSkill = [];
    for (var mechanic of [timeExtension, o51e, base, hprange, skillUse, blob, bicolor, tricolor, teammate, rainbow1, resolve, noSkyfall, combo1, combo2]) {
      var keepSearching = true;
      while (keepSearching) {
        var reMatch = mechanic[0].exec(skill.effect);
        if (reMatch != null) {
          readableSkill.push(mechanic[1](reMatch));
          skill.effect = skill.effect.replace(mechanic[0], "");
        }
        keepSearching = reMatch != null;
      }
    }

    if (skill.effect != "") { console.log(skill.effect); } // TODO print original as well
    lskills[skill.name] = readableSkill;
  }
}

function processASkills(data) {
  for (var askill of data) {
    askills[askill.name] = {effect: askill.effect,
                            cd:     askill.min_cooldown};
  }
}

function processMonsters(data) {
  for (var monster of data) {
    monsters[monster.id] = {askill:     askills[monster.active_skill],
                            lskill:     lskills[monster.leader_skill],
                            name:       monster.name,
                            atk:        monster.atk_max + 495,
                            hp:         monster.hp_max + 990,
                            rcv:        monster.rcv_max + 297,
                            awakenings: monster.awoken_skills,
                            att:        [monster.element, monster.element2],
                            type:       [monster.type, monster.type2]};
  }
}
