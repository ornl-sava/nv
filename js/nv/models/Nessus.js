var Nessus = Backbone.Model.extend({

  initialize: function() {

    // create our crossfilter
    this.logs = crossfilter();

    // create dimensions and add to logs (our crossfilter)
    var app = this;
    $.each( this.get('dimensions'), function(i, v){
      app["by"+v] = app.logs.dimension( function(d) { return d[v]; } );
    });

  },

// data query functions
  
  // TODO examples update for nv
  // TODO incorporate categorical filter from situ-vis
  //  Return events from crossfilter based on options in spec as follows:
  //  - useGlobalFilters: whether the model wants to obey any global filters
  //  - filters: an array of model-specific filters which can overwrite 
  //      matching global filters (format: [{attribute, rangeMin, rangeMax}, ...])
  //  - limit: limitation on amount of data sent back
  //  - attribute: which crossfilter dimension to use for getting data
  // 
  //  examples:
  //  the 50 most recent events:
  //  spec = {attribute:"timestamp", limit:50} 
  // 
  //  all events with malice scores between 0.3 and 0.5 and anomaly scores b/w 4 and 10:
  //  spec = { 
  //  filters:
  //     [
  //       {attribute:"maliceScore", rangeMin:0.3, rangeMax:0.5}, 
  //       {attribute:"anomalyScore", rangeMin:4, rangeMax:10}
  //     ]
  //  }   
  getData: function(spec){
    var config    =  spec || {}
      , limit     =  config.limit || Infinity;

    // use global filters or clear all filters
    if( config.useGlobalFilters )
      this.activateFilters( this.get('filters') );
    else 
      this.clearFilters();
   
    // activate local filters if they exist
    if( config.filters && config.filters.length > 0 )
      this.activateFilters(config.filters);

    // get data, clear filters, return data 
    var d = this['by'+config.attribute].top(limit);
    this.clearFilters();
    return d;
  },


// data modification functions

  // TODO Mike's functions should call this
  setData: function(dataset){
    this.logs.add(dataset);
    this.trigger('dataset updated');
  },

  // filters come from URLs, so we must parse them here
  updateFilter: function(f){
    // break them apart
    var entries = f.split(';');
    
    // add each to our filters list
    var divided = entries.map(function(d) { return d.split(','); });
    
    // convert to objects
    var filters = divided.map(function(d) { 
      return { attribute:d[0], rangeMin:d[1], rangeMax:d[2] }; 
    });

    this.set('filters', filters);

    // trigger a filterChange that models listen for
    this.trigger('filterChange', filters);
  },

  // iterate through filters and activate as necessary
  activateFilters: function(f){
    var filters = f || [];

    if( filters.length < 1 )
      return;

    var app = this;
    $.each(filters, function(i, v){
      if( v.exact )
        app['by'+v.attribute].filter( v.exact );
      else
        app['by'+v.attribute].filter( [v.rangeMin, v.rangeMax] );
    });
  },

  // clears all current filters
  clearFilters: function(){
    var app = this;
    $.each(this.get('dimensions'), function(i, v){
      app['by'+v].filterAll();
    });
  }

});
