/* global userData */
/* global Rating */
/* global remainingCards */
/* global userCards */
/* global _ */

// ! utility

// ! main
var currentCard = {};
var currentlyLoading = false;

var $main = document.querySelector('main');
var $mainCardTitle = document.querySelector('#card-title');
var $mainCardImage = document.querySelector('#card-image');
var $mainCardDisplay = document.querySelector('.card-display');
var $imageContainer = document.querySelector('.image-container');
var $buttonNewCard = document.querySelector('.new-card-button');
var $likeButton = document.querySelector('.like-button');
var $dislikeButton = document.querySelector('.dislike-button');
var $remainingCards = document.querySelector('#remaining-cards');

//* Change loading state
function setLoading(bool) {
  if (bool) {
    currentlyLoading = true;

    $buttonNewCard.disabled = true;
    $likeButton.disabled = true;
    $dislikeButton.disabled = true;

    $main.classList.add('loading');
  } else {
    currentlyLoading = false;

    $buttonNewCard.disabled = false;
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

    setAnimation($imageContainer, '👀');

    $mainCardTitle.textContent = card.name;
    $remainingCards.textContent = remainingCards.length;
  });
}

// * Animation Handler
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
    case '📂':
      animationToSet = motions.discardCard;
      break;
    case '👀':
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

$buttonNewCard.addEventListener('click', function () {
  drawNewCard('📂');
});
window.addEventListener('keydown', function (event) {
  if (event.key === ' ') {
    $buttonNewCard.click();
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

//! Site Initialization

/* exported initializeSite */
function initializeSite() {
  $main.classList.remove('hidden');
  drawNewCard();
}
