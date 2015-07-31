'use strict';

var mod = angular.module('demoarmApp');

mod.controller('Dashboard2Ctrl', function ($scope, $state, myRest) {
  $scope.baseURL = myRest.getBaseURL();

  var redrawDashboard = debounce(function() {
    // TODO solve issue with Highcharts and window resizing. The following is work-around.
    $state.reload();
  }, 1000);

  $(window).resize(redrawDashboard);
});
