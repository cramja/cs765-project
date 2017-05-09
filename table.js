//
// Adds a table to the vis namespace. Tables are like a stripped-down dataframe.
//

(function(){
  vis.table = function() {
    var data = [],       // all the tuples, form: [{k1:v, k2:v, ..., }, ...]
      columnTypes = [],  // [{cname:ctype}, ... ]
                         // annotation which describes the column's datatypes
      focusKeys = [],    // [cname, cname] keys which should be displayed differently
      focusDim = "",     // dimension which should be displayed in focus
      filter = null,     // function that is given a tuple. If returns true, then we view the tuple.
      sortAttr = null,
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
      onChange(table);
    }

    function table() {
      return _data === null ? data : _data;
    }

    table.columnTypes = function(d) {
      if (!arguments.length) return columnTypes;
      for(var i in d) {
        // columnType must be: key, dim.numeric, or dim
        // dims which are numeric may be aggregated.
        console.assert(["k", "d.n", "d"].includes(d[i]));
      }
      columnTypes = d;
      return table;
    };

    table.focusKeys = function(d) {
      if (!arguments.length) return focusKeys;
      focusKeys = d;
      onChange(table);
      return table;
    };

    table.focusDim = function(d) {
      if (!arguments.length) return focusDim;
      focusDim = d;
      onChange(table);
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

    table.avgs = function() {
      // averages for the 2 focus attributes.
      // terrible code
      var av = [],
        sums0 = {},
        sums1 = {},
        x = focusKeys[0],
        y = focusKeys[1];
        z = focusDim;
      for (var i = 0; i < data.length; i++) {
        var di = data[i];
        if (!sums0[di[x]]) sums0[di[x]] = 0;
        sums0[di[x]] += di[z];
        if (!sums1[di[y]]) sums1[di[y]] = 0;
        sums1[di[y]] += di[z];
      }
      var grandtotal = 0;
      d3.keys(sums0).forEach(function(k) {
        var avk = {};
        avk.x = k;
        avk.y = "AVG";
        avk.z = sums0[k] / d3.keys(sums1).length;
        grandtotal += sums0[k];
        av.push(avk);
      });
      d3.keys(sums1).forEach(function(k) {
        var avk = {};
        avk.x = "AVG";
        avk.y = k;
        avk.z = sums1[k] / d3.keys(sums0).length;
        av.push(avk);
      });
      av.push({
        x:"AVG",
        y:"AVG",
        z:grandtotal/(d3.keys(sums0).length * d3.keys(sums1).length)
      })
      return av;
    };

    table.sortAttr = function(d) {
      if (!arguments.length) return sortAttr;
      // simply creates a sort function based on a single attribute
      // expects {cname:column-name, sort:asc|dsc}
      // TODO: implement multilevel sort
      var sortfn = function(a,b) {
        if (d.sort == "asc") {
          return a[d.cname] <  b[d.cname] ? -1 : a[d.cname] >  b[d.cname] ? 1 : 0;
        }
        return a[d.cname] <  b[d.cname] ? 1 : a[d.cname] >  b[d.cname] ? -1 : 0;
      }
      sortAttr = d;

      return table.sort(sortfn);
    }

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