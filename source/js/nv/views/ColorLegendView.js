var ColorLegendView = Backbone.View.extend({

  initialize: function() {
    // render on model update
    this.model.on('change:data', this.render, this);

    this.render();
  },

  render: function(){
    var data = this.model.get('data')
      , div = d3.select(this.options.target);

    var entries = div.selectAll('.legendEntry')
      .data(data, function(d) { return d.type; });
    
    var svgs = entries.enter().append('div')
      .classed('legendEntry', true)
      .append('svg')
      .attr('width', 100)
      .attr('height', 20);

    svgs.append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .style('fill', function(d) { return d.color; });

    svgs.append('text')
      .attr('x', 25)
      .attr('y', 13)
      .text( function(d) { return d.type; } );

    entries.exit().remove();
  }
});
