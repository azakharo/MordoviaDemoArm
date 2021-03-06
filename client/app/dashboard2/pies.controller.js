'use strict';

var mod = angular.module('demoarmApp');

mod.controller('PiesCtrl', function ($scope, $interval, $log, myRest, $timeout) {
  // Startup code
  $scope.timePeriod = 'year';
  if (localStorage) {
    var found = localStorage.getItem("timePeriod");
    if (found) {
      $scope.timePeriod = found;
    }
  }

  $scope.noData = false;
  buildCharts($scope.timePeriod);

  var stopAutoRefresh = $interval(function () {
    buildCharts($scope.timePeriod);
  }, 5000);

  $scope.$on('$destroy', function () {
    $interval.cancel(stopAutoRefresh);
  });


  ///////////////////////////////////////////////////////////////////
  // Implementation

  $scope.onTimePeriodChanged = function() {
    if (localStorage) {
      localStorage.setItem("timePeriod", $scope.timePeriod);
    }
    buildCharts($scope.timePeriod);
  };

  //*******************************************************
  // Privileges chart

  // Dummy data
  //var transPerPrivileges = [
  //  {
  //    privilege: 'unprivileged',
  //    transactions: 20
  //  },
  //  {
  //    privilege: 'pensioners',
  //    transactions: 50
  //  },
  //  {
  //    privilege: 'students',
  //    transactions: 30
  //  },
  //];

  var privilegeDesc = {
    'unprivileged': {
      name: 'Нет льгот',
      color: '#000000'
    }
    //'pensioners': {
    //  name: 'Пенсионеры',
    //  color: '#0000FF'
    //},
    //'students': {
    //  name: 'Студенты',
    //  color: '#00FF00'
    //}
  };

  function drawPrivilegesChart(privilGroups) {
    // Prepare data for the chart
    var data = [];
    privilGroups.forEach(function(privilGrp) {
      var dataItem;
      if (privilegeDesc.hasOwnProperty(privilGrp.privilege)) {
        dataItem = {
          y: privilGrp.transactions,
          name: privilegeDesc[privilGrp.privilege].name,
          color: privilegeDesc[privilGrp.privilege].color
        };
      }
      else {
        dataItem = {
          y: privilGrp.transactions,
          name: privilGrp.privilege
        };
      }
      data.push(dataItem);
    });

    // Draw chart
    $('#privileges-chart').highcharts({
      chart: {
        //backgroundColor: "#FF0000",
        backgroundColor: null,
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        marginTop: 0
      },
      credits: {
        enabled: false
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
        name: 'privileges',
        data: data
      }],
      legend: {
        //labelFormat: '<b>{name}</b>: {percentage:.1f} %'
        labelFormat: '<b>{name}</b>: {y:.0f}'
      }
    });
  }

  // Privileges chart
  //*******************************************************


  /////////////////////////////////////////////////////////
  // Cards chart

  // Dummy data
  //var transPerCards = [
  //  {
  //    cardType: 'esek',
  //    transactions: 10
  //  },
  //  {
  //    cardType: 'electronic',
  //    transactions: 20
  //  },
  //  {
  //    cardType: 'usual',
  //    transactions: 70
  //  },
  //];

  var cardTypeDesc = {
    'esek': {
      name: 'ЕСЭК',
      color: '#FF4500'
    },
    'others': {
      name: 'не ЕСЭК',
      color: '#F08080'
    }
    //'electronic': {
    //  name: 'Электронные билеты',
    //  color: '#F08080'
    //},
    //'usual': {
    //  name: 'Обычные билеты',
    //  color: '#FFA500'
    //}
  };


  function drawCardsChart(cardTypeGroups) {
    // Prepare data for the chart
    var data = [];
    cardTypeGroups.forEach(function(cardTypeGrp) {
      var dataItem = {
        y: cardTypeGrp.transactions,
        name: cardTypeDesc[cardTypeGrp.cardType].name,
        color: cardTypeDesc[cardTypeGrp.cardType].color
      };
      data.push(dataItem);
    });

    // Draw chart
    $('#cards-chart').highcharts({
      chart: {
//        backgroundColor: "#000000",
        backgroundColor: null,
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        marginTop: 0
      },
      credits: {
        enabled: false
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
        //labelFormat: '<b>{name}</b>: {percentage:.1f} %'
        labelFormat: '<b>{name}</b>: {y:.0f}'
      }
    });
  }

  // Cards chart
  /////////////////////////////////////////////////////////

  var prevTimePer = angular.copy($scope.timePeriod);
  var prevEvents = undefined;
  function buildCharts(timePeriod) {
    myRest.getEvents().then(function (events) {
      // optimization
      if (prevTimePer === $scope.timePeriod && angular.equals(events, prevEvents)) {
        return; // just do nothing
      }
      prevTimePer = angular.copy($scope.timePeriod);
      prevEvents = angular.copy(events);

      // Limit data
      events = limitEvents(events, timePeriod);
      //log("limit events");
      //log("number of events: " + events.length);

      $scope.noData = events.length === 0;

      // Calc privilege distribution
      // Aggregate data by privilege string code
      var privGroupsObj = _.groupBy(events, function(e) {
        return e.currency.privilege;
      });
      //log(privGroupsObj);
      var privGroups = [];
      Object.keys(privGroupsObj).forEach(function(grpName) {
        var group = {};
        group.privilege = grpName;
        group.transactions = privGroupsObj[grpName].length;
        privGroups.push(group);
        //log(grpName + " " + group.transactions);
      });

      // Calc card type distribution
      // Aggregate data by card type
      var cardTypeGroupsObj = _.groupBy(events, function(e) {
        return e.card.isESEK ? "esek" : "others";
      });
      //log(cardTypeGroupsObj);
      var cardTypeGroups = [];
      Object.keys(cardTypeGroupsObj).forEach(function(grpName) {
        var group = {};
        group.cardType = grpName;
        group.transactions = cardTypeGroupsObj[grpName].length;
        cardTypeGroups.push(group);
        //log(grpName + " " + group.transactions);
      });

      if (events.length === 0) {
        // drop the charts
        if ($('#privileges-chart').highcharts()) {
          $('#privileges-chart').highcharts().destroy();
        }
        if ($('#cards-chart').highcharts()) {
          $('#cards-chart').highcharts().destroy();
        }
      }
      else {
        // Draw privileges pie
        drawPrivilegesChart(privGroups);

        // Draw card types pie
        drawCardsChart(cardTypeGroups);

        $timeout(resizeCharts, 100);
      }
    });
  }

  function resizeCharts() {
    //log("resizeCharts");
    var wrapperW = $('#pies-wrapper').width();
    var wrapperH = $('#pies-wrapper').height();
    //log("wrapper W: " + wrapperW);
    //log("wrapper H: " + wrapperH);
    //log("right up W:" + $('#my-right-up').width());
    //log("right up H:" + $('#my-right-up').height());
    var piePrivs = $('#privileges-chart').highcharts();
    var pieCards = $('#cards-chart').highcharts();
    if (wrapperH === 400) { // horiz pies
      //log("header H:" + $('#pies-header').height());
      var pieMustBeH = $('#my-right-up').height() - $('#pies-header').height() - 10;
      //log("pieMustBeH:" + pieMustBeH);
      piePrivs.setSize(wrapperW / 2, pieMustBeH, false);
      pieCards.setSize(wrapperW / 2, pieMustBeH, false);
    }
    else if (wrapperH === 800) { // vert pies
      piePrivs.setSize(wrapperW, wrapperH / 2, false);
      pieCards.setSize(wrapperW, wrapperH / 2, false);
    }
  }

  function limitEvents(events, timePeriod) {
    var oldest = moment();

    switch (timePeriod) {
      case 'day':
        oldest.startOf('day');
        break;
      case 'week':
        oldest.startOf('week');
        break;
      case 'month':
        oldest.startOf('month');
        break;
      case 'year':
        oldest.startOf('year');
        break;
      default:
        log(format("pie charts: UNEXPECTED time period '{}'", timePeriod));
        break;
    }

    return _.filter(events, function(e) {
      return e.timestamp.isAfter(oldest);
    });
  }

  function log(msg) {
    $log.debug(msg);
  }

});
