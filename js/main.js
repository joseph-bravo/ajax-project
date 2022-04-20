/* global userData */
/* global Rating */
/* global remainingCards */
/* global userCards */
/* global domUtils */
/* global _ */

// ! main
var currentCard = {};
var currentlyLoading = false;

var $main = document.querySelector('main');
var $mainCardTitle = document.querySelector('#card-title');
var $mainCardImage = document.querySelector('#card-image');
var $mainCardDisplay = document.querySelector('.card-display');
var $imageContainer = document.querySelector('.image-container');
var $remainingCards = document.querySelector('#remaining-cards');

var $newCardButton = document.querySelector('.new-card-button');
var $likeButton = document.querySelector('.like-button');
var $dislikeButton = document.querySelector('.dislike-button');

var $resultsList = document.querySelector('ul.results-list');

var $views = document.querySelectorAll('[data-view]');
var $navLinks = document.querySelectorAll('[data-nav]');

var currentView = '';

//* View Swapping
function swapView(switchToView) {
  if (currentView === switchToView) {
    return;
  }

  // if (switchToView === 'results') {
  //   redrawResultsView();
  // }

  for (var i = 0; i < $views.length; i++) {
    if ($views[i].dataset.view === switchToView) {
      $views[i].classList.remove('hidden');
    } else {
      $views[i].classList.add('hidden');
    }
  }

  currentView = switchToView;
}

for (var i = 0; i < $navLinks.length; i++) {
  $navLinks[i].addEventListener('click', function (event) {
    swapView(event.target.dataset.nav);
  });
}

//* Change loading state
function setLoading(bool) {
  if (bool) {
    currentlyLoading = true;

    $newCardButton.disabled = true;
    $likeButton.disabled = true;
    $dislikeButton.disabled = true;

    $main.classList.add('loading');
  } else {
    currentlyLoading = false;

    $newCardButton.disabled = false;
    $likeButton.disabled = false;
    $dislikeButton.disabled = false;

    $main.classList.remove('loading');
  }
}

//* Change displayed card
function displayCard(card, animation) {
  setLoading(true);
  setAnimation($imageContainer, animation);

  if (remainingCards.length < 1) {
    $main.classList.remove('loading');
    $mainCardTitle.textContent = 'No More Cards!!!';
    $remainingCards.textContent = remainingCards.length;
    return;
  }

  var croppedImageUrl =
  'https://storage.googleapis.com/ygoprodeck.com/pics_artgame/' +
  card.id + '.jpg';

  $mainCardImage.src = croppedImageUrl;

  $mainCardImage.addEventListener('load', function () {
    setLoading(false);

    setAnimation($imageContainer, 'view');

    $mainCardTitle.textContent = card.name;
    $remainingCards.textContent = remainingCards.length;
  });
}

//* Animation Handlers
var motions = {
  discardCard: 'animate__zoomOut',
  likeCard: 'animate__backOutRight',
  dislikeCard: 'animate__backOutLeft',
  displayCard: 'animate__zoomIn'
};

function clearAnimations(target) {
  target.classList.remove('hide');
  for (var m in motions) {
    target.classList.remove(motions[m]);
  }
}

function setAnimation(target, animation) {
  clearAnimations(target);
  var animationToSet;
  switch (animation) {
    case '👍':
      $mainCardDisplay.classList.add('liked');
      animationToSet = motions.likeCard;
      break;
    case '👎':
      $mainCardDisplay.classList.add('disliked');
      animationToSet = motions.dislikeCard;
      break;
    case 'discard':
      animationToSet = motions.discardCard;
      break;
    case 'view':
      $mainCardDisplay.classList.remove('liked', 'disliked');
      animationToSet = motions.displayCard;
      break;

  }
  target.classList.add(animationToSet);
}

function animationEndHandler(event) {
  if (!event.target.classList.contains('animate__zoomIn')) {
    event.target.classList.add('hide');
  }
  for (var m in motions) {
    event.target.classList.remove(motions[m]);
  }
}
$imageContainer.addEventListener('animationend', animationEndHandler);

//* New Card button.
function drawNewCard(action) {
  if (currentlyLoading) {
    return;
  }
  currentCard = _.sample(remainingCards);
  displayCard(currentCard, action);
}

$newCardButton.addEventListener('click', function () {
  drawNewCard('discard');
});

//* Like/Dislike buttons
var $ratingButtons = document.querySelector('.rating-buttons');
function rateCard(event) {
  if (currentlyLoading) {
    return;
  }
  if (event.target.matches('button, button *')) {
    var action = event.target.closest('button');
    var rating;
    if (action.matches('.like-button')) {
      rating = new Rating(currentCard.id, '👍');
      currentCard.rating = '👍';
    } else if (action.matches('.dislike-button')) {
      rating = new Rating(currentCard.id, '👎');
      currentCard.rating = '👎';
    }
    userData.ratings.unshift(rating);
    userCards.unshift(currentCard);
    prependToResultsView(currentCard);

    var indexOfRatedCard = remainingCards.indexOf(currentCard);
    remainingCards.splice(indexOfRatedCard, 1);

    drawNewCard(currentCard.rating);
  }
}
$ratingButtons.addEventListener('click', rateCard);

//* Bind keyboard to buttons
window.addEventListener('keydown', function (event) {
  switch (event.key) {
    case ' ':
      if (currentView !== 'rating') {
        break;
      }
      $newCardButton.click();
      break;
    case 'ArrowLeft':
      if (currentView !== 'rating') {
        break;
      }
      $dislikeButton.click();
      break;
    case 'ArrowRight':
      if (currentView !== 'rating') {
        break;
      }
      $likeButton.click();
      break;
    case 'r':
      swapView('results');
      break;
    case 'Escape':
      swapView('rating');
      break;
  }
});

//* Results card <li> DOM Creation
function getIconFromCardObj(cardObj) {
  var kebabed = _.kebabCase(cardObj.race);
  return 'images/iconsMD/' + kebabed + '.png';
}

function createCardEntry(ratedCardObj) {
  /*
    * <li class="card card-liked" data-card-id="0841308">
    *   <img class="race" src="images/iconsMD/cyberse.png" alt="race icon">
    *   <div class="card-text">
    *     <h3>Card Name</h3>
    *     <h4>Card Data</h4>
    *   </div>
    * </li>
  */

  var cardColor;

  if (ratedCardObj.rating === '👍') {
    cardColor = 'card-liked';
  } else {
    cardColor = 'card-disliked';
  }

  var $li = domUtils.createElement('li', {
    class: 'card ' + cardColor,
    'data-card-id': ratedCardObj.id
  });

  var $img = domUtils.createElement('img', {
    class: 'race',
    src: getIconFromCardObj(ratedCardObj),
    alt: ratedCardObj.race + ' icon'
  });

  var $cardText = domUtils.createElement('div', {
    class: 'card-text'
  });

  var $h3 = domUtils.createElement('h3', {}, ratedCardObj.name);

  var h4TextContent = '[' + ratedCardObj.race + ' / ' + ratedCardObj.type + '] (' + ratedCardObj.archetype + ')';

  var $h4 = domUtils.createElement('h4', {}, h4TextContent);

  $cardText.append($h3, $h4);
  $li.append($img, $cardText);

  ratedCardObj.domElement = $li;
  return $li;
}

function prependToResultsView(card) {
  $resultsList.prepend(createCardEntry(card));
}

function redrawResultsView() {
  while ($resultsList.children.length > 0) {
    $resultsList.children[0].remove();
  }
  userCards.forEach(function (element) {
    prependToResultsView(element);
  });
}

//! Site Initialization

swapView(currentView);

// * initializeSite() runs after data loads in.

/* exported initializeSite */
function initializeSite() {
  $main.classList.remove('hidden');
  redrawResultsView();
  swapView('rating');
  drawNewCard();
}
