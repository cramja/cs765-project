//
// Main function: defines a controller for the visualization.
//

vis.controller = function() {
  var width = 100,
      height = 62,
    loader = vis.canvasLoader(),
    table = vis.table(),
    heatmap = d3.heatmap();

  controller = function() {

    // svg for heat map
    var svg = d3.select("#main-view-container")
      .append("svg")
        .attr("id", "heatmap-svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + width + " " + height);
    heatmap.width(width).height(height);

    // div for chart
    d3.select(".bottom-focus")
      .append("div")
        .classed("chart", true);


    table.onChange(function(table) {
      var hmsvg = d3.select("#heatmap-svg").datum(vis.table2heatmap(table));
      hmsvg.call(heatmap);
      
    });

    loader.onLoad(function(d) {
      table.columnTypes(d.columnTypes); // first, give meta data
      table.focusKeys(["sid","aname"]); // set initial focus information
      table.focusDim("score");
      table.data(d.table);              // will trigger a table on change event.
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