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
function displayCard(card) {

  setLoading(true);

  //* Cancel Animations
  $imageContainer.classList.remove('animate__zoomIn');
  $imageContainer.classList.add('animate__bounceOutRight');

  var croppedImageUrl =
  'https://storage.googleapis.com/ygoprodeck.com/pics_artgame/' +
  card.id + '.jpg';

  $mainCardImage.src = croppedImageUrl;

  $mainCardImage.addEventListener('load', function () {

    setLoading(false);

    //* Cancel Animations
    $imageContainer.classList.remove('animate__bounceOutRight', 'hide');
    $imageContainer.classList.add('animate__zoomIn');

    $mainCardTitle.textContent = card.name;
    $remainingCards.textContent = remainingCards.length;
  });
}

// * Animation Handler
function imageContainerAnimationHandler(event) {
  if (event.target.classList.contains('animate__bounceOutRight')) {
    event.target.classList.add('hide');
    event.target.classList.remove('animate__bounceOutRight');
  } else {
    event.target.classList.remove('animate__zoomIn');
  }
}
$imageContainer.addEventListener('animationend', imageContainerAnimationHandler);

//* New Card button.
function drawNewCard() {
  if (!currentlyLoading) {
    currentCard = _.sample(remainingCards);
    displayCard(currentCard);
  }
}
$buttonNewCard.addEventListener('click', drawNewCard);
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
    drawNewCard();
  }
}
$ratingButtons.addEventListener('click', rateCard);

//! Site Initialization

/* exported initializeSite */
function initializeSite() {
  $main.classList.remove('hidden');
  drawNewCard();
}
