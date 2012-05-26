/**
 * re:form.ed rewritten on clarinet.js
 */
var reformed = (function() {
  var parser = exports.parser();
  var output = '';
  
  parser.onerror = function (e) {
    // an error happened. e is the error.
    console.log('error', e);
  };
  parser.onvalue = function (value) {
    // got some value.  v is the value. cant be string, int, bool, and null.
    console.log('value', value);
    output.textContent += '<input class="value" type="text" value="' + value + '" />'
    if (parser.state != 5) {
      output.textContent += '</div>';
    }
  };
  parser.onopenobject = function (key) {
    // opened an object. key is the first key.
    console.log('opened object; first key', key);
    output.textContent += '<fieldset class="object">';
    parser.onkey(key);
  };
  parser.onkey = function (key) {
    // got a key in an object.
    console.log('key', key);
    output.textContent += '<div class="kvp">';
    output.textContent += '<label class="key">' + key + '</label>';
  };
  parser.oncloseobject = function () {
    // closed an object.
    console.log('closed the object');
    output.textContent += '</fieldset>';
  };
  parser.onopenarray = function () {
    // opened an array.
    console.log('opened array');
    output.textContent += '<fieldset class="array">'
  };
  parser.onclosearray = function () {
    // closed an array.
    console.log('closed array');
    output.textContent += '</fieldset>'
  };
  parser.onend = function () {
    // parser stream is done, and ready to have more stuff written to it.
    console.log('all done');
    output.innerHTML = output.textContent;
  };
  
  return function (json) {
    output = document.getElementById('reformed');
    output.textContent = '';
    parser.write(json).close();
  }
})();