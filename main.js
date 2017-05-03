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

  this.AssignmentScoresSorted = function() {
    // For each assignment, get all the students grades.
    // returns: {assignment#:[grade,grade...]}
    var assn_scores = {};
    var grades = [];
    this.base_students.forEach(function(s) {
      grades.push(s.grades);
    });
    var max_assn = -1;
    grades.forEach(function(g){
      g.forEach(function(s, j) {
        map_push(assn_scores, j, s.score);
        max_assn = j > max_assn ? j : max_assn;
      });
    });
    for (var i = 0; i <= max_assn; i++) {
      assn_scores[i] = assn_scores[i].sort();
    }
    return assn_scores;
  };

  this.AssnScores2Box = function() {
    // returns [{xlabel:"assn_name", tiles:[min,q1,..,max]}]
    var scores = this.AssignmentScoresSorted();
    var box_data = [];
    for (var key in scores) {
      var sc = scores[key];
      box_data.push({
        xlabel: this.base_assignments[key].name,
        tiles: quartiles(sc)
      });
    }
    return box_data;
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
      .attr("viewBox", "0 0 " + this.getViewWidth() + " " + this.getViewHeight())
      .classed("svg-content", true);

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
    var val_min = d3.min(data, function(a){return d3.min(a.tiles);});
    var val_max = d3.max(data, function(a){return d3.max(a.tiles);});
    var val_count;

    var hor_margin = 20;
    var x_scale = d3.scaleBand()
      .round(true)
      .range([hor_margin, this.getViewWidth()-hor_margin])
      .domain(data.map(function(d) {
        return d.xlabel;
      }));

    var y_scale = d3.scaleLinear()
      .range([0, this.getViewHeight()])
      .domain([val_min, val_max]);

    var labels_container =
      this.view_svg.append("g")
        .attr("transform", "translate(0 " + (this.getViewHeight() * 0.9) + ")")

    labels_container
      .selectAll("g")
        .data(data)
        .enter()
        .append("text")
        .attr("x", function(d, i) {return x_scale(d.xlabel)})
        .attr("y", 0)
        .attr("fill", '#000')
        .style("text-anchor", "start")
        .attr("transform", function(d) {return "rotate(60," + x_scale(d.xlabel) + ",0)"})
        .text(function(d){return d.xlabel});
  };
};

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
    this.viewer = new BoxPlotView();
    this.viewer.init(this.db);

    $("#nav-container").append("<ul></ul>");
    var students = this.db.GetStudents();
    for (var i = 0; i < students.length; i++) {
      $("#nav-container>ul").append("<li>" + students[i].name + "</li>");
    }
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