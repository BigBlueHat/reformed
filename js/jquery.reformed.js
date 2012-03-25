/**
 * @copyright: BigBlueHat, 2010
 * @license: Apache Foundation License 2.0
 *
 *  Copyright 2011 BigBlueHat
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *
 * re:form.ed is a JSON to HTML Form to JSON conversion utility. The objective is to
 * build a simple HTML editor for JSON documents. It's intended use is as a frontend
 * to JSON-based API's such as CouchDB, Facebook, or OpenLibrary.
 *
 **/

/**
 * @param string json String version of JSON object to reform
 * @param string here Selector of HTML element to place form inside
 */
(function($) {
/******** Form Creation System ********/
	var reformed = {
		settings: {
			'editor':'schema' // schema, data, edit
		},
		init: function(json, options) {
			var $this = $(this);
			// TODO: refactor to make options truely optional
			if (options) {
				$.extend(reformed.settings, options);
			}
			reform = $.parseJSON(json);

			// create re:form
			$this.empty().append(reformed.object(reform));

			// TODO: make sortablility configurable
			if (reformed.settings.editor == 'edit') {
				$this.sortable({handle:'span.handle', 'items':'.kvp', placeholder: 'ui-state-highlight'});
				$this.find('> fieldset > .kvp').each(function(idx, el) {
					reformed.applyEditorEvents(el);
				});
			} else if (reformed.settings.editor == 'data') {
				$this.find('> fieldset > .kvp').each(function(idx, el) {
					reformed.applyArrayEditingEvents(el);
				});
			}
			return $this;
		},
		applyEditorEvents: function(el) {
			el = $(el);
			el.find('a.remove').click(function() {
				$(this).parent().remove_kvp();
			});
			el.find('.kvp > .actions > a.another').click(function() {
				$(this).parent().another_kvp();
			});
			el.find('.front > input').bind('keydown', 'alt+tab', function() {
				$(this).parent().another_kvp();
			});
			reformed.applyArrayEditingEvents(el);
		},
		applyArrayEditingEvents: function(el) {
			// array events
			$(el).find('.array > .actions > a.another').click(function() {
				var array = $(this).closest('.array');
				var actions = $(this).closest('.actions');
				var appended = actions.prev('fieldset, input')
					.clone().appendTo(array);
				if (appended.is('fieldset')) {
					appended.find('input').val('');
				} else {
					appended.val('');
				}
				actions.appendTo(array);
			});
		},
		kvp: function(key, value) {
			var use_schema = (reformed.settings.editor == 'schema');
			var output = '<div class="kvp"><div class="front">';
			if (reformed.settings.editor == 'edit') {
				output += '<span class="handle">drag</span> ';
				output += '<input type="text" value="'+key+'" class="key" />';
			} else {
				output += '<label class="key">'+key+'</label>';
			}

			if (use_schema) {
				var type = (value.format ? value.format : value.type);
				var title = value.description;
				var properties = value.properties;
				var items = value.items;
				value = (value.default ? value.default : '');
				if (type != 'array' && type != 'object') {
					if (type == 'string') type = 'text';
					if (type == 'integer') type = 'number';
					if (type == 'date-time') type = 'datetime';
					output += '<input class="value" type="'+type+'" value="'+value+'" title="'+(title ? title : '')+'" />';
				} else if (type == 'array') {
					value = [value];
					output += reformed.array(value, items);
				} else if (type == 'object' && properties) {
					output += reformed.object({'properties':properties});
				}
			} else {
				if ($.isPlainObject(value)) {
					output += reformed.object(value);
				} else if ($.isArray(value)) {
					output += reformed.array(value);
				} else if (typeof value == 'string' || typeof value == 'number') {
				  if (typeof value == 'string'
  				&&
    				(value.search(/<[^>]*>/g) > -1
    				|| value.search(/^(?:\s*)function(?:\s*)\(/) > -1)) {
				    output += '<textarea class="value">'+value+'</textarea>';
				  } else {
  					type = typecheck.test(value);
  					output += '<input class="value" type="'+type+'" value="'+value+'" />';
				  }
				} else if (typeof value == 'boolean') {
				  if (reformed.settings.editor == 'edit') {
				    output += '<input class="value" type="text" value="'+value+'" />';
				  } else {
  					output += '<input class="value" type="checkbox"';
  					if (value) output+= 'checked="checked"';
  					output += ' />';
				  }
				}
			}
			output += '</div>';
			if (reformed.settings.editor == 'edit') {
				output += '<div class="actions"><a class="configure">@</a><a class="another"">+</a><a class="remove">-</a></div>';
			}
			output += '</div>';
			return output;
		},

		object: function(object) {
			var output = '<fieldset class="object">';
			if (reformed.settings.editor != 'schema') {
				for (var attrname in object) {
					output += reformed.kvp(attrname, object[attrname]);
				}
			} else {
				for (var prop in object['properties']) {
					output += reformed.kvp(prop, object['properties'][prop]);
				}
			}
			output += '</fieldset>';
			return output;
		},

		array: function(array, items) {
			var output = '<fieldset class="array">';
			if (items && reformed.settings.editor == 'schema') {
				$.each(array, function (index, value) {
					output += '<input type="'+items.type+'" value="'+value+'" />';
				});
				// TODO: extend this to handle arrays of objects and arrays of arrays?
			} else {
				$.each(array, function (index, value) {
					if (typeof value == 'string' || typeof value == 'number') {
						type = typecheck.test(value);
						output += '<input type="text" value="'+value+'" />';
					} else if ($.isPlainObject(value)) {
						output += reformed.object(value);
					} else if ($.isArray(value)) {
						output += reformed.array(value);
					}
				});
			}
			if (reformed.settings.editor == 'edit' || reformed.settings.editor == 'data') {
				output += '<div class="actions"><a class="another"">+</a></div>';
			}
			output += '</fieldset>';
			return output;
		}
	};

$.fn.reform = function(json, options) {
	reformed.init.apply(this, arguments);
};

	// http://ajax.microsoft.com/ajax/jquery.validate/1.7/jquery.validate.js
	var typecheck = {
		test: function(value) {
			for (var type in this.types) {
				if (typeof this.types[type] == 'function' && this.types[type](value)) {
					return type;
				} else if (typeof this.types[type] == 'object' && this.types[type].test(value)) {
					return type;
				}
			}
			return false;
		},
		types: {
			// TODO: should we assume that strings containing numbers are numbers or strings (for validation/form helpers)?
			number: function(value) {
				return !isNaN(value) || typeof value == 'number';
			},

			// http://docs.jquery.com/Plugins/Validation/Methods/email
			email:
				// contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
				/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,

			// http://docs.jquery.com/Plugins/Validation/Methods/url
			url:
				// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
				/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,

			// http://ajax.microsoft.com/ajax/jquery.validate/1.7/additional-methods.js
			time: /^([01][0-9])|(2[0123]):([0-5])([0-9])$/,

			// pulled from various regex sources
			color: /^#?([a-f]|[A-F]|[0-9]){3}(([a-f]|[A-F]|[0-9]){3})?$/,

			month: /^\d{4}-\d{2}$/,

			date: /^\d{4}-\d{2}-\d{2}$/
		}
	}

/**
 * Deserialize re:form.ed HTML From to JSON string
 *
 * @param string from Selector of HTML element that contains the re:form.ed form
 */
$.rejson = function(from) {
	var _json = {};
	$(from + ' > fieldset.object > .kvp').each(function () {
	    _kvp = kvp($(this));
	    for (var attrname in _kvp) {
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
	var el = this.parent().after(reformed.kvp('', '')).next();
	el.find('.key').focus();
	reformed.applyEditorEvents(el);
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
	if (reformed.settings.editor == 'edit') {
		var k = el.find('div.front > input, fieldset').val();
		var v = $(el.find('div.front > input, div.front > textarea, fieldset')[1]);
	} else {
		var k = el.find('div.front > label.key').html();
		var v = $(el.find('div.front > input, div.front > textarea, fieldset')[0]);
	}
	if (v.is('input') || v.is('textarea')) {
		if (v.is(':checkbox')) {
			_kvp[k] = v.is(':checked');
		} else {
			var value = v.val();
			if (value) {
				_kvp[k] = (isNaN(value) ? value : parseInt(value));
			} else {
				_kvp[k] = value;
			}
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

})(jQuery);
