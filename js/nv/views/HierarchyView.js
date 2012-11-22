var HierarchyView = Backbone.View.extend({

  initialize: function() {
    var list       = d3.select(this.options.target).append('ul')
      , hierarchy  = this.model.get('data')
      , self       = this;

  
    // build the list based on the initial hierarchy
    list.selectAll('li')
      .data(hierarchy, function(d) { return d.target; })
      .enter().append('li')
      .classed('hierarchyNode', true)
      .text(function(d) { return d.target; });

    // make the list sortable
    $('#hierarchy ul').sortable({

      cursor: "move",

      // on drop (stop), emit the new hierarchy
      stop: function(event, ui) {
        var h = [];

        // get each data item in the list (in order)
        $("#hierarchy li").each(function(i, el){
          h.push( d3.select(el).datum() );
        });

        self.options.app.trigger('hierarchyChange', h);
      }

    });
  }

});
