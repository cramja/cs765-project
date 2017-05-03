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
      .domain(d3.range(this.data.values.length))
      .range([0, width])
      .padding((width-(this.data.values.length * kBandwidth)) / width);

    var chart = d3.box().domain([0, this.data.max]);

    // create a box for each data
    var boundG = this.container.selectAll("g")
      .data(this.data)
      .attr("transform", function(d) {return "translate(" + x_scale(i) + ",0)";});
    boundG.call(chart);
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