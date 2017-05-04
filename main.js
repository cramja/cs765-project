// Helper functions
//

function map_push(map, key, value) {
  // adds the value to the array at map[key]
  //
  if (!map[key]) {
    map[key] = [];
  }
  map[key].push(value);
}

function quartiles(sorted_arr) {
  // returns [min, q1, q2, a3, max]
  var t = sorted_arr.length/4;
  return [
    sorted_arr[0],
    sorted_arr[Math.floor(t)],
    sorted_arr[Math.floor(t*2)],
    sorted_arr[Math.floor(t*3/4)],
    sorted_arr[sorted_arr.length-1]
  ]
}

// Helper classes
//

Database = function() {
  // contains functions for creating data which can easily be consumed
  // by a view

  this.init = function(data) {
    this.base_assignments = data.assignments;
    this.base_students = data.students;
  };

  this.AssignmentScores = function() {
    // For each assignment, get all the students grades.
    // returns: {assignment#:[grade,grade...]}
    var assn_scores = {};
    var grades = [];
    this.base_students.forEach(function(s) {
      grades.push(s.grades);
    });
    grades.forEach(function(g){
      g.forEach(function(s, j) {
        map_push(assn_scores, j, s.score);
      });
    });
    for (var i = 0; i <= max_assn; i++) {
      assn_scores[i] = assn_scores[i];
    }
    return assn_scores;
  };

  this.AssnScores2Box = function() {
    // returns [{label:"assn_name", values:[{name:, value:},]}]
    var scores = this.AssignmentScores();
    var assn_names = this.base_assignments.map(function(d){return d.name;});

    var box_data = [];
    for (var key in scores) {
      var sc = scores[key];
      box_data.push({
        label: this.base_assignments[key].name,
        values: sc
      });
    }
    return box_data;
  };

  this.GetStudentsScores = function() {
    // returns [{name, id, [{name, score}]}]
    var assn_names = this.base_assignments.map(function(d){return d.name;});
    var student_score = this.base_students.map(function(d){
      return {
        id: d.id,
        name: d.sortable_name,
        values: d.grades.map(function(d,i) {
          return {name:assn_names[i], value:d.score};
        })
      }
    });
    return student_score;
  };

  this.GetStudents = function() {
    // list of student objects
    //
    return this.base_students.map(
        function(d) { return { "name" : d.sortable_name, "id" : d.id }; }
      );

  }
};


BoxPlotView = function() {
  // contains logic for creating and updating a box plot graph.

  this.init = function(db) {
    // Must be called before any of the other functions.

    this.db = db;
    this.base_data = db.base_data;

    // graphical elements:
    this.view_svg = d3.select("#main-view-container").append("svg");
    this.view_svg
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 " + this.getViewWidth() + " " + this.getViewHeight());
    // the magic:
    this.setBoxPlotData(this.db.AssnScores2Box());
  };

  this.getViewHeight = function() {
    return 620;
  };

  this.getViewWidth = function() {
    return 1000;
  };

  this.setBoxPlotData = function(data) {
    // input: data of the form: [{xlabel:"", data:[]}]
    var label_span = 0.2; // % of space reserved for labels
    var margin_x = 20;
    var margin_y = 20;
    var text_angle = 60;
    var label_y_offset = (1-label_span) * this.getViewHeight();
    var domain = [
        0,
        d3.max(data, function(d){return d3.max(d.values);})
      ];

    var x_scale = d3.scaleBand()
      .round(true)
      .range([margin_x, this.getViewWidth() - (margin_x * 2)])
      .domain(data.map(function(d) {
        return d.label;
      }))
      .padding(0.8);

    var chart = d3.box()
      .domain(domain)
      .height(this.getViewHeight() * (1-label_span) - margin_y * 2)
      .width(x_scale.bandwidth());

    // bind a g to each data. Within each g, we'll add a label and a box
    var boundG = this.view_svg.selectAll("g.box")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "box")
      .attr("transform", function(d) {
        return "translate(" + x_scale(d.label) + "," + margin_y + ")";
      });

    var boundBox = boundG.selectAll("g.box")
      .data(function(d) {return [d.values];})
      .enter()
      .call(chart);

    var labels = boundG.selectAll("text.boxLabel")
      .data(function(d) {
        return [d3.select(this).data()[0].label];
      })
      .enter()
      .append("text")
      .attr("class", "boxLabel")
      .attr("transform", "translate(0," + label_y_offset + ")rotate("+text_angle+")")
      .text(function(d) {console.log(d);return d;});

    //var lines = boundG.selectAll("line.lgd")
    //  .data(d3.range(0,50,10))
    //  .enter()
    //  .attr("x", 0)
    //  .attr("y", )
  };
};

(function() {
  d3.HeatMap = function () {

    var height = 1,
      width = 1,
      domain = [];

    function HeatMap(g) {
      var xoffset = width * 0.1,
        yoffset = height * 0.1;

      var y_sc = d3.scaleBand()
        .domain(d3.range(g.data().length))
        .range([0, height - yoffset])
        .padding(0.1);

      g.each(function(d,i) {
        // d == {label, values}
        var g = d3.select(this),
          n = d.values.length,
          idx = i;

        var x_sc = d3.scaleBand()
          .domain(d.values.map(function(d){ return d.name; }))
          .range([0, width - xoffset])
          .padding(0.1);

        var c_sc = d3.scaleLinear()
          .domain(domain)
          .range(['white', 'green']);

        // offset the row to the proper location
        var grow = g.append("g")
          .attr("transform", function(d,i) { return "translate(" + xoffset + "," + y_sc(idx) + ")"; });

        // Do highlight of row
        grow.selectAll("rect.hl")
          .data([d.selected])
          .enter()
          .append("rect")
            .attr("class", "hl")
            .attr("width", width)
            .attr("height", y_sc.bandwidth() * 1.1)
            .attr("dy", - (y_sc.bandwidth() * 0.05))
            .style("visibility", function(d) {return d ? "visible" : "hidden"; });

        // Add/update tiles
        var gtile  = grow.selectAll("rect.tile")
          .data(d.values);
        gtile.enter()
            .append("rect")
            .attr("class", "tile")
            .attr("x", function(d) {
              return x_sc(d.name);
            })
            .attr("height", y_sc.bandwidth())
            .attr("width", x_sc.bandwidth())
            .attr("fill", function(d) { return c_sc(d.value);});

        // y labels
        var glabel = g.append("g");
        glabel.selectAll("text.label")
          .data([d])
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", xoffset * 0.9)
            .attr("y", function(d) {return y_sc(idx); } )
            .attr("dy", y_sc.bandwidth() * 0.8)
            .attr("text-anchor", "end")
            .text(function(d) {return "" + d.id;});
      });
      // x labels
      var assn_data = g.data()[0].values.map(function(d){ return d.name; });
      var x_sc = d3.scaleBand()
        .domain(assn_data)
        .range([0, width - xoffset])
        .padding(0.1);

      var gylabel = g.append("g")
        .attr("transform",
          "translate(" + xoffset + "," + (height-yoffset) + ")");
      gylabel.selectAll("text.label")
        .data(assn_data)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", function(d) {return x_sc(d) + x_sc.bandwidth()/4;})
        .attr("y", yoffset - yoffset*.75)
        .attr("transform", function(d) {return "rotate(30, " + (x_sc(d) + x_sc.bandwidth()/4)+ "," + (yoffset - yoffset*0.75) +")"})
        .text(function(d){return d;});
    }

    HeatMap.height = function(y) {
      if (!arguments.length) return height;
      height = y;
      return HeatMap;
    };

    HeatMap.width = function(x) {
      if (!arguments.length) return width;
      width = x;
      return HeatMap;
    };

    HeatMap.domain = function(x) {
      if(!arguments.length) return domain;
      domain = x;
      return HeatMap;
    };

    return HeatMap;
  };
})();

EntityNavView = function() {
  // Creates a navigation view using jquery.
  //

  this.init = function(db) {
    this.db = db;
    this.nav_pane = $("#nav-container")
  };
};

Controller = function() {
  this.init = function(db) {
    this.db = db;
    this.height = 62;
    this.width = 100;

    // bind data to an svg, create a heatmap
    var dataset = this.db.GetStudentsScores();
    dataset.forEach(function(d) {d.selected=false;});
    dataset[1].selected = true;

    var domain = [0, 70]; // todo !hack

    var heatmap = d3.HeatMap()
      .width(this.width)
      .height(this.height)
      .domain(domain);

    var heatmapg = d3.select("#main-view-container")
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 " + this.width + " " + this.height)
      .selectAll("g")
        .data(dataset)
        .enter()
          .append("g")
          .attr("class", "heatmap")
          .call(heatmap);

    var list = d3.select("#nav-container")
      .append("ul")
      .selectAll("li")
      .data(this.db.GetStudents());
    list.enter()
      .append("li")
      .text(function(d) {return d.name;})
      .on("click", function(d) {
        d.selected = !d.selected;
        dataset[5].selected = true;
        console.log(dataset);
        d3.select("svg")
          .selectAll("g")
          .data(dataset).call(heatmap);
      });
  }
};

// Program initialization: read data and create a viewer.
//

// These two classes control the entire visualization engine
var database;
var controller;

var data_request = new XMLHttpRequest();
data_request.open('GET', 'example.json');
data_request.onreadystatechange = function() {
  if(data_request.readyState === XMLHttpRequest.DONE && data_request.status === 200) {
    database = new Database();
    database.init(JSON.parse(data_request.responseText));
    controller = new Controller();
    controller.init(database);
  } else if (data_request.status !== 200) {
    console.log("Error loading data from source, status: " + data_request.status);
  }
};
data_request.send();