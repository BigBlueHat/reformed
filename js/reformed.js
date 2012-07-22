/**
 * re:form.ed rewritten on clarinet.js
 */
var reformed = (function() {
  var parser = exports.parser();
  var current_obj = [];
  var recent_obj = null;

  var events = {
      "value": function (value) {
        // got some value.  v is the value. cant be string, int, bool, and null.
        console.log('value', value);
        input = document.createElement('input');
        input.setAttribute('class', 'value');
        input.setAttribute('type', 'text');
        input.setAttribute('value', value);
        // append
        recent_obj.appendChild(input);
      },
      /*"string": function() {},*/
      "key": function (key) {
        // got a key in an object.
        console.log('key', key);
        div = document.createElement('div');
        div.setAttribute('class', 'kvp');
        label = document.createElement('label');
        label.setAttribute('class', 'key');
        text = document.createTextNode(key);
        label.appendChild(text);
        div.appendChild(label);
        // append
        recent_obj = current_obj[current_obj.length-1].appendChild(div);
      },
      "openobject": function (key) {
        // opened an object. key is the first key.
        console.log('opened object; first key', key, current_obj);
        fieldset = document.createElement('fieldset');
        fieldset.setAttribute('class', 'object');
        current_obj.push(fieldset);
        parser.onkey(key);
      },
      "closeobject": function () {
        // closed an object.
        console.log('closed the object');
        current_obj[current_obj.length-2].appendChild(current_obj[current_obj.length-1]);
        current_obj.pop();
      },
      "openarray": function () {
        // opened an array.
        console.log('opened array');
        fieldset = document.createElement('fieldset');
        fieldset.setAttribute('class', 'array');
        recent_obj = current_obj[current_obj.length-1].appendChild(fieldset);
        current_obj.push(recent_obj);
      },
      "closearray": function () {
        // closed an array.
        console.log('closed array');
        current_obj[current_obj.length-2].appendChild(current_obj[current_obj.length-1]);
        current_obj.pop();
      },
      "error": function (e) {
        // an error happened. e is the error.
        console.log('error', e);
      },
      "end": function () {
        // parser stream is done, and ready to have more stuff written to it.
        console.log('all done');
      }/*,
      "ready": function() {}
      */
  };

  for (ev in events) {
    parser['on' + ev] = events[ev];
    // TODO: determine if parser is CParser or CStream-based
  };

  return function (json) {
    current_obj.push(document.getElementById('reformed'));
    current_obj.innerHTML = '';
    parser.write(json).close();
  }
})();
