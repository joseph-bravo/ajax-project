/* exported data */
/* exported cardData */
/* exported userCardSort */
/* global initializeSite */
/* global domUtils */

//! Initialize ALL Data
pullAllCardData();
// pullAllArchetypeData();

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
    initializeSite();
  });
}

var rawArchetypeData = [];

function pullAllArchetypeData() {
  var archetypeXHR = new XMLHttpRequest();
  archetypeXHR.open('GET', 'https://db.ygoprodeck.com/api/v7/archetypes.php');
  archetypeXHR.responseType = 'json';
  archetypeXHR.send();
  archetypeXHR.addEventListener('load', function () {
    console.log('archetypeXHR output:', archetypeXHR.response);
    rawArchetypeData = archetypeXHR.response;
    createAllArchetypes();
  });
}

//! Initialize User Data
var userData = {
  ratings: []
};

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
        element.rating = currentRating.rating;
        element.timeRated = currentRating.timeRated;
        userCards.unshift(element);
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
  this.id = id;
  this.dom = createArchetypeDOM(this);
}

function createAllArchetypes() {
  rawArchetypeData.forEach(function (element, index) {
    allArchetypes.push(new Archetype(element.archetype_name, index));
  });
  console.log(allArchetypes);
}
