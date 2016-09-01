'use strict';
var Transform = require('readable-stream/transform');
var perroquet = require('perroquet');

module.exports = function(options)
{
	var regex = option && options.regex ? options.regex : null;
	var functions = option && options.functions ? options.functions : null;
	
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
				var content = String(file.contents);
				content = perroquet(content, functions, regex);
				file.contents = new Buffer(content);
			}
			return callback(null, file);
		}
	});
};