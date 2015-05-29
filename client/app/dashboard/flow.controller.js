'use strict';

var mod = angular.module('demoarmApp');

mod.controller('FlowCtrl', function ($scope, $timeout, $log, myRest) {
  Highcharts.setOptions({
    global: {
      useUTC: false
    }
  });

  function drawChart(initialTurnover) {
    $('#flow-chart').highcharts({
      chart: {
        type: 'spline',
        animation: Highcharts.svg, // don't animate in old IE
        marginRight: 10,
        events: {
          load: function () {
            // set up the updating of the chart each second
            var series = this.series[0];
            setInterval(function () {
              myRest.getTurnover().then(function (turnover) {
                var x = (new Date()).getTime(); // current time
                var y = turnover;
                series.addPoint([x, y], true, true);
              });
            }, 2000);
          }
        }
      },
      title: {
        text: 'Пассажиропоток',
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
          text: 'Кол-во оплативших, чел.'
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
          return '<b>' + 'кол-во оплативших: ' + Highcharts.numberFormat(this.y, 0) + '</b><br/>' +
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
          // generate an array of random data
          var data = [],
            time = (new Date()).getTime(),
            i;

          for (i = -19; i <= 0; i += 1) {
            data.push({
              x: time + i * 2000,
              y: initialTurnover
            });
          }

          return data;
        }())
      }]
    });
  }

  myRest.getTurnover().then(function (initialTurnover) {
    drawChart(initialTurnover);
  });

  function log(msg) {
    $log.debug(msg);
  }

});
