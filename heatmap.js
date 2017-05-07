//
// A generic heatmap. Takes an element with data bound in the form
// {x:xval, y:yval, z:zval, hover:msg}
//
//

(function() {
  d3.heatmap = function () {

    var height = 1,
      width = 1;

    function heatmap(g) {
      var xoffset = width * 0.05,
        yoffset = height * 0.1,
        data = g.datum(),
        x_vals = d3.set(data, function(d) {return d.x;}).values(),
        y_vals = d3.set(data, function(d) {return d.y;}).values();

      g.classed("heatmap", true);

      var x_sc = d3.scaleBand()
        .domain(x_vals)
        .range([xoffset, width-xoffset])
        .padding(0.1);

      var y_sc = d3.scaleBand()
        .domain(y_vals)
        .range([0, height - yoffset])
        .padding(0.1);

      // colors map to score
      var c_sc = d3.scaleLinear()
        .domain([
          d3.min(data, function(d){return d.z;}),
          d3.max(data, function(d){return d.z;})
        ])
        .range(['white', 'green']);

      var tiles = g.selectAll("rect.tile").data(data);

      tiles.enter()
        .append("rect")
        .classed("tile", true)
        .attr("width", x_sc.bandwidth())
        .attr("height", y_sc.bandwidth())
        .attr("x", function(d) {
          return x_sc(d.x);
        })
        .attr("y", function(d) {return y_sc(d.y);})
        .attr("fill", function(d) { return c_sc(d.z);});

      tiles
        .attr("width", x_sc.bandwidth())
        .attr("height", y_sc.bandwidth())
        .attr("x", function(d) {
          return x_sc(d.x);
        })
        .attr("y", function(d) {return y_sc(d.y);})
        .attr("fill", function(d) { return c_sc(d.z);});

      tiles.exit().remove();

      var ylabel = g.selectAll("text.ylabel")
        .data(y_vals);

      ylabel.enter()
        .append("text")
        .attr("class", "ylabel")
        .attr("x", xoffset * 0.9)
        .attr("y", function(d) {return y_sc(d); } )
        .attr("dy", y_sc.bandwidth() * 0.8)
        .attr("text-anchor", "end")
        .text(function(d) {return "" + d;});

      ylabel.attr("x", xoffset * 0.9)
        .attr("y", function(d) {return y_sc(d); } )
        .attr("dy", y_sc.bandwidth() * 0.8)
        .attr("text-anchor", "end")
        .text(function(d) {return "" + d;});

      ylabel.exit().remove();

      var xlabel = g.selectAll("text.xlabel")
        .data(x_vals);

      xlabel.enter()
        .append("text")
        .attr("class", "xlabel")
        .attr("x", function(d) { return x_sc(d) + x_sc.bandwidth() * 0.25;})
        .attr("y", height - (yoffset * 0.75))
        .attr("transform", function(d) {return "rotate(30, " + (x_sc(d) + x_sc.bandwidth() * 0.25)+ "," + (height - (yoffset * 0.75)) +")"})
        .text(function(d){return d;});

      xlabel.attr("class", "xlabel")
        .attr("x", function(d) { return x_sc(d) + x_sc.bandwidth() * 0.25;})
        .attr("y", height - (yoffset * 0.75))
        .attr("transform", function(d) {return "rotate(30, " + (x_sc(d) + x_sc.bandwidth() * 0.25)+ "," + (height - (yoffset * 0.75)) +")"})
        .text(function(d){return d;});

      xlabel.exit().remove();
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

    return heatmap;
  };
})();