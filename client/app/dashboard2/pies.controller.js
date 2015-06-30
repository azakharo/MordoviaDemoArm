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

  var cards = [
    ['ЕСЭК', 10],
    ['Электронный билет', 20],
    ['Обычный билет', 70]
  ];

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
        headerFormat: '',
        pointFormat: '{point.name}: <b>{point.y: .0f}</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: false
            //format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            //style: {
            //  color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
            //}
          },
          showInLegend: true
        }
      },
      series: [{
        type: 'pie',
        name: 'cards',
        data: cards
      }],
      legend: {
        labelFormat: '<b>{name}</b>: {percentage:.1f} %'
      }
    });
  }

  drawPrivilegesChart();
  drawCardsChart();

  function log(msg) {
    $log.debug(msg);
  }

});
