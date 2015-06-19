'use strict';

var mod = angular.module('demoarmApp');

mod.controller('TurnoverCtrl', function ($scope, $timeout, $log, myRest) {
  var lastTurnover = -1;

  Highcharts.setOptions({
    global: {
      useUTC: false
    }
  });

  function drawChart(turnoverHist) {
    $('#chart').highcharts({
      chart: {
        type: 'line',
        animation: Highcharts.svg, // don't animate in old IE
        marginRight: 10,
        events: {
          load: function () {
            // set up the updating of the chart each second
            var series = this.series[0];
            setInterval(function () {
              myRest.getTurnover().then(function (turnover) {
                if (turnover !== lastTurnover) {
                  var x = (new Date()).getTime(); // current time
                  var y = turnover;
                  series.addPoint([x, y], true, true);

                  lastTurnover = turnover;
                }
              });
            }, 2000);
          }
        }
      },
      title: {
        text: 'Пассажирооборот',
        style: {
          "fontSize": "30px"
        }
      },
      xAxis: {
        type: 'datetime',
        tickPixelInterval: 150
      },
      yAxis: {
        title: {
          text: 'Кол-во пассажиров, чел.'
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }],
        allowDecimals: false,
        floor: 0
      },
      tooltip: {
        formatter: function () {
          return '<b>' + 'кол-во пассажиров: ' + Highcharts.numberFormat(this.y, 0) + '</b><br/>' +
            Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>';
        }
      },
      legend: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      series: [{
        name: 'passengers',
        data: (function () {
          var data = [];

          // Leave only with unique timestamps
          var hist = _.uniq(turnoverHist, 'timestamp');;

          // Get only 20 latest
          if (hist.length > 20) {
            hist = hist.slice(hist.length - 20);
          }

          // Create points to be drawn
          _(hist).forEach(function(turno) {
            data.push({
              x: turno.timestamp.toDate().getTime(),
              y: turno.value
            });
          });

          return data;
        }()),
        step: true
      }]
    });
  }

  myRest.getTurnoverHistory().then(function (turnoverHist) {
    drawChart(turnoverHist);
    if (turnoverHist.length > 0) {
      lastTurnover = turnoverHist[turnoverHist.length - 1].value;
    }
  });

  function log(msg) {
    $log.debug(msg);
  }

});
