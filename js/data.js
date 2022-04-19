/* exported data */
/* exported cardData */
/* global initializeSite */

var cardData = {};

function pullAllCardData() {
  var cardXHR = new XMLHttpRequest();
  cardXHR.open('GET', 'https://db.ygoprodeck.com/api/v7/cardinfo.php' +
  '?' + 'format=TCG' + '&' +
  'attribute=dark,earth,fire,light,water,wind,divine'
  );
  cardXHR.responseType = 'json';
  cardXHR.send();
  cardXHR.addEventListener('load', function () {
    cardData = cardXHR.response.data;
    initializeSite();
  });
}

pullAllCardData();

var userData = {
  rated: [],
  load: function () {
    var dataLocal = localStorage.getItem('userDataYGOLOS');
    if (dataLocal) {
      for (var prop in dataLocal) {
        userData[prop] = dataLocal[prop];
      }
      userData = JSON.parse(dataLocal);
    }
  },
  save: function () {
    var storingData = JSON.stringify(userData);
    localStorage.setItem('userDataYGOLOS', storingData);
  }
};

userData.load();
// window.addEventListener('unload', userData.save);
