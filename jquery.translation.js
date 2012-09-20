/*
 * jQuery.translate
 * Translation plugin for jQuery
 * 
 * See sample-usage.html for docs.
 * 
 * Copyright 2012 Jose L. Salinas
 * Released under the MIT License
 */

(function($){
	
	$.fn.translate = function(options) {
		
		const DATA_STR_ID       = 'trans_id',
		      DATA_PARAM_PREFIX = 'param_',
			  CLASS_NO_TRANS    = 'trans-not-found',
			  CLASS_NO_PARAM    = 'trans-missing-param';
		
		// trim
		String.prototype.trim = function () {
			return this.replace(/^\s+|\s+$/, '');
		};

		String.prototype.htmlencode_safe = function () {
			// xxx find html entities for parenthesis
			return this.replace(/</g, '&lt;')
			           .replace(/>/g, '&gt;')
			           .replace(/"/g, '&quot;')
			           .replace(/'/g, '&apos;')
			           .replace(/\(/g, '(')
			           .replace(/\)/g, ')');
		};
		
		// plugin initialization
		
		var settings = $.extend({}, $.fn.translate.defaults, options);
		
		var plugin = this;
		
		plugin.each( function () {
			var strid = $(this).data(DATA_STR_ID).trim();
			
			// if data-strid is empty, do nothing
			// XXX or should we create a new event for this?
			if ( strid === '' ) {
				// xxx trigger event?
				return;
			}
			
			if ( (typeof settings.translation_table[strid] === 'undefined') ||
				 (settings.translation_table[strid] === null) ||
				 (settings.translation_table[strid] == strid) ) {
				settings.translation_table[strid] = false;
			}
			var text = settings.translation_table[strid];
			
			if (text === false) {
				text = strid;
				if (settings.add_fail_classes) {
					$(this).addClass(CLASS_NO_TRANS);
				}
				$(this).trigger('fail_strid.translate', [plugin.selector, strid]);
			} else {
				var re = /\[_(\w+)_\]/g;
				
				while ( text.match(re) ) {
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
						
						// xxx
						if ( typeof settings.translation_table[value] !== 'undefined' ) {
							text = text.replace(full_p, settings.translation_table[value]);
							break;
						}
						
						if ( (typeof value === 'undefined') || (value === null) ) {
							value = p;
							if (settings.add_fail_classes) {
								$(this).addClass(CLASS_NO_PARAM);
							}
							$(this).trigger('fail_param.translate', [plugin.selector, strid, full_p]);
						}
						
						value = new String (value);
						text = text.replace(full_p, value.htmlencode_safe());
					}
				}
			}
			
			$(this).html( text );
		} );
		
		$(plugin.selector).triggerHandler('finished.translate', [plugin.selector]);
		
		return plugin.each( function () {} );
	};
	
	$.fn.translate.defaults = {
		"translation_table" : {},
		"add_fail_classes"  : false
	};
	
})(jQuery);
