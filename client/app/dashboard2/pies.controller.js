'use strict';

var mod = angular.module('demoarmApp');

mod.controller('PiesCtrl', function ($scope, $timeout, $log, myRest) {
  $scope.timePeriod = 'year';
  var privileges = [
    ['Нет льгот', 20],
    ['Пенсионеры', 50],
    ['Студенты', 30]
  ];

  function drawPrivilegesChart() {
    $('#privileges-chart').highcharts({
      chart: {
        backgroundColor: '#20B2AA',
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        marginTop: 0
      },
      title: {
        text: null
      },
      exporting: {
        enabled: false
      },
      tooltip: {
        headerFormat: '',
        pointFormat: '{point.name}: <b>{point.y:.0f}</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: {
              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
            }
          }
        }
      },
      series: [{
        type: 'pie',
        name: 'privileges',
        data: privileges
      }]
    });
  }

  function drawCardsChart() {
    $('#cards-chart').highcharts({
      chart: {
        backgroundColor: '#20B2AA',
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        marginTop: 0
      },
      title: {
        text: null
      },
      exporting: {
        enabled: false
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: {
              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
            }
          }
        }
      },
      series: [{
        type: 'pie',
        name: 'Browser share',
        data: [
          ['Firefox',   45.0],
          ['IE',       26.8],
          {
            name: 'Chrome',
            y: 12.8,
            sliced: true,
            selected: true
          },
          ['Safari',    8.5],
          ['Opera',     6.2],
          ['Others',   0.7]
        ]
      }]
    });
  }

  drawPrivilegesChart();
  drawCardsChart();

  function log(msg) {
    $log.debug(msg);
  }

});
