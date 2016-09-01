[![Build Status](https://travis-ci.org/blunt1337/perroquet.svg?branch=master)](https://travis-ci.org/blunt1337/perroquet)

```
	 ____                                      _   
	|  _ \ ___ _ __ _ __ ___   __ _ _   _  ___| |_ 
	| |_) / _ \ '__| '__/ _ \ / _` | | | |/ _ \ __|
	|  __/  __/ |  | | | (_) | (_| | |_| |  __/ |_ 
	|_|   \___|_|  |_|  \___/ \__, |\__,_|\___|\__|
								 |_| 
 ```

Perroquet is a small template engine that compiles into PHP. It's compiled into raw PHP files that you can run in your PHP server.

# Usage
```js
var php_code = perroquet('Hi my name is {{$name}}');
// php code = 'Hi my name is <?php echo $name; ?>'
```

# List of template codes

| Template code | Generated php code |
|---|---|
|`{{$variable}}`|`<?php echo $variable; ?>`|
|`{{$object.attribute}}`|`<?php echo $object->attribute; ?>`|
|`{{$array[key]}}`|`<?php echo $array['key']; ?>`|
|`{{$variable = 'value'}}`|`<?php $variable = 'value'; ?>`|
|`{{$array as $value}}`|`<?php foreach ($array as $value) {`|
|`{{$array as $key => $value}}`|`<?php foreach ($array as $key => $value) {`|
|`{{function() as $value}}`|`<?php foreach (function() as $value) { ?>`|
|`{{=date(..)}}`|`<?php echo date(..); ?>`|
|`{{#variable}}`|`<?php echo htmlentities($variable, ENT_COMPAT, 'utf-8'); ?>`|
|`{{url $img}}`|`<?php echo rawurlencode($img); ?>`|
|`{{>path}}`|`<?php include 'path'; ?>`|
|`{{?variable}}`|`<?php if (!empty($variable)) { ?>`|
|`{{!variable}}`|`<?php if (empty($variable)) { ?>`|
|`{{?variable1 && !variable2}}`|`<?php if (!empty($variable1) && empty($variable2)) ?>`|
|`{{if condition}}`|`<?php if (condition) { ?>`|
|`{{elseif condition}}`|`<?php else if (condition) { ?>`|
|`{{else}}`|`<?php } else { ?>`|
|`{{for $i = 0; $i < 9; $i++}}`|`<?php for ($i = 0; $i < 9; $i++) { ?>`|
|`{{while condition}}`|`<?php while (condition) { ?>`|
|`{{/}}`|`<?php } ?>`|
|`{{switch condition}}`|`<?php switch (condition) { ?>`|
|`{{case 'awesome'}}`|`<?php case 'awesome': ?>`|
|`{{bcase 'awesome'}}`|`<?php break; case 'awesome': ?>`|
|`{{default}}`|`<?php break; default: ?>`|
|`{{break}}`|`<?php break; ?>`|
|`{{pr $variable}}`|`<pre><?php print_r($variable); ?></pre>`|
|`{{js $variable}}`|`<?php echo json_encode($variable); ?>`|
|`{{esc}} my escaped {{$code}} {{/esc}}`|` my escaped {{$code}} `|

# Custom functions
You can add custom functions to the compiler:
```js
var php_code = perroquet('Today is the {{date Y-m-d}}', {
	date: function (format) {
		// format = 'Y-m-d'
		return '<?php echo date(\''+format.replace(/'/g, '\\\'')+'\'); ?>';
	}
});
```

# Custom delimiters
You can change the default {{..}} delimiters with the third parameter of perroquet(code, custom_functions, custom_regex). For example:
```js
var php_code = perroquet('Hi my name is --#name--', null, /--(.*?)--/g);
```

  To suggest a feature, report a bug, or general discussion:
  http://github.com/blunt1337/perroquet/issues/