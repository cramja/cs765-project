//
// Adds a canvas data loader to the vis namespace.
//

(function(){
  vis.canvasLoader = function() {
    var baseData = "", // loaded JSON
      filename = "example.json",
      data = [],       // processed table
      onLoad = function() {},
      process = function(data) {
        // Do a rename/select
        var assnInf = data.assignments.map(function(d) {return {aname: d.name, aid: d.id, aprompt: d.prompted};});
        var stdInf = data.students.map(function(d) {return {sname: d.sortable_name, sid: d.id, grades: d.grades};});
        // Do a join, by hand
        var table = [];
        for (var i = 0; i < stdInf.length; i++) {
          var s = stdInf[i];
          console.assert(s.grades.length === assnInf.length);
          for (var j = 0; j < assnInf.length; j++) {
            var a = assnInf[j];
            // tuples
            table.push({
              sname: s.sname,
              sid: s.sid,
              aname: a.aname,
              aid: a.aid,
              score: s.grades[j].score,
              late: s.grades[j].late,
              posts: s.grades[j].posts
            });
          }
        }
        var columnTypes = {
          sname: "k",
          sid: "k",
          aname: "k",
          aid: "k",
          score: "d.n",
          late: "d.n",
          posts: "d"
        };
        return {columns:columnTypes, table:table};
      };

    function canvasLoader() {
      // warning: async call may not have completed. Set onLoad
      return data;
    }

    canvasLoader.baseData = function(d) {
      if(!arguments.length) return baseData;
      baseData = d;
      data = process(baseData);
      onLoad(data);
      return canvasLoader;
    };

    canvasLoader.onLoad = function(f) {
      if(!arguments.length) return onLoad;
      onLoad = f;
      return canvasLoader;
    };

    canvasLoader.filename = function(d) {
      if(!arguments.length) return filename;
      filename = d;
      // fetch file, process file

      var data_request = new XMLHttpRequest();
      data_request.open('GET', filename);
      data_request.onreadystatechange = function() {
        if(data_request.readyState === XMLHttpRequest.DONE && data_request.status === 200) {
          canvasLoader.baseData(JSON.parse(data_request.responseText));
        } else if (data_request.status !== 200) {
          console.log("Error loading data from source, status: " + data_request.status);
        }
      };
      data_request.send();
      return canvasLoader;
    };

    return canvasLoader;
  };
})();