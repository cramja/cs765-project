//
// A generic heatmap. Takes an element with data bound in the form
// {x:xval, y:yval, z:zval, hover:msg}
//
//

(function() {
  d3.heatmap = function () {

    var height = 1,
      width = 1,
      table = null;

    function heatmap(g) {
      var xoffset_r = width * 0.01,
        xoffset_l = width * 0.15,
        yoffset = height * 0.15,
        data = g.datum().values,
        meta = g.datum().meta,
        x_vals = d3.set(data, function(d) {return d.x;}).values().map(function(d){return {name:d, attr:meta.x};}),
        y_vals = d3.set(data, function(d) {return d.y;}).values().map(function(d){return {name:d, attr:meta.y};});

      g.classed("heatmap", true);

      if (!d3.select(".hmtooltip").node()) {
        // add an invisible node which holds the tooltip.
        d3.select("body").append("div") 
          .attr("class", "hmtooltip")       
          .style("opacity", 0);
      }

      var x_sc = d3.scaleBand()
        .domain(x_vals.map(function(d){return d.name;}))
        .range([xoffset_l, width-xoffset_r])
        .padding(0.05);

      var y_sc = d3.scaleBand()
        .domain(y_vals.map(function(d){return d.name;}))
        .range([0, height - yoffset])
        .padding(0.05);

      // colors map to score
      var min = d3.min(data, function(d){return d.z;});
      var c_sc = d3.scaleLinear()
        .domain([
          min,
          d3.max(data, function(d){return d.z;})
        ])
        .range(['white', 'green']);
      if (min < 0) {
        c_sc = d3.scaleLinear()
        .domain([
          min,
          0,
          d3.max(data, function(d){return d.z;})
        ])
        .range(['red', 'white', 'green']);
      }

      var tiles = g.selectAll("rect.tile").data(data);

      tiles.enter()
        .append("rect")
        .classed("tile", true)
      .merge(tiles)
        .attr("width", x_sc.bandwidth())
        .attr("height", y_sc.bandwidth())
        .attr("x", function(d) {
          return x_sc(d.x);
        })
        .attr("y", function(d) {return y_sc(d.y);})
        .attr("fill", function(d) { return c_sc(d.z);})
        .on("mouseover", function(d) {
          var tt = d3.select(".hmtooltip");
            tt.transition()    
              .duration(50)
              .style("opacity", 1);

            tt.html("x: " + d.x + "<br>y: " + d.y + "<br>z: " + d.z)  
              .style("left", (d3.event.pageX + 28) + "px")   
              .style("top", (d3.event.pageY - 28) + "px");  
            })
        .on("mousemove", function(d) {
          var tt = d3.select(".hmtooltip");

          tt.style("left", (d3.event.pageX + 28) + "px")   
            .style("top", (d3.event.pageY - 28) + "px");  
        })          
        .on("mouseout", function(d) {   
            var tt = d3.select(".hmtooltip");
            tt.transition()    
              .duration(50)    
              .style("opacity", 0); 
        });

      tiles.exit().remove();

      var ylabel = g.selectAll("text.ylabel")
        .data(y_vals);

      ylabel.enter()
        .append("text")
      .merge(ylabel)
        .attr("class", "ylabel")
        .attr("x", xoffset_l * 0.9)
        .attr("y", function(d) {return y_sc(d.name); } )
        .attr("dy", y_sc.bandwidth() * 0.8)
        .attr("text-anchor", "end")
        .text(function(d) {return "" + d.name;})
        .on("click", function(d){
          if (d.name == "AVG"){
            // get where y val == avg
            var avgY = [];
            for (var i = 0; i < data.length; i++) {
              if (data[i].y == "AVG")
                avgY.push(data[i]);
            }
            // sort on z
            avgY = avgY.sort(function(a,b){return a.z > b.z ? -1 : a.z < b.z ? 1 : 0;});
            // create a priority index on xvals
            xPriority = {};
            for(var i in avgY) {
              xPriority[avgY[i].x] = parseInt(i);
            }
            // now sort, first according to xPriority, then y value
            table.sort(function(ra,rb){
              var va = xPriority[ra[meta.x]] * 100000 + ra[meta.z],
                vb = xPriority[rb[meta.x]] * 100000 + rb[meta.z];
              return va > vb ? -1 : va < vb ? 1 : 0;

            });

          }
          table.sort(function(ra, rb){
            var va = ra[meta.y] == d.name ? ra[meta.z] + 100000 : ra[meta.z],
              vb = rb[meta.y] == d.name ? rb[meta.z] + 100000 : rb[meta.z];
            return va > vb ? -1 : va < vb ? 1 : 0;
          });
        })
      .exit()
        .remove();

      var xlabel = g.selectAll("text.xlabel")
        .data(x_vals);

      xlabel.enter()
        .append("text")
      .merge(xlabel)
        .attr("class", "xlabel")
        .attr("x", function(d) { return x_sc(d.name) + x_sc.bandwidth() * 0.25;})
        .attr("y", height - (yoffset * 0.75))
        .attr("transform", function(d) {return "rotate(30, " + (x_sc(d.name) + x_sc.bandwidth() * 0.25)+ "," + (height - (yoffset * 0.75)) +")"})
        .text(function(d){return d.name;})
      .exit()
        .remove();

      // create control objects
      if (d3.select("#heatmap-control").node()) {
        // todo: this code is terribly written:
        var ctl = d3.select("#heatmap-control"),
            cinfo = table.columnTypes(),
            xfocus = table.focusKeys()[0],
            yfocus = table.focusKeys()[1],
            zfocus = table.focusDim(),
        cinfo = d3.keys(cinfo).map(function(k){
          return {
            cname: k,
            ctype: cinfo[k],
            current: 
              xfocus == k ? "x" : yfocus == k ? "y" : zfocus == k ? "z" : null
          };
        });
        var xdat =[], ydat = [], zdat = [];
        for (var i = 0; i < cinfo.length; i++) {
          var cdat = cinfo[i];
          if (cdat.ctype == "k") {
            xdat.push(
              {
                name:cdat.cname,
                focus:cdat.cname == xfocus,
                onclick:function(d) {
                  table.focusKeys([d.name, table.focusKeys()[1]]);
                }
              });
            ydat.push(
              {
                name:cdat.cname,
                focus:cdat.cname == yfocus,
                onclick:function(d) {
                  table.focusKeys([table.focusKeys()[0], d.name]);
                }
              });
          } else if (cdat.ctype == "d.n") {
            zdat.push(
              {
                name:cdat.cname,
                focus:cdat.current == "z",
                onclick:function(d) {
                  table.focusDim(d.name);
                }
              });
          }
        }
        var rdata = [{name:"X", value:xdat}, {name:"Y", value:ydat}, {name:"Z", value:zdat}];
        var rows = d3.select("#heatmap-control").selectAll(".hmctl-row").data(rdata);
        rows.enter()
          .append("div")
          .classed("hmctl-row", true)
        .merge(rows)
          .html(function(d){return d.name+"<br>";})
          .selectAll(".hmctl-ele")
          .data(function(d){return d.value;})
            .enter()
              .append("span")
              .classed("hmctl-ele", true);
        d3.selectAll(".hmctl-row").selectAll(".hmctl-ele")
          .classed("hmctl-focus", function(d){return d.focus;})
          .text(function(d) {return d.name;})
          .on("click", function(d){d.onclick(d);})
          .exit()
            .remove();

        // rows = rows.merge(rows.enter());
        // rows;
          // .merge(rows)
          // .text(function(d){return d.name;});
      }

      

    }

    heatmap.height = function(y) {
      if (!arguments.length) return height;
      height = y;
      return heatmap;
    };

    heatmap.width = function(x) {
      if (!arguments.length) return width;
      width = x;
      return heatmap;
    };

    heatmap.table = function(d) {
      if (!arguments.length) return table;
      table = d;
      return heatmap;
    };

    return heatmap;
  };

  vis.table2heatmap = function(table) {
    var xcol = table.focusKeys()[0],
      ycol = table.focusKeys()[1],
      zcol = table.focusDim(),
      hmdata = [],
      data = table();

      for (var i = 0; i < data.length; i++) {
        var row = data[i];
        hmdata.push({x: row[xcol], y: row[ycol], z: row[zcol]});
      }

      // hack. who cares at this point.
      var avgs = table.avgs();
      for (var i = 0; i < avgs.length; i++) {
        var row = avgs[i];
        hmdata.push({x: row.x, y: row.y, z: row.z});
      }

      return {
        meta: {
          x: table.focusKeys()[0],
          y: table.focusKeys()[1],
          z: table.focusDim()
        },
        values: hmdata
      };
  };

  // takes a table reference and turns it into
  // {
  //  x:[xval1, xval2, ..., avg],
  //  y:[yval1, yval2, ..., avg],
  //  z:[{x:v, y:v, z:v}],
  //  attrmeta: {x:{name, y:name, z:name}
  // }
  // d3.layout.table2heatmap = function(d) {

  // }
})();