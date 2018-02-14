// Esa Kemppainen 2011-03
// Depends on jquery i18n plugin

var translate = (function($) {

	return {

		/**
		 * Retrieve translated messages by providing a key to the message to be retrieved, e.g. "info_start_page_name".
		 * If parameters need to be passed for the translated message, pass an additional array argument with the strings to replace parameters with, example:
		 * trans.msg('some_text_key', ['param_1_text', 'param_2_text']);
		 * Param {0} in the message will be replaced with 'param_1_text' and {1} with 'param_2_text'. 
		 */
		msg : function() {
			if (arguments.length === 1) {
				return $.i18n.prop(arguments[0]);
			} else if (arguments.length === 2) {
				return $.i18n.prop(arguments[0], arguments[1]);
			} else {
				alert('Invalid number of arguments to translate.msg');
			}
		}
	}
}($));
