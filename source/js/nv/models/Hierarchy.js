var Hierarchy = Backbone.Model.extend({

  initialize: function() {
    // define and set our initial hierarchy
    var _hierarchy = [
      { target: 'nv' },
      { useData: true, target: 'group' },
      { useData: true, target: 'ip' },
      { prefix: ':', useData: true, target: 'port' },
      { prefix: 'id', useData: true, target: 'vulnid' }
    ];

    // set the data initially
    this.set('data', _hierarchy);

    // on changes to isChangeVis, restructure hierarchy 
    this.get('datasource').on('change:isChangeVis', function(){
      var isChangeVis = this.get('datasource').get('isChangeVis'),
          hierarchy = this.get('data');

      // filter out state; else append it
      if(!isChangeVis){
        hierarchy = _.filter( hierarchy, function(d) { return d.target !== 'state'; } );
      } else {
        hierarchy.push({ useData: true, target: 'state' });
      }

      // TODO why do we have to trigger the change event manually?
      this.set('data', hierarchy);
      this.trigger('change:data');
    }, this);

    // listen for hierarchy view changes
    this.get('app').on('hierarchyChange', function(h){
      this.set('data', h);
    }, this);
  }
});
