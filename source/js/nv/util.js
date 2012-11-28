// used to move svg element to front
// https://groups.google.com/forum/?fromgroups#!searchin/d3-js/scope/d3-js/eUEJWSSWDRY/XWKLd3QuaAoJ
d3.selection.prototype.moveToFront = function() { 
  return this.each(function() { 
    this.parentNode.appendChild(this); 
  }); 
}; 

// taken from https://groups.google.com/forum/?fromgroups=#!topic/d3-js/pTVgFuEgCfY
d3.stringWidth = function(svg, string, font, aclass) {
    var f = font || '12px arial';

    var text = svg.append("text")
        .attr('class', aclass)
        .style("font", f)
        .style("opacity", 0)
        .text(string);

    var width = text.node().getBBox().width;

    d3.select(text).remove();

    return width;
};

// color for treemap nodes
var nodeColor = d3.scale.linear()
  .domain([0.0, 2.0, 10.0])
  .range([d3.hsl("#F1EEF6"), d3.hsl("#BDC9E1"), d3.hsl("#2B8CBE")]); 

var nodeColorFixed = d3.scale.linear()
  .domain([0.0, 10.0])
  .range([d3.hsl("#AAAAAA"), d3.hsl("#405E50")]); 

var nodeColorNew = d3.scale.linear()
  .domain([0.0, 10.0])
  .range([d3.hsl("#AAAAAA"), d3.hsl("#AD009F")]); 

var nodeColorOpen = d3.scale.linear()
  .domain([0.0, 10.0])
  .range([d3.hsl("#AAAAAA"), d3.hsl("#FFCF40")]); 
