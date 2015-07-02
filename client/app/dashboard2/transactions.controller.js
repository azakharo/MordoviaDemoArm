'use strict';

var mod = angular.module('demoarmApp');

mod.controller('TransactionsCtrl', function ($scope, $timeout, $log, myRest) {
  // Startup code
  $scope.aggrPeriod = 'day';
  buildChart($scope.aggrPeriod);


  //*****************************************************************
  // Implementation

  function drawChart(groups) {
    // Prepare categories
    var categories = _.map(groups, 'name');;

    // Prepare series data
    var successSeries = [];
    var errorSeries = [];
    groups.forEach(function(grp) {
      successSeries.push(grp.successes);
      errorSeries.push(grp.errors);
    });

    // Draw chart
    $('#trans-chart').highcharts({
      chart: {
        type: 'column',
        backgroundColor: null
      },
      title: {
        text: null
      },
      exporting: {
        enabled: false
      },
      xAxis: {
        categories: categories
      },
      yAxis: {
        min: 0,
        allowDecimals: false,
        title: {
          text: 'Кол-во транзакций'
        },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color: (Highcharts.theme && Highcharts.theme.textColor) || 'white'
          }
        }
      },
      legend: {
        align: 'right',
        x: -5,
        verticalAlign: 'top',
        y: 10,
        floating: true,
        backgroundColor: null,
        borderColor: '#CCC',
        borderWidth: 0,
        shadow: false
      },
      tooltip: {
        formatter: function () {
          return '<b>' + this.x + '</b><br/>' +
            this.series.name + ': ' + this.y + '<br/>' +
            'Всего: ' + this.point.stackTotal;
        }
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: true,
            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
            style: {
              textShadow: '0 0 3px black'
            }
          }
        }
      },
      series: [{
        name: 'Успешных',
        data: successSeries,
        color: '#90EE90'
      }, {
        name: 'Ошибки',
        data: errorSeries,
        color: '#F08080'
      }]
    });
  }

  $scope.onAggrPeriodChanged = function() {
    buildChart($scope.aggrPeriod);
  };

  function groupEventsByDay(event) {
    return event.timestamp.format('DD.MM');
  }

  function groupEventsByWeek(event) {
    return 'ww' + event.timestamp.format('ww');
  }

  function groupEventsByMonth(event) {
    return event.timestamp.format('MM.YYYY');
  }

  function groupEventsByYear(event) {
    return event.timestamp.format('YYYY');
  }

  var aggrPer2groupFunc = {
    'day'   : groupEventsByDay,
    'week'  : groupEventsByWeek,
    'month' : groupEventsByMonth,
    'year'  : groupEventsByYear
  };

  function limitEvents(events, aggrPeriod) {
    if (aggrPeriod === 'day' || aggrPeriod === 'week') {
      // limit data to 1 year ago to prevent the interference
      var oldest = moment().subtract(1, 'years');
      return _.filter(events, function(e) {
        return e.timestamp.isAfter(oldest);
      });
    }
  }

  function buildChart(aggrPeriod) {
    myRest.getEvents().then(function (events) {
      // Limit data, if necessary
      events = limitEvents(events, aggrPeriod);

      // Originally events are sorted by timestamp desc.
      // Reverse
      _(events).reverse();

      // Aggregate data
      var groupsObj = _.groupBy(events, aggrPer2groupFunc[aggrPeriod]);
      //log(groupsObj);

      // Calc number of success, failure for every time period
      var groups = [];
      Object.keys(groupsObj).forEach(function(grpName) {
        var group = {};
        group.name = grpName;
        //log(grpName);
        //log(groups[grpName].length);
        var successes = 0;
        var errors = 0;
        groupsObj[grpName].forEach(function(trans) {
          if (trans.isSuccess) {
            successes += 1;
          }
          else {
            errors += 1;
          }
        });
        group.successes = successes;
        group.errors = errors;
        groups.push(group);
        //log(grpName + ":");
        //log("successes: " + successes);
        //log("errors: " + errors);
      });

      // Draw chart
      drawChart(groups);
    });
  }

  function log(msg) {
    $log.debug(msg);
  }

});
