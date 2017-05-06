(function(){
"use strict";

/**
*  @class sporTable
*/
function SporTable(config) {
  this.config = {
    fixtures: config.fixtures,
    DOMParent: config.DOMParent,
    sortable: config.sortable || false,
    points: config.points || {win: 3, draw: 1, lost: 0},
    lang: setLanguage("pl")
  };

  this.results = {};
  this.teams = {};

  function setLanguage(lang) {
    var langs = {
      en: {
        "Team": "Team",
        "Home": "Home",
        "Away": "Away",
        "Position": "#",
        "WinsAcronym": "W",
        "DrawsAcronym": "D",
        "LostAcronym": "L",
        "GoalsForcedAcronym": "GF",
        "GoalsAgainstAcronym": "GA",
        "GoalsDifferenceAcronym": "GD",
        "PointsShort": "Pts.",
        "InvalidResult": "Invalid result!"
      },
      pl: {
        "Team": "Drużyna",
        "Home": "Dom",
        "Away": "Wyjazd",
        "Position": "#",
        "WinsAcronym": "W",
        "DrawsAcronym": "R",
        "LostAcronym": "P",
        "GoalsForcedAcronym": "BZ",
        "GoalsAgainstAcronym": "BS",
        "GoalsDifferenceAcronym": "+/-",
        "PointsShort": "Pkt.",
        "InvalidResult": "Nieprawidłowy wynik!"
      }
    }

    return langs[lang];
  }
  setLanguage.call(this);

  this.buildFixturesView();
  this.buildTeamsObject();
  this.calculateGoalDifference();
  this.calculatePoints();
  this.buildTableView();
}

/**
* Method for quick creation of HTML elements
*
* @method createElement
* @param {String} elem HTML tag name
* @param {String/Array} style Class name passed as string or classes names passed as an array
* @param {Object} attr Object with HTML attributes of created element
* @param {String} text Text content of created element
* @return {Object} Ready HTML Element
*/
SporTable.prototype.createElem = function(elem, style, attr, text) {
  elem = document.createElement(elem);

  if(text) {
    text = document.createTextNode(text);
    elem.appendChild(text);
  }

  if(typeof style === "string") {
    elem.classList.add(style);
  }
  else if(style instanceof Array) {
    var classList = "",
        styleLength = style.length,
        i;

    for (i = 0; i < styleLength; i += 1) {
      classList += style[i] + " ";
    }

    elem.setAttribute("class", classList.trim());
  }

  if(attr) {
    var attributesKeys = Object.keys(attr),
        attributesLength = attributesKeys.length,
        j;

    for(j = 0; j < attributesLength; j += 1) {
      elem.setAttribute(attributesKeys[j], attr[attributesKeys[j]]);
    }
  }

  return elem;
};

/**
* Method calculate match details and adds them to team object
*
* @method analyzeMatch
* @param {Array} homeArr Array withe home team name and result
* @param {Array} awayArr Array withe away team name and result
*/
SporTable.prototype.analyzeMatch = function(homeArr, awayArr) {
  var homeTeam = homeArr[0],
      homeResult = homeArr[1],
      awayTeam = awayArr[0],
      awayResult = awayArr[1];

  //Calculate matches details
  function calculateMatches(homeTeam, homeResult, awayTeam, awayResult) {
    var homeTeam = this.teams[homeTeam].home,
        awayTeam = this.teams[awayTeam].away;

    switch(true) {
      case (homeResult > awayResult):
        homeTeam.wins += 1;
        awayTeam.lost += 1;
        break;
      case (homeResult == awayResult):
        homeTeam.draws += 1;
        awayTeam.draws += 1;
        break;
      case (homeResult < awayResult):
        homeTeam.lost += 1;
        awayTeam.wins += 1;
        break;
      default:
        console.log(this.config.lang.InvalidResult);
    }
  }
  calculateMatches.apply(this, [homeTeam, homeResult, awayTeam, awayResult]);

  //Calculate goals
  function calculateGoals(homeTeam, homeResult, awayTeam, awayResult) {
    var homeTeam = this.teams[homeTeam].home,
        awayTeam = this.teams[awayTeam].away;

    homeTeam.gf += +homeResult;
    homeTeam.ga += +awayResult;
    awayTeam.gf += +awayResult;
    awayTeam.ga += +homeResult;
  }
  calculateGoals.apply(this, [homeTeam, homeResult, awayTeam, awayResult]);

}

/**
* Method build team object needed to generate table. In addition, it erases unnecessary results object.
*
* @method buildTeamsObject
*/
SporTable.prototype.buildTeamsObject = function() {
  var key;

  for(key in this.results) {
    var key2,
        round = this.results[key];

    for(key2 in round) {
      var game = round[key2],
          homeTeam = game.homeTeam,
          awayTeam = game.awayTeam,
          homeResult = game.homeResult,
          awayResult = game.awayResult;

      //If team object doesn't exist create it
      function checkTeamObject(teams) {
        var i,
            teamsLength = teams.length;

        for(i = 0; i < teamsLength; i += 1) {
          if(!this.teams[teams[i]]) {
            this.teams[teams[i]] = {};
            var teamObj = this.teams[teams[i]];

            teamObj.home = {
              wins: 0,
              draws: 0,
              lost: 0,
              gf: 0,
              ga: 0,
              gd: 0
            };

            teamObj.away = {
              wins: 0,
              draws: 0,
              lost: 0,
              gf: 0,
              ga: 0,
              gd: 0
            };

            teamObj.points = 0;
          }
        }
      }
      checkTeamObject.apply(this, [[homeTeam, awayTeam]])

      this.analyzeMatch([homeTeam, homeResult], [awayTeam, awayResult]);
    }

  }

  delete this.results;
}

/**
* Method calculate goal difference of the teams
*
* @method calculateGoalDifference
*/
SporTable.prototype.calculateGoalDifference = function() {
  var teamsObj = this.teams,
      key;

  for(key in teamsObj) {
    var team = key,
        home = teamsObj[team].home,
        away = teamsObj[team].away,
        gdHome =(home.gf - home.ga),
        gdAway =(away.gf - away.ga);

    home.gd = gdHome;
    away.gd = gdAway;
  }

}

/**
* Method calculate league points
*
* @method calculatePoints
*/
SporTable.prototype.calculatePoints = function() {
  var teamsObj = this.teams,
      key;

  for(key in teamsObj) {
    var team = key,
        home = teamsObj[team].home,
        away = teamsObj[team].away,
        rulesPoints = this.config.points,
        points = ((home.wins+away.wins)*rulesPoints.win) + ((home.draws+away.draws)*rulesPoints.draw) + ((home.lost+away.lost)*rulesPoints.lost);

        teamsObj[team].points = points;

  }

}

/*
* Method sorts teams in order
*
* @method buildTeamsObject
* @return {Array} Array containing order of the teams
*/
SporTable.prototype.sortTeamsObj = function() {
  var teamsObj = this.teams,
      key,
      teamsArr = [],
      teamsOrder = [],
      i;

  for(key in teamsObj) {
    var obj = {}
    obj.team = key;
    obj.points = teamsObj[key].points;

    teamsArr.push(obj);
  }

  teamsArr.sort(function(a, b) {
    return b.points - a.points;
  })

  var i,
      teamsArrLength = teamsArr.length;

  for(i = 0; i < teamsArrLength; i += 1) {
    teamsOrder.push(teamsArr[i].team);
  }

  return teamsOrder;

}

/**
* Method builds table view and adds it to DOM
*
* @method buildTableView
*/
SporTable.prototype.buildTableView = function() {
  var table = this.createElem("table", null, {border: 1, cellpadding: 3, style: "text-align: center;"}),
      thead = this.createElem("thead"),
      tbody = this.createElem("tbody"),
      teamsObj = this.teams,
      teamsOrder = this.sortTeamsObj(),
      teamsOrderLength = teamsOrder.length;

  function buildTableHeader() {
    var tr1 = this.createElem("tr"),
        tr2 = this.createElem("tr"),
        lang = this.config.lang,
        cellsList = [lang.Position, lang.Team, lang.WinsAcronym, lang.DrawsAcronym, lang.LostAcronym, lang.GoalsForcedAcronym, lang.GoalsAgainstAcronym, lang.GoalsDifferenceAcronym, lang.WinsAcronym, lang.DrawsAcronym, lang.LostAcronym, lang.GoalsForcedAcronym, lang.GoalsAgainstAcronym, lang.GoalsDifferenceAcronym, lang.PointsShort],
        cellsListLength = cellsList.length,
        i;

    var th1 = this.createElem("th", null, {colspan: 2}, "");
    var th2 = this.createElem("th", null, {colspan: 6}, lang.Home);
    var th3 = this.createElem("th", null, {colspan: 6}, lang.Away);
    tr1.appendChild(th1);
    tr1.appendChild(th2);
    tr1.appendChild(th3);

    for(i = 0; i < cellsListLength; i += 1) {
      var th = this.createElem("th", null, null, cellsList[i]);
      tr2.appendChild(th);
    }

    thead.appendChild(tr1);
    thead.appendChild(tr2);
  }
  buildTableHeader.call(this);

  function buildTableBody() {
    var i;

    for(i = 0; i < teamsOrderLength; i += 1) {
      var tr = this.createElem("tr"),
          home = teamsObj[teamsOrder[i]].home,
          away = teamsObj[teamsOrder[i]].away,
          points = teamsObj[teamsOrder[i]].points,
          cellsList = [
                        i+1,
                        teamsOrder[i],
                        home.wins,
                        home.draws,
                        home.lost,
                        home.gf,
                        home.ga,
                        home.gd,
                        away.wins,
                        away.draws,
                        away.lost,
                        away.gf,
                        away.ga,
                        away.gd,
                        points
                    ],
          cellsTBListLength = cellsList.length,
          j;

      for(j = 0; j < cellsTBListLength; j += 1) {
        var td = this.createElem("td", null, null, cellsList[j] || "0");
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }
  }
  buildTableBody.call(this)

  table.appendChild(thead);
  table.appendChild(tbody);
  this.config.DOMParent.appendChild(table);
};

/**
* Method for building a results object
*
* @method buildResultsObject
* @param {Number} roundId Round number
* @param {Number} gameId Match id
* @param {String} homeTeam Home team name
* @param {String} result Result of the match
* @param {String} awayTeam Away team name
*/
SporTable.prototype.buildResultsObject = function(roundId, gameId, homeTeam, result, awayTeam) {
  function processingResult(result) {
    var result = result.split("-");

    return {
      home: result[0],
      away: result[1],
    }
  }

  var result = processingResult(result),
      round;

  this.results[roundId] = this.results[roundId] || {};

  round = this.results[roundId];
  round[gameId] = {}
  round[gameId]["homeTeam"] = homeTeam;
  round[gameId]["homeResult"] = result.home;
  round[gameId]["awayResult"] = result.away;
  round[gameId]["awayTeam"] = awayTeam;
}

/**
* Method for building a fixtures view & initialization method responsible for results object creation.
*
* @method buildFixturesView
*/
SporTable.prototype.buildFixturesView = function() {
  var fixtures = this.config.fixtures.trim(),
      rounds = fixtures.match(/\*\d+\*.+?\/\*\d+\*/gmi),
      roundsLength = rounds.length,
      fixturesDiv = this.createElem("div", "sportable-fixtures"),
      i;

  //Round
  for(i = 0; i < roundsLength; i += 1) {
    var roundsNumber = rounds[i].split("*")[1],
        roundHeaderP = this.createElem("p", "sportable-fixtures-header", null, roundsNumber + ". kolejka"),
        roundMatches = rounds[i].match(/\@\d+.+?\/\@\d+/gmi),
        roundMatchesLength = roundMatches.length,
        gameList = this.createElem("ul", "sportable-fixtures-gamelist"),
        j;

      //Matches
      for(j = 0; j < roundMatchesLength; j += 1) {
        var date = roundMatches[j].match(/\#.+?\#/gmi)[0].split("#")[1],
            game = roundMatches[j].match(/\|\|.*?\|\|/gmi)[0].split("|"),
            homeTeam = game[2],
            result = game[3],
            awayTeam = game[4],
            gameListItem = this.createElem("li");

        gameListItem.textContent = date + " - " + homeTeam + " " + result + " " +  awayTeam;
        gameList.appendChild(gameListItem);

        //Use split values to build new results object
        this.buildResultsObject(i, j, homeTeam, result, awayTeam);
      }

    fixturesDiv.appendChild(roundHeaderP);
    fixturesDiv.appendChild(gameList);
  }

  //Add div to site
  this.config.DOMParent.appendChild(fixturesDiv);
}

}());
