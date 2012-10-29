var NessusInfo = Backbone.Model.extend({
  initialize: function() {
    this.get('app').on('nessusIDSelected', this.updateData, this);
  },

  updateData: function(d){
    // TODO could do some cleanup here rather than in the view
    this.set('data', d);
  }
});
