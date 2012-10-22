var HistogramView = Backbone.View.extend({

  initialize: function() {
    // listen for model changes
    this.model.on('change:data', this.render, this);

    // init a d3 histogram
    d3.select(this.options.target)
      .append('svg')
      .attr('width', this.options.w)
      .attr('height', this.options.h);
  },

  // TODO implement @mbostock's margins (http://bl.ocks.org/3019563)
  render: function(){
    var vis         = d3.select(this.options.target).select('svg')
      , app         = this.model.get('app')
      , data        = this.model.get('data')
      , range       = this.options.range
      , attribute   = this.model.get('attribute')
      , view        = this
      , w           = this.options.w
      , h           = this.options.h
      , barwidth    = this.options.barwidth
      , labels      = this.model.get('labels')
      , title       = this.options.title
      , numBins     = data.length
      , barspace    = Math.floor( w/data.length - barwidth )
      , rect        = vis.selectAll('.bar')
      , rectLabels  = vis.selectAll('.histogramLabel')
      , titleLabel  = vis.selectAll('.histogramtitle');

    // y scale for bars
    var y = d3.scale.linear()
              .domain([0, d3.max(data)])
              .range([5, h-40]);

    // enter
    rect.data(data)
        .enter().append('rect')
        .classed('bar', true)
        .on('click', function() { barClick(this); })
//        .attr('data-rangeMin', function(d, i) { return labelScale(i); }) 
//        .attr('data-rangeMax', function(d, i) { return labelScale(i+1); })
        .attr('width', barwidth)
        .attr('height', function(d, i) { return y(d); })
        .attr('x', function(d, i) { return i*(barwidth+barspace); })
        .attr('y', function(d, i) { return h - 45 - y(d); });

    // update
    // rect.transition().duration(250)

    //x-axis labels for bars
    rectLabels.data(labels)
      .enter().append('text')
      .attr('class', 'histogramlabel')
      .attr('x', function(d, i) { return i*(barwidth+barspace) + barwidth/2; })
      .attr('y', h - 35)
      .attr('text-anchor', 'middle')
      .text( function(d) { return d; });

    //title
    titleLabel.data(title)
      .enter().append('text')
      .attr('class', 'histogramtitle')
      .attr('x', w / 2 )
      .attr('y', h - 20)
      .attr('text-anchor', 'middle')
      .text(title);

    // on bar click, trigger a filter
    // var barClick = function barClick(d) {   
    //   var rmin = d3.select(d).attr('data-rangeMin')
    //     , rmax = d3.select(d).attr('data-rangeMax');

    //   app.navigate('filter:'+attribute+','+rmin+','+rmax, true);
    // };
  }
});
