var Histogram = Backbone.Model.extend({
  initialize: function() {
    // respond to app-level events
    this.get('datasource').on('dataset updated', this.updateData, this);
  },

  updateData: function(){
    var attribute        = this.get('attribute')
      , filterOptions    = this.get('filters') || {
          attribute: attribute
        };

    // histograms are used in two cases: the filter/overview histograms and 
    //  accumulation histograms on cards. One requires ips and the other doesn't.
    //  We handle those cases here:
    var rawData = this.get('datasource').getData(filterOptions);

    // compute histogram
    var histogram = d3.layout.histogram()
             .value(function(d) { return d[attribute]; })
             (rawData); 

    // Convert array of object arrays to array of their lengths
    var histlengths = histogram.map(function(d) { return d.length; });

    // set data (this triggers an update event)
    this.set('data', histlengths);
  }
});
