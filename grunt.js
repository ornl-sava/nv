/*jshint node:true */
/*global module:false */

module.exports = function (grunt) {

  'use strict';

  /*
  Tasks:
  * lint - uses [jshint](https://github.com/jshint/jshint/)
  * min - uses [uglify-js](https://github.com/mishoo/UglifyJS)
  */


  // Project configuration.
  grunt.initConfig({
    lint: {
      files: ['js/nv/util.js',
              'js/nv/main.js',
              'js/nv/models/*.js',
              'js/nv/views/*.js',
              'js/nv/router.js']
    },
    concat: {
      libs: {
        src: ['js/lib/d3.v2.js',
              'js/lib/jquery-1.8.2.js',
              'js/lib/underscore.js',
              'js/lib/backbone.js',
              'js/lib/d3.v2.js',
              'js/lib/crossfilter.js',
              'js/lib/bootstrap-custom.min.js'],
        dest: 'js/lib.js'
      },
      app: {
        src: ['js/nv/util.js',
              'js/nv/models/*.js',
              'js/nv/views/*.js',
              'js/nv/router.js',
              'js/nv.js',
              'parser/src/parser.js'],
        dest: 'js/app.js'
      }
    },
    jshint: {
      options: {
        browser: true,
        laxcomma: true,
        maxparams: 5,
        maxdepth: 5,
        maxstatements: 25,
        maxcomplexity: 10
      },
      globals: {
        jQuery: true,
        console: false
      }
    },
  });

  // Default task will be invoked when grunt is called without any argument
  // run everything except copy
  grunt.registerTask('default', 'lint concat');
};
