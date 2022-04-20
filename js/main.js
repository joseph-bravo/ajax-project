/* global userData */
/* global Rating */
/* global remainingCards */
/* global userCards */
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

var $views = document.querySelectorAll('[data-view]');
var $navLinks = document.querySelectorAll('[data-nav]');

var currentView = 'results';

//* View Swapping
function swapView(switchToView) {
  for (var i = 0; i < $views.length; i++) {
    if ($views[i].dataset.view === switchToView) {
      $views[i].classList.remove('hidden');
    } else {
      $views[i].classList.add('hidden');
    }
  }
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

// * Animation Handlers
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
window.addEventListener('keydown', function (event) {
  if (event.key === ' ') {
    $newCardButton.click();
  }
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
    userData.ratings.push(rating);
    userCards.push(currentCard);
    var indexOfRatedCard = remainingCards.indexOf(currentCard);
    remainingCards.splice(indexOfRatedCard, 1);
    drawNewCard(currentCard.rating);
  }
}
$ratingButtons.addEventListener('click', rateCard);

//* Results card <li> DOM Creation
function createCardEntry(ratedObj) {
  /*
    ? DOM Format:
    <li class="card card-liked" data-card-id="0841308">
      <img class="race" src="images/iconsMD/cyberse.png" alt="">
      <div class="catext">
        <h3>Card Name</h3>
        <h4>Card Data<rd-/h4>
      </div>
    </li>
  */
}
//! Site Initialization

swapView(currentView);

/* exported initializeSite */
function initializeSite() {
  $main.classList.remove('hidden');
  drawNewCard();
}
