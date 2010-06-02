/**
 * @copyright: BigBlueHat, 2010
 * @license: Apache Foundation License 2.0
 *
 * reformed is a JSON to HTML Form to JSON conversion utility. The objective is to
 * build a simple HTML editor for JSON documents. It's intended use is as a frontend
 * to JSON-based API's such as CouchDB, Facebook, or OpenLibrary.
 *
 **/

/******* JSON Creation from HTML Form serialization functions *******/
/**
 * Key Value Pair - one input + another input || a fieldset (an object or array)
 **/
function kvp(el) {
	var _kvp = {};
	var k = el.children().val();
	var v = $(el.children()[1]);
	if (v[0].tagName == 'INPUT') {
	    _kvp[k] = (isNaN(v.val()) ? v.val() : parseInt(v.val()));
	} else if (v.hasClass('array')) {
		var _ary = [];
		if (v.children('fieldset.object').length > 0) {
			v.children('fieldset.object').each(function() {
				_ary.push(obj($(this)));
			});
		} else {
			v.children('input').each(function() {
				_ary.push($(this).val());
			});
		}
	    _kvp[k] = _ary;
	} else if (v.hasClass('object')) {
		_kvp[k] = obj(v);
	}
	return _kvp;
}

/**
 * Objects always have one or more .kvp's
 **/
function obj(el) {
	var _obj = {};
	el.children('.kvp').each(function() {
	    var _temp_kvp = kvp($(this));
	    for (attrname in _temp_kvp) {
	    	_obj[attrname] = _temp_kvp[attrname];
	    }
	});
	return _obj;
}


/******** Form Creation System ********/

/** templates **/
function kvp_t(key, value) {
	var output = '<div class="kvp"><input type="text" value="'+key+'" />';
	if (typeof value == 'string' || typeof value == 'number') {
		output += '<input type="text" value="'+value+'" />';
	} else if (jQuery.isPlainObject(value)) {
		output += object_t(value);
	} else if (jQuery.isArray(value)) {
		output += array_t(value);
	}
	output += '</div>'
	return output;
}

function object_t(object) {
	var output = '<fieldset class="object">';
	for (attrname in object) {
		output += kvp_t(attrname, object[attrname]);
	}
	output += '</fieldset>';
	return output;
}

function array_t(array) {
	var output = '<fieldset class="array">';
	$.each(array, function (index, value) {
		if (typeof value == 'string' || typeof value == 'number') {
			output += '<input type="text" value="'+value+'" />';
		} else if (jQuery.isPlainObject(value)) {
			output += object_t(value);
		} else if (jQuery.isArray(value)) {
			output += array_t(value);
		}
	});
	output += '</fieldset>';
	return output;
}