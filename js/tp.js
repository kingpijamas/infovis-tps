var preProcessEvents = function(events) {
  var SgaRegex = /sga/;
  var GoodGradeRegex = /good/;
  var BadGradeRegex = /bad/;
  var FacebookRegex = /facebook/;
  var GithubRegex = /github/;

  var minDate;
  events.forEach(function(event) {
    var eventType = event.type;
    event.source = event.type.split("-")[0]
    event.sga = SgaRegex.test(eventType);
    event.good = GoodGradeRegex.test(eventType);
    event.bad = BadGradeRegex.test(eventType);
    event.facebook = FacebookRegex.test(eventType);
    event.github = GithubRegex.test(eventType);
    event.rawDate = event.date;
    event.date = parseDate(event.date);

    if (!minDate || event.date < minDate) {
      minDate = event.date;
    }
  });

  events.forEach(function(event) {
    var distanceInYears = event.date.getFullYear() - minDate.getFullYear();
    var distanceInSemesters = getSemesterInYear(event.date) - getSemesterInYear(minDate);
    event.semester = distanceInYears * SemestersPerYear + distanceInSemesters;
  });
}

var setUpGradesChart = function(facts, lastSemester) {
  setUpStackedBarChart({
    data: {
      facts: facts,
      dimension: facts.dimension(dc.pluck("semester")),
      domain: [0, lastSemester + 1],
      showGroups: ["good", "bad"],
      show: dc.pluck("sga")
    },
    style: {
      dom: gradesChart,
      width: 500,
      height: 240,
      margins: {
        left: 100,
        top: 15,
        right: 10,
        bottom: 50
      },
      labels: {
        x: "# cuatrimestre",
        y: "# notas"
      },
      elasticY: true,
      brushOn: true,
      onHover: function(fact) {
        var baseText = "cuat. #" + fact.key + ", " + fact.value[this.layer] + " notas ";
        if (this.layer == "good") {
          return baseText + "buenas";
        } else {
          return baseText + "malas";
        }
      },
      colors: ["#228B22", "#BD2C00"]
    }
  });
}

var setUpFacebookChart = function(facts, lastSemester) {
  setUpStackedBarChart({
    data: {
      facts: facts,
      dimension: facts.dimension(dc.pluck("semester")),
      domain: [0, lastSemester + 1],
      showGroups: ["facebook"],
      show: dc.pluck("facebook")
    },
    style: {
      dom: facebookChart,
      width: 500,
      height: 240,
      margins: {
        left: 100,
        top: 15,
        right: 10,
        bottom: 50
      },
      labels: {
        x: "# cuatrimestre",
        y: "# eventos"
      },
      elasticY: true,
      brushOn: false,
      onHover: function(fact) {
        return "cuat. #" + fact.key + ", " + this.layer + ": " + fact.value[this.layer] + " eventos";
      },
      colors: ["#3B5998"]
    }
  });
}


var setUpGithubChart = function(facts, lastSemester) {
  setUpStackedBarChart({
    data: {
      facts: facts,
      dimension: facts.dimension(dc.pluck("semester")),
      domain: [0, lastSemester + 1],
      showGroups: ["github"],
      show: dc.pluck("github")
    },
    style: {
      dom: githubChart,
      width: 500,
      height: 240,
      margins: {
        left: 100,
        top: 15,
        right: 10,
        bottom: 50
      },
      labels: {
        x: "# cuatrimestre",
        y: "# eventos"
      },
      elasticY: true,
      brushOn: false,
      onHover: function(fact) {
        return "cuat. #" + fact.key + ", " + this.layer + ": " + fact.value[this.layer] + " eventos";
      },
      colors: ["#BD2C00"]
    }
  });
}

var setUpGradesTable = function(facts) {
  setUpTableWithControls({
    table: {
      data: {
        facts: facts,
        dimension: facts.dimension(dc.pluck("semester")),
        show: dc.pluck("sga"),
        columns: [
          dc.pluck("rawDate"),
          dc.pluck("semester"),
          dc.pluck("source"),
          function(fact) {
            return fact.type.split("-").slice(1).join("-");
          }
        ],
        sortBy: dc.pluck("date"),
        order: d3.ascending
      },
      style: {
        dom: gradesTable,
        width: 500,
        height: 240
      }
    },
    controls: {
      data: {
        offset: 0,
        pageSize: 5
      },
      style: {
        id: "grades-table-controls"
      }
    }
  });
}

var setUpGithubTable = function(facts) {
  setUpTableWithControls({
    table: {
      data: {
        facts: facts,
        dimension: facts.dimension(dc.pluck("semester")),
        show: dc.pluck("github"),
        columns: [
          dc.pluck("rawDate"),
          dc.pluck("semester"),
          dc.pluck("source"),
          function(fact) {
            return fact.type.split("-").slice(1).join("-");
          }
        ],
        sortBy: dc.pluck("date"),
        order: d3.ascending
      },
      style: {
        dom: githubTable,
        width: 500,
        height: 240
      }
    },
    controls: {
      data: {
        offset: 0,
        pageSize: 5
      },
      style: {
        id: "github-table-controls"
      }
    }
  });
}
var setUpFacebookTable = function(facts) {
  setUpTableWithControls({
    table: {
      data: {
        facts: facts,
        dimension: facts.dimension(dc.pluck("semester")),
        show: dc.pluck("facebook"),
        columns: [
          dc.pluck("rawDate"),
          dc.pluck("semester"),
          dc.pluck("source"),
          function(fact) {
            return fact.type.split("-").slice(1).join("-");
          }
        ],
        sortBy: dc.pluck("date"),
        order: d3.ascending
      },
      style: {
        dom: facebookTable,
        width: 500,
        height: 240
      }
    },
    controls: {
      data: {
        offset: 0,
        pageSize: 5
      },
      style: {
        id: "facebook-table-controls"
      }
    }
  });
}

var facebookChart = dc.barChart("#facebook-chart");
var facebookTable = dc.dataTable("#facebook-table");

var githubChart = dc.barChart("#github-chart");
var githubTable = dc.dataTable("#github-table");

var gradesChart = dc.barChart("#grades-chart");
var gradesTable = dc.dataTable("#grades-table");

d3.json("data/all-events.json", function(error, events) {
  preProcessEvents(events);
  var facts = crossfilter(events);
  var lastSemester = getMax(events, dc.pluck("semester"));
  setUpFacebookChart(facts, lastSemester);
  setUpFacebookTable(facts);
  setUpGithubChart(facts, lastSemester);
  setUpGithubTable(facts);
  setUpGradesChart(facts, lastSemester);
  setUpGradesTable(facts);
  dc.renderAll();
});
