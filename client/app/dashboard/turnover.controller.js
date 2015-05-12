'use strict';

var mod = angular.module('demoarmApp');

mod.controller('TurnoverCtrl', function ($scope, $timeout, $log) {

  Highcharts.setOptions({
    global: {
      useUTC: false
    }
  });

  function drawChart() {
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
              var x = (new Date()).getTime(); // current time
              passengerNextIter();
              var y = passengerCount;
              series.addPoint([x, y], true, true);
            }, 1000);
          }
        }
      },
      title: {
        text: 'Пассажирооборот'
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
          // generate an array of random data
          var data = [],
            time = (new Date()).getTime(),
            i;

          for (i = -19; i <= 0; i += 1) {
            data.push({
              x: time + i * 1000,
              y: 0
            });
          }

          return data;
        }()),
        step: true
      }]
    });
  }

  drawChart();

  // WARKAROUND issue with chart width
  $timeout(function() {
    $('#chart').highcharts().reflow();
  }, 100);

  // Simulate passengers
  var passengerCount = 0;
  function passengerNextIter() {
    var randVal = Math.random();
    if (randVal < 0.5) {
      if (passengerCount > 0) {
        passengerCount -= 1;
      }
    }
    else {
      passengerCount += 1;
    }
  }

});
