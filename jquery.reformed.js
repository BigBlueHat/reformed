/**
 * @copyright: BigBlueHat, 2010
 * @license: Apache Foundation License 2.0
 *
 * reformed is a JSON to HTML Form to JSON conversion utility. The objective is to
 * build a simple HTML editor for JSON documents. It's intended use is as a frontend
 * to JSON-based API's such as CouchDB, Facebook, or OpenLibrary.
 *
 **/

/**
 * @param string json String version of JSON object to reform
 * @param string here Selector of HTML element to place form inside
 */
(function($) {
$.fn.reform = function(json, is_schema) {
	this.empty();
	reform = $.parseJSON(json);
	this.append(object_t(reform));
	// TODO: make sortablility configurable
	this.sortable({handle:'span.handle', 'items':'.kvp', placeholder: 'ui-state-highlight'});
	this.find('.kvp a.remove').live('click', function() {
		jQuery(this).parent().remove_kvp();
	});
	this.find('.kvp a.another').live('click', function() {
		jQuery(this).parent().another_kvp();
	});
};

/**
 * Deserialize re:form.ed HTML From to JSON string
 *
 * @param string from Selector of HTML element that contains the re:form.ed form
 */
$.rejson = function(from) {
	var _json = {};
	$(from + ' > fieldset.object > .kvp').each(function () {
	    _kvp = kvp($(this));
	    for (attrname in _kvp) {
	    	if (_json[attrname]) {
	    		alert('key conflict');
	    		$(this).css('background-color', 'red');
	    		return false;
	    	}
	    	_json[attrname] = _kvp[attrname];
	    }
	});
	
	return $.toJSON(_json);
};

$.fn.another_kvp = function () {
	this.parent().after(kvp_t('', ''));
};

$.fn.remove_kvp = function () {
	this.parent().remove();	
};

/******* JSON Creation from HTML Form serialization functions *******/
/**
 * Key Value Pair - one input + another input || a fieldset (an object or array)
 **/
function kvp(el) {
	var _kvp = {};
	// TODO: add classes to inputs/fieldsets to make selecting more reliable?
	var k = el.find('div.front > input, fieldset').val();
	var v = $(el.find('div.front > input, fieldset')[1]);
	if (v.is('input')) {
		if (v.is(':checkbox')) {
			_kvp[k] = v.is(':checked');
		} else {
			_kvp[k] = (isNaN(v.val()) ? v.val() : parseInt(v.val()));
		}
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
	var output = '<div class="kvp"><div class="front"><span class="handle">drag</span> <input type="text" value="'+key+'" class="key" />';
	if (typeof value == 'string' || typeof value == 'number') {
		output += '<input class="value" type="text" value="'+value+'" />';
	} else if ($.isPlainObject(value)) {
		output += object_t(value);
	} else if ($.isArray(value)) {
		output += array_t(value);
	} else if (typeof value == 'boolean') {
		output += '<input class="value" type="checkbox"';
		if (value) output+= 'checked="checked"';
		output += ' />';
	}
	output += '</div><div class="actions"><a class="configure">@</a><a class="another"">+</a><a class="remove">-</a></div>';
	output += '</div>';
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
		} else if ($.isPlainObject(value)) {
			output += object_t(value);
		} else if ($.isArray(value)) {
			output += array_t(value);
		}
	});
	output += '</fieldset>';
	return output;
}

})(jQuery);