// used to move svg element to front
// https://groups.google.com/forum/?fromgroups#!searchin/d3-js/scope/d3-js/eUEJWSSWDRY/XWKLd3QuaAoJ
d3.selection.prototype.moveToFront = function() { 
  return this.each(function() { 
    this.parentNode.appendChild(this); 
  }); 
}; 

// taken from https://groups.google.com/forum/?fromgroups=#!topic/d3-js/pTVgFuEgCfY
//I usually prototype directly on string in m jquery version
//String.prototype.width = function(svg, string, font, aclass) {
d3.stringWidth = function(svg, string, font, aclass) {
    var f = font || '12px arial';

    var text = svg.append("text")
        .attr('class', aclass)
        .style("font", f)
        .style("opacity", 0)
        .text(string);

    var width = text.node().getBBox().width;

    d3.select(text).remove();

    return width;
};

var Histogram = Backbone.Model.extend({
  initialize: function() {
    // respond to app-level events
    this.get('datasource').on('dataset updated', this.updateData, this);
  },

  updateData: function(){
    var filterOptions   = this.get('filterOptions')
      , attribute       = filterOptions.attribute
      , bins            = this.get('bins') || ""
      , range            = this.get('range') || ""
      , datamap         = this.get('datamap') || "";

    var rawData = this.get('datasource').getData(filterOptions);

    // compute histogram based on attribute value
    var histogram = d3.layout.histogram()
        .value(function(d) { 
          // if we have a datamap, use it
          return datamap ? datamap(d[attribute]) : d[attribute]; 
        });

    // if bins specified, set them
    if( bins )
      histogram.bins(bins);
  
    // if bins specified, set them
    if( range )
      histogram.range(range);

    // compute the histogram
    var data = histogram(rawData); 

    if(filterOptions.attribute === 'cvss'){
      console.log(data);
    }

    // if a limit is specified, sort and cut the data
    if( this.get('limit') ){
      var limit = this.get('limit');

      // sort the data by length (ascending) and reverse
      data = _.sortBy(data, function(d){ return d.length; }).reverse();

      // cut off after limit
      data = _.first(data, limit);
    } 

    // set labels. if bins are specified, use numbers
    //  otherwise use the category (data + attribute)
    var labels;
    if( bins ) {

      labels = data.map( function(d, i) { 
        // if we have a datamap, access the domain to get the labels correct
        return datamap ? datamap.domain()[i] : i; 
      });

    } else {

      labels = data.map( function(d) { 
        return d[0][attribute]; 
      });

    }

    // TODO combine label and length in data attribute
    this.set('data', data.map(function(d, i) { 
      return {
        length: d.length,
        label: labels[i]
      };
    }) );  

  }
});

var Nessus = Backbone.Model.extend({

  initialize: function() {

    // create our crossfilter
    this.logs = crossfilter();

    // create dimensions and add to logs (our crossfilter)
    var app = this;
    $.each( this.get('dimensions'), function(i, v){
      app["by"+v] = app.logs.dimension( function(d) { return d[v]; } );
    });

  },

// data query functions
  
  // TODO examples update for nv
  // TODO incorporate categorical filter from situ-vis
  //  Return events from crossfilter based on options in spec as follows:
  //  - useGlobalFilters: whether the model wants to obey any global filters
  //  - filters: an array of model-specific filters which can overwrite 
  //      matching global filters (format: [{attribute, rangeMin, rangeMax}, ...])
  //  - limit: limitation on amount of data sent back
  //  - attribute: which crossfilter dimension to use for getting data
  // 
  //  examples:
  //  the 50 most recent events:
  //  spec = {attribute:"timestamp", limit:50} 
  // 
  //  all events with malice scores between 0.3 and 0.5 and anomaly scores b/w 4 and 10:
  //  spec = { 
  //  filters:
  //     [
  //       {attribute:"maliceScore", rangeMin:0.3, rangeMax:0.5}, 
  //       {attribute:"anomalyScore", rangeMin:4, rangeMax:10}
  //     ]
  //  }   
  getData: function(spec){
    var config    =  spec || {}
      , limit     =  config.limit || Infinity;

    // use global filters or clear all filters
    if( config.useGlobalFilters )
      this.activateFilters( this.get('filters') );
    else 
      this.clearFilters();
   
    // activate local filters if they exist
    if( config.filters && config.filters.length > 0 )
      this.activateFilters(config.filters);

    // get data, clear filters, return data 
    var d = this['by'+config.attribute].top(limit);
    this.clearFilters();
    return d;
  },


// data modification functions

  setData: function(dataset){
    // empty dataset if needed
    if(this.logs.size() > 1)
      this.logs = crossfilter();

    this.logs.add(dataset);
    this.trigger('dataset updated');
  },

  // filters come from URLs, so we must parse them here
  updateFilter: function(f){
    // break them apart
    var entries = f.split(';');
    
    // add each to our filters list
    var divided = entries.map(function(d) { return d.split(','); });
    
    // convert to objects
    var filters = divided.map(function(d) { 
      return { attribute:d[0], rangeMin:d[1], rangeMax:d[2] }; 
    });

    this.set('filters', filters);

    // trigger a filterChange that models listen for
    this.trigger('filterChange', filters);
  },

  // iterate through filters and activate as necessary
  activateFilters: function(f){
    var filters = f || [];

    if( filters.length < 1 )
      return;

    var app = this;
    $.each(filters, function(i, v){
      if( v.exact )
        app['by'+v.attribute].filter( v.exact );
      else
        app['by'+v.attribute].filter( [v.rangeMin, v.rangeMax] );
    });
  },

  // clears all current filters
  clearFilters: function(){
    var app = this;
    $.each(this.get('dimensions'), function(i, v){
      app['by'+v].filterAll();
    });
  }

});

var NessusInfo = Backbone.Model.extend({
  initialize: function() {
    this.get('app').on('nessusIDSelected', function(msg){
      this.updateData(msg);
    }, this);

    // respond to a mouseover on histogram
    this.get('app').on('histogramMouseover', function(msg){

      // if note, say so, same for hole; ignore otherwise
      if( msg.chart.indexOf('note') != -1){
        this.updateData({vulntype: 'note', vulnid: msg.label});
      } else if( msg.chart.indexOf('hole') != -1){
        this.updateData({vulntype: 'hole', vulnid: msg.label});
      }

    }, this);

  },

  updateData: function(info){
    var nodeInfo = {
      id:     info.vulnid, 
      type:   info.vulntype, 
      port:   info.port, 
      ip:     info.ip, 
      group:  info.group
    };

    var vulnInfo = vulnIdInfo[info.vulnid];

    this.set('data', {nodeInfo: nodeInfo, vulnInfo: vulnInfo});
  }
});

var Treemap = Backbone.Model.extend({
  initialize: function() {
    // respond to app-level events
    this.get('datasource').on('dataset updated', this.updateData, this);

    this.set('sizeOption', 'cvss');

    this.on('change:sizeOption', this.updateData, this);

    // TODO change in filterOptions should update data
    this.on('change:filterOptions', this.updateData, this);

    // respond to app filter change
    this.get('app').on('histogramClick', function(msg){

      // TODO use this info to construct a filter
      if(msg.state === "off"){
        console.log('removing filters');
        updateFilter('remove');
      } else if(msg.chart === "cvss"){
        console.log('adding cvss filter');
        updateFilter('cvss', msg.label+0.0, msg.label+1.01);
      } else if(msg.chart === "vuln type"){
        console.log('adding vuln type filter');
        updateFilter('vulntype', msg.label);
      } else if(msg.chart === "top holes"){
        console.log('adding top holes filter');
        updateFilter('vulnid', msg.label);
      } else if(msg.chart === "top notes"){
        console.log('adding top notes filter');
        updateFilter('vulnid', msg.label);
      }

    });

    var that = this;
    var updateFilter = function updateFilter(attr, value, valueEnd){
      var filterOptions   = that.get('filterOptions');

      if(attr === 'remove'){
        filterOptions.filters = null;
      } else if(valueEnd){
        filterOptions.filters = [
          { attribute:attr, rangeMin:value, rangeMax: valueEnd }
        ];
      } else {
        filterOptions.filters = [
          { attribute:attr, exact:value }
        ];
      }

      that.set('filterOptions', filterOptions);
      that.updateData();
    };
  },

  updateData: function(){
    var filterOptions   = this.get('filterOptions')
      , attribute       = filterOptions.attribute;

    var rawData = this.get('datasource').getData(filterOptions);

    if(rawData.length < 1){
      console.log('current filter yields no data, try another');
      return;
    }

    var root;
    if(isChangeVis){
      root=d3.nest()
      .key(function(d) {return 'groups';})
      .key(function(d) {return d.group;})
      .key(function(d) {return d.ip;})
      .key(function(d) {return d.state;})
      .key(function(d) {return ":"+d.port;})
      .key(function(d) {return "id:"+d.vulnid;})
      .sortKeys(d3.ascending)
      .entries(rawData); 
    } else {
      root=d3.nest()
      .key(function(d) {return 'groups';})
      .key(function(d) {return d.group;})
      .key(function(d) {return d.ip;})
      .key(function(d) {return ":"+d.port;})
      .key(function(d) {return "id:"+d.vulnid;})
      .sortKeys(d3.ascending)
      .entries(rawData); 
    }

    // free the root from its original array
    root = root[0];

    this.accumulate(root);

    // set data to the lengths of the data
    this.set('data', root);  
  }, 

  // Aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation.
  // 
  // TODO: can we generalize the accumulate functions for multiple attributes?
  accumulate: function(d) {
    var app = this;

    function accumulateCVSS(d){
      return d.values ? 
        d.cvss = d.values.reduce(function(p, v) { return Math.max(p, accumulateCVSS(v)); }, 0) :
        d.cvss;
    }

    function accumulateState(d){
      return d.values ?
        d.state = d.values.reduce(function(p, v) { return accumulateState(v); }, 0) :
        d.state;
    }

    function accumulateFixedCounts(d){
      return d.values ?
        d.fixedCount = d.values.reduce(function(p, v) { return p + accumulateFixedCounts(v); }, 0) :
        d.state === 'fixed' ? 1 : 0;
    }
    
    function accumulateOpenCounts(d){
      return d.values ?
        d.openCount = d.values.reduce(function(p, v) { return p + accumulateOpenCounts(v); }, 0) :
        d.state === 'open' ? 1 : 0;
    }

    function accumulateNewCounts(d){
      return d.values ?
        d.newCount = d.values.reduce(function(p, v) { return p + accumulateNewCounts(v); }, 0) :
        d.state === 'new' ? 1 : 0;
    }

    d.cvss = accumulateCVSS(d);
    if(isChangeVis){
      d.state = accumulateState(d);
      d.fixedCount = accumulateFixedCounts(d);
      d.openCount = accumulateOpenCounts(d);
      d.newCount = accumulateNewCounts(d);
    }

    return d.values ?
      d.value = d.values.reduce(function(p, v) { return p + app.accumulate(v); }, 0) :
      d[this.get('sizeOption')];
  }
});

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
      , title       = this.options.title
      , that        = this
      , numBins     = data.length
      , barspace    = Math.floor( w/data.length - barwidth )
      , rect        = vis.selectAll('.bar')
      , rectLabels  = vis.selectAll('.histogramLabel')
      , titleLabel  = vis.selectAll('.histogramtitle');

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

var NessusInfoView = Backbone.View.extend({

  initialize: function() {
    // render on model update
    this.model.on('change:data', this.render, this);
  },

  render: function(){
    var data = this.model.get('data');

    var div = $(this.options.target)
      , nodeInfo = data.nodeInfo
      , idData = data.vulnInfo;

    // TODO do this with d3 instead
    div.html('<hr><p>');
    if(nodeInfo){
      if(nodeInfo.type == 'hole')
        div.append("Security Hole"+ '<br><br>');
      else
        div.append("Security Note"+ '<br><br>');
      div.append("Group: " + nodeInfo.group + '<br>');
      div.append("Address: " + nodeInfo.ip + '<br>');
      div.append("Port: " + nodeInfo.group + '<br><br>');
      div.append("Nessus ID: " + nodeInfo.id + '<br>');
    }
    div.append("Title: " + idData.title + '<br>');
    if(idData.family && idData.family !== "")
      div.append("Family: " + idData.family + '<br>');
    div.append('<br>');
    if(idData.synopsis && idData.synopsis !== "")
      div.append("Synopsis: " + idData.synopsis + '<br><br>');
    if(idData.description && idData.description !== "")
      div.append("Description: " + idData.description + '<br><br>');
    if(idData.updateInfo && idData.updateInfo !== "")
      div.append("UpdateInfo: " + idData.updateInfo + '<br><br>');
    if(idData.solution && idData.solution !== "")
      div.append("Solution: " + idData.solution);
    /* //TODO deal with these later.
    div.append("bugtraqList: "   + idData.bugtraqList);
    div.append("cveList: "       + idData.cveList);
    div.append("otherInfoList: " + idData.otherInfoList);
    */
    div.append('</p>');

  }
});

var TreemapView = Backbone.View.extend({

  initialize: function() {
    // listen for model changes
    this.model.on('change:data', this.render, this);

    // globals
    this.margin = {top: 20, right: 20, bottom: 0, left: 0};
    this.width = 960;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.formatNumber = d3.format(',d');
    this.transitioning = false;

    // init treemap
    this.x = d3.scale.linear()
        .domain([0, this.width])
        .range([0, this.width]);
    
    this.y = d3.scale.linear()
        .domain([0, this.height])
        .range([0, this.height]);
    
    this.treemap = d3.layout.treemap()
        .children(function(d, depth) { return depth ? null : d.values; })
        .sort(function(a, b) { return a.value - b.value; })
        .ratio(this.height / this.width * 0.5 * (1 + Math.sqrt(5)))
        .round(false);
    
    this.svg = d3.select('#vis')
      .append('svg')
        .attr('width', this.width + this.margin.left + this.margin.right)
        .attr('height', this.height + this.margin.bottom + this.margin.top)
        .style('margin-left', -this.margin.left + 'px')
        .style('margin-right', -this.margin.right + 'px')
      .append('g')
        .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
        .style('shape-rendering', 'crispEdges');
    
    this.grandparent = this.svg.append('g')
        .attr('class', 'grandparent');
    
    this.grandparent.append('rect')
        .attr('y', -this.margin.top)
        .attr('width', this.width)
        .attr('height', this.margin.top);
    
    this.grandparent.append('text')
        .attr('x', 6)
        .attr('y', 6 - this.margin.top)
        .attr('dy', '.75em');
  },

  render: function(){
    var root = this.model.get('data');
    var app = this;

    // define the colors here
    var nodeColor = d3.scale.linear()
      .domain([0.0, 2.0, 10.0])
      .range([d3.hsl("#F1EEF6"), d3.hsl("#BDC9E1"), d3.hsl("#2B8CBE")]); 


    var nodeColorFixed = d3.scale.linear()
      .domain([0.0, 10.0])
      .range([d3.hsl("#AAAAAA"), d3.hsl("#405E50")]); 
      // old: .range([d3.hsl("#FEE6CE"), d3.hsl("#4DAF4A")]); // white-green
    
    var nodeColorNew = d3.scale.linear()
      .domain([0.0, 10.0])
      .range([d3.hsl("#AAAAAA"), d3.hsl("#AD009F")]); 
      // old: .range([d3.hsl("#FEE6CE"), d3.hsl("#984EA3")]); // white-red

    
    var nodeColorOpen = d3.scale.linear()
      .domain([0.0, 10.0])
      .range([d3.hsl("#AAAAAA"), d3.hsl("#FFCF40")]); 
      // old: .range([d3.hsl("#FEE6CE"), d3.hsl("#FF7F00")]); // white-orange


  
    initialize(root);
    layout(root);
    display(root);
  
    function initialize(root) {
      root.x = root.y = 0;
      root.dx = app.width;
      root.dy = app.height;
      root.depth = 0;
    }
  
    function maxIndex(arr){
      var max_index = -1;
      var max_value = Number.MIN_VALUE;
      for(var i = 0; i < arr.length; i++)
      {
        if(arr[i] > max_value)
        {
          max_value = arr[i];
          max_index = i;
        }
      }
      return max_index;
    }
  
    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {
      if (d.values) {
        app.treemap.nodes({values: d.values});
        d.values.forEach(function(c) {
          c.x = d.x + c.x * d.dx;
          c.y = d.y + c.y * d.dy;
          c.dx *= d.dx;
          c.dy *= d.dy;
          c.parent = d;
          layout(c);
        });
      }
    }
  
  
    // tells you if the selected element is at the bottom of the hierarchy
    // which is an id, in our case...
    function atTheBottom(d){
      if(d.values && d.values.length === 1 && d.values[0].vulnid)
        return true;
      else
        return false;
    }
  
    function display(d) {
      app.grandparent
        .datum(d.parent)
        .on('click', transition)
        .select('text')
        .text( name(d));
  
      // TODO our resize woes come from here
      var g1 = app.svg.insert('g', '.grandparent')
        .datum(d)
        .attr('class', 'depth');
  
      var g = g1.selectAll('g')
        .data(d.values)
        .enter().append('g');
  
      g.filter(function(d) { return d.values; })
        .classed('children', true)
        .attr('id', function(d) { return 'IP' + (d.key).replace(/\./g, ''); })
        .on('click', function(d) {
          if(!atTheBottom(d))
            transition(d);
        })
        .on('mouseover', function(d) {
          // TODO would be better as "if at id level"
          // note: d is the treemap node, d.values contains the actual events
          if(atTheBottom(d)){
            var info = d.values[0];

            // trigger app event
            // TODO app.options.app is messy; consider changing app
            app.options.app.trigger('nessusIDSelected', info);

            // make text bold to indicate selection
            d3.select(this).select('text')
            .style('font-weight', 'bold'); 
          }
            
          // TODO Lane see if this is necessary, it may just bring text to 
          //  front, which can be annoying
          d3.select(this).moveToFront();
  
          d3.select(this).select('.parent')
            .style('stroke', 'black')
            .style('stroke-width', '2px');
  
        })
        .on('mouseout', function(d) {
        
            d3.select(this).select('.parent')
              .style('stroke', '')
              .style('stroke-width', '');

            // fix any bolding
            d3.select(this).select('text')
              .style('font-weight', 'normal');
  
        });
  
      // NOTE: can move the .style here to rect() to color by cell
      g.selectAll('.child')
        .data(function(d) { return d.values || [d]; })
        .enter().append('rect')
        .attr('class', 'child')
        .style('fill', function(d) { 
            // if status, use appropriate color scale
            if(d.state){
              // reset d.state here according to max counts
              // TODO Lane this is a hack, you can probably do this inline
              var maxStateIndex = maxIndex([d.fixedCount, d.newCount, d.openCount]);
  
              d.state = maxStateIndex === 0 ? 'fixed' : maxStateIndex === 1 ? 'new' : 'open';
  
              // choose which scale to use
              if(d.state === 'new')
                return nodeColorNew(d.cvss);
  
              if(d.state === 'open')
                return nodeColorOpen(d.cvss);
  
              if(d.state === 'fixed')
                return nodeColorFixed(d.cvss);
            }
  
            return nodeColor(d.cvss);
        })
      .call(rect);
  
      g.append('rect')
        .attr('class', 'parent')
        .call(rect)
        .text(function(d) { return app.formatNumber(d.value); })
        .append('title').text(function(d) { return d.key; });
  
      // append label for this node, if it's too small, don't show it
      g.append('text')
        .attr('dy', '.75em')
        .attr('text-anchor', 'left')
        .text(function(d) { 
          return d.key;
        })
        .classed('rectlabel', true)
        .call(text);
  
      function transition(d) {
        if (app.transitioning || !d){ 
          return; 
        }
  
        app.transitioning = true;
  
        var g2 = display(d),
            t1 = g1.transition().duration(1250),
            t2 = g2.transition().duration(1250);
  
        // Update the domain only after entering new elements.
        app.x.domain([d.x, d.x + d.dx]);
        app.y.domain([d.y, d.y + d.dy]);
  
        // Enable anti-aliasing during the transition.
        app.svg.style('shape-rendering', null);
  
        // Draw child nodes on top of parent nodes.
        app.svg.selectAll('.depth').sort(function(a, b) { return a.depth - b.depth; });
  
        // Fade-in entering text.
        g2.selectAll('text').style('fill-opacity', 0);
  
        // Transition to the new view.
        t1.selectAll('text').call(text).style('fill-opacity', 0);
        t2.selectAll('text').call(text).style('fill-opacity', 1);
        t1.selectAll('rect').call(rect);
        t2.selectAll('rect').call(rect);
  
        // Remove the old node when the transition is finished.
        t1.remove().each('end', function() {
          app.svg.style('shape-rendering', 'crispEdges');
          app.transitioning = false;

          // select all labels in the treemap and make sure they fit
          // TODO better transition sequence here using fill-opacity
          d3.selectAll('.rectlabel')
            .transition()
            .text(function(d) { 
              // note: stringWidth is a custom d3 function defined in util.js
              var nodeWidth   = d3.stringWidth(d3.select(this.parentNode), d.key, null, 'rectlabel')
                , parentWidth = d3.select(this.parentNode).select('.parent').attr('width');

              return nodeWidth < parentWidth ? d.key : "..."; 
            });

        });
      }
  
      return g;
    }
  
    function text(t) {
      t.attr('x', function(d) { return app.x(d.x) + 6; })
       .attr('y', function(d) { return app.y(d.y) + 6; });
    }
  
    function rect(r) {
      r.attr('x', function(d) { return app.x(d.x); })
       .attr('y', function(d) { return app.y(d.y); })
       .attr('width', function(d) { return app.x(d.x + d.dx) - app.x(d.x); })
       .attr('height', function(d) { return app.y(d.y + d.dy) - app.y(d.y); });
    }
  
    function name(d) {
      return d.parent ?
        name(d.parent) + '_' + d.key :
        d.key;
    }
  }, 
  
  resize: function(){
    this.width = $('#vis').width();
    this.x.domain([0, this.width]).range([0, this.width]);
    d3.select("#vis > svg").attr("width", this.width + this.margin.left + this.margin.right);
    d3.selectAll(".grandparent rect").attr("width", this.width);
    this.treemap.ratio(this.height / this.width * 0.5 * (1 + Math.sqrt(5)));

    // if we don't do this here, we get duplicate .depth divs on each resize
    d3.selectAll('.depth').remove();

    this.render();
  }

});

// The router is our entire app
var NV = new (Backbone.Router.extend({
  routes: {
    "": "index"
  },

  // instantiate/link views and models
  initialize: function(){
    // the crossfilter holder
    this.nessus           =  new Nessus({
                             dimensions: [ 'ip', 
                                           'port',
                                           'cvss',
                                           'vulnid',
                                           'vulntype']
                           });

  // models and views

    // cvss (severity) histogram
    
    this.cvssHistogram        =   new Histogram({  
                                  app: this,
                                  datasource: this.nessus, 
                                  bins: 10, 
                                  range: [0, 10], 
                                  filterOptions: { attribute:'cvss' }
                               });

   this.cvssHistogramView    =   new HistogramView({
                                 app: this,
                                 model: this.cvssHistogram,
                                 target:'#cvssHistogram',
                                 barwidth: 15,
                                 w: 180,
                                 h: 165,
                                 title: 'cvss'
                              });

    // vulnerability type histogram

      // NOTE: This is a hack to make categorical histograms.
      // If d3 somehow supports non-numerical histograms, we can remove this
      // and lighten the histogram model considerably.
      var vulnTypeMap = d3.scale.ordinal()
          .domain(['hole', 'port', 'note'])
          .range([1,2,3]);

      this.vulnTypeHistogram  =   new Histogram({  
                                  app: this,
                                  datasource: this.nessus, 
                                  bins: 3, 
                                  datamap: vulnTypeMap,
                                  filterOptions: {
                                    attribute: 'vulntype'
                                  }
                              });

      this.vulnTypeHistogramView    =   new HistogramView({
                                 app: this,
                                 model: this.vulnTypeHistogram,
                                 target:'#vulnTypeHistogram',
                                 barwidth: 20,
                                 w: 100,
                                 h: 165,
                                 title: 'vuln type'
                              });

    // top notes histogram

    this.topNoteHistogram    =   new Histogram({  
                                  app: this,
                                  datasource: this.nessus, 
                                  limit: 5,
                                  filterOptions: {
                                    attribute: 'vulnid',
                                    filters: [
                                      { attribute:'vulntype', exact:'note' }
                                    ]
                                  }
                               });

    this.topNoteHistogramView    =   new HistogramView({
                                  app: this,
                                  model: this.topNoteHistogram,
                                  target:'#topNoteHistogram',
                                  barwidth: 30,
                                  w: 180,
                                  h: 165,
                                  title: 'top notes'
                               });
 
    // top holes histogram

    this.topHoleHistogram    =   new Histogram({  
                                  app: this,
                                  datasource: this.nessus, 
                                  limit: 5,
                                  filterOptions: {
                                    attribute: 'vulnid',
                                    filters: [
                                      { attribute:'vulntype', exact:'hole' }
                                    ]
                                  }
                              });

    this.topHoleHistogramView    =   new HistogramView({
                                     app: this,
                                     barwidth: 30,
                                     model: this.topHoleHistogram,
                                     target:'#topHoleHistogram',
                                     w: 180,
                                     h: 165,
                                     title: 'top holes'
                                });


    // treemap
    this.treemap    =   new Treemap({  
                                  app: this,
                                  datasource: this.nessus, 
                                  filterOptions: {
                                    attribute: 'vulnid'
                                  }
                              });

    this.treemapView    =   new TreemapView({
                                     app: this,
                                     model: this.treemap,
                                     target:'#vis'
                                });



    // info view
    this.nessusInfo    =   new NessusInfo({  
                                  app: this,
                                  datasource: this.nessus
                              });

    this.nessusInfoView    =   new NessusInfoView({
                                     app: this,
                                     model: this.nessusInfo,
                                     target:'#nessusinfo'
                                });

  },

  // called from outside the app
  start: function(){
    Backbone.history.start();
  }

}))();

// NOTE: in comments 'bb' === 'backbone'

// TODO Lane move this to the nessus bb model
var isChangeVis = false;


// TODO Mike do we need these? -Lane
var eventList;
var nbeText1 = "";
var nbeText2 = "";


// TODO Lane Mike the sizeBy functions are currently connected directly to 
// buttons in index.html. We should create a bb view for the div id="sizeoptions" 
// so we can handle these via bb events.
function sizeBySeverity() {
   NV.treemap.set('sizeOption', 'cvss'); 
}

function sizeByCriticality() {
   NV.treemap.set('sizeOption', 'criticality'); 
}

function sizeByCount() {
   NV.treemap.set('sizeOption', 'value'); 
}


// Sets the main Backbone data model
function setNBEData(dataset){
  NV.nessus.setData(dataset);
}


var groupList = [];

function handleGroupAdd(){
  //TODO make sure each IP is only in one group(?)
  //TODO should really be able to remove groups also ...
  var start = $("#ipStart").val();
  var end = $("#ipEnd").val();
  var groupName = $("#groupName").val();
  var weight = $("#defaultWeight").val();
  var newGroup = {"start":start, "end":end, "groupName":groupName, "weight":weight};
  groupList.push(newGroup);
  console.log("added group: " + JSON.stringify(newGroup));
  console.log("group list now contains: " + JSON.stringify(groupList));
  updateCurrentGroupTable(); //why is this needed here?  Somehow affects table re-drawing?
}

function handleDataPageAdd(){
  console.log("Data page add button");
}

function handleDataTab1(){
  console.log("Data tab 1 active");
  eventList = null; //in case it's changed.
}

function handleGroupsTab(){
  console.log("Groups tab active");
  if( ! eventList ) updateEventList();
  updateCurrentGroupTable();
}

function handleVisTab(){
  console.log("Vis tab active");
  if( ! eventList ) updateEventList(); //in case groups tab did not set it.
}

function updateEventList(){
  var nbeItems1 = "",
      nbeItems2 = "";

  nbeItems1 = parseNBEFile( nbeText1 );
  eventList = nbeItems1;
  if(nbeText2.trim() !== ""){
    isChangeVis = true;
    nbeItems2 = parseNBEFile( nbeText2 );
    eventList = mergeNBEs(nbeItems1, nbeItems2);
  }
}

function updateCurrentGroupTable(){

  if( ! eventList ){ //have never seen this happen, but leaving in for now --mdi
    console.log("updateCurrentGroupTable needed to update eventList: this is unexpected.");
    updateEventList();
  }

  //build default group list
//  console.log("event list is " + JSON.stringify(eventList));
  var ips = findIPsInList(eventList);
  //console.log("have these IPs: " + JSON.stringify(ips));

  //add to the default group.
  //NOTE we are building this list of groups:ips, instead of the two seperate lists we already have, so that all machines in a group are next to each other in the table.  TODO might be cleaner to just do this in buildTable?  No other fns need this list currently.
  groups = {};
  for( var i=0; i < ips.length; i++ ){
    var groupName = findGroupName(ips[i]);
    var weight = 1; //default
    for(var j=0; j<groupList.length; j++){
      if(groupList[j].groupName === groupName){
        weight = groupList[j].weight;
      }
    }
    var entry = {"ip": ips[i], "weight": weight};
    console.log("found that ip " + ips[i] + " is in group " + groupName);
    if( !groups[groupName] ){
      groups[groupName] = [];
    }
    groups[groupName].push(entry);
  }

  //console.log("current group list is: " + JSON.stringify(groups) );

  //display the (default) groups and weights for all machines.
  buildTable(groups);

  //add group name to item in crossfilter
  eventList = addGroupInfoToData(groups, eventList);

  // sets the backbone data model
  setNBEData(eventList);
}

//TODO
//this will be somewhat slow, O(n^2), no easy way around it.
//note this will modify nbeItems2 and not modify nbeItems1.  Can change this if needed later.
function mergeNBEs(nbeItems1, nbeItems2){
  var result = [];
  function compareEntries(a, b){ //true if equal, false if not
    if(a.ip === b.ip && a.vulnid === b.vulnid && a.vulntype === b.vulntype && a.cvss === b.cvss && a.port === b.port){
      return true;
    }
    else {
      return false;
    }
  }

  var openItems = 0;
  var changedItems = 0;
  //iterate through first list, find matching items in second list. mark them 'open' in result and remove from second list.
  //if no matching item is found, mark it as 'changed' in first.
  var found;
  for(var i=0; i<nbeItems1.length; i++){
    found = false;
    for(var j=0; j<nbeItems2.length; j++){
      if( compareEntries(nbeItems1[i], nbeItems2[j]) ){
        found = true;
        var item = nbeItems1[i];
        item.state = 'open';
        result.push(item);
        nbeItems2.splice(j, 1);
        openItems +=1;
        break;
      }
    }
    if(found === false){
      var item = nbeItems1[i];
      item.state = 'fixed';
      result.push(item);
      changedItems +=1;
    }
  }
  console.log("open items: " + openItems);
  console.log("changed items: " + changedItems);
  console.log("new items: " + nbeItems2.length);
  //handle items remaining in second list. (append to result list, mark 'new')
  while( nbeItems2.length > 0){
    var item = nbeItems2.pop();
    item.state = 'new';
    result.push(item);
  }

  return result;
}

function findIPsInList(eventList){
  var ips = {}; //making a fake set here.
  for( var i=0; i < eventList.length; i++ ){
    ips[eventList[i].ip] = true;
  }
  ips = Object.keys(ips); //only need to keep this
  return ips;
}

function findGroupName(ip){
  var testAddr = ip.split('.');
  if( testAddr.length !== 4){
    throw "address of " + groupList[i].end + " is invalid";
  }

  function isAfter(start, test){ //after or equal will return true
    for(var i=0; i<4; i++){
      if(parseInt(start[i]) > parseInt(test[i])){
        return false;
      }
    }
    return true;
  }

  function isBefore(end, test){ //before or equal
    return isAfter(test, end);
  }

  //grouplist contains a list of {start, end, groupName, weight}
  for(var i=0; i<groupList.length; i++){
    var start = groupList[i].start.split('.')
    if( start.length !== 4){
      throw "start address of " + groupList[i].start + " is invalid";
    }
    var end = groupList[i].end.split('.')
    if( end.length !== 4){
      throw "end address of " + groupList[i].end + " is invalid";
    }
    console.log(groupList[i].groupName + ": isAfter(" + groupList[i].start + ", " + ip + ") returned " + isAfter(start, testAddr) );
    console.log(groupList[i].groupName + ": isBefore(" + groupList[i].end  + ", " + ip + ") returned " + isBefore(end, testAddr) );
    if( isAfter(start, testAddr) && isBefore(end, testAddr) ){
      return groupList[i].groupName;
    }
  }
  return "none"; //not found; "none" is the default label for table.
}

function addGroupInfoToData(groups, eventList){
  var events = [];
  var ips = {}; //make a map of ip:{group, weight}
  var groupNames = Object.keys(groups);
  for( var j=0; j < groupNames.length; j++ ){
    var machines = groups[groupNames[j]];
    for( var i=0; i < machines.length; i++ ){
      ips[machines[i]["ip"]] = {"group": groupNames[j], "weight": machines[i]["weight"]}
    }
  }

  for( var i=0; i < eventList.length; i++ ){
    events.push(eventList[i])
    events[i].group  = ips[eventList[i].ip].group
    events[i].criticality = parseInt(ips[eventList[i].ip].weight)
  }
  return events;
}

function buildTable(groups){
  $('#currentGroupTable').select('tbody').html("");
  var weightSelector, row;
  var groupNames = Object.keys(groups);
  for( var j=0; j < groupNames.length; j++ ){
    var machines = groups[groupNames[j]];
    for( var i=0; i < machines.length; i++ ){
      weightSelector = '<select class="weightSelect" id="weightSelect' + machines[i]["ip"].split('.').join('_') + '"';
      weightSelector += '><option value="1">1 (lowest)</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10 (highest)</option></select>';
      row = '<tr>';
      row += '<td>'+ groupNames[j] +'</td><td>'+ machines[i]["ip"] +'</td>';
      row += '<td>'+ weightSelector +'</td>';
      row += '</tr>';
      $('#currentGroupTable').select('tbody').append(row);
      $('#weightSelect' + machines[i]["ip"].split('.').join('_') ).children().eq(machines[i]["weight"]-1).attr("selected","selected");
      //console.log( $('#weightSelect' + machines[i]["ip"].split('.').join('_') ).select('option').eq(machines[i]["weight"]-1).html() );
    }
  }
}

//TODO has to be on a server for this to work?  Go figure.
//rather loosely based on these examples http://www.html5rocks.com/en/tutorials/file/dndfiles/
var handleFileSelect = function (element) {
  
  var holder = document.getElementById(element);
  
  if (typeof window.FileReader === 'undefined') {
    $('#file-status').css('display', 'block');
    $('#file-status').addClass('alert-error');
    console.log('FileReader not supported');
  } 
  else {
    console.log('FileReader supported');
  }
 
  holder.ondragover = function () { 
    this.className = 'hover'; 
    return false; 
  };
  
  holder.ondragend = function () { 
    this.className = ''; 
    return false; 
  };
  
  holder.ondrop = function (e) {
    this.className = '';
    e.preventDefault();

    var files = e.dataTransfer.files,
        f = files[0],
        reader = new FileReader();
                      
    reader.readAsText(f); //utf-8 encoding is default

    reader.onload = function (event) {
      // if this is the first file, load to nbeText1
      // if not, then any additional files are saved to nbeText2
      if ( nbeText1.trim() === '' ) {
        nbeText1 = event.target.result;
      }
      else {
        nbeText2 = event.target.result;
      }
      console.log('Loaded file: ' + f.name);
      $('#file-status').css('display', 'block');
      $('#file-status').addClass('alert-success');
      $('#file-status').html('File ' + f.name + ' loaded.');
    };

    reader.onerror = function() {
      $('#file-status').css('display', 'block');
      $('#file-status').addClass('alert-error');
      $('#file-status').html('could not parse file ' + f.name + ' as text');
    }

    return false;
  };
  
  
  
}

var vulnIdInfo = {};

// initialization
$().ready(function () {

  handleFileSelect('file-drop');

  // set up needed event listeners, etc.
  $('#addGroupBtn').bind('click', function(event) {
    handleGroupAdd();
  });
  $('#dataTab1Link').bind('click', function(event) {
    handleDataTab1();
  });
  $('#groupsTabLink').bind('click', function(event) {
    handleGroupsTab();
  });
  $('#visTabLink').bind('click', function(event) {
    handleVisTab();
  });

  //TODO kind of a dumb reason to need a server running...
  // -- true, maybe we could just put the vulnids in a js file and include in the html?
  $.get("data/vulnIDs.json", function(data) {
    console.log("Got the vulnIDs JSON file!");
    //console.log(data)
    tempData = data;//JSON.parse(data);
    tempKeys = Object.keys(tempData);
    for(var i=0; i<tempKeys.length; i++){
      //console.log( tempData[tempKeys[i]])
      vulnIdInfo[tempKeys[i]] = tempData[tempKeys[i]];
    }
    //var resp = $(data); // Now you can do whatever you want with it
    //$("#contentMain", resp).appendTo("#nessusinfo");
  });

});

//var sys = require("util")

/**
 * Parses a nessus result line and handles missing fields.
 * @param nessStr - nbe result string line
 * @return - structure containing th eip, vulnid, vulntype, cvss and port
 */
var parseNessusResult = function(nessStr){
    var scoreReg = /CVSS Base Score : (\d+\.\d+)/;

    var portReg = /\D+ \((\d{1,7})\D+\)/;
    var splitNess = nessStr.split("|");
    var ip = splitNess[2];
    var code = parseFloat(splitNess[4]);
    var holeNote = splitNess[5];
    if(scoreReg.test(nessStr)){
        var score = parseFloat(scoreReg.exec(nessStr)[1]);
    }
    else{
        var score = 1.0;
    }
    if(portReg.test(nessStr)){
        var port = parseFloat(portReg.exec(nessStr)[1]);
    }
    else{
        var port = 'notes';
    }
    

    return {"ip": (ip === undefined ? "" : ip),
        "vulnid": (isNaN(code) ? 0 : code),
        "vulntype":(holeNote === undefined ? "" : holeNote.indexOf('Note') !== -1 ? 'note' : 'hole'),
        "cvss": score,
        "value": 1,
        "port":port};
}

/**
 * @param stampString - timestamp line from an NBE file.
 * @return - milliseconds between epoch and the time in the stamp.
 */
var parseNessusTimeStamp = function(stampString){
    var moment = require("moment")
    var timeFormat = "ddd MMM DD HH:mm:ss YYYY"
    var splitInput = stampString.split("|")
    
    var time = moment(splitInput[splitInput.length - 2], timeFormat)
    //var time = splitInput[splitInput.length - 2]
    return time.valueOf()
}

/**
 * @param line - line to be tested.
 * @return - returns true if the line is a time line containing a timestamp.
 */
var hasTime = function(line){
    var splits = line.split("|")
    return (splits[splits.length - 2].length > 0 && splits[0] == "timestamps")
}

/**
 * @param line - line to be tested.
 * @return - returns true if the line is a result line and false otherwise.
 */
var isResult = function(line){
    return(line.split("|")[0] === "results")
}

/**
 * @param nbe - a string representing the contents of a NBE file.
 * @return - array where each entry is a result from the NBE file.
 */
var parseNBEFile = function(nbe){
    var lines = nbe.split("\n")
    var currentTime = 0
    var returnArray = new Array(2)

    for(var i = 0; i < lines.length; i++){
        if(isResult(lines[i])){
            returnArray.push(parseNessusResult(lines[i]))
        }
    }
    return returnArray.filter(function(){return true});//removes nulls
}

//module.exports.parseNessusResult = parseNessusResult;
//module.exports.parseNessusTimeStamp = parseNessusTimeStamp;
//module.exports.parseNBEFile = parseNBEFile;
