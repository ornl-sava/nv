var ColorLegend = Backbone.Model.extend({
    
  initialize: function() {
    this.makeScales(10.0);

    // these colors are defined in util.js for the treemap
    var change    = [ 'fixed', 'open', 'new' ]
      , nochange  = [ 'severity' ];
    
    // default to nochange
    this.set('activeColors', nochange);

    // respond to changes on vis type
    this.get('datasource').on('change:isChangeVis', function(){
      var isChangeVis = this.get('datasource').get('isChangeVis');

      if( isChangeVis )
        this.set('activeColors', change);
      else
        this.set('activeColors', nochange);

    }, this);
  },

  makeScales: function(high){
    // define colors
    var multihue = ['#FFF7FB', '#F1EEF6', '#ECE7F2', '#D0D1E6', '#A6BDDB', '#74A9CF', '#3690C0', '#0570B0', '#045A8D', '#023858'];
//      var multihue = ['#FFF7FB', '#F7FCF0', '#E0F3DB', '#CCEBC5', '#A8DDB5', '#7BCCC4', '#4EB3D3', '#2B8CBE', '#0868AC', '#084081'];


    var lowColor    = d3.hsl('#F1EEF6');
    var highColor   = d3.hsl('#2B8CBE');
    var fixedColor  = d3.hsl('#405E50');
    var newColor    = d3.hsl('#AD009F');
    var openColor   = d3.hsl('#FFCF40');
    
    // define scales
    var severityScale = d3.scale.quantize()
      .domain([0.0, high])
      .range(multihue);

//     var severityScale = d3.scale.linear()
//      .domain([0.0, high])
//      .range([lowColor, highColor])
//      .clamp(true);
//    
    var fixedScale = d3.scale.linear()
      .domain([0.0, high])
      .range([lowColor, fixedColor])
      .clamp(true);
    
    var openScale = d3.scale.linear()
      .domain([0.0, high])
      .range([lowColor, openColor])
      .clamp(true);

    var newScale = d3.scale.linear()
      .domain([0.0, high])
      .range([lowColor, newColor])
      .clamp(true);

    this.set('severity', severityScale);
    this.set('fixed', fixedScale);
    this.set('open', openScale);
    this.set('new', newScale);
  }
});
