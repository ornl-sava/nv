var ColorLegendView = Backbone.View.extend({

  initialize: function() {
    // render on model update
    this.model.on('change:activeColors', this.render, this);

    this.render();
  },

  render: function(){
    // TODO domain labels
    
    var activeColors = this.model.get('activeColors')
      , div = d3.select(this.options.target)
      , self = this;

    var entries = div.selectAll('.legendEntry')
      .data(activeColors, function(d) { return d; });
    
    var svgs = entries.enter().append('div')
      .classed('legendEntry', true)
      .append('svg')
      .attr('width', 150)
      .attr('height', 30);

    svgs.selectAll('rect')
      .data([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .enter().append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('x', function(d, i) { return i*15; })
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

    // TODO text should be aligned left, right, center as needed; google this
    svgs.append('text')
      .attr('x', 150/2 - 5)
      .attr('y', 26)
      .text( function(d) { return d; } );

    svgs.append('text')
      .attr('x', 0)
      .attr('y', 26)
      .text( function(d) { 
        return self.model.get(d).domain()[0];
      });

    svgs.append('text')
      .attr('x', 150-15)
      .attr('y', 26)
      .text( function(d) { 
        return self.model.get(d).domain()[1];
      });

    entries.exit().remove();
  }
});
