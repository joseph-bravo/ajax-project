/* exported domUtils */

var domUtils = {
  createElement: function (tagName, attributesObject, txtContent) {
    var $output = document.createElement(tagName);
    for (var i in attributesObject) {
      $output.setAttribute(i, attributesObject[i]);
    }
    if (txtContent) {
      $output.textContent = txtContent;
    }
    return $output;
  },
  createArchetypeDOM: function (archetype) {
    /*
        <li data-archetype-id="0" class="archetype">
        <button class="archetype-header">
          Archetype Name
          <i class="archetype-header-control fas fa-minus-square"></i>
        </button>
        <ul class="card-list">
          <li class="card card-liked" data-card-id="" >
            <a href="">
              <img class="race" src="images/iconsMD/cyberse.png" alt="">
              <div class="card-text">
                <h3>Card Name</h3>
                <h4>Card Data</h4>
              </div>
            </a>
          </li>
        </ul>
      </li>
    */
    var $outerList = this.createElement('li', {
      'data-archetype-id': archetype.id,
      class: 'archetype',
      'data-expanded': 'false',
      'data-empty': true
    });
    var $header = this.createElement(
      'button',
      {
        class: 'archetype-header'
      },
      archetype.name
    );
    var $archetypeHeaderControl = this.createElement('i', {
      class: 'archetype-header-control fas fa-plus-square'
    });
    var $cardList = this.createElement('ul', {
      class: 'card-list'
    });

    $outerList.append($header, $cardList);
    $header.append($archetypeHeaderControl);
    return $outerList;
  },
  createCardEntryDOM: function (ratedCardObj) {
    /*
    <li class="card card-liked" data-card-id="">
      <a href="" >
        <img class="race" src="images/iconsMD/cyberse.png" alt="">
        <div class="card-text">
          <h3>Card Name</h3>
          <h4>Card Data</h4>
        </div>
      </a>
    </li>
  */
    var cardColor;

    if (ratedCardObj.rating === '👍') {
      cardColor = 'card-liked';
    } else {
      cardColor = 'card-disliked';
    }

    var $li = this.createElement('li', {
      class: 'card ' + cardColor,
      'data-card-id': ratedCardObj.id
    });

    var $a = this.createElement('a', {
      href: 'https://db.ygoprodeck.com/card/?search=' + ratedCardObj.id,
      target: '_blank'
    });

    var $img = this.createElement('img', {
      class: 'race',
      src: this.getIconFromCardObj(ratedCardObj),
      alt: ratedCardObj.race + ' icon'
    });

    var $cardText = this.createElement('div', {
      class: 'card-text'
    });

    var $h3 = this.createElement('h3', {}, ratedCardObj.name);

    var archetype = '';
    if (ratedCardObj.archetype) {
      archetype = '(' + ratedCardObj.archetype + ') ';
    }

    var h4TextContent =
      archetype + '[' + ratedCardObj.race + ' / ' + ratedCardObj.type + ']';

    var $h4 = this.createElement('h4', {}, h4TextContent);

    $cardText.append($h3, $h4);
    $a.append($img, $cardText);
    $li.append($a);

    ratedCardObj.dom = $li;
    return $li;
  },
  getIconFromCardObj: function (cardObj) {
    var kebabed = _.kebabCase(cardObj.race);
    return 'images/iconsMD/' + kebabed + '.png';
  }
};
