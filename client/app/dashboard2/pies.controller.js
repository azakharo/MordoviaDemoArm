'use strict';

var mod = angular.module('demoarmApp');

mod.controller('PiesCtrl', function ($scope, $timeout, $log, myRest) {
  $scope.timePeriod = 'year';

  //*******************************************************
  // Privileges chart

  // Dummy data
  var transPerPrivileges = [
    {
      privilege: 'unprivileged',
      transactions: 20
    },
    {
      privilege: 'pensioners',
      transactions: 50
    },
    {
      privilege: 'students',
      transactions: 30
    },
  ];

  var privilegeDesc = {
    'unprivileged': {
      name: 'Нет льгот',
      color: '#000000'
    },
    'pensioners': {
      name: 'Пенсионеры',
      color: '#0000FF'
    },
    'students': {
      name: 'Студенты',
      color: '#00FF00'
    }
  };

  function drawPrivilegesChart() {
    // Prepare data for the chart
    var data = [];
    transPerPrivileges.forEach(function(privilTrans) {
      var dataItem = {
        y: privilTrans.transactions,
        name: privilegeDesc[privilTrans.privilege].name,
        color: privilegeDesc[privilTrans.privilege].color
      };
      data.push(dataItem);
    });

    // Draw chart
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
        data: data
      }]
    });
  }

  // Privileges chart
  //*******************************************************


  /////////////////////////////////////////////////////////
  // Cards chart

  // Dummy data
  var transPerCards = [
    {
      cardType: 'esek',
      transactions: 10
    },
    {
      cardType: 'electronic',
      transactions: 20
    },
    {
      cardType: 'usual',
      transactions: 70
    },
  ];

  var cardTypeDesc = {
    'esek': {
      name: 'ЕСЭК',
      color: '#FF4500'
    },
    'electronic': {
      name: 'Электронные билеты',
      color: '#F08080'
    },
    'usual': {
      name: 'Обычные билеты',
      color: '#FFA500'
    }
  };


  function drawCardsChart() {
    // Prepare data for the chart
    var data = [];
    transPerCards.forEach(function(cardTypeTrans) {
      var dataItem = {
        y: cardTypeTrans.transactions,
        name: cardTypeDesc[cardTypeTrans.cardType].name,
        color: cardTypeDesc[cardTypeTrans.cardType].color
      };
      data.push(dataItem);
    });

    // Draw chart
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
        data: data
      }],
      legend: {
        labelFormat: '<b>{name}</b>: {percentage:.1f} %'
      }
    });
  }

  // Cards chart
  /////////////////////////////////////////////////////////

  drawPrivilegesChart();
  drawCardsChart();

  function log(msg) {
    $log.debug(msg);
  }

});
