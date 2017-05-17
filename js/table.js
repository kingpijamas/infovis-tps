var setUpTableWithControls = function(params) {
  var table = setUpTable(params.table);

  tableControlsParams = clone(params.controls);
  tableControlsParams.data.table = table;
  setUpTableControls(tableControlsParams);
}

var setUpTable = function(params) {
  var _table = {
    data: params.data,
    style: params.style
  };

  var filteredDimension = _table.data.dimension;
  filteredDimension.oldTop = filteredDimension.top;
  filteredDimension.top = function(k) {
    return filteredDimension.oldTop(Infinity).filter(_table.data.show).slice(0, k);
  };
  filteredDimension.oldBottom = filteredDimension.bottom;
  filteredDimension.bottom = function(k) {
    return filteredDimension.oldBottom(Infinity).filter(_table.data.show).slice(0, k);;
  };

  _table.style.dom
    .width(_table.style.width)
    .height(_table.style.height)
    .dimension(filteredDimension)
    .group(function(fact) {
      return _table.data.show;
    })
    .size(Infinity)
    .showGroups(false)
    .columns(_table.data.columns)
    .sortBy(_table.data.sortBy)
    .order(_table.data.order)

  return _table;
}

var setUpTableControls = function(params) {
  var _controls = {
    data: params.data,
    style: params.style
  };

  var parentElementCssId = "#" + _controls.style.id;
  _controls.display = function() {
    d3.select(parentElementCssId + "> .begin")
      .text(_controls.data.offset);
    d3.select(parentElementCssId + "> .end")
      .text(_controls.data.offset + _controls.data.pageSize - 1);
    d3.select(parentElementCssId + "> .prev")
      .attr("disabled", (_controls.data.offset - _controls.data.pageSize) < 0 ? "true" : null);
    d3.select(parentElementCssId + "> .next")
      .attr("disabled", ((_controls.data.offset + _controls.data.pageSize) >= _controls.data.table.data.dimension.top(Infinity).length) ? "true" : null);
    d3.select(parentElementCssId + "> .size").text(_controls.data.table.data.dimension.top(Infinity).length);
  };
  _controls.update = function() {
    _controls.data.table.style.dom.beginSlice(_controls.data.offset);
    _controls.data.table.style.dom.endSlice(_controls.data.offset + _controls.data.pageSize);
    _controls.display();
  };
  _controls.prev = function() {
    _controls.data.offset -= _controls.data.pageSize;
    _controls.update();
    _controls.data.table.style.dom.redraw();
  };
  _controls.next = function() {
    _controls.data.offset += _controls.data.pageSize;
    _controls.update();
    _controls.data.table.style.dom.redraw();
  };
  d3.select(parentElementCssId + "> .prev").on("click", _controls.prev);
  d3.select(parentElementCssId + "> .next").on("click", _controls.next);
  _controls.update();
  return _controls;
}
