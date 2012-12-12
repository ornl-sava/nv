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

    var text = svg.append('text')
        .attr('class', aclass)
        .style('font', f)
        .style('opacity', 0)
        .style('visibility', 'hidden')
        .style('display', 'inline')
        .text(string);

    var width = text.node().getComputedTextLength();

    d3.select(text).remove();

    return width;
};
