var nodeColor = d3.scale.linear()
    .domain([0.0, 2.0, 10.0])
    .range([d3.hsl("#F1EEF6"), d3.hsl("#BDC9E1"), d3.hsl("#2B8CBE")]); 

var nodeColorFixed = d3.scale.linear()
    .domain([0.0, 10.0])
    .range([d3.hsl("#FEE6CE"), d3.hsl("#4DAF4A")]); // white-green

var nodeColorNew = d3.scale.linear()
    .domain([0.0, 10.0])
    .range([d3.hsl("#FEE6CE"), d3.hsl("#984EA3")]); // white-red

var nodeColorOpen = d3.scale.linear()
    .domain([0.0, 10.0])
    .range([d3.hsl("#FEE6CE"), d3.hsl("#FF7F00")]); // white-orange

//associative array to store exactly what bars you click on and off
var activeFilters = {};

// globals
var margin = {top: 20, right: 0, bottom: 0, left: 0},
    width = 960,
    height = 500 - margin.top - margin.bottom,
    formatNumber = d3.format(",d"),
    transitioning;

var isChangeVis = true;

// users can change this via buttons, which then redraws the treemap according to the new size metric
// cvss, value, criticality
var sizeOption = 'value';

// All the data!
var nbedata,
    all,
    byIP,
    byAny,
    byPort,
    byCVSS,
    byVulnID,
    byVulnType
var eventList;
var nbeText1 = "";
var nbeText2 = "";

// TODO Lane - put this function somewhere else
function testIfChildHasValue(dee, kee, val){
  var fv = findValue(dee, kee, val);
  return fv > 0;

  function findValue(d, key, value){
    if(d.values){
      return d.values.reduce(function(p, v) { return p + findValue(v, key, value); }, 0);
    } 
    else {
      if(typeof d[key] !== undefined){
        if ( !isNaN(d[key]) ){ //if value is a number

          //find the value of each bar in the histograms
          if ( Math.floor(d[key]) === Math.floor(value) ){
            return 1;
          } 
          else {
            return 0;
          }

        }
        else {
          if (d[key] === value){
            return 1;
          } 
          else {
            return 0;
          }
        }
      } 
      else {
        return 0;
      }
    }
  }
}

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
  crossfilterInit(); // TODO Lane not sure why this needs to be called here, need to investigate how setNBEData is being used...

  // initialize treemap
  initTreemap();
 
  // initialize nessus info area
  initNessusInfo();
}

// change treemap node size datafields
function sizeBySeverity() {
   sizeOption = 'cvss'; 
   redraw(); 
}

function sizeByCriticality() {
   sizeOption = 'criticality'; 
   redraw(); 
}

function sizeByCount() {
   sizeOption = 'value'; 
   redraw(); 
}

// called after data load
function redraw() {
  drawTreemap();
}

// called when window is resized
function resize() {
  width = $('#vis').width();
  x.domain([0, width]).range([0, width]);
  d3.select("#vis > svg").attr("width", width + margin.left + margin.right);
  d3.selectAll(".grandparent rect").attr("width", width);
  treemap.ratio(height / width * 0.5 * (1 + Math.sqrt(5)));
  redraw();
}

// treemap functions
function initTreemap(){

  width = 940; //TODO - set this dynamically based on size of window
  
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
    .entries(byCVSS.top(Infinity)); // TODO lane make work with crossfilter (feed it objects)
  } else {
    root=d3.nest()
    .key(function(d) {return 'groups';})
    .key(function(d) {return d.group;})
    .key(function(d) {return d.ip;})
    .key(function(d) {return ":"+d.port;})
    .key(function(d) {return "id:"+d.vulnid;})
    .sortKeys(d3.ascending)
    .entries(byCVSS.top(Infinity)); // TODO lane make work with crossfilter (feed it objects)
  }

  // free the root from its original array
  root = root[0];

//  var nodes = [];

  initialize(root);
  accumulate(root);
  layout(root);
  display(root);


  // console.log("====");
  // console.log("olde");
  // console.log(nodes);
  // console.log(root);
  // console.log("====");

  // vis func
  function initialize(root) {
    root.x = root.y = 0;
    root.dx = width;
    root.dy = height;
    root.depth = 0;
  }


  // Aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation.
  function accumulate(d) {
//    nodes.push(d);

    d.cvss = accumulateCVSS(d);
    if(isChangeVis){
      d.state = accumulateState(d);
      d.fixedCount = accumulateFixedCounts(d);
      d.openCount = accumulateOpenCounts(d);
      d.newCount = accumulateNewCounts(d);
    }

    return d.values
      ? d.value = d.values.reduce(function(p, v) { return p + accumulate(v); }, 0)
      : d[sizeOption];
  }

  function accumulateCVSS(d){
    return d.values
      ? d.cvss = d.values.reduce(function(p, v) { return Math.max(p, accumulateCVSS(v)); }, 0)
      : d.cvss;
  }

  function accumulateState(d){
    return d.values
      ? d.state = d.values.reduce(function(p, v) { return accumulateState(v); }, 0)
      : d.state;
  }

  function accumulateFixedCounts(d){
    return d.values
      ? d.fixedCount = d.values.reduce(function(p, v) { return p + accumulateFixedCounts(v); }, 0)
      : d.state === 'fixed' ? 1 : 0;
  }
  
  function accumulateOpenCounts(d){
    return d.values
      ? d.openCount = d.values.reduce(function(p, v) { return p + accumulateOpenCounts(v); }, 0)
      : d.state === 'open' ? 1 : 0;
  }

  function accumulateNewCounts(d){
    return d.values
      ? d.newCount = d.values.reduce(function(p, v) { return p + accumulateNewCounts(v); }, 0)
      : d.state === 'new' ? 1 : 0;
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


  // tells you if the selected element is at the bottom of the hierarchy
  // which is an id, in our case...
  function atTheBottom(d){
    if(d.values && d.values.length === 1 && d.values[0].vulnid)
      return true;
    else
      return false;
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

    //TODO - Lane - move to front
    g.filter(function(d) { return d.values; })
      .classed("children", true)
      .attr("id", function(d) { return "IP" + (d.key).replace(/\./g, ""); })
      .on("click", function(d) {
        if(atTheBottom(d)){
            console.log(d);
          console.log('at da bottom: '+ d.values[0].vulnid + ' val is: ' + JSON.stringify(vulnIdInfo[d.values[0].vulnid])); //WORKS!
          console.log( d );
          var nodeInfo = {id: d.values[0].vulnid, 
            type: d.values[0].vulntype, 
            port: d.values[0].port, 
            ip:   d.values[0].ip, 
            group: d.values[0].group};
          console.log( nodeInfo );
          // TODO Mike Lane trigger nessus update here
          setNessusIDData( vulnIdInfo[d.values[0].vulnid], nodeInfo );
          // setNessusIDData(findNessusIDData(d.values[0].vulnid));
            d3.select(this).select("text")
              .style("font-weight", "bold")
              .attr("id", "changeable");

            d3.select(this).select(".child")
              .style("stroke", "black")
              .style("stroke-width", "5px");
        } else {
          transition(d);
        }
      })
      .on("mouseover", function(d) {
          
          d3.select(this).moveToFront();

          d3.select(this).select(".parent")
            .style("stroke", "black")
            .style("stroke-width", "2px");

      })
      .on("mouseout", function(d) {
      
          d3.select(this).select(".parent")
            .style("stroke", "")
            .style("stroke-width", "");

      });

    // NOTE: can move the .style here to rect() to color by cell
    g.selectAll(".child")
      .data(function(d) { return d.values || [d]; })
      .enter().append("rect")
      .attr("class", "child")
      .style("fill", function(d) { 
          // if status, use appropriate color scale
          if(d.state){
            // reset d.state here according to max counts
            // TODO Lane this is a hack, but will work for the paper
            var maxStateIndex = maxIndex([d.fixedCount, d.newCount, d.openCount]);
            //console.log('maxindex: ' +maxStateIndex);
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

    g.append("rect")
      .attr("class", "parent")
      .call(rect)
      .text(function(d) { return formatNumber(d.value); });

    g.append("text")
      .attr("dy", ".75em")
      .text(function(d) { return d.key; })
      .classed("rectlabel", true)
      .call(text);

    function transition(d) {
      if (transitioning || !d){ 
        return; 
      }

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
      ? name(d.parent) + "_" + d.key
      : d.key;
  }
}


// initialize our nessus info area with labels
function initNessusInfo(){
  /*
  var nessusInfoLabels = ['title', 'overview', 'synopsis', 'description', 'seealso', 'solution', 'riskfactor'];
  var div = d3.select('#nessusinfo');

  var nessussections = div.selectAll('.nessusinfosection')
    .data(nessusInfoLabels, function(d) { return d; })
    .enter().append('div')
    .classed('.nessusinfosection', true)
    .attr('id', function(d) { return "nessus_"+d; });

  nessussections.append('span')
    .classed('nessusinfotitle', true)
    .text(function(d) { return d; });

  // this p later modified by the setNessusIDData function
  nessussections.append('p');
  
  // quick test of function below
  var testdata = [
    {key:"title", text:"3Com HiPer Access Router Card (HiperARC) IAC Packet Flood DoS"},
    {key:"overview", text:"This script is Copyright (C) 1999-2011 Tenable Network Security, Inc."
        + "<br />" + "Family  Denial of Service"
        + "<br />" + "Nessus Plugin ID  10108 (hyperbomb.nasl)"
        + "<br />" + "Bugtraq ID"  
        + "<br />" + "CVE ID  CVE-1999-1336"},
    {key:"synopsis", text:"The remote host is vulnerable to a denial of service attack."},
    {key:"description", text:"It was possible to reboot the remote host (likely a HyperARC router) by sending it a high volume of IACs."
      + "An attacker may use this flaw to shut down your internet connection."},
    {key:"seealso", text:"http://marc.info/?l=bugtraq&m=93492615408725&w=2"
      + "<br />" + "http://marc.info/?l=bugtraq&m=93458364903256&w=2"},
    {key:"solution", text:"Add a telnet access list to your Hyperarc router. If the remote system is not a Hyperarc router, then contact your vendor for a patch."},
    {key:"riskfactor", text:"(CVSS2#AV:N/AC:L/Au:N/C:N/I:N/A:P)"}
  ];
  */
  var testdata = {title: "", description: ""};
  setNessusIDData(testdata);
}

// replaces the current dataset and calls redraw
function setNBEData(dataset){
  crossfilterInit();
  nbedata.add(dataset);
  NV.nessus.setData(dataset); // TODO backbone remove others
  // test crossfilter here
  //  console.log(nbedata.size());
  //  byCVSS.filter([2.0, 7.0]);
  //console.log(byAny.top(Infinity));
  //  byCVSS.filterAll();

  redraw();
}

// updates the nessus data by id //TODO mike
// TODO Lane throw this on stackoverflow to see if the $.each can be avoided
function setNessusIDData(idData, nodeInfo){
  var div = $('#nessusinfo');
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

  /*
  var enter = div.selectAll('.nessusinfosection')
    .data(iddata, function(d) { return d.key; })
    .enter();

  $.each(enter[0], function(i, v) { 
    var key = v.__data__.key;
    var text = v.__data__.text;
    d3.select('#nessus_'+key).select('p').html(text);
  });
  */
}

function loadJSONData(file){
  // if file isn't .json file, load a default
  if(file.indexOf('json') === -1){
    console.log('invalid file named, reverting to a default');
    file = 'data/testdata/testdata10.json';
  }

  // Load data and set to nbedata global
  d3.json(file, function(data) {
    setNBEData(data);
  });
}

var groupList = [];

/*
function handleNBEAdd(){
  //$("#dataTab2").show()
  $("#dataTab2Link").show()
  $("#dataTab1Link").html("Initial Data")
  $("#dataTab2Link").html("Updated Data")
}
*/

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
  var nbeItems1 = ""
  var nbeItems2 = ""

  var useFiles = ( $('#nbeTextAreas:visible').length <= 0 )
  //console.log('usefiles flag is ' + useFiles)

  if(useFiles){
    nbeItems1 = parseNBEFile( nbeText1 );
    eventList = nbeItems1;
    if(nbeText2.trim() !== ""){
      nbeItems2 = parseNBEFile( nbeText2 );
      eventList = mergeNBEs(nbeItems1, nbeItems2);
    }
  }else{ //else using text areas
    nbeItems1 = parseNBEFile( $("#nbeFile1").val() );
    eventList = nbeItems1;
    if( $("#nbeFile2").val().trim() !== "" ){
      console.log("using second nbe text also ...")
      nbeItems2 = parseNBEFile( $("#nbeFile2").val() );
      eventList = mergeNBEs(nbeItems1, nbeItems2)
    }
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
    var entry = {"ip": ips[i], "weight": weight}
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
  eventList = addGroupInfoToData(groups, eventList)

  setNBEData(eventList);
}

//TODO
//this will be somewhat slow, O(n^2), no easy way around it.
//note this will modify nbeItems2 and not modify nbeItems1.  Can change this if needed later.
function mergeNBEs(nbeItems1, nbeItems2){
  var result = [];
  function compareEntries(a, b){ //true if equal, false if not
    if(a.ip === b.ip && a.vulnid === b.vulnid && a.vulntype === b.vulntype && a.cvss === b.cvss && a.port === b.port){
      return true
    }else{
      return false
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
  var testAddr = ip.split('.')
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
function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object

  // files is a FileList of File objects.
  //there should only be one item here, the input only allows to select one.
  var f = evt.target.files[0];
  var reader = new FileReader();

  reader.onload = (function(theFile) {
    //console.log("!!"+JSON.stringify(theFile));
    return function(e) {
      //console.log("!!"+e.target.result);
      if(evt.target.id === "file1")
        nbeText1 = e.target.result;
      if(evt.target.id === "file2")
        nbeText2 = e.target.result;
    };
  })(f);

  try{  // try to read file as text.
    reader.readAsText(f); //utf-8 encoding is default
  } catch(e){
    //can't check the mime types, since not known for .nbe, so just catch errors instead
    //TODO: most (all?) bin files will still not throw this exception, just make junk text.  other ideas?
    console.error("could not parse file " + f.name + " as text" + e);
  }
}

var vulnIdInfo = {};

// initialization
$().ready(function () {

  //stuff for file upload and related
  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
    document.getElementById('file1').addEventListener('change', handleFileSelect, false);
  } else {
    console.error('The File APIs are not fully supported in this browser.')
  }

  //stuff for c&p of NBE file
  $("#nbeTextAreas").hide()
  $('#hideTextareas').hide()

  $('#showTextareas').bind('click', function(event) {
    $("#nbeTextAreas").show()
    $('#showTextareas').hide()
    $('#hideTextareas').show()

    //TODO confirm this is desired behavior
    $('#filesForm')[0].reset() 
    nbeText1 = ""
    nbeText2 = ""
  });
  $('#hideTextareas').bind('click', function(event) {
    $("#nbeTextAreas").hide()
    $('#showTextareas').show()
    $('#hideTextareas').hide()
  });


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


  // handle window resizes
  $(window).resize(function() {
    resize();
  });

  // start the vis
  init();
});
