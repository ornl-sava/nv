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
        .style('margin.right', -this.margin.right + 'px')
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
    // TODO entire treemap here, layout and all
    var root = this.model.get('data');
    var app = this;
  
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
        .text(name(d));
  
      var g1 = app.svg.insert('g', '.grandparent')
        .datum(d)
        .attr('class', 'depth');
  
      var g = g1.selectAll('g')
        .data(d.values)
        .enter().append('g');
  
      //TODO - Lane - move to front
      g.filter(function(d) { return d.values; })
        .classed('children', true)
        .attr('id', function(d) { return 'IP' + (d.key).replace(/\./g, ''); })
        .on('click', function(d) {
          // if(atTheBottom(d)){
          //     console.log(d);
          //   console.log('at da bottom: '+ d.values[0].vulnid + ' val is: ' + JSON.stringify(vulnIdInfo[d.values[0].vulnid])); //WORKS!
          //   console.log( d );
          //   var nodeInfo = {id: d.values[0].vulnid, 
          //     type: d.values[0].vulntype, 
          //     port: d.values[0].port, 
          //     ip:   d.values[0].ip, 
          //     group: d.values[0].group};
          //   console.log( nodeInfo );
          //   // TODO Mike Lane trigger nessus update here
          //   setNessusIDData( vulnIdInfo[d.values[0].vulnid], nodeInfo );
          //   // setNessusIDData(findNessusIDData(d.values[0].vulnid));
          //     d3.select(this).select('text')
          //       .style('font-weight', 'bold')
          //       .attr('id', 'changeable');
  
          //     d3.select(this).select('.child')
          //       .style('stroke', 'black')
          //       .style('stroke-width', '5px');
          // } else {
            transition(d);
  //        }
        })
        .on('mouseover', function(d) {
            
            d3.select(this).moveToFront();
  
            d3.select(this).select('.parent')
              .style('stroke', 'black')
              .style('stroke-width', '2px');
  
        })
        .on('mouseout', function(d) {
        
            d3.select(this).select('.parent')
              .style('stroke', '')
              .style('stroke-width', '');
  
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
        .text(function(d) { return app.formatNumber(d.value); });
  
      g.append('text')
        .attr('dy', '.75em')
        .text(function(d) { return d.key; })
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
    this.render();
  }

});
