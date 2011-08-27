/*
 * pygments.js: A node.js wrapper for pygments
 *
 * (C) 2011, Pavan Kumar Sunkara
 *
 */

var spawn = require('child_process').spawn,
    exists = require('path').existsSync,
    fs = require('fs');

var pygments = exports;

//
// Default timeout threshold for pygments
//
pygments.timeout = 10

//
// Default binary path for pygmentize
//
pygments.bin = 'pygmentize'

//
// ### function colorize
// #### @target {String} Target to be highlighted
// #### @lexer {String} Lexer to use for highlighting
// #### @format {String} Format for the output
// #### @options {Object} Other options
//
pygments.colorize = function(target, lexer, format, options) {
  var options = options || {};
  if(lexer) options['l'] = lexer;
  if(format) options['f'] = format;

  options = this.merge_options(options);
  target = this.stringize(target, (options['force']));
  delete options['force'];

  return this.execute(target, options);
}

//
// ### function execute
// #### @target {String} Target to be highlighted
// #### @options {Object} Options
//
pygments.execute = function(target, options) {
  var pyg = spawn(this.bin, this.convert_options(options));
  var ret = '';
  pyg.stdout.on('data', function(data) {
    console.log(data.toString());
  });
  pyg.stderr.on('data', function (data) {
    console.log(data.toString());
  });
  pyg.stdin.write(target);
  pyg.stdin.end();
  return ret;
}

//
// ### function convert_options
// #### @options {Object} Options to be converted
//
pygments.convert_options = function(options) {
  var cmd = [];
  for(var option in options) {
    validate_args(option, options[option]);
    cmd.push("-"+option + options[option]);
  }
  return cmd;
}

//
// ### function merge_options
// #### @opts {Object} Options to be merged
//
pygments.merge_options = function(options) {
  var default_options = {
    'force': false,
    'l': 'ruby',
    'f': 'html',
    'O': 'encoding=utf-8'
  }
  for(var option in options)
    default_options[option] = options[option];
  return default_options;
}

//
// ### function stringize
// #### @target {String} Target to be highlighted
// #### @force {Boolean} Force the target to be string
//
pygments.stringize = function(target, force) {
  force = (force===undefined ? false : force);
  if(exists(target) && !force) {
    var target_stats = fs.statSync(target);
    if(target_stats.isFile()) {
      var target_fd = fs.openSync(target, 'r');
      target = fs.readSync(target_fd, target_stats['size'], null)[0];
      fs.closeSync(target_fd);
    }
  }
  return target;
}

var validate_args = function(flag, value) {
  if(!flag.match(/^[a-z]+$/i)) throw new Error("Flag is invalid: " + flag)
  if(!value.match(/^[a-z0-9\-\_\+\=\#\,\s]+$/i)) throw new Error("Flag value is invalid: -"+flag+" "+value)
}
