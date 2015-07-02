'use strict';

var mod = angular.module('demoarmApp');

mod.controller('TransactionsCtrl', function ($scope, $timeout, $log, myRest) {
  $scope.aggrPeriod = 'day';

  function drawChart() {
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
        categories: ['29.06', '30.06', '01.07']
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
        data: [5, 3, 4],
        color: '#90EE90'
      }, {
        name: 'Ошибки',
        data: [2, 2, 3],
        color: '#F08080'
      }]
    });
  }

  drawChart();

  function log(msg) {
    $log.debug(msg);
  }

});
