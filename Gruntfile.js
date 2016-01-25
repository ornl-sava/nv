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


  // Project configuration.
  grunt.initConfig({
    jshint: {
      files: [
        'source/js/nv/*.js'
      , 'source/js/nv/models/*.js'
      , 'source/js/nv/views/*.js'
      ],
      options: {
        browser: true,
        laxcomma: true,
        maxparams: 5,
        maxdepth: 5,
        maxstatements: 30,
        maxcomplexity: 10
      },
      globals: {
        jQuery: true,
        console: false
      }
    }
    ,
    cssmin: {
      'public/css/style.min.css': [
        'source/css/bootstrap.css'
      , 'source/css/bootstrap-responsive.css'
      , 'source/css/font-awesome.css'
      , 'source/css/tipsy.css'
      , 'source/css/nv.css'
      ]
    }
    ,
    concat: {
      libs: {
        src: [
          'source/js/lib/d3.v2.js'
        , 'source/js/lib/crossfilter.js'
        , 'source/js/lib/lodash.underscore.js'
        , 'source/js/lib/backbone-min.js'
        , 'source/js/lib/bootstrap.min.js'
        , 'source/js/lib/jquery-ui-1.9.2.custom.js'
        , 'source/js/lib/jquery.tipsy.js'
        ]
      , dest: 'public/js/lib.min.js'
      }
    , app: {
        src: [
          'source/js/nv/main.js'
        , 'source/js/nv/util.js'
        , 'source/js/nv/models/*.js'
        , 'source/js/nv/views/*.js'
        , 'source/js/nv/router.js'
        , 'source/js/legacy.js'
        , 'source/js/parser/src/parser.js'
        ]
      , dest: 'public/js/app.min.js'
      }
    }
    ,
    uglify: {
      libs: {
        src: [
          'source/js/lib/d3.v2.js'
        , 'source/js/lib/crossfilter.js'
        , 'source/js/lib/lodash.underscore.js'
        , 'source/js/lib/backbone-min.js'
        , 'source/js/lib/bootstrap.min.js'
        , 'source/js/lib/jquery-ui-1.9.2.custom.js'
        , 'source/js/lib/jquery.tipsy.js'
        ]
      , dest: 'public/js/lib.min.js'
      }
    , app: {
        src: [
          'source/js/nv/main.js'
        , 'source/js/nv/util.js'
        , 'source/js/nv/models/*.js'
        , 'source/js/nv/views/*.js'
        , 'source/js/nv/router.js'
        , 'source/js/legacy.js'
        , 'source/js/parser/src/parser.js'
        ]
      , dest: 'public/js/app.min.js'
      }
    }
    ,
    copy: {
      main: {
        files: [
          {src: ['source/index.html'], dest: 'public/'},
          {src: ['source/js/lib/jquery-1.9.1.min.js'], dest: 'public/js/'},
          {src: ['source/font/*'], dest: 'public/font/', expand: true},
          {src: ['source/data/*'], dest: 'public/data/', expand: true}
        ]
      }
    }    
    ,
    watch: { 
      files: [ 
        '<config:concat.app.src>'
      , 'source/index.html'
      , 'source/css/nv.css'
      , 'source/css/tipsy.css'
      ]
    , tasks: 'dev'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // production, run when grunt is run with no arguments
  grunt.registerTask('default', ['jshint', 'cssmin', 'uglify', 'copy']);
  // development - dont minify js
  grunt.registerTask('dev', 'lint cssmin concat copy');
};
