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
  }
};
