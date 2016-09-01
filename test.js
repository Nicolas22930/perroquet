var perroquet = require('./index.js');

function assert(template, mustbe, custom_functions) {
	computed = perroquet(template, custom_functions);
	if (computed !== mustbe) {
		throw new Error("Test '"+template+"' resulted in '"+computed+"' when it should have been '"+mustbe+"'");
	}
}

assert('{{$echo}}', '<?php echo $echo; ?>');
assert('{{$assign = "value"}}', '<?php $assign = "value"; ?>');
assert('{{$array as $value}}', '<?php foreach ($array as $value) { ?>');
assert('{{$array as $index => $value}}', '<?php foreach ($array as $index => $value) { ?>');
assert('{{$12345}}', '{{$12345}}');
assert('{{=date()}}', '<?php echo date(); ?>');
assert('{{#var}}', '<?php echo htmlentities($var, ENT_COMPAT, \'utf-8\'); ?>');
assert('{{/}}', '<?php } ?>');
assert('{{?items}}', '<?php if (!empty($items)) { ?>');
assert('{{!items}}', '<?php if (empty($items)) { ?>');
assert('{{url $var}}', '<?php echo rawurlencode($var); ?>');
assert('{{if $var}}', '<?php if ($var) { ?>');
assert('{{else}}', '<?php } else { ?>');
assert('{{elseif $var}}', '<?php } else if ($var) { ?>');
assert('{{for $i = 0; $i < 5; $i++}}', '<?php for ($i = 0; $i < 5; $i++) { ?>');
assert('{{while $i < 5}}', '<?php while ($i < 5) { ?>');
assert('{{case "chocolate"}}', '<?php case "chocolate": ?>');
assert('{{bcase "chocolate"}}', '<?php break; case "chocolate": ?>');
assert('{{break}}', '<?php break; ?>');
assert('{{switch $var}}', '<?php switch ($var) { ?>');
assert('{{switch $var}} ignored {{case 1}}here{{bcase 2}}there{{/}}', '<?php switch ($var) {  case 1: ?>here<?php break; case 2: ?>there<?php } ?>');
assert('{{pr $var}}', '<pre><?php print_r($var); ?></pre>');
assert('{{js $var}}', '<?php echo json_encode($var); ?>');
assert('{{Class::function() as $value}}', '<?php foreach (Class::function() as $value) { ?>');
assert('{{$var.user.name}}', '<?php echo $var->user->name; ?>');
assert('{{$var.user.\'concat\'}}', '<?php echo $var->user.\'concat\'; ?>');
assert('{{$var[user][name]}}', '<?php echo $var[\'user\'][\'name\']; ?>');
assert('{{$var[$i][name]}}', '<?php echo $var[$i][\'name\']; ?>');
assert('{{esc}}{{$var}}{{/esc}}', '{{$var}}');
assert('before{{esc}}{{$var}}{{/esc}}after', 'before{{$var}}after');
assert('{{date Y-m-d}}', '<?php echo date(\'Y-m-d\'); ?>', {date: function (format) {
	return '<?php echo date(\''+format.replace(/'/g, '\\\'')+'\'); ?>';
}});