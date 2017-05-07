//
// Adds a table to the vis namespace. Tables are like a stripped-down dataframe.
//

(function(){
  vis.table = function() {
    var data = [],       // all the tuples
      columnTypes = [],  // annotation which describes the column's datatypes
      focusKeys = [],    // keys which should be displayed differently
      focusDim = "",     // dimension which should be displayed in focus
      filter = null,     // function that is given a tuple. If returns true, then we view the tuple.
      sort = null,       // function that takes 2 tuples as an arg
      _data = null,      // tuples after filter + sort
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

    table.columnTypes = function(d) {
      if (!arguments.length) return columnTypes;
      for(var i in d) {
        // columnType must be: dimension, attribute.numeric, or attribute
        console.assert(["k", "d.n", "d"].includes(d[i]));
      }
      columnTypes = d;
      return table;
    };

    table.focusKeys = function(d) {
      if (!arguments.length) return focusKeys;
      focusKeys = d;
      // todo: alert listeners of change.
      return table;
    };

    table.focusDim = function(d) {
      if (!arguments.length) return focusDim;
      focusDim = d;
      // todo: alert listeners of change.
      return table;
    };

    table.data = function(d) {
      if (!arguments.length) return data;
      data = d;
      applyPreds(true);
      return table;
    };

    table.sort = function(d) {
      if (!arguments.length) return sort;
      sort = d;
      applyPreds(false);
      return table;
    };

    table.filter = function(d) {
      if (!arguments.length) return filter;
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