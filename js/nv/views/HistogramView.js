var HistogramView = Backbone.View.extend({

  initialize: function() {
    // listen for model changes
    this.model.on('change', this.render, this);

    // init a d3 histogram
    d3.select(this.options.target)
      .append('svg')
      .attr('width', this.options.w)
      .attr('height', this.options.h);
  },

  // TODO implement @mbostock's margins (http://bl.ocks.org/3019563)
  render: function(){
    var vis       = d3.select(this.options.target).select('svg')
      , app       = this.model.get('app')
      , data      = this.model.get('data')
      , range     = this.options.range
      , numBins   = this.options.numBins
      , attribute = this.model.get('attribute')
      , view      = this
      , w         = this.options.w
      , h         = this.options.h
      , barwidth  = 15
      , barspace  = Math.floor( w/data.length - w/barwidth )
      , rect      = vis.selectAll('.bar')
      , labels    = vis.selectAll('.histogramLabel');

    // y scale for bars
    var y = d3.scale.linear()
              .domain([0, d3.max(data)])
              .range([5, h-40]);

    // label scale (use rangeRound to get integers)
    var labelScale = d3.scale.linear()
                       .domain([0, numBins])
                       .range(range);
    // enter
    rect.data(data)
        .enter().append('rect')
        .classed('bar', true)
        .on('click', function() { barClick(this); })
        .attr('data-rangeMin', function(d, i) { return labelScale(i); }) 
        .attr('data-rangeMax', function(d, i) { return labelScale(i+1); })
        .attr('width', barwidth)
        .attr('height', function(d, i) { return y(d); })
        .attr('x', function(d, i) { return i*(barwidth+barspace); })
        .attr('y', function(d, i) { return h - 45 - y(d); });

    // update
    // rect.transition().duration(250)

    //x-axis labels for bars
    labels.data(data)
      .enter().append("text")
      .attr("class", "histogramlabel")
      .attr("x", function(d, i) { return ( ((w / data.length) * i) + (barspace+barwidth)/2 ); })
      .attr("y", h - 35)
      .attr("text-anchor", "middle")
      .text( function(d, i) { return i; });

    // //title
    // histContainer.append("text")
    //   .attr("class", "histogramtitle")
    //   .attr("x", w / 2 )
    //   .attr("y", h + 26)
    //   .attr("text-anchor", "middle")
    //   .text(label);

    // //max value label
    // histContainer.append("text")
    //   .attr("class", "maxarea")
    //   .attr("x", w / 2 )
    //   .attr("y", h + 40)
    //   .attr("text-anchor", "middle");



    // on bar click, trigger a filter
    var barClick = function barClick(d) {   
      var rmin = d3.select(d).attr('data-rangeMin')
        , rmax = d3.select(d).attr('data-rangeMax');

      app.navigate('filter:'+attribute+','+rmin+','+rmax, true);
    };
  }
});
