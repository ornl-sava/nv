var TreemapView = Backbone.View.extend({

  initialize: function() {
    // listen for model changes
    this.model.on('change:data', this.render, this);
  },

  render: function(){
    // TODO entire treemap here, layout and all
  }

 });
