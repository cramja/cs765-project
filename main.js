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
    return this.base_students.map(
      function (d) {
        return {"name": d.sortable_name, "id": d.id};
      }
    );
  };

  this.GetAssignments = function() {
    return this.base_assignments.map(
      function(d) { return { "name" : d.name, "id" : d.id }; }
    );
  };

  this.GetScores = function() {
    // returns [{id, name, score, assn}]
    var assn_names = this.base_assignments.map(function(d){return d.name;});
    var student_info = this.base_students.map(function(m) {
      var student = [{
          id: m.id,
          name: m.sortable_name
        }],
        scores = m.grades.map(function(n) { return {score: n.score};});
        for (var i = 0; i < scores.length; i ++) {scores[i].assn = assn_names[i];}
      return d3.cross(student, scores, function(a,b) {return {assn: b.assn, score: b.score, name: a.name, id: a.id};});
    });
    return [].concat.apply([], student_info); // flatten
  };
};

(function() {
  d3.HeatMap = function () {

    var height = 1,
      width = 1,
      domain = [];

    function HeatMap(g) {
      var xoffset = width * 0.05,
        yoffset = height * 0.1,
        data = g.datum();

      g.classed("heatmap", true);

      // student id maps to y
      var y_sc = d3.scaleBand()
        .domain(data.meta.students.map(function(d) {return d.id;}))
        .range([0, height - yoffset])
        .padding(0.1);

      // assignments map to x
      var x_sc = d3.scaleBand()
        .domain(data.meta.assignments.map(function(d) {return d.name;}))
        .range([xoffset, width-xoffset])
        .padding(0.1);

      // colors map to score
      var c_sc = d3.scaleLinear()
        .domain([
          d3.min(data.values, function(d){return d.score;}),
          d3.max(data.values, function(d){return d.score;})
        ])
        .range(['white', 'green']);

      var tiles = g.selectAll("rect.tile").data(data.values);

      tiles.enter()
        .append("rect")
          .classed("tile", true)
          .attr("width", x_sc.bandwidth())
          .attr("height", y_sc.bandwidth())
          .attr("x", function(d) {
            return x_sc(d.assn);
          })
          .attr("y", function(d) {return y_sc(d.id);})
          .attr("fill", function(d) { return c_sc(d.score);});

      tiles.exit().remove();

      var ylabel = g.selectAll("text.ylabel")
        .data(data.meta.students);

      ylabel.enter()
        .append("text")
          .attr("class", "ylabel")
          .attr("x", xoffset * 0.9)
          .attr("y", function(d) {return y_sc(d.id); } )
          .attr("dy", y_sc.bandwidth() * 0.8)
          .attr("text-anchor", "end")
          .text(function(d) {return "" + d.id;});

      var xlabel = g.selectAll("text.xlabel")
        .data(data.meta.assignments);

      xlabel.enter()
        .append("text")
          .attr("class", "xlabel")
          .attr("x", function(d) { return x_sc(d.name) + x_sc.bandwidth() * 0.25;})
          .attr("y", height - (yoffset * 0.75))
          .attr("transform", function(d) {return "rotate(30, " + (x_sc(d.name) + x_sc.bandwidth() * 0.25)+ "," + (height - (yoffset * 0.75)) +")"})
          .text(function(d){return d.name;});
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
    var dataset = {
      meta: {
        students: this.db.GetStudents(),
        assignments: this.db.GetAssignments()
      },
      values: this.db.GetScores()
    };

    var heatmap = d3.HeatMap()
      .width(this.width)
      .height(this.height);

    var svg = d3.select("#main-view-container")
      .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + this.width + " " + this.height);

    svg.datum(dataset);
    svg.call(heatmap);

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