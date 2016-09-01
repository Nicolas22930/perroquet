'use strict';
var Transform = require('readable-stream/transform');
var perroquet = require('perroquet');
var path = require('path');

module.exports = function(options)
{
	var regex = options && options.regex ? options.regex : null;
	var functions = options && options.functions ? options.functions : null;
	
	return new Transform({
		objectMode: true,
    	transform: function(file, enc, callback)
		{
			if (file.isNull()) {
        		return callback(null, file);
      		}
			
			if (file.isStream()) {
				cb(new gutil.PluginError('gulp-perroquet', 'Streaming not supported'));
				return;
			}
			
        	if (file.isBuffer()) {
				// Compile
				var content = String(file.contents);
				content = perroquet(content, functions, regex);
				file.contents = new Buffer(content);
				
				// Change extension to .php
				var ext = path.extname(file.path);
				if (ext) {
					file.path = file.path.substr(0, file.path.length - ext.length) + '.php';
				}
			}
			return callback(null, file);
		}
	});
};