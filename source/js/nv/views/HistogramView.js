var HistogramView = Backbone.View.extend({

  initialize: function() {
    
    // listen for model changes
    this.model.on('change:data', this.render, this);
    this.options.app.on('resize', this.resize, this);

    // set bootstrap span sizes
    d3.select(this.options.target)
      .attr('class', 'span3');

    // init a d3 histogram
    d3.select(this.options.target)
      .append('svg')
      .attr('height', this.options.h);
  },

  render: function(){
    var vis         = d3.select(this.options.target).select('svg')
      , app         = this.model.get('app')
      , data        = this.model.get('data')
      , range       = this.options.range
      , attribute   = this.model.get('attribute')
      , view        = this
      , h           = this.options.h
      , barwidth    = this.options.barwidth
      , barspace    = 2
      , title       = this.options.title
      , that        = this
      , numBins     = data.length
      , rect        = vis.selectAll('.bar')
      , rectLabels  = vis.selectAll('.histogramLabel')
      , titleLabel  = vis.selectAll('.histogramtitle');

    var containerWidth = $(document).innerWidth();
    
    var w = (barwidth + barspace) * numBins;
    vis.attr('width', w);

    // y scale for bars
    var y = d3.scale.linear()
              .domain([0, d3.max(data, function(d) { return d.length; })])
              .range([1, h-40]);

    // enter
    rect.data(data, function(d) { return d.length; })
        .enter().append('rect')
        .classed('bar inactive', true)
        .on('click', function() { barClick(this); })
        .on('mouseover', function() { barMouseOver(this); })
        .attr('width', barwidth)
        .attr('height', function(d, i) { return y(d.length); })
        .attr('x', function(d, i) { return i*(barwidth+barspace); })
        .attr('y', function(d, i) { return h - 45 - y(d.length); });

    // update

    //x-axis labels for bars
    rectLabels.data(data, function(d) { return d.label; })
      .enter().append('text')
      .attr('class', 'histogramlabel')
      .attr('x', function(d, i) { return i*(barwidth+barspace) + barwidth/2; })
      .attr('y', h - 35)
      .attr('text-anchor', 'middle')
      .text( function(d) { return d.label; });

    //title
    titleLabel.data([title])
      .enter().append('text')
      .attr('class', 'histogramtitle')
      .attr('x', w / 2 )
      .attr('y', h - 20)
      .attr('text-anchor', 'middle')
      .text(title);


    // on bar mouseover, emit the chart title and label of the selected
    var barMouseOver = function barMouseOver(d) {   
      var msg = {
        chart: title,
        label: d3.select(d).data()[0].label
      };

      that.options.app.trigger('histogramMouseover', msg);
    };

    // On bar click, emit the chart title, label, and bar size of the selected.
    //   If the bar is already selected, remove all filters
    var barClick = function barClick(d) {
      var sel = d3.select(d)
        , active = sel.classed('active');

      // get the data for the clicked element
      var data = d3.select(d).data()[0];

      // prepare the message to send to the app
      var msg = {
        label: data.label,
        length: data.length,
        chart: that.options.title
      };

      // if cvss histogram, decrease label by 1 to get correct selection
      // if( msg.chart.indexOf('cvss') !== 1 ){
      //     console.log(msg);
      //     msg.label = msg.label-1;
      // }

      // make all bars inactive
      d3.selectAll('.bar').classed('active', false);
      d3.selectAll('.bar').classed('inactive', true);

      // activate this one if it's not active, else just send off message
      if( !active ){
        sel.classed('active', true);
        sel.classed('inactive', false);
        msg.state = 'on';
      } else {
        msg.state = 'off';
      }

      // trigger an event and attach the message
      that.options.app.trigger('histogramClick', msg);
    };
  },

  // TODO Instead of this, programmatically set limit in render
  resize: function(){
    var divWidth    = $(this.options.target).width()
      , svgWidth    = $(this.options.target + ' svg').width()
      , barWidth    = this.options.barwidth
      , barSpace    = 2
      , limit       = this.model.get('limit') || "";

    if(limit === 0)
      return;

    if( divWidth > svgWidth + barWidth + barSpace )
      this.model.set('limit', limit+1);
    else if ( divWidth < svgWidth )
      this.model.set('limit', limit-1);
  }
});
