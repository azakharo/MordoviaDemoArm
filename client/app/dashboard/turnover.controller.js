'use strict';

var mod = angular.module('demoarmApp');

mod.controller('TurnoverCtrl', function ($scope, $timeout, $log) {

  function drawChart() {
    $('#chart').highcharts({
      chart: {
        type: 'bar'
      },
      title: {
        text: 'Fruit Consumption'
      },
      xAxis: {
        categories: ['Apples', 'Bananas', 'Oranges']
      },
      yAxis: {
        title: {
          text: 'Fruit eaten'
        }
      },
      series: [{
        name: 'Jane',
        data: [1, 0, 4]
      }, {
        name: 'John',
        data: [5, 7, 3]
      }]
    });
  }

  drawChart();

  // WARKAROUND issue with chart width
  $timeout(function() {
    $('#chart').highcharts().reflow();
  }, 100);

});
