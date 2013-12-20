/**
 * re:form.ed rewritten on clarinet.js
 */
(function() {

  /*DOMinate essential 1.0.1 by Adrian Sieber (adriansieber.com)*/
  /** NOTE: added return value of appendChild() operation **/
  DOMinate=function e(t,n,i,r){function l(e){return document.createElement(e)}for(t[0].big&&(t[0]=l(t[0])),i=1;i<t.length;i++)if(r=t[i],r.big)t[0].innerHTML=r;else if(r.pop)return e(r),t[0].appendChild(r[0]);else for(n in r)t[0].setAttribute(n,r[n])};

  var parser = exports.parser();
  var recent_obj = null;

  var events = {
      "value": function (value) {
        // got some value.  v is the value. cant be string, int, bool, and null.
        DOMinate([recent_obj,
          ["input", {"class": "value", "type": "text", "value": value}]]);
      },
      /*"string": function() {},*/
      "key": function (key) {
        // got a key in an object.
        // TODO: kill this when we kill .front
        while (recent_obj.className !== 'object') {
          recent_obj = recent_obj.parentNode;
        }
        recent_obj = DOMinate([recent_obj,
          ["div", {"class": "kvp"}]]);
        recent_obj = DOMinate([recent_obj,
          ["div", {"class": "front"},
            ["label", {"class": "key"}, key]
          ]]);
      },
      "openobject": function (key) {
        // opened an object. key is the first key.
        recent_obj = DOMinate([recent_obj,
          ["fieldset", {"class": "object"}]]);
        parser.onkey(key);
      },
      "closeobject": function () {
        // closed an object.
        recent_obj = recent_obj.parentNode.parentNode.parentNode;
      },
      "openarray": function () {
        // opened an array.
        recent_obj = DOMinate([recent_obj,
          ["fieldset", {"class": "array"}]]);
      },
      "closearray": function () {
        // closed an array.
      },
      "error": function (e) {
        // an error happened. e is the error.
      },
      "end": function () {
        // parser stream is done, and ready to have more stuff written to it.
      }/*,
      "ready": function() {}
      */
  };

  for (ev in events) {
    parser['on' + ev] = events[ev];
    // TODO: determine if parser is CParser or CStream-based
  };

  this.reformed = function (json, into) {
    recent_obj = document.getElementById(into);
    parser.write(json).close();
  }
})();
