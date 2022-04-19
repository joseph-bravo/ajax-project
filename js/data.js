/* exported data */
/* exported cardData */
/* global initializeSite */

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

//! Initialize User Data
var userData = {
  ratings: []
};

/* exported Rating */
function Rating(id, rating) {
  this.id = id;
  this.rating = rating;
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

//! Filter Working Data

function filterData() {

  rawData.forEach(function (element, index) {
    var notIncluded = false;
    for (var rating = 0; rating < userData.ratings.length; rating++) {
      var currentRating = userData.ratings[rating];
      if (element.id === currentRating.id) {
        element.rating = currentRating.rating;
        userCards.push(element);
        notIncluded = false;
        break;
      } else {
        notIncluded = true;
      }
    }
    if (notIncluded || userData.ratings.length === 0) {
      remainingCards.push(element);
    }
  });
}

window.addEventListener('unload', saveUserDataToStorage);
