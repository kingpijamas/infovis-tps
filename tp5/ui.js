var width = 800;
var height = 600;

var data = d3.range(10).map(function(i) {
  return {
    id: i,
    x: d3.randomUniform(0, width)(),
    y: d3.randomUniform(0, height)()
  };
});

var defaultColor = "black";
var selectionColor = "yellow";

var svg = d3.select("#plot")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

svg.selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", function(d) {
    return d.x;
  })
  .attr("cy", function(d) {
    return d.y;
  }).
attr("id", function(d) {
    return d.id;
  })
  .attr("r", 5)
  .style("fill", defaultColor);

var getClickCoords = function() {
  return {
    x: d3.event.pageX,
    y: d3.event.pageY
  };
}

var maxAndMin = function(x, y) {
  if (x < y) {
    return {
      min: x,
      max: y
    }
  }
  return {
    min: y,
    max: x
  }
}

var isSelected = function(xs, ys, d) {}

var circles = d3.select("#plot").selectAll("circle");

var selectionAreaStart, selectionAreaEnd, xs, ys, selectedIds;

svg.append("g")
  .attr("class", "brush")
  .call(d3.brush().on("brush", function() {
    selectionAreaStart = d3.event.selection[0];
    selectionAreaEnd = d3.event.selection[1];
    selectedIds = [];

    xs = maxAndMin(selectionAreaEnd[0], selectionAreaStart[0]);
    ys = maxAndMin(selectionAreaEnd[1], selectionAreaStart[1]);

    circles.each(function(d) {
      d3.select(this).style("fill", defaultColor);
    });

    circles.filter(function(d) {
        return xs.min <= d.x && d.x <= xs.max &&
          ys.min <= d.y && d.y <= ys.max;
      })
      .each(function(d) {
        selectedIds.push(d.id);
        d3.select(this).style("fill", selectionColor);
      });

    d3.select("#selection").text("Selected: " +
      selectedIds.map(function(d) {
        return "id" + d;
      })
      .join(", "));
  }));
