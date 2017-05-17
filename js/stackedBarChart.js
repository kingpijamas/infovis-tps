var setUpStackedBarChart = function(params) {
  var _chart = {
    data: params.data,
    style: params.style
  };
  _chart.data.groups = _chart.data.dimension.group().reduce(
    function(accum, fact) {
      _chart.data.showGroups.forEach(function(group) {
        if (fact[group]) {
          accum[group] += 1;
        }
      });
      return accum;
    },
    function(accum, fact) {
      _chart.data.showGroups.forEach(function(group) {
        if (fact[group]) {
          accum[group] -= 1;
        }
      });
      return accum;
    },
    function() {
      accum = {};
      _chart.data.showGroups.forEach(function(group) {
        accum[group] = 0;
      });
      return accum;
    }
  );
  _chart.stackAttribute = function(i) {
    return function(fact) {
      return fact.value[i];
    };
  }
  _chart.reverseLegendables = function(chart) {
    dc.override(chart, "legendables", function() {
      var items = chart._legendables();
      return items.reverse();
    });
  };

  var firstGroupToShow = _chart.data.showGroups[0];

  _chart.style.dom
    .width(_chart.style.width)
    .height(_chart.style.height)
    .x(d3.scale.linear().domain(_chart.data.domain))
    .margins(_chart.style.margins)
    .dimension(_chart.data.dimension)
    .filter(_chart.data.show)
    .group(_chart.data.groups, firstGroupToShow, _chart.stackAttribute(firstGroupToShow))
    .brushOn(_chart.style.brushOn)
    .elasticY(_chart.style.elasticY)
    .xAxisLabel(_chart.style.labels.x)
    .yAxisLabel(_chart.style.labels.y)
    .title(_chart.style.onHover)
    .ordinalColors(_chart.style.colors);

  _chart.style.dom.legend(dc.legend());
  _chart.reverseLegendables(_chart.style.dom);

  _chart.data.showGroups.slice(1).forEach(function(group) {
    _chart.style.dom.stack(_chart.data.groups, group, _chart.stackAttribute(group));
  });
}
