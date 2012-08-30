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
		
		// a pair of polyfills
		
		// trim
		String.prototype.trim = function () {
			return this.replace(/^\s+|\s+$/, '');
		};

		// plugin initialization
		
		var settings = $.extend({}, $.fn.translate.defaults, options);
		
		var trans_table = {};
		if ( (typeof trans_table[settings.lang] === 'undefined') || (trans_table[settings.lang] === null) ) {
			trans_table[settings.lang] = {};
		}
		set_trans(settings.translations);
		
		var plugin = this;
		
		plugin.each( function () {
			var strid = $(this).data(DATA_STR_ID).trim();
			if ( strid !== '' ) {
				if ( (typeof get_trans(strid) === 'undefined') ||
					 (get_trans(strid) === null) ||
					 (get_trans(strid) == strid) ) {
					set_trans(strid, false);
				}
			}
			
			// if data-strid is empty, do nothing
			// XXX or should we create a new event for this?
			var strid = $(this).data(DATA_STR_ID).trim();
			if ( strid === '' ) {
				return;
			}
			
			var text = get_trans(strid);
			
			if (text === false) {
				text = strid;
				if (settings.add_fail_classes) {
					$(this).addClass(CLASS_NO_TRANS);
				}
				$(this).trigger('fail_strid.translate', [$($(this)[0]), settings.lang, strid]);
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
						if (settings.add_fail_classes) {
							$(this).addClass(CLASS_NO_PARAM);
						}
						$(this).trigger('fail_param.translate', [$($(this)[0]), settings.lang, strid, full_p]);
					}
					
					text = text.replace(full_p, value);
				}
			}
			
			$(this).html( text );
		} );
		
		$(plugin.selector).triggerHandler('finished.translate', [plugin.selector]);
		
		return plugin.each( function () {} );
	};
	
	$.fn.translate.defaults = {
		"lang"             : '-',
		"translations"     : {},
		"add_fail_classes" : false
	};
	
})(jQuery);
