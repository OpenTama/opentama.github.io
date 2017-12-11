var getMonsters;

(function(){

var monsters = [];
var lskills = [];
var askills = [];
monsters[0] = {
  id:      0,
  lskill:  [{type: "none"}],
  assetId: 0,
  rarity:  -1,
  atk:     0,
  hp:      0,
  rcv:     0,
  att:     [-1, -1],
  type:    [-1, -1, -1]
};

// make sure it processes monster data after lskills and askills
fetch("data/active_skills").then(function(response) {
  return response.json();
}).then(function(data) {
  processASkills(data);
  fetch("data/leader_skills").then(function(response) {
    return response.json();
  }).then(function(data) {
    processLSkills(data);
    fetch("data/monsters").then(function(response) {
      return response.json();
    }).then(function(data) {
      processMonsters(data);
    }).catch(function(e) {
      console.error(e);
      alert("unable to read monsters");
    });
  }).catch(function(e) {
    console.error(e);
    alert("unable to read leaders");
  });
}).catch(function(e) {
  console.error(e);
  alert("unable to read actives");
});

function processLSkills(data) {
  var missing = 0;

  var timeExtension = [matchStart(), "Increases time limit of orb movement by ", matchNum("time"), " seconds", matchEnd()];

  var o51e = [matchStart(), "Matched attribute ", matchStat(""), " when matching exactly 5 connected orbs with at least 1 enhanced orb", matchEnd()];

  var base = [matchStart(), "(?:", matchStat(""), " to ", matchType(), "|", matchType(), matchStat(""), ")", 
              matchStringTest("coop", " in cooperation mode"), "(?:\. ", matchStat("").re, " if both attributes are met)?", matchEnd()];

  var hprange = [matchStart(), matchType(), matchStat(""), {
    re:   " when HP is (full|(?:less|greater) than [0-9]+%)",
    func: function(skill, groups) {
            skill.hptest = groups[0] == "full" ? function(x) { return x == 1; } :
                           /less/.test(groups[0]) ? function(x) { return x < /[0-9]+/.exec(groups[0])[1]; } :
                           function(x) { return x > /[0-9]+/.exec(groups[0])[1]; };
          }}, matchEnd()];

  var skillUse = [matchStart(), matchType(), matchStat(""), " on the turn a skill is used\\.  \\( Multiple skills will not stack \\) ?"];

  var blob = [matchStart(), matchStat(""), " when (?:simultaneously clearing|matching) ", matchStringTest("precise", "exactly "),
              matchNum("orbsMin"), "\\+? connected ", matchColor(), " orbs(?:\\. ", matchStat("").re, " for each additional orb, up to ",
              matchStat("Max"), " at ", matchNum("orbsMax"), " connected orb)?", matchEnd()];

  var teammate = [matchStart(), matchType(), matchStat(""), {
    re:   " when (.+) in the same team",
    func: function(skill, groups) {
            skill.teammates = groups[0].split(" , ");
          }}, matchEnd()];

  var rainbow = [matchStart(), matchType(), matchStat(""), " when (?:reaching|attacking with) (?:", matchNum("attMin"), " of (?:following orb types: )?)?",
                 matchColor(), "(?:\\. ", matchStat("").re, " for each additional orb type, up to ", matchStat("Max"), " for all ", matchNum("attMax"), " matches",
                 ")?(?: combos| orb types)?(?: at the same time)?", matchEnd()];

  var resolve = [matchStart(), "While your HP is ", matchNum("hp"), "% or above, a single hit that normally kills you will instead leave you with 1 HP\\. ",
                 "For the consecutive hits, this skill will only affect the first hit", matchEnd()];

  var noSkyfall = [matchStart(), "No skyfall (?:matches|combos)", matchEnd()];

  var combo = [matchStart(), matchType(), matchStat(""), " (?:when reaching|at) ", matchStringTest("precise", "exactly "), matchNum("combosMin"), 
               " (?:or more )?combos(?: or above)?(?:\\. ", matchStat("").re, " for each additional combo, up to ", matchStat("Max"), " at ", matchNum("combosMax"),
               " combos)?", matchEnd()];

  var counterAtk = [matchStart(), matchNum("chance"), "% chance to deal counter ", matchColor(), " damage of ", matchNum("strength"), "x damage taken", matchEnd()];

  var autoRcv = [matchStart(), "Heal RCV x", matchNum("strength"), " as HP after every orbs elimination", matchEnd()];

  var colorShield = [matchStart(), matchNum("strength"), "% ", matchColor(), " damage reduction", matchEnd()];

  var cross = [matchStart(), matchStat(""), " (?:for clearing|after matching) ", matchStringTest("stackable", "each "),
               matchColor(), " orbs in a cross formation", matchEnd()];

  var colorCombo = [matchStart(), matchType(), matchStat(""), " when (?:attacking with|reaching) ", matchNum("combosMin"), "\\+? (?:set of )?", matchColor(),
                    " combos?(?: at the same time)?(?:\\. ", matchStat("").re, " for each additional combo, up to ", matchStat("Max"), " when reaching[^.]* ",
                    matchNum("combosMax"), " combos(?: combination)?)?", matchEnd()];

  var board7x6 = [matchStart(), "Change the board to 7x6 size", matchEnd()];

  var noMatchN = [matchStart(), "Can no longer clear ", matchNum("orbs"), " (?:or less )?connected orbs", matchEnd()];

  var autoAtk = [matchStart(), "Deal ATK x", matchNum("strength"), " damage to all enemies after every orbs elimination\\. ",
                 "Ignores enemy element, but can be reduced by enemy defense down to 0 damage", matchEnd()];

  var s4 = [matchStart(), "Fixed orb movement time at 4 seconds\\."];

  var statReduce = [matchStart(), {
    re:   "([0-9]+)% (HP|RCV) reduction(?: and )?\\.? ?",
    func: function (skill, groups) {
            skill.type = "base";
            skill.requirement = ["All"];
            skill.hp = groups[2] == "HP" ? (1 - parseFloat(groups[1]) / 100) : 1;
            skill.atk = 1;
            skill.rcv = groups[2] == "RCV" ? (1 - parseFloat(groups[1]) / 100) : 1;
            skill.shield = 0;
            skill.coop = false;
          }}];

  var leftover = [matchStart(), matchStat(""), " when there are ", matchNum("leftover"), " or less orbs on the board after matching", matchEnd()];

  var ignore = [".+coins.+|Fusing.+|.+egg.+|.+exp.+|.+sound.+|.+Skill.+|.+skill.+|Sells.+|.+Latent.+"];

  var mechanics = [[s4, "4 seconds"], [statReduce, "stat reduce"], [skillUse, "skill use"], [timeExtension, "time extension"],
                   [o51e, "5o1e"], [colorShield, "color shield"], [base, "passive boost"], [hprange, "hp conditional"],
                   [blob, "blob"], [rainbow, "raindow"], [teammate, "required teammate"], [resolve, "resolve"], [noSkyfall, "no skyfall"],
                   [combo, "combo"], [counterAtk, "counterattack"], [autoRcv, "autorecover"], [autoAtk, "autoattack"], [cross, "cross"],
                   [colorCombo, "monocolor"], [board7x6, "7x6"], [noMatchN, "no match n"], [leftover, "leftover orbs"], [ignore, "none"]];
  mechanics = mechanics.map(function(x) { return fromResList(x[0], x[1]); });

  for (var skill of data) {
    if (skill.name == "N/A") {
      continue;
    }
    readableSkill = [];
    for (var mechanic of mechanics) {
      if (skill.effect == "") {
        break;
      }
      var keepSearching = true;
      while (keepSearching) {
        try {
          var parsed = mechanic(skill.effect);
          if (parsed[0] != null) {
            readableSkill.push(parsed[0]);
            skill.effect = parsed[1];
          } else {
            keepSearching = false;
          }
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
      lskills[skill.name] = [{type: "Unsupported or malformed"}];
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
                            id:         monster.id,
                            assetId:    typeof(monster.pdx_id) == "undefined" ? monster.id : monster.pdx_id,
                            atk:        monster.atk_max + 495,
                            hp:         monster.hp_max + 990,
                            rcv:        monster.rcv_max + 297,
                            awakenings: monster.awoken_skills,
                            rarity:     monster.rarity,
                            att:        [monster.element, monster.element2],
                            type:       [monster.type, monster.type2, monster.type3]};
  }
  console.log("data loaded")
};

getMonsters = function() { return monsters; };

})()
