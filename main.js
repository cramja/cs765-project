//
// Main function: defines a controller for the visualization.
//

vis.controller = function() {
  var width = 100,
      height = 62,
    loader = vis.canvasLoader(),
    table = vis.table(),
    heatmap = d3.heatmap().table(table),
    chart = d3.chart().table(table);

  controller = function() {
    // callback for loader
    d3.select("#file-picker").node().onchange = function(event){
      var input = event.target;

      var reader = new FileReader();
      reader.onload = function(){
          var text = reader.result;
          loader.baseData(JSON.parse(text)); // updates vis
        };
      reader.readAsText(input.files[0]);
    };

    // svg for heat map
    var svg = d3.select("#main-view-container")
      .append("svg")
        .attr("id", "heatmap-svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + width + " " + height);
    heatmap.width(width).height(height);

    // window.onresize = function(e) {
    //   var boundRect = d3.select("#main-view-container").node()
    //     .getBoundingClientRect();
    //   var svg = d3.select("#main-view-container").select("svg")
    //     .attr("width", document.documentElement.clientWidth)
    //     .attr("height", document.documentElement.clientHeight);
    //   heatmap.width(document.documentElement.clientWidth).height(document.documentElement.clientHeight);
    //     console.log("hacks");
    // };

    // div for chart
    d3.select(".bottom-focus")
      .append("table")
        .classed("chart-container", true);

    table.onChange(function(table) {
      var hmsvg = d3.select("#heatmap-svg").datum(vis.table2heatmap(table));
      hmsvg.call(heatmap);

      var ctable = d3.select(".chart-container").datum(vis.table2chart(table));
      ctable.call(chart);
    });

    loader.onLoad(function(d) {
      table.columnTypes(d.columns); // first, give meta data
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