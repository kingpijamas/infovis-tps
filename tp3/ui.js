var data = [{
    "x": 1,
    "y": 5
  },
  {
    "x": 20,
    "y": 20
  },
  {
    "x": 40,
    "y": 10
  },
  {
    "x": 60,
    "y": 40
  },
  {
    "x": 80,
    "y": 5
  },
  {
    "x": 100,
    "y": 60
  }
];

var totalWidth = 1000;
var totalHeight = 500;

var margins = {
  top: 20,
  bottom: 80,
  left: 50,
  right: 20
};

var plotWidth = totalWidth - margins.left - margins.right;
var plotHeight = totalHeight - margins.top - margins.bottom;

var getX = function(d) {
  return d.x;
};
var getY = function(d) {
  return d.y;
};
var translation = function(x, y) {
  return "translate(" + x + " ," + y + ")";
};

var scaleX = d3.scaleLinear()
  .domain([0, d3.max(data, getX)])
  .range([0, plotWidth]);

var scaleY = d3.scaleLinear()
  .domain([0, d3.max(data, getY)])
  .range([plotHeight, 0]);

var lineFunction = d3.line()
  .x(function(d) {
    return scaleX(getX(d));
  })
  .y(function(d) {
    return scaleY(getY(d));
  });

var svg = d3.select("body").append("svg")
  .attr("width", totalWidth)
  .attr("height", totalHeight)
  .append("g")
  .attr("transform", translation(margins.left, margins.top));

svg.append("path")
  .data([data])
  .attr("class", "line")
  .attr("d", lineFunction)
  .attr("stroke", "red")
  .attr("stroke-width", "2")
  .attr("fill", "none")

var xAxisPosition = {
  x: 0,
  y: plotHeight
}

svg.append("g")
  .attr("transform", translation(xAxisPosition.x, xAxisPosition.y))
  .call(d3.axisBottom(scaleX));

svg.append("text")
  .attr("transform",
    translation(
      xAxisPosition.x + plotWidth / 2,
      xAxisPosition.y + 35
    )
  )
  .style("text-anchor", "middle")
  .text("x");

var yAxisPosition = {
  x: 0,
  y: 0
}

svg.append("g")
  .call(d3.axisLeft(scaleY));

svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", yAxisPosition.y - plotHeight / 2)
  .attr("y", yAxisPosition.x - margins.left)
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("y");
