/* global cardData */
/* global userData */
/* global _ */

// ! utility

// ! main
var currentCard = {};
var currentlyLoading = false;

var $mainCardTitle = document.querySelector('#card-title');
var $mainCardImage = document.querySelector('#card-image');
var $titleBlock = document.querySelector('.label-block');
var $image = document.querySelector('#card-image');
var $imageContainer = document.querySelector('.image-container');

//* Change displayed card
function displayCard(card) {

  currentlyLoading = true;

  //* Cancel Animations
  $imageContainer.classList.remove('animate__zoomIn');
  $imageContainer.classList.add('animate__bounceOutRight');

  $buttonNewCard.disabled = true;
  $buttonNewCard.classList.add('loading');
  $titleBlock.classList.add('loading');
  $image.classList.add('loading');

  var croppedImageUrl =
  'https://storage.googleapis.com/ygoprodeck.com/pics_artgame/' +
  card.id + '.jpg';

  $mainCardImage.src = croppedImageUrl;

  $mainCardImage.addEventListener('load', function () {

    currentlyLoading = false;

    //* Cancel Animations
    $imageContainer.classList.remove('animate__bounceOutRight', 'hide');
    $imageContainer.classList.add('animate__zoomIn');

    $buttonNewCard.disabled = false;
    $buttonNewCard.classList.remove('loading');
    $titleBlock.classList.remove('loading');
    $image.classList.remove('loading');

    $mainCardTitle.textContent = card.name;
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
    currentCard = _.sample(cardData);
    displayCard(currentCard);
  }
}
var $buttonNewCard = document.querySelector('.new-card-button');
$buttonNewCard.addEventListener('click', drawNewCard);
window.addEventListener('keydown', function (event) {
  if (event.key === ' ') {
    $buttonNewCard.click();
  }
});

//* Like/Dislike buttons
var $ratingButtons = document.querySelector('.rating-buttons');
function rateCard(event) {
  if (event.target.matches('button, button *')) {
    var cardToPush = currentCard;
    var action = event.target.closest('button');
    console.log('action:', action);
    if (action.matches('.like-button')) {
      cardToPush.rating = 'like';
    } else if (action.matches('.dislike-button')) {
      cardToPush.rating = 'dislike';
    }
    userData.rated.push(cardToPush);
    console.log('pushed:', cardToPush);
    console.log('userData:', userData);
    drawNewCard();
  }
}
$ratingButtons.addEventListener('click', rateCard);

//! Site Initialization

/* exported initializeSite */
var $main = document.querySelector('main');
function initializeSite() {
  $main.classList.remove('hidden');
  drawNewCard();
}
