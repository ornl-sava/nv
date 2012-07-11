/*
 * nv.js
 *
 * TODO NOTE to Mike: the parser can use setNBEData(dataset) to set nbedata and call redraw
 *
 * Here are the divs in nv.html:
 * - id="vis"
 * - id="options"
 * - id="edit"
 * - id="nessusinfo"
 * - id="histograms"
 */

//$.get("http://codementum.org", function(data) {
//  var resp = $(data); // Now you can do whatever you want with it
//  $(".hero-unit", resp).appendTo("body");
//});

//$.get("http://www.nessus.org/plugins/index.php?view=single&id=42118/", function(data) {
//  var resp = $(data); // Now you can do whatever you want with it
//  $("#contentMain", resp).appendTo("#nessusinfo");
//});

//$.getJSON('http://www.panoramio.com/wapi/data/get_photos?v=1&key=dummykey&tag=test&offset=0&length=20&callback=?&minx=-30&miny=0&maxx=0&maxy=150', 
//    function(json) {
//      alert(json.photos[1].photoUrl);
//});

// colors
// http://colorbrewer2.org/index.php?type=sequential&scheme=Oranges&n=3
var nodeColor = d3.scale.linear()
    .domain([0.0, 10.0])
    .range([d3.hsl("#FEE6CE"), d3.hsl("#FDAE6B"), d3.hsl("#E6550D")]); // white-orange
    //.range(["hsl(62,100%,90%)", "hsl(228,30%,20%)"]); // yellow blue

// LabelMaps are used to find a label given a number (in initHistogram)
var vulntypeLabelMap = ["hole", "note", "port"];

// NumberMaps are used to find a number given a label (in drawHistogram)
var vulntypeNumberMap = d3.scale.ordinal()
      .domain(vulntypeLabelMap)
      .range([1,2,3]);

// globals
var margin = {top: 20, right: 0, bottom: 0, left: 0},
    width = 960,
    height = 500 - margin.top - margin.bottom,
    formatNumber = d3.format(",d"),
    transitioning;

// All the data!
var nbedata,
    all,
    byIP,
    byPort,
    byCVSS,
    byVulnID,
    byVulnType;

// crossfilter setup
function crossfilterInit(){
  // sets/resets our data
  nbedata = crossfilter();

  // dimensions/groups
  all = nbedata.groupAll(),
  byIP = nbedata.dimension(function(d) { return d.ip; }),
  byAny = nbedata.dimension(function(d) { return d; }),
  byPort = nbedata.dimension(function(d) { return d.port; }),
  byCVSS = nbedata.dimension(function(d) { return d.cvss; }),
  byVulnID = nbedata.dimension(function(d) { return d.vulnid; }),
  byVulnType = nbedata.dimension(function(d) { return d.vulntype; });
}

// treemap globals
var x,
    y,
    treemap,
    svg,
    grandparent;

function init() {

  //TODO - Evan - buttons
  d3.select("#options").append("button")
    .classed("btn btn-primary", true)
    .text("Severity")
    .on("click", function() { console.log("Severity was clicked"); });
  d3.select("#options").append("button")
    .classed("btn btn-primary", true)
    .text("Criticality")
    .on("click", function() { console.log("Criticality was clicked"); });
  d3.select("#options").append("button")
    .classed("btn btn-primary", true)
    .text("Counts")
    .on("click", function() { console.log("Counts was clicked"); });


  // initialize treemap
  initTreemap();

  // initialize histograms
  initHistogram("#histograms", 10, "cvssHistogram");
  initHistogram("#histograms", 3, "vulnTypeHistogram", vulntypeLabelMap);
  initHistogram("#histograms", 20, "top20NoteHistogram");
  initHistogram("#histograms", 20, "top20HoleHistogram");

  // load treemap data (sets nbedata which calls drawTreemap() after it loads)
  // this should be commented out when we receive data from the parser
  loadJSONData('../../data/testdata/testdata7.json');

  // test changes of data using timeouts
  //window.setTimeout(function() { loadJSONData('../../data/testdata/testdata6.json'); }, 3000);  
  //window.setTimeout(function() { loadJSONData('../../data/testdata/testdata7.json'); }, 10000);  
}

// called after data load
function redraw() {
  drawTreemap();
  drawHistogram("#cvssHistogram", 10, "cvss");
  drawHistogram("#vulnTypeHistogram", 3, "vulntype", vulntypeNumberMap);
  drawHistogram("#top20NoteHistogram", 20, "vulnid", null, null, "note");
  drawHistogram("#top20HoleHistogram", 20, "vulnid", null, null, "hole");
  //drawHistogram(name, n, par, scale, binWidth, typeFilter) {
}


// treemap functions
function initTreemap(){
  
  x = d3.scale.linear()
      .domain([0, width])
      .range([0, width]);
  
  y = d3.scale.linear()
      .domain([0, height])
      .range([0, height]);
  
  treemap = d3.layout.treemap()
      .children(function(d, depth) { return depth ? null : d.values; })
      .sort(function(a, b) { return a.value - b.value; })
      .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
      .round(false);
  
  svg = d3.select("#vis").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top)
      .style("margin-left", -margin.left + "px")
      .style("margin.right", -margin.right + "px")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .style("shape-rendering", "crispEdges");
  
  grandparent = svg.append("g")
      .attr("class", "grandparent");
  
  grandparent.append("rect")
      .attr("y", -margin.top)
      .attr("width", width)
      .attr("height", margin.top);
  
  grandparent.append("text")
      .attr("x", 6)
      .attr("y", 6 - margin.top)
      .attr("dy", ".75em");
}

function drawTreemap() {
  var root=d3.nest()
    .key(function(d) {return "group";})
    .key(function(d) {return d.ip;})
    .key(function(d) {return d.port;})
    .sortKeys(d3.ascending)
    .entries(byCVSS.top(Infinity)); // TODO lane make work with crossfilter (feed it objects)

  // free the root from its original array
  root = root[0];

  var nodes = [];

  initialize(root);
  accumulate(root);
  layout(root);
  display(root);

  function initialize(root) {
    root.x = root.y = 0;
    root.dx = width;
    root.dy = height;
    root.depth = 0;
  }

  // Aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation.
  function accumulate(d) {
    nodes.push(d);

    d.cvss = accumulateCVSS(d);

    return d.values
      ? d.value = d.values.reduce(function(p, v) { return p + accumulate(v); }, 0)
      : d.value;
  }

  function accumulateCVSS(d){
    return d.values
      ? d.cvss = d.values.reduce(function(p, v) { return Math.max(p, accumulateCVSS(v)); }, 0)
      : d.cvss;
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
      treemap.nodes({values: d.values});
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
    grandparent
      .datum(d.parent)
      .on("click", transition)
      .select("text")
      .text(name(d));

    var g1 = svg.insert("g", ".grandparent")
      .datum(d)
      .attr("class", "depth");

    var g = g1.selectAll("g")
      .data(d.values)
      .enter().append("g");

    g.filter(function(d) { return d.values; })
      .classed("children", true)
      .on("click", transition);

    // NOTE: can move the .style here to rect() to color by cell
    g.selectAll(".child")
      .data(function(d) { return d.values || [d]; })
      .enter().append("rect")
      .attr("class", "child")
      .style("fill", function(d) { 
        return nodeColor(d.cvss);
      })
    .call(rect);

    g.append("rect")
      .attr("class", "parent")
      .call(rect)
      .append("title")
      .text(function(d) { return formatNumber(d.value); });

    g.append("text")
      .attr("dy", ".75em")
      .text(function(d) { return d.key; })
      .classed("rectlabel", true)
      .call(text);

    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;

      var g2 = display(d),
          t1 = g1.transition().duration(1250),
          t2 = g2.transition().duration(1250);

      // Update the domain only after entering new elements.
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);

      // Transition to the new view.
      t1.selectAll("text").call(text).style("fill-opacity", 0);
      t2.selectAll("text").call(text).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);

      // Remove the old node when the transition is finished.
      t1.remove().each("end", function() {
        svg.style("shape-rendering", "crispEdges");
        transitioning = false;
      });
    }

    return g;
  }

  function text(text) {
    text.attr("x", function(d) { return x(d.x) + 6; })
      .attr("y", function(d) { return y(d.y) + 6; });
  }

  function rect(rect) {
    rect.attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y); })
      .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
      .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
  }

  function name(d) {
    return d.parent
      ? name(d.parent) + "." + d.key
      : d.key;
  }
}

//TODO - Evan
// function that initalizes one histogram
//sel       -> d3 selection
//n         -> number of bins
//name      -> name of histogram (id)
//labelmap  -> mapping numbers to labels
//binWidth  -> width of each bar
function initHistogram(sel, n, name, labelmap, binWidth) {
  
  binWidth = binWidth ? binWidth : 20;  //ternary operator to check if binWidth was defined and set binWidth to a default number if it wasn't

  var histoW = binWidth*n,
      histoH = 200;

  var nothing = [];

  for ( var i = 0; i < n; i++) nothing[i] = 0;
  
  var hist = d3.select(sel)
               .append("div")
               .attr("id", name)
               .attr("class", "histogram")
               .append("svg")
               .attr("width", histoW)
               .attr("height", histoH);

  hist.selectAll("rect")
      .data(nothing)
      .enter().append("rect")
      .attr("x", function(d, i) { return (histoW / n)*i - 0.5; })
      .attr("width", histoW / n)
      .attr("y", histoH - n)
      .attr("height", 0.05*histoH)
      .style("fill", "purple")
      .style("stroke", "white");

  // labels
  var labels = d3.range(n);
  
  //x-axis
  hist.selectAll("text#histogramlabel")
      .data(labels)
      .enter().append("text")
      .attr("class", "histogramlabel")
      .attr("x", function(d, i) { return ( (histoW / n)*i ); })
      .attr("y", histoH - 11)
      .text( function(d) { 
        return labelmap ? labelmap[d] : d;
      });

  //title
  hist.append("text")
      .attr("class", "histogramtitle")
      .attr("x", histoW / 2 )
      .attr("y", histoH )
      .text(name);
}

//TODO - Evan
// function that draws one histogram
//name  -> name of histogram (id)
//n     -> number of bins
//par   -> parameter in data being used
//binWidth  -> width of each bar
function drawHistogram(name, n, par, scale, binWidth, typeFilter) {

  binWidth = binWidth ? binWidth : 20;  //ternary operator to check if binWidth was defined and set binWidth to a default number if it wasn't

  var histoW = binWidth*n,
      histoH = 200;

  // if typeFilter defined, filter
  if(typeFilter){
    byVulnType.filter(typeFilter);
  }
  //create histogram
  var hist = d3.layout.histogram()
              .bins(n)
              .range([1, n])
              .value(function(d,i) { 
                return scale ? scale(d[par]) : d[par];
              })
              (byAny.top(Infinity));

  // if typeFilter defined, remove filter and sort/reverse array (descending order for top 20)
  if(typeFilter){
    byVulnType.filterAll();
    hist = hist.sort().reverse();
  }

  //set domain for data
  var max = d3.max(hist, function(d, i) { return d.length; });
  var hScale = d3.scale.linear()
                  .domain([0,  max])
                  .range([0, histoH - 50]);
  d3.select(name)
    .selectAll("rect")
    .data(hist)
    .transition()
      .duration(1000)
      .attr("y", function(d) { return histoH - hScale(d.length) - 20; })
      .attr("height", function(d) { return hScale(d.length); });

  // if the data in the hist is a vulnid, change labels to corresponding vulnids
  if(typeFilter){
    d3.select(name).selectAll("text.histogramlabel")
      .data(hist)
      .text(function(d) { return d[0].vulnid; });
  }

  d3.select(name)
    .append("text")
    .text("max: "+max);
}

// replaces the current dataset and calls redraw
function setNBEData(dataset){
  crossfilterInit();
  nbedata.add(dataset);
  // test crossfilter here
//  console.log(nbedata.size());
//  byCVSS.filter([2.0, 7.0]);
//  console.log(byCVSS.top(Infinity));
//  byCVSS.filterAll();
  
  redraw();
}

function loadJSONData(file){
  // if file isn't .json file, load a default
  if(file.indexOf('json') === -1){
    console.log('invalid file named, reverting to a default');
    file = '../../data/testdata/testdata6.json';
  }

  // Load data and set to nbedata global
  d3.json(file, function(data) {
    setNBEData(data);
  });
}

function handleGroupAdd(){
  console.log("group add button");
}

function handleDataPageAdd(){
  console.log("Data page add button");
}

function handleNbeChanged(){
  console.log("NBE file modified");
  //delete the current objs, will re-build them when needed.
}

function handleDataTab(){
  console.log("Data tab active");
}

function handleGroupsTab(){
  console.log("Groups tab active");
  var nbeText = $("#nbeFile1").html();
  var eventList = parseNBEFile( nbeText );
  //build default group list
  console.log("event list is " + JSON.stringify(eventList));
}

function handleVisTab(){
  console.log("Vis tab active");
}


// initialization
$(document).ready(function () {
  // set up needed event listeners, etc.
  $('#addGroupBtn').bind('click', function(event) {
    handleGroupAdd();
  });
  $('#dataTabLink').bind('click', function(event) {
    handleDataTab();
  });
  $('#groupsTabLink').bind('click', function(event) {
    handleGroupsTab();
  });
  $('#visTabLink').bind('click', function(event) {
    handleVisTab();
  });

  // start the vis
  init();
});

