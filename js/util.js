var parseDate = function(date) {
  var parts = date.split("-");
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

var SemestersPerYear = 2;

var getSemesterInYear = function(date) {
  if (date.getMonth() < 6) {
    return 0;
  } else {
    return 1;
  }
};

var getMax = function(array, accessor) {
  return Math.max.apply(null, array.map(accessor));
};

var clone = function(obj) {
  if (null == obj || "object" != typeof obj) {
    return obj;
  }
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      copy[attr] = obj[attr];
    }
  }
  return copy;
};
