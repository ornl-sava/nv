var Hierarchy = Backbone.Model.extend({

  initialize: function() {
    
    // define and set our initial hierarchy
    var hierarchy = [
      { target: 'nv' },
      { useData: true, target: 'group' },
      { useData: true, target: 'ip' },
      { useData: true, target: 'state' },
      { prefix: ':', useData: true, target: 'port' },
      { prefix: 'id', useData: true, target: 'vulnid' }
    ];

    // if we're not comparing nbes, remove the state element
    // TODO isChangeVis should be not be set globally
    if( this.get('datasource').get('isChangeVis') )
      hierarchy.splice(3, 1);

    // set the data
    this.set('data', hierarchy);

    // listen for hierarchy view changes
    this.get('app').on('hierarchyChange', function(h){
      this.set('data', h);
    }, this);

  }

});
