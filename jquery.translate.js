/*
 * jQuery.translate
 * Automatic translation plugin for jQuery
 * 
 * options:
 *  - lang: destination language
 *  - url: json provider for missing translations
 *  - trans: 
 * Copyright 2011 Jose L. Salinas
 * Released under the MIT License
*/

(function($){
	
	$.fn.translate = function(options) {
		
		const DATA_STR_ID       = 'trans_id',
		      DATA_PARAM_PREFIX = 'param_',
			  CLASS_NO_TRANS    = 'trans-not-found',
			  CLASS_NO_PARAM    = 'trans-missing-param';
		
		// storage
		
		var set_trans = function (key, value) {
			if (typeof key === 'string') {
				trans_table[settings.lang][key] = value;
			} else {
				for (var i in key) {
					set_trans(i, key[i]);
				}
			}
		};
		
		var get_trans = function (key) {
			if ( (typeof key === 'undefined') || (key === null) ) {
				return trans_table[settings.lang];
			}
			return trans_table[settings.lang][key];
		};
		
		// interaction with HTML DOM
		
		var extract_strids = function () {
			plugin.each( function () {
				var strid = $(this).data(DATA_STR_ID).trim();
				if ( strid !== '' ) {
					if ( (typeof get_trans(strid) === 'undefined') ||
					     (get_trans(strid) === null) ||
					     (get_trans(strid) == strid) ) {
						set_trans(strid, false);
					}
				}
			} );
		};
		
		var do_translation = function () {
			plugin.each( function () {
				// XXX check data-strid
				var strid = $(this).data(DATA_STR_ID).trim();
				if ( strid === '' ) {
					return;
				}
				
				var text = get_trans(strid);
				
				if (text === false) {
					text = strid;
					console.log("Warning: missing translation string '" + strid + "' (language: " + settings.lang + ")");
					if (settings.callback_trans_not_found) {
						settings.callback_trans_not_found($(this)[0], settings.lang, strid);
					} else {
						$(this).addClass(CLASS_NO_TRANS);
					}
				} else {
					var re = /\[_(\w+)_\]/g;
					var params = [],
						full_params = [];
					while (match = re.exec(text)) {
						full_params.push(match[0]);
						params.push(match[1]);
					}
					
					for (var i = 0; i < params.length; i++) {
						var p = params[i],
							full_p = full_params[i];
						
						var key = DATA_PARAM_PREFIX + p.toLowerCase();
						var value = $(this).data(key);
						if ( (typeof value === 'undefined') || (value === null) ) {
							value = full_p;
							console.log("Warning: missing parameter '" + full_p + "' in translation string '" + strid + "' (language: " + settings.lang + ")");
							if (settings.callback_missing_param) {
								settings.callback_missing_param($(this)[0], settings.lang, strid, full_p);
							} else {
								$(this).addClass(CLASS_NO_PARAM);
							}
						}
						
						text = text.replace(full_p, value);
					}
				}
				
				$(this).html( text );
			} );
		};
		
		// a pair of polyfills
		
		// trim
		String.prototype.trim = function () {
			return this.replace(/^\s+|\s+$/, '');
		};

		// dummy console
		if (typeof window.console === 'undefined') {
			window.console = {
				"log": function (text) {
					// do nothing
				}
			};
		}
		
		// plugin initialization
		
		var settings = $.extend({}, $.fn.translate.defaults, options);
		
		var trans_table = {};
		if ( (typeof trans_table[settings.lang] === 'undefined') || (trans_table[settings.lang] === null) ) {
			trans_table[settings.lang] = {};
		}
		set_trans(settings.translations);
		
		var plugin = this;
		
		extract_strids();
		do_translation();
		
		return plugin.each( function () {} );
		
	};
	
	$.fn.translate.defaults = {
		"lang"                     : '-',
		"translations"             : {},
		"callback_trans_not_found" : null,
		"callback_missing_param"   : null
	};
	
})(jQuery);
