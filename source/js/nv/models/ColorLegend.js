var ColorLegend = Backbone.Model.extend({
    
  initialize: function() {

    // these colors are defined in util.js for the treemap
    var change    = [ {type:'fixed', color:'#405E50'},
                      {type:'new',   color:'#AD009F'},
                      {type:'open',  color:'#FFCF40'} ]
      , nochange  = [ {type:'severity', color:'#2B8CBE'} ];
    
    // default to nochange
    this.set('data', nochange);

    // respond to changes on vis type
    this.get('datasource').on('change:isChangeVis', function(){
      var isChangeVis = this.get('datasource').get('isChangeVis');

      if( isChangeVis )
        this.set('data', change);
      else
        this.set('data', nochange);

    }, this);
  }
});
