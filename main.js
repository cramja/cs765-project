//
// Main function: defines a controller for the visualization.
//

vis.controller = function() {
  var width = 100,
      height = 62,
    loader = vis.canvasLoader(),
    table = vis.table(),
    heatmap = d3.heatmap(),
    data2heatmap = function (tbl) {  // mapping function from the data table to a heatmap
      return tbl.map(function(d) {return {x: d.aname, y:d.sid, z:d.score};});
    },
    navpanel = vis.navPanel(),
    data2navpanel = function(tbl) {
      return d3.set(tbl, function(d) {return d.sname;}).values();
    };

  controller = function() {

    // svg for heat map
    var svg = d3.select("#main-view-container")
      .append("svg")
        .attr("id", "heatmap-svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + width + " " + height);
    heatmap.width(width).height(height);

    // ul for navigation view
    navpanel = navpanel.table(table);
    d3.select("#nav-container")
      .classed("navpanel",true)
      .append("ul");

    table.onChange(function(data) {
      var hmsvg = d3.select("#heatmap-svg").datum(data2heatmap(data));
      hmsvg.call(heatmap);

      var navdiv = d3.select(".navpanel").datum(data2navpanel(data));
      navdiv.call(navpanel);
    });

    loader.onLoad(function(d) {
      table.data(d); // will trigger a table on change event.
    });

    loader.filename("example.json"); // will trigger an onload event.
  };

  controller.table = function(d) {
    if(!arguments.length) return table;
    table = d; // todo rebind
    return controller;
  };

  return controller;
};

// Program initialization: create controller, run.
//

controller = vis.controller();
controller();