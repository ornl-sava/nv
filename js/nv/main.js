
/*jshint browser:true, jquery:true */
/*globals NV:true, d3:true, console:false, crossfilter:true */

(function () {

'use strict';

/*
   Private functions
*/

// handle window resizes
// TODO Lane make this an event that views can respond to
$(window).resize(function() {
  NV.treemapView.resize();
});


/*
   Document Ready
*/
$(function(){

  // start the router history
  NV.start({pushState: true});

  // button actions
  // $('#homeButton').click(reset);

});


/*
  Public functions
  any?
*/
return {
};

}());
