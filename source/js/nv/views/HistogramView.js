var HistogramView = Backbone.View.extend({

  initialize: function() {
    // TODO should this be set in the router?
    this.margin = 40;
    
    // listen for model changes
    this.model.on('change:data', this.render, this);
    this.options.app.on('resize', this.render, this);

    // add float left style
    d3.select(this.options.target)
      .style('float', 'left')
      .style('margin-right', this.margin+'px'); 

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
      , target      = this.options.target
      , that        = this
      , numBins     = data.length
      , rect        = vis.selectAll('.bar')
      , rectLabels  = vis.selectAll('.histogramlabel')
      , titleLabel  = vis.selectAll('.histogramtitle');


    var containerWidth = $(document).innerWidth();
    
    // set svg and parent width; handle changes in limit.
    // basically, the hole and note histogram should add/remove bars
    // based on the space they occupy.
    var w, divWidth;
    if(target === '#topHoleHistogram' || target === '#topNoteHistogram'){
      var filterWidth =   $('#filters').width()
        , cvssWidth   =   $('#cvssHistogram').width()
        , typeWidth   =   $('#vulnTypeHistogram').width()
        , margin      =   this.margin
        , limit       =   this.model.get('limit') || "";

      // open space for the hole and note histograms
      openSpace = filterWidth - cvssWidth - typeWidth - margin*2;

      // margin*1.2 prevents the last chart from wrapping as much on resize
      divWidth = openSpace/2 - margin*1.2;

      // find and set the new limit
      var newLimit = Math.floor(divWidth / (barwidth + barspace));
      this.model.set('limit', newLimit);

      // reset data and numBins 
      data = this.model.get('data');
      numBins = data.length;

      // svg width
      w = (barwidth + barspace) * numBins;
    } else {
      // svg and div is the same width
      divWidth = w = (barwidth + barspace) * numBins;
    }

    // set new svg and div width
    vis.attr('width', w);
    $(target).width(divWidth); 

    // y scale for bars
    var y = d3.scale.linear()
              .domain([0, d3.max(data, function(d) { return d.length; })])
              .range([1, h-40]);

    // enter
    var rectSel = rect.data(data, function(d) { return d.length; });

    rectSel.enter().append('rect')
        .classed('bar inactive', true)
        .on('click', function() { barClick(this); })
        .on('mouseover', function() { barMouseOver(this); })
        .attr('width', barwidth)
        .attr('height', function(d, i) { return y(d.length); })
        .attr('x', function(d, i) { return i*(barwidth+barspace); })
        .attr('y', function(d, i) { return h - 45 - y(d.length); });

    rectSel.exit().remove();

    // update

    //x-axis labels for bars
    labelSel = rectLabels.data(data, function(d) { return d.label; });

    labelSel.enter().append('text')
      .attr('class', 'histogramlabel')
      .attr('x', function(d, i) { return i*(barwidth+barspace) + barwidth/2; })
      .attr('y', h - 35)
      .attr('text-anchor', 'middle')
      .text( function(d) { return d.label; });

    labelSel.exit().remove();

    //title
    titleSel = titleLabel.data([title], function(d) { return d; });

    titleSel.enter().append('text')
      .attr('class', 'histogramtitle')
      .attr('text-anchor', 'middle')
      .text(title);

    titleSel.attr('x', w / 2 )
      .attr('y', h - 20);

    titleSel.exit().remove();


    // on bar mouseover, emit the chart title and label of the selected
    var barMouseOver = function barMouseOver(d) {   
      var msg = {
        chart: title,
        label: d3.select(d).data()[0].label
      };

      that.options.app.trigger('histogramMouseover', msg);
    };

    // on bar click, emit the chart title, label, and bar size of the selected
    // if the bar is already selected, remove all filters
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
  }
});
