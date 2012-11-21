var HierarchyView = Backbone.View.extend({

  initialize: function() {
    var vis   = d3.select(this.options.target).append('ul')
      , data  = this.model.get('data')
      , that   = this;

  
    vis.selectAll('li')
      .data(data, function(d) { return d.target; })
      .enter().append('li')
      .classed('hierarchyNode', true)
      .text(function(d) { return d.target; });

    $('#hierarchy ul').sortable({
      stop: function(event, ui) {
        // loop through the list and make a new hierarchy
        var h = [];
        $("#hierarchy li").each(function(i, el){
          h.push( d3.select(el).datum() );
        });
        // emit an event with the new hierarchy
        that.options.app.trigger('hierarchyChange', h);
      }
    }
    );
  }

});
