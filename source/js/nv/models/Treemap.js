var Treemap = Backbone.Model.extend({
  initialize: function() {

    // set our default size option
    this.set('sizeOption', 'cvss');

    // respond to app-level events
    this.get('datasource').on('dataset updated', this.updateData, this);
    this.on('change:sizeOption', this.updateData, this);
    this.on('change:filterOptions', this.updateData, this);
    this.get('hierarchy').on('change', this.updateData, this);

    this.get('app').on('histogramClick', function(msg){

      if(msg.state === "off"){
        updateFilter('remove');
      } else if(msg.chart === "cvss"){
        updateFilter('cvss', msg.label+0.0, msg.label+1.01);
      } else if(msg.chart === "vuln type"){
        updateFilter('vulntype', msg.label);
      } else if(msg.chart === "top holes"){
        updateFilter('vulnid', msg.label);
      } else if(msg.chart === "top notes"){
        updateFilter('vulnid', msg.label);
      }

    });

    // make an updateFilter function
    var self = this;
    var updateFilter = function updateFilter(attr, value, valueEnd){
      var filterOptions   = self.get('filterOptions');

      if(attr === 'remove'){
        filterOptions.filters = null;
      } else if(valueEnd){
        filterOptions.filters = [
          { attribute:attr, rangeMin:value, rangeMax: valueEnd }
        ];
      } else {
        filterOptions.filters = [
          { attribute:attr, exact:value }
        ];
      }

      self.set('filterOptions', filterOptions);
      self.updateData();
    };

  },

  updateData: function(){
    var filterOptions   = this.get('filterOptions')
      , attribute       = filterOptions.attribute
      , hierarchy       = this.get('hierarchy').get('data');

    var rawData = this.get('datasource').getData(filterOptions);

    // check if our filters end up excluding everything
    if(rawData.length < 1){
      console.log('current filter yields no data, try another');
      return;
    }

    var root = applyhierarchy(hierarchy);

    function applyhierarchy(hierarchy){
      var nest = d3.nest();

      // loop hierarchy and apply key functions based on hierarchy object 
      _.each(hierarchy, function(h){

        nest.key(function(d){

          if(h.useData){
            if(h.prefix)
              return h.prefix+d[h.target];
            else
              return d[h.target];
          } else {
            return h.target;
          }

        });

      });

      nest.sortKeys(d3.ascending);
      return nest.entries(rawData);
    }

    // free the root from its original array
    root = root[0];

    this.accumulate(root);

    // set data to the lengths of the data
    this.set('data', root);  
  }, 

  // aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation.
  // 
  // TODO: can we generalize the accumulate functions for multiple attributes?
  accumulate: function(d) {
    var app = this;

    function accumulateCount(d){
      return d.values ? 
        d.count = d.values.reduce(function(p, v) { return p + accumulateCount(v); }, 0) :
        d.value;
    }

    function accumulateCVSS(d){
      return d.values ? 
        d.cvss = d.values.reduce(function(p, v) { return Math.max(p, accumulateCVSS(v)); }, 0) :
        d.cvss;
    }

    function accumulateCriticality(d){
      return d.values ? 
        d.criticality = d.values.reduce(function(p, v) { return Math.max(p, accumulateCriticality(v)); }, 0) :
        d.criticality;
    }

    function accumulateState(d){
      return d.values ?
        d.state = d.values.reduce(function(p, v) { return accumulateState(v); }, 0) :
        d.state;
    }

    function accumulateFixedCounts(d){
      return d.values ?
        d.fixedCount = d.values.reduce(function(p, v) { return p + accumulateFixedCounts(v); }, 0) :
        d.state === 'fixed' ? 1 : 0;
    }
    
    function accumulateOpenCounts(d){
      return d.values ?
        d.openCount = d.values.reduce(function(p, v) { return p + accumulateOpenCounts(v); }, 0) :
        d.state === 'open' ? 1 : 0;
    }

    function accumulateNewCounts(d){
      return d.values ?
        d.newCount = d.values.reduce(function(p, v) { return p + accumulateNewCounts(v); }, 0) :
        d.state === 'new' ? 1 : 0;
    }

    d.cvss = accumulateCVSS(d);
    d.count = accumulateCount(d);
    d.criticality = accumulateCriticality(d);

    if( this.get('datasource').get('isChangeVis') ){
      d.state = accumulateState(d);
      d.fixedCount = accumulateFixedCounts(d);
      d.openCount = accumulateOpenCounts(d);
      d.newCount = accumulateNewCounts(d);
    }

    return d.values ?
      d.value = d.values.reduce(function(p, v) { return p + app.accumulate(v); }, 0) :
      d[this.get('sizeOption')];
  }
});
