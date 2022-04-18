/* exported data */
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
    cardData = cardXHR.response;
    console.log(cardData);
  });
}

pullAllCardData();
