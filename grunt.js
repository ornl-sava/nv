/*jshint node:true */
/*global module:false */

module.exports = function (grunt) {

  'use strict';

  /*
  Tasks:
  * lint - uses [jshint](https://github.com/jshint/jshint/)
  * min - uses [uglify-js](https://github.com/mishoo/UglifyJS)
  * [mincss](https://github.com/gruntjs/grunt-contrib-mincss)
  */

  grunt.loadNpmTasks('grunt-contrib-mincss');

  // Project configuration.
  grunt.initConfig({
    lint: {
      files: ['js/nv/util.js',
              'js/nv/main.js',
              'js/nv/models/*.js',
              'js/nv/views/*.js',
              'js/nv/router.js']
    },
    
    mincss: {
      'css/style.min.css': [
        'css/nv.css'
      ]
    },
    
    concat: {
      libs: {
        src: ['js/lib/d3.v2.js',
              'js/lib/underscore.js',
              'js/lib/backbone.js',
              'js/lib/crossfilter.js'],
        dest: 'js/lib.min.js'
      },
      app: {
        src: ['js/nv/util.js',
              'js/nv/models/*.js',
              'js/nv/views/*.js',
              'js/nv/router.js',
              'js/nv.js',
              'js/parser/src/parser.js'],
        dest: 'js/app.min.js'
      }
    },

    min: {
      libs: {
        src: ['js/lib/d3.v2.js',
              'js/lib/underscore.js',
              'js/lib/backbone.js',
              'js/lib/crossfilter.js'],
        dest: 'js/lib.min.js'
      },
      app: {
        src: ['js/nv/util.js',
              'js/nv/models/*.js',
              'js/nv/views/*.js',
              'js/nv/router.js',
              'js/nv.js',
              'js/parser/src/parser.js'],
        dest: 'js/app.min.js'
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
    }
  });

  // production, run when grunt is run with no arguments
  grunt.registerTask('default', 'lint mincss min');

  // development - dont minify js
  grunt.registerTask('devolopment', 'lint mincss concat');

};
