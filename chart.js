//
// Adds a chart to the d3 namespace. Charts are like a stripped-down excel sheet
//

(function() {
  d3.chart = function () {
    var table; // Data source. Should only be used to pass filter/sort functions

    function chart(g) {
      var data = g.datum();
      g.classed("chart", true);

      // create the container elements if they do not exist.
      if (!g.select("tr.hd").node()) {
        g.append("tr").classed("hd", true);
      }

      // create header row if this is the initialization:
      var th = g.select("tr.hd").selectAll("th")
        .data(data.cinfo);

      th.enter()
        .append("th")
      .merge(th)
        .classed("bold", function (d) { return d.type == "k"; })
        .classed("asc", function(d) { return d.sort == "asc"; })
        .classed("dsc", function(d) { return d.sort == "dsc"; })
        .text(function(d) { return d.name; })
        .on("click", function(d){
          if (d.type == "k" || d.type == "d.n") {
            var sortType = "asc";
            if (d.sort == "asc") {
              sortType = "dsc";
            } else if (d.sort == "dsc") {
              sortType = null;
            }
            table.sortAttr({cname:d.name, sort:sortType});
          }
        })
      .exit()
        .remove();

      // create the table body if it does not exist.
      if (!g.select("tbody").node()) {
        g.append("tbody");
      }

      var tr = g.select("tbody").selectAll("tr")
        .data(data.cdata);

      var td = tr.enter()
        .append("tr")
      .merge(tr)
      .selectAll("td")
        .data(function(s) {return s;});
          
      tr.exit().remove();

      td.enter()
          .append("td")
        .merge(td)
          .text(function(d,i){
            if (data.cinfo[i].type == 'k' ||
                data.cinfo[i].type == 'd.n') {
              return d.value;
            }
            return JSON.stringify(d.value[0]);
          });
    }

    chart.table = function(d) {
      if(!arguments.length) return table;
      table = d;
      return chart;
    };

    return chart;
  };

  vis.table2chart = function(table) {
    var cinfo = [];
    for (var k in table.columnTypes()) {
      cinfo.push({
        name: k, 
        type: table.columnTypes()[k], 
        sort: table.sortAttr() && 
              table.sortAttr().cname == k ? table.sortAttr().sort : null
      });
    }
    var cdata = [],
      tdata = table();
    for (var i = 0; i < tdata.length; i++) {
      var crow = [];
      for (var k in tdata[i]) {
        crow.push({cname:k, value:tdata[i][k]});
      }
      cdata.push(crow);
    }
    return {
      cinfo: cinfo,
      cdata: cdata
    };
  };
})();
