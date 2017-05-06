//
// Adds a table to the vis namespace. Tables are like a stripped-down dataframe.
//

(function(){
  vis.table = function() {
    var data = [],   // all the tuples
      filter = null, // function that is given a tuple. If returns true, then we view the tuple.
      sort = null,   // function that takes 2 tuples as an arg
      _data = null,  // tuples after filter + sort
      onChange = function(d) {}; // on change, a reference to the filtered/sorted data is passed.

    function applyPreds(reset) {
      if (reset || _data === null) {
        _data = [];
        for (var i = 0; i < data.length; i++){
          _data.push(data[i]);
        }
      }

      var tmp = [];
      if (filter) { // todo: there's a way to write this so we don't have to double filter
                    //       if a filter has already been applied.
        for (var i = 0; i < data.length; i++) {
          if (filter(_data[i])) {
            tmp.push(_data[i]);
          }
        }
      } else {
        tmp = _data;
      }

      if (sort) {
        tmp = _data.sort(sort);
      }

      _data = tmp;
      onChange(table());
    }

    function table() {
      return _data === null ? data : _data;
    }

    table.data = function(d) {
      if (!arguments.length) return d;
      data = d;
      applyPreds(true);
      return table;
    };

    table.sort = function(d) {
      if (!arguments.length) return d;
      sort = d;
      applyPreds(false);
      return table;
    };

    table.filter = function(d) {
      if (!arguments.length) return d;
      var reset = filter !== null;
      filter = d;
      applyPreds(reset);
      return table;
    };

    table.onChange = function(d) {
      if (!arguments.length) return d;
      onChange = d;
      return table;
    };

    return table;
  };
})();