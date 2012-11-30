
/*jshint browser:true, jquery:true */
/*globals NV:true, d3:true, console:false, crossfilter:true */

(function () {

'use strict';

/*
   Private functions
*/

// handle window resizes
$(window).resize(function() {
  NV.treemapView.resize();
});


/*
   Document Ready
*/
$(function(){
  // start the router history
  NV.start({pushState: true});
});


/*
  Public functions
  any?
*/
return {
};

}());
