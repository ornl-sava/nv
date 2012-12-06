var ColorLegendView = Backbone.View.extend({

  initialize: function() {
    // render on model update
//    this.model.on('change:activeColors', this.render, this);
    this.model.on('change', this.render, this);

    this.render();
  },

  render: function(){

    var legendWidth = 150
      , legendHeight = 30
      , labelY = 26
      , boxSize = 15;

    var activeColors = this.model.get('activeColors')
      , div = d3.select(this.options.target)
      , self = this;

    var entries = div.selectAll('.legendEntry')
      .data(activeColors, function(d) { return d; });
    
    var svgs = entries.enter().append('div')
      .classed('legendEntry', true)
      .append('svg')
      .attr('width', legendWidth)
      .attr('height', legendHeight);

    svgs.selectAll('rect')
      .data(d3.range(1,10))
      .enter().append('rect')
      .attr('width', boxSize)
      .attr('height', boxSize)
      .attr('x', function(d, i) { return i*boxSize; })
      .style('fill', function(d, i) { 
        var type = d3.select(this.parentNode).datum();
        var scale = self.model.get(type);
        return scale(i); 
      })
      .style('stroke', function(d, i) { 
        var type = d3.select(this.parentNode).datum();
        var scale = self.model.get(type);
        return scale(i); 
      });

    // append labels
    svgs.append('text')
      .attr('x', legendWidth/2)
      .attr('y', labelY)
      .attr('text-anchor', 'middle')
      .text( function(d) { return d; } );

    svgs.append('text')
      .attr('x', 0)
      .attr('y', labelY)
      .attr('text-anchor', 'start')
      .classed('legend_min', true);

    svgs.append('text')
      .attr('x', legendWidth)
      .attr('y', labelY)
      .attr('text-anchor', 'end')
      .classed('legend_max', true);

    // update labels
    entries.select('.legend_min')
      .text( function(d) { 
        return self.model.get(d).domain()[0];
      });

    entries.select('.legend_max')
      .text( function(d) { 
        return self.model.get(d).domain()[1];
      });

    entries.exit().remove();
  }
});
