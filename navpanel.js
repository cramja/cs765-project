//
// Adds a navigation panel to the vis namespace.
//

(function() {
  vis.navPanel = function () {
    var table = null;

    function navpanel(g) {
      var data = g.datum();

      var li = g.select("ul").selectAll("li").data(data);
      li.enter()
        .append("li")
          .text(function(d) {return d;})
          .on("click", function(d) {
            table.filter(function(d) {return d.aid > 5000;})
          });
      li.exit().remove();
    }

    navpanel.table = function(tbl) {
      if (!arguments.length) return tbl;
      table = tbl;
      return navpanel;
    };

    return navpanel;
  };
})();
