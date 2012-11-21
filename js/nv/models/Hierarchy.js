var Hierarchy = Backbone.Model.extend({
  initialize: function() {
    
    // define and set our initial hierarchy
    var hierarchy = [
      {target: 'nv'},
      {useData: true, target: 'group'},
      {useData: true, target: 'ip'},
      {useData: true, target: 'state'},
      {prefix: ':', useData: true, target: 'port'},
      {prefix: 'id', useData: true, target: 'vulnid'}
    ];

    // if we're not comparing nbes, don't use the state element
    // TODO isChangeVis should be not be set globally
    if(!isChangeVis)
      hierarchy.splice(3, 1);

    this.set('data', hierarchy);


    // TODO respond to events swapping portions of the hieararchy
  },

  swap: function(i, j){
    var hierarchy = this.get('data');

    // swap
    var swap = hierarchy[i];
    hierarchy[i] = hierarchy[j];
    hierarchy[j] = swap;

    this.set('data', hierarchy);
  }
});
