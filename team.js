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
/*fetch("https://www.padherder.com/api/active_skills").then(function(response) {
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
});*/

function processLSkills(data) {
  var missing = 0;
  // TODO refactor
  var timeExtension = [
    /(?:^|\. )Increases time limit of orb movement by ([0-9.]+) seconds(?:\.$|(?=\. )|$)/,
    function (reMatch) { return {type: "time_extension", time: parseFloat(reMatch[1]) }; }
  ];

  var o51e = [
    /(?:^|\. )Matched attribute ATK x([0-9.]+) when matching exactly 5 connected orbs with at least 1 enhanced orb(?:\.$|(?=\. )|$)/,
    function (reMatch) { return {type: "5o1e", atk: parseFloat(reMatch[1]) }; }
  ];

  var base1 = [
    /(?:^|\. )((?:(?:HP|ATK|RCV|All Stats) x[0-9.]+(?:, )?)+) to ((?:(?:Fire|Water|Wood|Light|Dark|God|Devil|Dragon|Attacker|Physical|Balanced|Healer|Machine|Enhance Material|All|all)(?:, | & | attribute(?: & )?| type))+ cards)(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      var hpFind = /HP x([0-9.]+)/;
      var atkFind = /ATK x([0-9.]+)/;
      var rcvFind = /RCV x([0-9.]+)/;
      var allFind = /All Stats x([0-9.]+)/;
      var all = allFind.test(reMatch[1]) ? parseFloat(allFind.exec(reMatch[1])[1]) : 1;
      return {type:        "base",
              requirement: reMatch[2].split(/ & | attribute(?: & )?| type| cards /).filter(function(x) { return x != ""; }),
              hp:          (hpFind.test(reMatch[1]) ? parseFloat(hpFind.exec(reMatch[1])[1]) : 1) * all,
              atk:         (atkFind.test(reMatch[1]) ? parseFloat(atkFind.exec(reMatch[1])[1]) : 1) * all,
              rcv:         (rcvFind.test(reMatch[1]) ? parseFloat(rcvFind.exec(reMatch[1])[1]) : 1) * all};
    }
  ];

  var base2 = [
    /(?:^|\. )((?:(?:(?:Fire|Water|Wood|Light|Dark|God|Devil|Dragon|Attacker|Physical|Balanced|Healer|Machine|Enhance Material|All|all)(?:, | & | attribute(?: & )?| type))+ cards )?)((?:(?:HP|ATK|RCV|All Stats) x[0-9.]+(?:, )?)+)(?:\. (?:(?:HP|ATK|RCV) x[0-9.]+(?:, )?)+ if both attributes are met)?(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      var hpFind = /HP x([0-9.]+)/;
      var atkFind = /ATK x([0-9.]+)/;
      var rcvFind = /RCV x([0-9.]+)/;
      var allFind = /All Stats x([0-9.]+)/;
      var all = allFind.test(reMatch[2]) ? parseFloat(allFind.exec(reMatch[2])[1]) : 1;
      return {type:        "base",
              requirement: reMatch[1].split(/ & | attribute(?: & )?| type| cards /).filter(function(x) { return x != ""; }),
              hp:          (hpFind.test(reMatch[2]) ? parseFloat(hpFind.exec(reMatch[2])[1]) : 1) * all,
              atk:         (atkFind.test(reMatch[2]) ? parseFloat(atkFind.exec(reMatch[2])[1]) : 1) * all,
              rcv:         (rcvFind.test(reMatch[2]) ? parseFloat(rcvFind.exec(reMatch[2])[1]) : 1) * all};
    }
  ];

  var hprange = [
    /(?:^|\. )((?:(?:(?:Fire|Water|Wood|Light|Dark|God|Devil|Dragon|Attacker|Physical|Balanced|Healer|Machine|Enhance Material|All)(?:, | & | attribute(?: & )?| type))+ cards )?)((?:(?:ATK|RCV) x[0-9.]+(?:, )?|[0-9]+% all damage reduction)+) when HP is (full|(?:less|greater) than [0-9]+%)(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      var atkFind = /ATK x([0-9.]+)/;
      var rcvFind = /RCV x([0-9.]+)/;
      var shieldFind = /([0-9]+)% all damage reduction/;
      var hptest = reMatch[3] == "full" ? function(x) { return x == 1.0; } :
                 /less/.test(reMatch[3]) ? function(x) { return x < /[0-9]+/.exec(reMatch[3])[1] / 100.0; } :
                 /greater/.test(reMatch[3]) ? function(x) { return x > /[0-9]+/.exec(reMatch[3])[1] / 100.0; } :
                 "This should never be reached";
      return {type:        "hprange",
              requirement: reMatch[1].split(/ & | attribute(?: & )?| type| cards /).filter(function(x) { return x != ""; }),
              atk:         atkFind.test(reMatch[2]) ? parseFloat(atkFind.exec(reMatch[2])[1]) : 1,
              rcv:         rcvFind.test(reMatch[2]) ? parseFloat(rcvFind.exec(reMatch[2])[1]) : 1,
              shield:      shieldFind.test(reMatch[2]) ? parseFloat(shieldFind.exec(reMatch[2])[1]) / 100 : 0,
              test:        hptest};
    }
  ];

  var skillUse = [
    /(?:^|\. )((?:(?:(?:Fire|Water|Wood|Light|Dark|God|Devil|Dragon|Attacker|Physical|Balanced|Healer|Machine|Enhance Material|All)(?:, | & | attribute(?: & )?| type))+ cards )?)((?:(?:ATK|RCV) x[0-9.]+(?:, )?)+) on the turn a skill is used\. \( Multiple skills will not stack \) ?/,
    function (reMatch) {
      var atkFind = /ATK x([0-9.]+)/;
      var rcvFind = /RCV x([0-9.]+)/;
      return {type:        "skil_use",
              requirement: reMatch[1].split(/ & | attribute(?: & )?| type| cards /).filter(function(x) { return x != ""; }),
              atk:         atkFind.test(reMatch[2]) ? parseFloat(atkFind.exec(reMatch[2])[1]) : 1,
              rcv:         rcvFind.test(reMatch[2]) ? parseFloat(rcvFind.exec(reMatch[2])[1]) : 1};
    }
  ];

  var blobFixed = [
    /(?:^|\. )((?:(?:ATK|RCV) x[0-9.]+(?:, )?)+) when (?:simultaneously clearing|matching) (exactly )?([0-9]+)\+? connected ((?:(?:Fire|Water|Wood|Light|Dark|Heart|Jammer|Poison|Mortal Poison|heart)(?: or )?)+) orbs(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      var atkFind = /ATK x([0-9.]+)/;
      var rcvFind = /RCV x([0-9.]+)/;
      return {type:    "blob",
              att:     reMatch[3].split(/ or /),
              minAtk:  atkFind.test(reMatch[1]) ? parseFloat(atkFind.exec(reMatch[1])[1]) : 1,
              maxAtk:  atkFind.test(reMatch[1]) ? parseFloat(atkFind.exec(reMatch[1])[1]) : 1,
              rcv:     rcvFind.test(reMatch[1]) ? parseFloat(rcvFind.exec(reMatch[1])[1]) : 1,   
              minOrbs: parseInt(reMatch[3]),
              maxOrbs: parseInt(reMatch[3]),
              precise: reMatch[2] == "exactly "};
    }
  ];

  var blobScaling = [
    /(?:^|\. )ATK x([0-9.]+) when simultaneously clearing ([0-9]+) connected ((?:(?:Fire|Water|Wood|Light|Dark|Heart|Jammer|Poison|Mortal Poison)(?: or )?)+) orbs\. ATK x[0-9.]+ for each additional orb, up to ATK x([0-9.]+) at ([0-9]+) connected orb(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type:    "blob",
              att:     reMatch[3].split(/ or /),
              minAtk:  parseFloat(reMatch[1]),
              maxAtk:  parseFloat(reMatch[4]),
              rcv:     1,
              minOrbs: parseInt(reMatch[2]),
              maxOrbs: parseInt(reMatch[5]),
              precise: false};
    }
  ];

  var teammate = [
    /(?:^|\. )(All attribute cards )?((?:(?:HP|ATK|RCV) x[0-9.]+(?:, )?)+) when (.+) in the same team(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      var hpFind = /HP x([0-9.]+)/;
      var atkFind = /ATK x([0-9.]+)/;
      var rcvFind = /RCV x([0-9.]+)/;
      return {type:      "teammate",
              hp:        hpFind.test(reMatch[1]) ? parseFloat(hpFind.exec(reMatch[1])[1]) : 1,
              atk:       atkFind.test(reMatch[1]) ? parseFloat(atkFind.exec(reMatch[1])[1]) : 1,
              rcv:       rcvFind.test(reMatch[1]) ? parseFloat(rcvFind.exec(reMatch[1])[1]) : 1,
              teammates: reMatch[2].split(/ , /)};
    }
  ];

  var rainbowFixed = [
    /(?:^|\. )All attribute cards ((?:(?:ATK|RCV) x[0-9.]+(?:, )?|[0-9]+% all damage reduction)+) when (?:reaching|attacking with) ((?:(?:Fire|Water|Wood|Light|Dark|Heart)(?: & | and |, )?)+) (?:combos|orb types)(?: at the same time)?(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      var atkFind = /ATK x([0-9.]+)/;
      var rcvFind = /RCV x([0-9.]+)/;
      var shieldFind = /([0-9]+)% all damage reduction/;
      return {type:   "rainbow",
              minAtk: atkFind.test(reMatch[1]) ? parseFloat(atkFind.exec(reMatch[1])[1]) : 1,
              maxAtk: atkFind.test(reMatch[1]) ? parseFloat(atkFind.exec(reMatch[1])[1]) : 1,
              rcv:    rcvFind.test(reMatch[1]) ? parseFloat(rcvFind.exec(reMatch[1])[1]) : 1,
              shield: shieldFind.test(reMatch[1]) ? parseFloat(shieldFind.exec(reMatch[1])[1]) / 100 : 0,
              minAtt: reMatch[2].split(/ & | and |, /).length,
              maxAtt: reMatch[2].split(/ & | and |, /).length,
              atts:   reMatch[2].split(/ & | and |, /)};
    }
  ];

  var rainbowScaling = [
    /(?:^|\. )All attribute cards ATK x([0-9.]+) when attacking with ([0-9]+) of following orb types: ((?:(?:Fire|Water|Wood|Light|Dark|Heart)(?:, | & |))+)(?:\. ATK x[0-9.]+ for each additional orb type, up to ATK x([0-9.]+) for all ([0-9]+) matches)?(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type:   "rainbow",
              minAtk: parseFloat(reMatch[1]),
              maxAtk: reMatch[4] == undefined ? parseFloat(reMatch[1]) : parseFloat(reMatch[4]),
              rcv:    1,
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

  var comboFixed = [
    /(?:^|\. )(Fire|Water|Wood|Light|Dark|All) attribute cards ((?:(?:ATK|RCV) x[0-9.]+(?:, )?|[0-9]+% all damage reduction)+) (?:when reaching|at) (exactly )?([0-9]+) (?:or more )?combos(?: or above)?(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      var atkFind = /ATK x([0-9.]+)/;
      var rcvFind = /RCV x([0-9.]+)/;
      var shieldFind = /([0-9]+)% all damage reduction/;
      return {type:        "combo",
              requirement: [reMatch[1]],
              minAtk:      atkFind.test(reMatch[2]) ? parseFloat(atkFind.exec(reMatch[2])[1]) : 1,
              maxAtk:      atkFind.test(reMatch[2]) ? parseFloat(atkFind.exec(reMatch[2])[1]) : 1,
              rcv:         rcvFind.test(reMatch[2]) ? parseFloat(rcvFind.exec(reMatch[2])[1]) : 1,
              shield:      shieldFind.test(reMatch[2]) ? parseFloat(shieldFind.exec(reMatch[2])[1]) / 100 : 0,
              minCombos:   parseInt(reMatch[4]),
              maxCombos:   parseInt(reMatch[4]),
              precise:     reMatch[3] == "exactly "};
    }
  ];

  var comboScaling = [
    /(?:^|\. )ATK x([0-9.]+) at ([0-9]+) combos\. ATK x[0-9.]+ for each additional combo, up to ATK x([0-9.]+) at ([0-9]+) combos(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type:        "combo",
              requirement: ["All"],
              minAtk:      parseFloat(reMatch[1]),
              maxAtk:      parseFloat(reMatch[3]),
              rcv:         1,
              shield:      0,
              minCombos:   parseInt(reMatch[2]),
              maxCombos:   parseInt(reMatch[4]),
              precise:     false};
    }
  ];

  var counterAtk = [
    /(?:^|\. )([0-9]+)% chance to deal counter (Fire|Water|Wood|Light|Dark) damage of ([0-9.]+)x damage taken(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type:     "counter_atk",
              chance:   parseFloat(reMatch[1]) / 100,
              att:      reMatch[2],
              strength: parseFloat(reMatch[3])};
    }
  ];

  var autoRcv = [
    /(?:^|\. )Heal RCV x([0-9.]+) as HP after every orbs elimination(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type:     "auto_rcv",
              strength: parseFloat(reMatch[1])};
    }
  ];

  var coopBoost = [
    /(?:^|\. )((?:(?:HP|ATK|RCV) x[0-9.]+(?:, )?)+) in cooperation mode(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      var hpFind = /HP x([0-9.]+)/;
      var atkFind = /ATK x([0-9.]+)/;
      var rcvFind = /RCV x([0-9.]+)/;
      return {type:        "coop_boost",
              hp:          hpFind.test(reMatch[1]) ? parseFloat(hpFind.exec(reMatch[1])[1]) : 1,
              atk:         atkFind.test(reMatch[1]) ? parseFloat(atkFind.exec(reMatch[1])[1]) : 1,
              rcv:         rcvFind.test(reMatch[1]) ? parseFloat(rcvFind.exec(reMatch[1])[1]) : 1};
    }
  ];

  var colorShield = [
    /(?:^|\. )([0-9]+)% ((?:(?:Fire|Water|Wood|Light|Dark|All|all)(?:, | & )?)+) damage reduction(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type:   "color_shield",
              shield: parseFloat(reMatch[1]) / 100,
              att:    reMatch[2].split(/, | & /)};
    }
  ];

  var colorCross = [
    /(?:^|\. )ATK x([0-9.]+) for clearing each ((?:(?:Fire|Water|Wood|Light|Dark|Jammer)(?: or )?)+) orbs in a cross formation(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type: "color_cross",
              atk:  parseFloat(reMatch[1]),
              att:  reMatch[2].split(/ or /)};
    }
  ];

  var monoColorFixed = [
    /(?:^|\. )All attribute cards ((?:(?:ATK|RCV) x[0-9.]+(?:, )?|[0-9]+% all damage reduction)+) when (?:attacking with|reaching) ([0-9]+)\+? (?:set of )?(Fire|Water|Wood|Light|Dark|Heart|Jammer) combos(?: at the same time)?(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      var atkFind = /ATK x([0-9.]+)/;
      var rcvFind = /RCV x([0-9.]+)/;
      var shieldFind = /([0-9]+)% all damage reduction/;
      return {type:      "mono_color",
              minAtk:    atkFind.test(reMatch[1]) ? parseFloat(atkFind.exec(reMatch[1])[1]) : 1,
              maxAtk:    atkFind.test(reMatch[1]) ? parseFloat(atkFind.exec(reMatch[1])[1]) : 1,
              minRcv:    rcvFind.test(reMatch[1]) ? parseFloat(rcvFind.exec(reMatch[1])[1]) : 1,
              maxRcv:    rcvFind.test(reMatch[1]) ? parseFloat(rcvFind.exec(reMatch[1])[1]) : 1,
              shield:    shieldFind.test(reMatch[1]) ? parseFloat(shieldFind.exec(reMatch[1])[1]) / 100 : 0,
              minCombos: parseInt(reMatch[2]),
              maxCombos: parseInt(reMatch[2]),
              att:       reMatch[3]};
    }
  ];

  var monoColorScaling = [
    /(?:^|\. )All attribute cards ATK x([0-9.]+) when reaching ([0-9]+) set of (Fire|Water|Wood|Light|Dark|Heart|Jammer) combos?\. ATK x[0-9.]+ for each additional combo, up to ATK x([0-9.]+) when reaching[^.]* ([0-9]+) combos(?: combination)?(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type:      "combo",
              minAtk:    parseFloat(reMatch[1]),
              maxAtk:    parseFloat(reMatch[4]),
              minRcv:    1,
              maxRcv:    1,
              shield:    0,
              minCombos: parseInt(reMatch[2]),
              maxCombos: parseInt(reMatch[5]),
              att:       reMatch[3]};
    }
  ];

  var board7x6 = [
    /(?:^|\. )Change the board to 7x6 size(?:\.$|(?=\. )|$)/,
    function (reMatch) { return {type: "7x6" }; }
  ];

  var heartCross = [
    /(?:^|\. )(?:ATK x([0-9.]+), r|R)educe damage taken by ([0-9]+)% after matching Heal orbs in a cross formation(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type:   "heart_cross",
              atk:    reMatch[1] == undefined ? 1 : parseFloat(reMatch[1]),
              shield: parseFloat(reMatch[2]) / 100};
    }
  ];

  var noMatchN = [
    /(?:^|\. )Can no longer clear ([1-9]+) (?:or less )?connected orbs(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type: "no_match_n",
              orbs: parseInt(reMatch[1])};
    }
  ];

  var autoAtk = [
    /(?:^|\. )Deal ATK x([0-9.]+) damage to all enemies after every orbs elimination\. Ignores enemy element, but can be reduced by enemy defense down to 0 damage(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type:     "auto_atk",
              strength: parseFloat(reMatch[1])};
    }
  ];

  var s4 = [
    /(?:^|\. )Fixed orb movement time at 4 seconds\./,
    function (reMatch) { return {type: "4_seconds"}; }
  ];

  var statReduce = [
    /(?:^|\. )([0-9]+)% (HP|RCV) reduction(?: and )?\.? ?/,
    function (reMatch) {
      return {type:        "base",
              requirement: ["All"],
              hp:          reMatch[2] == "HP" ? (1 - parseFloat(reMatch[1]) / 100) : 1,
              atk:         1,
              rcv:         reMatch[2] == "RCV" ? (1 - parseFloat(reMatch[1]) / 100) : 1};
    }
  ];

  var colorOption = [
    /(?:^|\. )All attribute cards ATK x([0-9.]+) when reaching ((?:(?:(?:Fire|Water|Wood|Light|Dark|Heal)(?:, | & )?)+(?: or )?)+) combos(?:\.$|(?=\. )|$)/,
    function (reMatch) {
      return {type:    "color_option",
              atk:     parseFloat(reMatch[1]),
              options: reMatch[2].split(/ or /).map(function(x) { return x.split(/, | & /); })};
    }
  ];

  var ignore = [
    /.+coins.+|Fusing.+|.+egg.+|.+exp.+|.+sound.+|.+Skill.+|.+skill.+|Sells.+|.+Latent.+/,
    function (reMatch) { return {type: "noop" }; }
  ];

  for (var skill of data) {
    if (skill.name == "N/A") {
      continue;
    }
    readableSkill = [];
    for (var mechanic of [s4, statReduce, skillUse, timeExtension, o51e, base1, base2, hprange, blobScaling, blobFixed, rainbowScaling, rainbowFixed,
                          teammate, resolve, noSkyfall, comboScaling, comboFixed, counterAtk, autoRcv, autoAtk, coopBoost,
                          colorShield, colorCross, monoColorScaling, monoColorFixed, board7x6, heartCross, noMatchN, colorOption, ignore]) {
      var keepSearching = true;
      while (keepSearching) {
        try {
          var reMatch = mechanic[0].exec(skill.effect);
          if (reMatch != null) {
            readableSkill.push(mechanic[1](reMatch));
            skill.effect = skill.effect.replace(mechanic[0], "");
          }
          keepSearching = reMatch != null;
        } catch (e) {
          console.log(e);
          console.log(skill.effect);
          keepSearching = false;
        }
      }
    }

    if (skill.effect != "") {
      console.log(skill.effect);
      missing += 1;
      lskills[skill.name] = "Unsupported";
    } else {
      lskills[skill.name] = readableSkill;
    }
  }
  console.log(missing + " missing of " + data.length);
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
