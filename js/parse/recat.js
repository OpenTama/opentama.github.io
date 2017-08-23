function fromResList(resList, name) {
  var numGroups = resList.map(function (re) {
    if (typeof(re.re) == 'undefined') {
      return 0;
    } else {
      try {
        return (new RegExp(re.re + '|')).exec('').length - 1;
      } catch (e) {
        console.error(e);
        console.error(re.re);
      }
    }
  });
  var entireReStr = resList.reduce(function (acc, re) {
    if (typeof(re.re) == 'undefined') {
      return acc + re;
    } else {
      return acc + re.re;
    }
  }, "");
  var entireRe;
  try {
    entireRe = new RegExp(entireReStr);
    console.log(entireRe);
  } catch (e) {
    console.error(e);
    console.error(entireReStr);
    return null;
  }
  return function(input) {
    var entireMatch = entireRe.exec(input);
    if (entireMatch != null) {
      var retval = {type: name};
      entireMatch.splice(0, 1);
      for (var i in resList) {
        groupsForComponent = entireMatch.splice(0, numGroups[i]);
        if (typeof(resList[i].func) != 'undefined') {
          resList[i].func(retval, groupsForComponent);
        }
      }
      return [retval, input.replace(entireRe, "")];
    } else {
      return [null, input];
    }
  };
}

function matchStart() { return "(?:^|\\. )"; }

function matchEnd() { return "(?:\\.$|(?=\\. )|$)"; }

function matchStat(suffix) {
  return {
    re:   "((?:(?:HP|ATK|RCV|All Stats) x[0-9.]+(?:,  ?)?|[0-9]+% all damage reduction|[Rr]educe damage taken by [0-9]+%)+)",
    func: function(skill, groups) {
      if (typeof(groups[0]) != 'undefined') {
        var hpFind = /HP x([0-9.]+)/;
        var atkFind = /ATK x([0-9.]+)/;
        var rcvFind = /RCV x([0-9.]+)/;
        var allFind = /All Stats x([0-9.]+)/;
        var shieldFind = /([0-9]+)%/;
        var hp = hpFind.test(groups[0]) ? parseFloat(hpFind.exec(groups[0])[1]) : 1;
        var atk = atkFind.test(groups[0]) ? parseFloat(atkFind.exec(groups[0])[1]) : 1;
        var rcv = rcvFind.test(groups[0]) ? parseFloat(rcvFind.exec(groups[0])[1]) : 1;
        var all = allFind.test(groups[0]) ? parseFloat(allFind.exec(groups[0])[1]) : 1;
        var shield = shieldFind.test(groups[0]) ? parseFloat(shieldFind.exec(groups[0])[1]) / 100 : 0;
        skill["hp" + suffix] = hp * all;
        skill["atk" + suffix] = atk * all;
        skill["rcv" + suffix] = rcv * all;
        skill["shield" + suffix] = shield;
      }
    }
  };
}

function matchType() {
  return {
    re:   "((?:(?:(?:Fire|Water|Wood|Light|Dark|God|Devil|Dragon|Attacker|Physical|Balanced|Healer|Machine|Enhance Material|All|all)(?:, | & | attribute(?: & )?| type))+ cards ?)?)",
    func: function(skill, groups) {
      if (typeof(groups[0]) != 'undefined') {
        skill.requirement = groups[0].split(/ & | attribute(?: & )?| type| cards /).filter(function(x) { return x != ""; });
      }
    }
  };
}

function matchColor() {
  return {
    re:   "((?:(?:Fire|Water|Wood|Light|Dark|Heart|Heal|Jammer|Poison|Mortal Poison|heart|All)(?:, | & | and | or )?)+)",
    func: function(skill, groups) {
      skill.att = groups[0].split(/, | & | or /);
    }
  };
}

function matchNum(name) {
  return {
    re:   "([0-9.]+)",
    func: function(skill, groups) {
      skill[name] = typeof(groups[0]) == undefined ? -1 : parseFloat(groups[0]);
    }
  };
}

function matchStringTest(name, str) {
  return {
    re:   "(" + str + ")?",
    func: function(skill, groups) {
      skill[name] = groups[0] == str;
    }
  }
}
