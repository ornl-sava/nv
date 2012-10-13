var Histogram = Backbone.Model.extend({
  initialize: function() {
    // respond to app-level events
    this.get('datasource').on('dataset updated', this.updateData, this);
  },

  updateData: function(){
    var filterOptions   = this.get('filterOptions')
      , attribute       = filterOptions.attribute
      , bins            = this.get('bins') || ""
      , datamap         = this.get('datamap') || "";

    var rawData = this.get('datasource').getData(filterOptions);

    // compute histogram based on attribute value
    var histogram = d3.layout.histogram()
        .value(function(d) { 
          // if we have a datamap, use it
          return datamap ? datamap(d[attribute]) : d[attribute]; 
        });

    // if bins specified, set them
    if( bins )
      histogram.bins(bins);

    // compute the histogram
    var data = histogram(rawData); 

    // if a limit is specified, sort and cut the data
    if( this.get('limit') ){
      var limit = this.get('limit');

      // sort the data by length (ascending) and reverse
      data = _.sortBy(data, function(d){ return d.length; }).reverse();

      // cut off after limit
      data = _.first(data, limit);
    }

    // set data to the lengths of the data
    this.set('data', data.map(function(d) { return d.length; }) );
    
    // set labels. if bins are specified, use numbers
    //  otherwise use the category (data + attribute)
    // TODO, can d3 histograms make better labels by telling us what the bins mean?
    if( bins ) {
      this.set('labels', data.map( function(d, i) { return i; }) );
    } else {
      this.set('labels', data.map( function(d) { 
        // TODO if we have a datamap, get the inverse to get the labels right
        // to do this, see if we can reverse the d3 ordinal scale
        return d[0][attribute]; 
      }) );
    }

    // TODO remove eventually... only for testing
    console.log(this.get('data'));
    console.log(this.get('labels'));
  }
});
