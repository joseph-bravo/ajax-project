/* global userData */
/* global Rating */
/* global remainingCards */
/* global userCards */
/* global userCardSort */
/* global allArchetypes */
/* global Card */
/* global getArchetype */
/* global domUtils */
/* global _ */

// ! main
var currentCard = {};
var currentlyLoading = true;

var $main = document.querySelector('main');
var $mainCardTitle = document.querySelector('#card-title');
var $mainCardImage = document.querySelector('#card-image');
var $mainCardLink = document.querySelector('#card-link');
var $mainCardDisplay = document.querySelector('.card-display');
var $imageContainer = document.querySelector('.image-container');
var $remainingCards = document.querySelector('#remaining-cards');

var $newCardButton = document.querySelector('.new-card-button');
var $likeButton = document.querySelector('.like-button');
var $dislikeButton = document.querySelector('.dislike-button');

var $resultsList = document.querySelector('ul.results-list');
var $allCardsList = document.querySelector('li.all-cards .card-list');
var $allCardsContainer = document.querySelector('li.all-cards');

var $views = document.querySelectorAll('[data-view]');
var $navLinks = document.querySelectorAll('[data-nav]');

var currentView = '';

// ? View Swapping
function swapView(switchToView) {
  if (currentView === switchToView) {
    return;
  }

  if (switchToView === 'results') {
    redrawButtons();
    rearrangeResults();
  }

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

// ? Change loading state
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

// ? Change displayed card
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
    card.id +
    '.jpg';

  $mainCardImage.src = croppedImageUrl;

  $mainCardImage.addEventListener('error', function () {
    var fallback = card.card_images[0].image_url;
    if (!fallback) {
      $mainCardImage.src = 'images/placeholder.png';
      return;
    }
    $mainCardImage.src = card.card_images[0].image_url;
  });

  $mainCardImage.addEventListener('load', function () {
    setLoading(false);

    setAnimation($imageContainer, 'view');

    $mainCardTitle.textContent = card.name;
    $mainCardLink.href = 'https://db.ygoprodeck.com/card/?search=' + card.id;

    $remainingCards.textContent = remainingCards.length;
  });
}

// ? Animation Handlers
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

// ? New Card button.
function drawNewCard(action) {
  currentCard = _.sample(remainingCards);
  displayCard(currentCard, action);
}

$newCardButton.addEventListener('click', function () {
  if (currentlyLoading) {
    return;
  }
  drawNewCard('discard');
});

// ? Like/Dislike buttons
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
    var newCard = new Card(currentCard, rating.rating, Date.now);
    userData.ratings.unshift(rating);
    userCards.unshift(newCard);

    getArchetype(newCard.archetype).archetypeUserCards.push(newCard);

    var indexOfRatedCard = remainingCards.indexOf(currentCard);
    remainingCards.splice(indexOfRatedCard, 1);

    drawNewCard(currentCard.rating);
  }
}
$ratingButtons.addEventListener('click', rateCard);

// ? Bind keyboard to buttons

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

// ? Sorting Results View

var options = {
  viewRatings: 'all',
  viewArchetype: true,
  sortOrder: 'recent',
  set: function (option, value) {
    this[option] = value;
    rearrangeResults();
  }
};

function rearrangeResults() {
  domUtils.removeAllChildren($resultsList);
  domUtils.removeAllChildren($allCardsList);
  $resultsList.dataset.viewArchetype = options.viewArchetype;
  if (options.viewArchetype) {
    allArchetypes.forEach(function (element) {
      element.domCardList.textContent = '';
      element.dom.dataset.empty = element.isEmpty();
      if (element.isEmpty()) {
        return;
      }
      if (options.viewRatings === 'all') {
        element.archetypeUserCards.forEach(function (card) {
          element.domCardList.prepend(card.dom);
        });
      } else {
        var stillEmpty = true;
        element.archetypeUserCards.forEach(function (card) {
          if (card.rating === options.viewRatings) {
            element.domCardList.prepend(card.dom);
            stillEmpty = false;
          }
        });
      }
      if (stillEmpty) {
        return;
      }
      $resultsList.append(element.dom);
    });
  } else {
    if (options.viewRatings === 'all') {
      userCards.forEach(function (card) {
        $allCardsList.prepend(card.dom);
      });
    } else {
      userCards.forEach(function (card) {
        if (card.rating === options.viewRatings) {
          $allCardsList.prepend(card.dom);
        }
      });
    }
    $resultsList.append($allCardsContainer);
  }
  if (options.sortOrder === 'recent') {
    resultsOrder('reverse');
  } else {
    resultsOrder();
  }
}

function resultsOptionsHandler(event) {
  if (event.target.matches('button')) {
    switch (event.target.dataset.option) {
      //* View Ratings
      case '👎':
        options.set('viewRatings', '👎');
        break;
      case 'all':
        options.set('viewRatings', 'all');
        break;
      case '👍':
        options.set('viewRatings', '👍');
        break;

        //* View Archetype
      case 'false':
        options.set('viewArchetype', false);
        break;
      case 'true':
        options.set('viewArchetype', true);
        break;

      //* Sort Order
      case 'recent':
        options.set('sortOrder', 'recent');
        break;
      case 'oldest':
        options.set('sortOrder', 'oldest');
        break;
    }
    redrawButtons();
  }
}

var $resultsOptions = document.querySelector('.results-options');
$resultsOptions.addEventListener('click', resultsOptionsHandler);

var $viewButtons = document.querySelectorAll('.view-button');
var $archetypeButtons = document.querySelectorAll('.archetype-button');
var $orderButtons = document.querySelectorAll('.order-button');

function redrawButtons() {
  $viewButtons.forEach(function (element) {
    if (element.dataset.option === options.viewRatings) {
      element.classList.add('active');
    } else {
      element.classList.remove('active');
    }
  });
  $archetypeButtons.forEach(function (element) {
    if (element.dataset.option === JSON.stringify(options.viewArchetype)) {
      element.classList.add('active');
    } else {
      element.classList.remove('active');
    }
  });
  $orderButtons.forEach(function (element) {
    if (element.dataset.option === options.sortOrder) {
      element.classList.add('active');
    } else {
      element.classList.remove('active');
    }
  });
}

function resultsOrder(direction) {
  var sortOrder = userCardSort.recent();
  if (direction === 'reverse') {
    sortOrder.reverse();
  }
  sortOrder.forEach(function (element, index) {
    element.dom.style.order = index;
  });
}

// ? Header Button Handler

// !------------------

function headerButtonHandler(event) {
  if (event.target.matches('button.archetype-header, button.archetype-header i')) {
    var $archetypeToToggle = event.target.closest('[data-archetype-id]');
    var $icon = $archetypeToToggle.querySelector('i');
    console.log($icon.classList);
    console.log($archetypeToToggle);
    if ($archetypeToToggle.dataset.expanded === 'true') {
      $icon.classList.remove('fa-minus-square');
      $icon.classList.add('fa-plus-square');
      $archetypeToToggle.dataset.expanded = false;
    } else {
      $icon.classList.remove('fa-plus-square');
      $icon.classList.add('fa-minus-square');
      $archetypeToToggle.dataset.expanded = true;
    }
  }
}

$resultsList.addEventListener('click', headerButtonHandler);

// !------------------

// ? Site Initialization

swapView(currentView);

// ? initializeSite() runs after data loads in.
/* exported initializeSite */
function initializeSite() {
  $main.classList.remove('hidden');
  setLoading(true);
  rearrangeResults();
  resultsOrder('reverse');
  swapView('rating');
  drawNewCard();
}
