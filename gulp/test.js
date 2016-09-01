var perroquet = require('./index.js');
var gutil = require('gulp-util');

var stream = perroquet();

stream.on('data', function (file) {
	if (file.contents.toString() != 'Welcome <?php echo $name; ?>!') {
		throw new Error('Failed result file content: '+file.contents.toString());
	}
	if (file.relative != 'fixture.php') {
		throw new Error('Failed result file path: '+file.relative);
	}
});

stream.write(new gutil.File({
	cwd: __dirname,
	base: 'fixture',
	path: 'fixture/fixture.html',
	contents: new Buffer('Welcome {{$name}}!')
}));
stream.end();