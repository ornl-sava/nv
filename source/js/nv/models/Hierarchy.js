var Hierarchy = Backbone.Model.extend({

  initialize: function() {

    // define and set our initial hierarchy

    var _hierarchy = [
      { target: 'nv' },
      { useData: true, target: 'ip' },
      { prefix: ':', useData: true, target: 'port' },
      { prefix: 'id', useData: true, target: 'vulnid' }
    ];

    // set the data initially (silently)
    this.set({data: _hierarchy, silent: true});

    // event handling
  
    // on changes to isChangeVis (bool), set/remove state accordingly
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

    // TODO this code can be used when the groups pages has been rewritten
    //  in backbone, the following is a temporary fix
    // on changes to groups, set/remove group accordingly
//    this.get('datasource').on('change:groups', function(){
//      var groups = this.get('datasource').get('groups'),
//          hierarchy = this.get('data');
//
//      // filter out state; else append it
//      if(groups.size < 1){
//        hierarchy = _.filter( hierarchy, function(d) { return d.target !== 'group'; } );
//      } else {
//        hierarchy.push({ useData: true, target: 'group' });
//      }
//
//      // TODO why do we have to trigger the change event manually?
//      this.set('data', hierarchy);
//      this.trigger('change:data');
//    }, this);

     // TODO see above: add groups to hierarchy
     this.get('datasource').on('change:groups', function(){
      var hierarchy = this.get('data');

      var hasGroup = _.find(hierarchy, function(d) { return d.target === 'group'; });


      if(!hasGroup)
        hierarchy.splice(1, 0, { useData: true, target: 'group' });

      this.set('data', hierarchy);
      this.trigger('change:data');

     }, this);

    // on hierarchy change, make this our new hierarchy
    this.get('app').on('hierarchyChange', function(h){
      this.set('data', h);
    }, this);
  }
});
