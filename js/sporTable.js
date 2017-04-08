(function(){
"use strict";

/**
  @class sporTable
*/
function SporTable(config) {
  config = {
    id: config.id? config.id : "sportTable",
    sortable: config.sortable? config.sortable : false,
    points: config.points? config.points : {win: 3, draw: 1, lost: 0},
    teams: this.checkTeamsObj(config.teams)
  };
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
* Method validates the passed team object
*
* @method checkTeamsObj
* @param {Object} teamsObj Teams object passed in config.teams
* @return {Object/Boolean} Method return this same object or false in case of failure
*/
SporTable.prototype.checkTeamsObj = function(teamsObj) {
  var obj = teamsObj,
      objLength = Object.keys(teamsObj).length,
      checkList = [],
      i,
      currentObj;

  for(i = 0; i < objLength; i += 1) {
    currentObj = obj[i];

    if(typeof currentObj === "object" && currentObj !== null && currentObj.name) {
      checkList.push(currentObj);
    } else {
      console.error("Invalid type of teams object");
      return false;
    }
  }

  if(checkList.length === objLength) {
    return obj;
  }
};

}());
