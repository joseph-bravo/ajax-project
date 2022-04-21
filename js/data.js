/* exported data */
/* exported cardData */
/* exported userCardSort */
/* exported getArchetype */
/* global initializeSite */
/* global domUtils */

//! Initialize ALL Data
pullAllCardData();

//! Reset Data
var resetting = false;

// eslint-disable-next-line no-unused-vars
function resetData() {
  resetting = true;
  localStorage.removeItem('userDataYGOLOS');
  window.location.reload();
}

//! Initialize Raw Card Data from API
var rawData = [];
var rawArchetypeData = [];

function pullAllCardData() {
  var cardXHR = new XMLHttpRequest();
  cardXHR.open('GET', 'https://db.ygoprodeck.com/api/v7/cardinfo.php' +
  '?' + 'format=TCG' + '&' +
  'attribute=dark,earth,fire,light,water,wind,divine'
  );
  cardXHR.responseType = 'json';
  cardXHR.send();
  cardXHR.addEventListener('load', function () {
    rawData = cardXHR.response.data;
    loadUserDataFromStorage();
    filterData();
    pullAllArchetypeData();
  });
}

function pullAllArchetypeData() {
  var archetypeXHR = new XMLHttpRequest();
  archetypeXHR.open('GET', 'https://db.ygoprodeck.com/api/v7/archetypes.php');
  archetypeXHR.responseType = 'json';
  archetypeXHR.send();
  archetypeXHR.addEventListener('load', function () {
    rawArchetypeData = archetypeXHR.response;
    createAllArchetypes();
    initializeSite();
  });
}

//! Initialize User Data
var userData = {
  ratings: []
};

function Card(cardobj, rating, timeRated) {
  for (var prop in cardobj) {
    this[prop] = cardobj[prop];
  }
  this.rating = rating;
  this.timeRated = timeRated;
  this.dom = domUtils.createCardEntryDOM(this);
}

/* exported Rating */
function Rating(id, rating) {
  this.id = id;
  this.rating = rating;
  this.timeRated = Date.now();
}

function saveUserDataToStorage() {
  if (resetting) {
    return;
  }
  var dataToSave = JSON.stringify(userData);
  localStorage.setItem('userDataYGOLOS', dataToSave);
}

var remainingCards = [];
var userCards = [];

function loadUserDataFromStorage() {
  if (resetting) {
    return;
  }
  var dataToLoad = localStorage.getItem('userDataYGOLOS');
  var parsedDataToLoad = JSON.parse(dataToLoad);
  if (parsedDataToLoad) {
    for (var s in parsedDataToLoad) {
      userData[s] = parsedDataToLoad[s];
    }
  }
}

//! Sort User Cards
var userCardSort = {
  filter(string) {
    var output = [];
    switch (string) {
      case ('👍'):
        output = userCards.filter(function (element) {
          return element.rating === '👍';
        });
        break;
      case ('👎'):
        output = userCards.filter(function (element) {
          return element.rating === '👎';
        });
        break;
      default:
        output = userCards;
        break;
    }
    return output;
  },
  recent: function (target) {
    if (!target) {
      target = userCards;
    }
    var output = target.slice();
    output.sort(function (a, b) {
      return a.timeRated - b.timeRated;
    });
    return output;
  }
};

//! Filter Working Data

function filterData() {
  rawData.forEach(function (element, index) {
    var notIncluded = false;
    for (var rating = 0; rating < userData.ratings.length; rating++) {
      var currentRating = userData.ratings[rating];
      if (element.id === currentRating.id) {
        var newUserCard = new Card(element, currentRating.rating, currentRating.timeRated);
        userCards.unshift(newUserCard);
        notIncluded = false;
        break;
      } else {
        notIncluded = true;
      }
    }
    if (notIncluded || userData.ratings.length === 0) {
      remainingCards.unshift(element);
    }
  });
}

window.addEventListener('unload', saveUserDataToStorage);

//! Create Archetype DOMs

var allArchetypes = [];

function Archetype(name, id) {
  this.name = name;
  this.expanded = false;
  this.archetypeUserCards = getCardsThatMatchArchetype(name);
  this.dom = domUtils.createArchetypeDOM(this);
  this.domCardList = this.dom.querySelector('.card-list');
  this.dom.dataset.empty = this.archetypeUserCards.length > 0;
}

Archetype.prototype.isEmpty = function () {
  if (this.archetypeUserCards.length > 0) {
    return false;
  } else {
    return true;
  }
};

function ArchetypeNone() {
  this.name = 'No Archetype';
  this.expanded = false;
  this.archetypeUserCards = getCardsThatMatchArchetype(undefined);
  this.dom = domUtils.createArchetypeDOM(this);
  this.domCardList = this.dom.querySelector('.card-list');
  this.dom.dataset.empty = this.archetypeUserCards.length > 0;
}

ArchetypeNone.prototype.isEmpty = function () {
  if (this.archetypeUserCards.length > 0) {
    return false;
  } else {
    return true;
  }
};

function getArchetype(name) {
  return allArchetypes.find(function (element) {
    return element.name === name;
  });
}

function getCardsThatMatchArchetype(archetypeName) {
  return userCards.filter(function (element) { return element.archetype === archetypeName; });
}

function createAllArchetypes() {
  rawArchetypeData.forEach(function (element, index) {
    allArchetypes.push(new Archetype(element.archetype_name, index));
  });
  allArchetypes.push(new ArchetypeNone());
}
