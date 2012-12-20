var TreemapView = Backbone.View.extend({

  initialize: function() {
    // listen for model changes
    this.model.on('change:data', this.render, this);
    this.options.app.on('hierarchyChange', this.render, this);
    this.options.app.on('resize', this.resize, this);

    // globals
    this.margin = {top: 20, right: 20, bottom: 0, left: 0};
    this.width = 960; 
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.formatNumber = d3.format(',d');
    this.transitioning = false;

    // init treemap scales and layout
    this.x = d3.scale.linear();
    this.y = d3.scale.linear();
    this.treemap = d3.layout.treemap();
    
    // add svg and group to the vis
    this.svg = d3.select('#vis')
      .append('svg')
      .append('g');
    
    // append grandparent (the clickable rect at top of treemap)
    this.grandparent = this.svg.append('g')
      .attr('class', 'grandparent');
    
    // add rect and text to grandparent
    this.grandparent.append('rect');
    this.grandparent.append('text');
  },

  render: function(){
    var root = this.model.get('data');
    var self = this;

    // remove all .depth, since subsequent renders produce duplicates
    d3.selectAll('.depth').remove();

    // get container width
    this.width = $('#vis').width();

    // set up x and y scales
    self.x.domain([0, self.width])
      .range([0, self.width]);

    self.y.domain([0, self.height])
      .range([0, self.height]);

    // set up treemap layout
    self.treemap.children(function(d, depth) { return depth ? null : d.values; })
      .sort(function(a, b) { return a.value - b.value; })
      .ratio(self.height / self.width * 0.5 * (1 + Math.sqrt(5)))
      .round(false);

    // set svg dimensions
    d3.select('#vis svg')
      .attr('width', self.width + self.margin.left + self.margin.right)
      .attr('height', self.height + self.margin.bottom + self.margin.top)
      .style('margin-left', -self.margin.left + 'px')
      .style('margin-right', -self.margin.right + 'px');

    // set svg group dimensions (the nodes are drawn here)
    d3.select('#vis svg g')
        .attr('transform', 'translate(' + self.margin.left + ',' + self.margin.top + ')');

    // set grandparent rect dimensions
    d3.select('#vis svg .grandparent rect')
      .attr('y', -this.margin.top)
      .attr('width', this.width)
      .attr('height', this.margin.top);

    // set grandparent text dimensions
    d3.select('#vis svg .grandparent text')
      .attr('x', 6)
      .attr('y', 6 - this.margin.top)
      .attr('dy', '.75em');

    // render the treemap
    initialize(root);
    layout(root);
    display(root);
  
    function initialize(root) {
      root.x = root.y = 0;
      root.dx = self.width;
      root.dy = self.height;
      root.depth = 0;
    }
   
    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1 x 1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent's dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1 x 1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {
      if (d.values) {
        self.treemap.nodes({values: d.values});
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
   
    function display(d) {
      var data = d;

      self.grandparent
        .datum(d.parent)
        .on('click', transition)
        .select('text')
        .text( name(d));
  
      var g1 = self.svg.insert('g', '.grandparent')
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
          // Emit an event with the key 
          self.options.app.trigger('treemap_mouseover', d.key);

          // move this element to front (ensures highlight is visible)
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
          var opt = self.model.get('colorOption');
          var type = 'severity';
          var scale = self.options.color.get(type);

          // if status, use appropriate color scale
          if(d.state){

            // reset d.state here according to max counts
            var maxStateIndex = maxIndex([d.fixedCount, d.newCount, d.openCount]);
  
            d.state = maxStateIndex === 0 ? 'fixed' : maxStateIndex === 1 ? 'new' : 'open';
  
            // choose which scale to use
            if(d.state === 'new')
              scale = self.options.color.get('new');
  
            if(d.state === 'open')
              scale = self.options.color.get('open');
  
            if(d.state === 'fixed')
              scale = self.options.color.get('fixed');
          }

          // if count, change scale
          if( opt === 'count' ){
            self.options.color.makeScales(data.values.length);
          } else {
            self.options.color.makeScales(10.0);
          }

          return scale(d[opt]);
        })
      .call(rect);
  
      // append a rect 
      g.append('rect')
        .attr('class', 'parent')
        .call(rect)
        .text(function(d) { return self.formatNumber(d.value); })
        .append('title').text(function(d) { return d.key; });

      $('.parent').tipsy({ 
        fade: true, 
        delayIn: 777,
        gravity: $.fn.tipsy.autoNS,
        html: true,
        title: function() {
          var d = this.__data__;
          return d.key + 
                 '<br /> max cvss: ' + d.cvss + 
                 '<br /> vuln count: ' + d.count; 
        }
      });
  
      // append label for this node
      g.append('text')
        .attr('dy', '.75em')
        .attr('text-anchor', 'left')
        .text(function(d) { 
          return d.key;
        })
        .classed('rectlabel', true)
        .call(text);
  
      function transition(d) {
        if (self.transitioning || !d){ 
          return; 
        }
  
        self.transitioning = true;
  
        var g2 = display(d),
            t1 = g1.transition().duration(1250),
            t2 = g2.transition().duration(1250);
  
        // Update the domain only after entering new elements.
        self.x.domain([d.x, d.x + d.dx]);
        self.y.domain([d.y, d.y + d.dy]);
  
        // Enable anti-aliasing during the transition.
        self.svg.style('shape-rendering', null);
  
        // Draw child nodes on top of parent nodes.
        self.svg.selectAll('.depth').sort(function(a, b) { return a.depth - b.depth; });
  
        // Fade-in entering text.
        g2.selectAll('text').style('fill-opacity', 0);
  
        // Transition to the new view.
        t1.selectAll('text').call(text).style('fill-opacity', 0);
        t2.selectAll('text').call(text).style('fill-opacity', 1);
        t1.selectAll('rect').call(rect);
        t2.selectAll('rect').call(rect);
  
        // Remove the old node when the transition is finished.
        t1.remove().each('end', function() {
          self.svg.style('shape-rendering', 'crispEdges');
          self.transitioning = false;

          // remove oversized labels after a transition
          labelSizeTweak();
        });
      }
  
      // remove any oversized labels before returning
      labelSizeTweak();

      return g;
    }

    // tells you if the selected element is at the bottom of the hierarchy
    // which is an id, in our case...
    function atTheBottom(d){
      if(d.values && d.values.length === 1 && d.values[0].vulnid)
        return true;
      else
        return false;
    }

    // return the max index in an array
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

    function labelSizeTweak(){
      // select all labels in the treemap and make sure they fit
      d3.selectAll('.rectlabel')
        .transition()
        .text(function(d) { 
          // note: stringWidth is a custom d3 function defined in util.js
          var parentWidth = d3.select(this.parentNode).select('.parent').attr('width')
            , nodeWidth   = d3.stringWidth(d3.select(this.parentNode), d.key, null, 'rectlabel');

          return nodeWidth < parentWidth ? d.key : "..."; 
        });
    }
      
    function text(t) {
      t.attr('x', function(d) { return self.x(d.x) + 6; })
       .attr('y', function(d) { return self.y(d.y) + 6; });
    }
  
    function rect(r) {
      r.attr('x', function(d) { return self.x(d.x); })
       .attr('y', function(d) { return self.y(d.y); })
       .attr('width', function(d) { return self.x(d.x + d.dx) - self.x(d.x); })
       .attr('height', function(d) { return self.y(d.y + d.dy) - self.y(d.y); });
    }
  
    function name(d) {
      return d.parent ?
        name(d.parent) + '_' + d.key :
        d.key;
    }
  }, 
  
  resize: function(){
    // set this view's width based on the new container width
    this.width = $('#vis').width();

    // reset the x scale domain
    this.x.domain([0, this.width]).range([0, this.width]);

    // resize our svg (and grandparent)
    d3.select("#vis > svg").attr("width", this.width + this.margin.left + this.margin.right);
    d3.selectAll(".grandparent rect").attr("width", this.width);
    this.treemap.ratio(this.height / this.width * 0.5 * (1 + Math.sqrt(5)));

    this.render();
  }

});
