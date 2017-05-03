// Creates a box plot using d3
// Do not edit the symbolic link version of this file!
//


BoxPlotView = function() {
  this.init = function(container, data) {
    this.container = container;
    this.base_data = data;
    this.data = this.process(this.base_data);
    this.enter();
    return this;
  };

  this.enter = function() {
    var kBandwidth = 30;
    var width = this.container.width;
    var height = this.container.height;

    var x_scale = d3.scaleBand()
      .domain(this.data.values.map(function(d) {return d.name;}))
      .range([0, width])
      .padding((width-(this.data.values.length * kBandwidth)) / width);

    var y_scale = d3.scaleLinear()
      .domain(this.data.domain)
      .range([0, height]);

    // create a box for each data


    var centerline = this.container.pane
      .selectAll("line.center")
      .data(this.data.values);

    centerline.enter()
      .insert("line")
      .attr("class", "center")
      .attr("x1", function(d) { return x_scale(d.name) + x_scale.bandwidth()/2;})
      .attr("y1", function(d) { return y_scale(d.min); })
      .attr("x2", function(d, i) { return x_scale(d.name) + x_scale.bandwidth()/2;})
      .attr("y2", function(d) { return y_scale(d.max); });

    var qbox = this.container.pane
      .selectAll("rect.qbox")
      .data(this.data.values);

    qbox.enter()
      .insert("rect")
      .attr("class", "qbox")
      .attr("x", function(d) {return x_scale(d.name);})
      .attr("width", x_scale.bandwidth())
      .attr("y", function(d) {return y_scale(d.qtile[0]);})
      .attr("height", function(d) {return y_scale(d.qtile[2]) - y_scale(d.qtile[0]);});

    var midline = this.container.pane
      .selectAll("line.midline")
      .data(this.data.values);

    midline.enter()
      .insert("line")
      .attr("class", "midline")
      .attr("x1", function(d) {return x_scale(d.name);})
      .attr("y1", function(d) {return y_scale(d.qtile[1]); })
      .attr("x2", function(d) {return x_scale(d.name) + x_scale.bandwidth();})
      .attr("y2", function(d) { return y_scale(d.qtile[1]); });

    var mins = this.container.pane
      .selectAll("line.min")
      .data(this.data.values);

    mins.enter()
      .insert("line")
      .attr("class", "min")
      .attr("x1", function(d) {return x_scale(d.name);})
      .attr("y1", function(d) {return y_scale(d.min); })
      .attr("x2", function(d) {return x_scale(d.name) + x_scale.bandwidth();})
      .attr("y2", function(d) { return y_scale(d.min); });

    var maxs = this.container.pane
      .selectAll("line.max")
      .data(this.data.values);

    maxs.enter()
      .insert("line")
      .attr("class", "max")
      .attr("x1", function(d) {return x_scale(d.name);})
      .attr("y1", function(d) {return y_scale(d.max); })
      .attr("x2", function(d) {return x_scale(d.name) + x_scale.bandwidth();})
      .attr("y2", function(d) { return y_scale(d.max); });

    var labels = this.container.pane.selectAll("text.label")
      .data(this.data.values);

    labels.enter().append("text")
      .attr("class", "label")
      .attr("dy", "12px")
      .attr("dx", x_scale.bandwidth() + 3)
      .attr("x", function(d){return x_scale(d.name);})
      .attr("y", function(d){return y_scale(d.qtile[0]);})
      .text(function(d) {return "" + Math.round(d.qtile[0]*100)/100})

    var glabels = this.container.pane
      .selectAll("g.label")
      .data(this.data.values);
  };

  this.update = function(data) {
    // todo
  };

  this.process = function (data) {
    // makes an object with d3 data+some meta data:
    //    { domain:[], values:[{qtile:[1,2,3], min:0, max:1}] }
    var vdata = {domain: [1000, -1000], values: []};
    for (var i in data) {
      var item = data[i];
      var dvalue = {
        qtile: this.quartiles(item.values),
        min: item.values[0],
        max: item.values[item.values.length - 1],
        name: item.name
      };
      vdata.domain[0] = vdata.domain[0] > dvalue.min ? dvalue.min : vdata.domain[0];
      vdata.domain[1] = vdata.domain[1] < dvalue.max ? dvalue.max : vdata.domain[1];
      vdata.values.push(dvalue);
    }
    return vdata;
  };

  this.quartiles = function (data) {
    return [
      d3.quantile(data, 0.25),
      d3.quantile(data, 0.5),
      d3.quantile(data, 0.75)
    ];
  };

};