var ColorLegendView = Backbone.View.extend({

  initialize: function() {
    // render on model update
    this.model.on('change:data', this.render, this);

    this.render();
  },

  render: function(){
    // TODO feed color scales instead of data
    // TODO color model should work for treemap AND here
    var data = this.model.get('data')
      , div = d3.select(this.options.target);

    var entries = div.selectAll('.legendEntry')
      .data(data, function(d) { return d.type; });
    
    var svgs = entries.enter().append('div')
      .classed('legendEntry', true)
      .append('svg')
      .attr('width', 150)
      .attr('height', 50);

    svgs.selectAll('rect')
      .data([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .enter().append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('x', function(d, i) { return i*15; })
      .style('fill', function(d) { return d3.select(this.parentNode).datum().color; })
      .style('stroke', function(d) { return d3.select(this.parentNode).datum().color; });

    svgs.append('text')
      .attr('x', 150/2)
      .attr('y', 25)
      .text( function(d) { return d.type; } );

    entries.exit().remove();
  }
});
