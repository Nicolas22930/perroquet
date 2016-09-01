/**
  Copyright 2016 Olivier blunt (business@blunt.sh)

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

	  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */
'use strict';

/**
 * Replace template code {{xxx}} by pure php
 * @param	string		before					The complete matched template code "{{xxx}}"
 * @param	string		code					The inner brackets content "xxx"
 * @param	object		custom_functions		Custom compilation functions, {{date xxx}} will be replace by the result of custom_functions.date(xxx)
 * @return	string								Raw php code
 */
function parse(before, code, custom_functions)
{
	switch (code.charAt(0)) {
		// Echo, assignement or foreach
		case '$':
			// Check if it is really a variable
			if (!/^\$[a-zA-Z\x7f-\xff_{]/.test(code)) {
				return before;
			}
			
			// Foreach
			if (code.indexOf(' as ') > 1) {
				code = '<?php foreach ('+code+') { ?>';
			}
			// Assign
			else if (code.indexOf('=') > 1) {
				code = '<?php '+code+'; ?>';
			}
			// Echo
			else {
				code = '<?php echo '+code+'; ?>';
			}
			break;
		
		// Simple echo (for constants or functions)
		case '=':
			code = '<?php echo '+code.substr(1)+'; ?>';
			break;
		
		// Echo with html escaping
		case '#':
			code = '<?php echo htmlentities($'+code.substr(1)+', ENT_COMPAT, \'utf-8\'); ?>';
			break;
		
		// Close something
		case '/':
			return '<?php } ?>';
		
		// Include a file
		case '>':
			// Custom function 'include' can override this one
			if (typeof custom_functions == 'object' && custom_functions !== null && custom_functions.hasOwnProperty('include')) {
				var fct = custom_functions.include;
				if (typeof fct == 'function') {
					code = fct(code.substr(1));
					break;
				}
			}
			
			// Default inclusion
			code = code.substr(1);
			code = code.replace(/'/g, '\\\'');
			return '<?php include \''+code+'\'; ?>';
		
		// Conditions
		case '?':
			// Shortcut {?$var} = {?var}{$var}{/}
			if (code.substr(1, 1) == '$') {
				code = code.substr(1);
				code = '<?php if (!empty('+code+')) echo '+code+'; ?>';
				break;
			}
			// Shortcut {?#var} = {?var}{#var}{/}
			if (code.substr(1, 1) == '#') {
				code = code.substr(1);
				code = '<?php if (!empty('+code+')) echo htmlentities('+code+', ENT_COMPAT, \'utf-8\'); ?>';
				break;
			}
		case '!':
			code = '<?php if ('+parseCondition(code)+') { ?>';
			break;
		
		// Word commands
		default:
			var match;
			if (match = code.match(/^(\w+)(\s*(.*))?$/)) {
				switch (match[1]) {
					// Url encode
					case 'url':
						code = '<?php echo rawurlencode('+match[3]+'); ?>';
						break;
					
					// Conditions
					case 'if':
						code = '<?php if ('+parseCondition(match[3])+') { ?>';
						break;
					case 'else':
						code = '<?php } else { ?>';
						break;
					case 'elseif':
						code = '<?php } else if ('+parseCondition(match[3])+') { ?>';
						break;
					
					// Loops
					case 'for':
						code = '<?php for ('+match[3]+') { ?>';
						break;
					case 'while':
						code = '<?php while ('+parseCondition(match[3])+') { ?>';
						break;
					
					// Switch stuff
					case 'case':
						code = '<?php case '+match[3]+': ?>';
						break;
					case 'bcase':
						code = '<?php break; case '+match[3]+': ?>';
						break;
					case 'default':
						code = '<?php break; default: ?>';
						break;
					case 'break':
						code = '<?php break; ?>';
						break;
					case 'switch':
						code = '<?php switch ('+match[3]+') { ?>';
						break;
					
					// Print_r
					case 'pr':
						code = '<pre><?php print_r('+match[3]+'); ?></pre>';
						break;
					
					// Json
					case 'js':
						code = '<?php echo json_encode('+match[3]+'); ?>';
						break;
					
					default:
						// Foreach with "function() as ..."
						if (code.indexOf(' as ') > 0) {
							code = '<?php foreach ('+code+') { ?>';
							break;
						}
						
						// Custom functions
						if (typeof custom_functions == 'object' && custom_functions !== null && custom_functions.hasOwnProperty(match[1])) {
							var fct = custom_functions[match[1]];
							if (typeof fct == 'function') {
								code = fct(match[3]);
								break;
							}
						}
						return before;
				}
			} else {
				return before;
			}
			break;
	}
	
	// Replace . by -> when possible
	code = code.replace(/(\$[a-z0-9_]+(\.[a-z0-9_{]+)+)/ig, function (match) {
		return match.replace(/\./g, '->');
	});
	
	// Replace [string_] by ['string_']
	code = code.replace(/\[([a-z_][a-z0-9_]*)\]/ig, function (_, match1) {
		return '[\''+match1+'\']';
	});
	
	return code;
}

/**
 * Convert condition strings:
 * !var.name => empty($var.name)
 * ?var.name => !empty($var.name)
 * @param	string		code
 * @return	string
 */
function parseCondition(code)
{
	return code.replace(
		/(!|\?)(([a-z0-9_'"[\]{}]+(\.[a-z0-9_'"[\]{}]+)*)+(?!\s*\())/ig,
		function (_, match1, match2) {
			if (match1 == '!') {
				return 'empty($'+match2+')';
			} else {
				return '!empty($'+match2+')';
			}
		}
	);
}

/**
 * Remove template code inside {{esc}}...{{/esc}}
 * @param	string		code
 * @param	object		strings			Holder of escaped parts
 * @return	string
 */
function removeEscapes(code, strings)
{
	var res = '';
	var offset = 0;
	
	// Find starts
	var open_match;
	var open_regex = /{{esc(ape)?}}/ig;
	while (open_match = open_regex.exec(code)) {
		// Start offset
		var tag_start = open_match.index;
		var content_start = tag_start + open_match[0].length;
		
		// Find end, or another start
		var level = 1;
		var content_end = content_start;
		var tag_end = null;
		var close_match;
		var close_regex = /{{(\/)?esc(ape)?}}/ig;
		while (close_match = close_regex.exec(code.substr(content_start))) {
			content_end = content_start + close_match.index;
			tag_end = content_end + close_match[0].length;
			
			// Closing
			if (close_match[1] == '/') {
				// All closed
				if (--level == 0) break;
			} else {
				level++;
			}
		}
		// No end found = complete page
		if (tag_end === null) {
			content_end = tag_end = code.length;
		}
		
		// Add escaped code in strings
		strings[tag_start] = code.substr(content_start, content_end - content_start);
		
		// Add to result
		res += code.substr(offset, tag_start - offset);
		res += '{{escaped_code_'+tag_start+'}}';
		
		// Set offset
		offset = tag_end;
	}
	
	// Add last part
	res += code.substr(offset);
	
	return res;
}

/**
 * Put back escaped parts
 * @param	string		code
 * @param	object		strings			Holder of escaped parts
 * @return	string
 */
function addEscapes(code, strings)
{
	for (var k in strings) {
		if (strings.hasOwnProperty(k)) {
			code = code.replace('{{escaped_code_'+k+'}}', strings[k]);
		}
	}
	return code;
}

/**
 * Convert perroquet html templates into pure php code
 * @param	string		code				Template code
 * @param	object		custom_functions	Custom compilation functions, {{date xxx}} will be replace by the result of custom_functions.date(xxx)
 * @param	RegExp		custom_regex		To use another matching regex, default {{(.*?)}}, need matching group 1 for parsing
 * @return	string							Raw php/html code
 */
module.exports = function(code, custom_functions, custom_regex)
{
	// Escape
	var strings = {};
	code = removeEscapes(code, strings);
	
	// Replaces template codes
	var regex = custom_regex || /{{(.*?)}}/g;
	code = code.replace(regex, function (match0, match1) {
		return parse(match0, match1, custom_functions);
	});
	
	// Remove everything between switch and case
	code = code.replace(/(<\?php switch .*?\?>)(.|\n)*?(<\?php case )/img, function (_0, match1, _2, match3) {
		return match1 + match3;
	});
	
	// Cleanup ?><?php
	code = code.replace(/\?><\?php/g, '');
	
	// Put back escaped code
	code = addEscapes(code, strings);
	
	// Replace nbsp
	code = code.replace(/\xc2\xa0/g, '&nbsp;');
	
	return code;
};