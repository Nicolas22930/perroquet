# gulp-perroquet
[![Build Status](https://travis-ci.org/blunt1337/perroquet.svg?branch=master)](https://travis-ci.org/blunt1337/perroquet)

## Install

```
$ npm install --save-dev gulp-perroquet
```

## Usage

```js
const gulp = require('gulp');
const perroquet = require('gulp-perroquet');

gulp.task('default', () => {
	gulp.src('src/app.html')
		.pipe(perroquet())
		.pipe(gulp.dest('dest/'));
});
```

## options

### Custom function option

Use [custom function](https://github.com/blunt1337/perroquet#custom-functions) like this:
```js
perroquet({
	functions: {
		date: function (format) {
			// format = 'Y-m-d'
			return '<?php echo date(\''+format.replace(/'/g, '\\\'')+'\'); ?>';
		}
	}
});
```

### Custom delimiter option

Use [custom delimiter](https://github.com/blunt1337/perroquet#custom-delimiters) like this:
```js
perroquet({
	regex: /<<(.*?)>>/g
});
// Match <<$variable>> tags instead of {{$variable}}
```

## License

Apache 2.0 © [Olivier blunt](http://blunt.sh)